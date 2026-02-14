#!/bin/bash
# E2E Test - Executes run_1.sh (Phase 1) or run_2.sh (Phase 2) and verifies results
# Phase 1 = run_1.sh (system setup, root). Phase 2 = run_2.sh (client install, testuser).
# Run inside Docker with systemd. Requires PHASE=1|2 set by run_e2e.sh.

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib/test_utils.sh
source "$SCRIPT_DIR/lib/test_utils.sh"

LOG_PREFIX="E2E"
PHASE="${PHASE:-}"

if [[ -z "$PHASE" ]] || [[ "$PHASE" != "1" && "$PHASE" != "2" ]]; then
    log_error "PHASE=1 or PHASE=2 required (set by run_e2e.sh)"
    exit 1
fi

log_header "run_${PHASE}.sh - E2E"
log_info "Running as: $(whoami)"

if ! command -v systemctl &>/dev/null; then
    log_error "systemctl not found - run container with systemd init"
    exit 1
fi

cd "$PROJECT_ROOT"

# =============================================================================
# PHASE 1: run_1.sh (system setup)
# =============================================================================
if [[ "$PHASE" == "1" ]]; then
    if ! is_root; then
        log_error "Phase 1 E2E must run as root"
        exit 1
    fi

    source "$PROJECT_ROOT/exports.sh"

    log_header "Executing run_1.sh"
    export DEBIAN_FRONTEND=noninteractive
    export DEBIAN_PRIORITY=critical

    "$PROJECT_ROOT/install/utils/debconf_preseed.sh"
    mkdir -p /root/.ssh
    if [[ ! -f /root/.ssh/authorized_keys ]]; then
        echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI test-key-for-e2e" > /root/.ssh/authorized_keys
        chmod 600 /root/.ssh/authorized_keys
    fi

    if ! "$PROJECT_ROOT/run_1.sh"; then
        record_test "run_1.sh execution" "FAIL"
        print_test_summary
        exit 1
    fi
    record_test "run_1.sh execution" "PASS"

    log_header "Verifying run_1.sh Results"
    if [[ -f /root/handoff_info.txt ]]; then
        record_test "Handoff info file created" "PASS"
        if grep -q "$LOGIN_UNAME" /root/handoff_info.txt; then record_test "Handoff contains username" "PASS"; else record_test "Handoff contains username" "FAIL"; fi
    else
        record_test "Handoff info file created" "FAIL"
    fi
    if id -u "$LOGIN_UNAME" &>/dev/null; then record_test "User '$LOGIN_UNAME' created" "PASS"; else record_test "User '$LOGIN_UNAME' created" "FAIL"; fi
    if sudo -u "$LOGIN_UNAME" sudo -n true 2>/dev/null; then record_test "User has sudo (NOPASSWD)" "PASS"; else record_test "User has sudo (NOPASSWD)" "FAIL"; fi
    if [[ -f /home/${LOGIN_UNAME}/.ssh/authorized_keys ]]; then record_test "SSH keys migrated to new user" "PASS"; else record_test "SSH keys migrated to new user" "FAIL"; fi
    if [[ -f /etc/ssh/sshd_config.backup ]]; then record_test "SSH config backed up" "PASS"; else record_test "SSH config backed up" "FAIL"; fi
    if [[ -f /etc/sysctl.d/99-eth2-hardening.conf ]]; then record_test "Network hardening applied" "PASS"; else record_test "Network hardening applied" "FAIL"; fi
    if [[ -f /usr/local/bin/security_monitor.sh ]]; then record_test "Security monitoring script installed" "PASS"; else record_test "Security monitoring script installed" "FAIL"; fi
    if ufw status 2>/dev/null | grep -q "Status: active"; then record_test "UFW firewall active" "PASS"; else record_test "UFW firewall active" "FAIL"; fi
    if systemctl is-active --quiet fail2ban 2>/dev/null; then
        record_test "Fail2ban service running" "PASS"
        if fail2ban-client status 2>/dev/null | grep -q "sshd"; then record_test "Fail2ban sshd jail active" "PASS"; else record_test "Fail2ban sshd jail active" "FAIL"; fi
    else
        record_test "Fail2ban service running" "FAIL"
    fi
    if command -v aide &>/dev/null; then
        record_test "AIDE installed" "PASS"
        if [[ -f /var/lib/aide/aide.db ]]; then record_test "AIDE database initialized" "PASS"; else record_test "AIDE database initialized" "FAIL"; fi
        if [[ -f /usr/local/bin/aide_check.sh ]] && [[ -x /usr/local/bin/aide_check.sh ]]; then
            record_test "AIDE check script installed" "PASS"
            if /usr/local/bin/aide_check.sh &>/dev/null; then record_test "AIDE check script runs" "PASS"; else record_test "AIDE check script runs" "FAIL"; fi
            if crontab -l 2>/dev/null | grep -Fq "/usr/local/bin/aide_check.sh"; then record_test "AIDE cron job scheduled" "PASS"; else record_test "AIDE cron job scheduled" "FAIL"; fi
        else
            record_test "AIDE check script installed" "FAIL"
        fi
    else
        record_test "AIDE installed" "FAIL"
    fi
fi

# =============================================================================
# PHASE 2: run_2.sh (client installation) - Tests flag mode
# =============================================================================
if [[ "$PHASE" == "2" ]]; then
    mkdir -p config
    echo "export LOGIN_UNAME='$(whoami)'" > config/user_config.env
    export CI_E2E=true
    export DEBIAN_FRONTEND=noninteractive
    export DEBIAN_PRIORITY=critical

    # Re-apply debconf preseed to prevent tzdata/postfix/cron hangs
    log_header "Pre-seeding debconf (prevent tty hangs)"
    sudo bash "$PROJECT_ROOT/install/utils/debconf_preseed.sh"

    # Step 1: Install dependencies (like run_2.sh when not --skip-deps)
    log_header "Installing dependencies"
    if ! ./install/utils/install_dependencies.sh --production; then
        record_test "install_dependencies" "FAIL"
        print_test_summary
        exit 1
    fi
    record_test "install_dependencies" "PASS"

    # Step 2: Run run_2.sh with flags (tests the run_2 flag flow)
    log_header "Executing run_2.sh (flag flow: geth, prysm, mev-boost)"
    run2_log="/tmp/run2_e2e_$$.log"
    if ! run_script_with_log "$run2_log" ./run_2.sh --execution=geth --consensus=prysm --mev=mev-boost --skip-deps; then
        record_test "run_2.sh execution" "FAIL"
        dump_log_tail "$run2_log" 50 "  "
        rm -f "$run2_log"
        print_test_summary
        exit 1
    fi
    rm -f "$run2_log"
    record_test "run_2.sh execution" "PASS"

    log_header "Verifying client installs"
    verify_installed "Geth" command -v geth
    verify_installed "Prysm" test -f "$HOME/prysm/prysm.sh"
    verify_installed "MEV-Boost" test -f "$HOME/mev-boost/mev-boost"
    verify_installed "JWT secret" test -f "$HOME/secrets/jwt.hex"
    verify_installed "eth1 systemd service" bash -c 'systemctl list-unit-files 2>/dev/null | grep -q "eth1.service"'
fi

# =============================================================================
# SUMMARY
# =============================================================================
print_test_summary
