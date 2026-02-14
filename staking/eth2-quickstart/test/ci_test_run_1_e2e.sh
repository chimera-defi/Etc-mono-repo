#!/bin/bash
# E2E Test for run_1.sh - Actually executes run_1.sh and verifies results
# Run inside Docker container with systemd as init: docker exec <container> /workspace/test/ci_test_run_1_e2e.sh
# Requires: container started with --privileged -v /sys/fs/cgroup:/sys/fs/cgroup:rw and CMD /sbin/init

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib/test_utils.sh
source "$SCRIPT_DIR/lib/test_utils.sh"

LOG_PREFIX="E2E"

log_header "run_1.sh End-to-End Test"
log_info "This test ACTUALLY runs run_1.sh and verifies the results"
log_info "Running as: $(whoami)"

# Must be root (run_1 requires root)
if ! is_root; then
    log_error "E2E test must run as root"
    exit 1
fi

# Must have systemd (configure_ssh, fail2ban need it)
if ! command -v systemctl &>/dev/null; then
    log_error "systemctl not found - run container with systemd init"
    exit 1
fi

cd "$PROJECT_ROOT"

# Load config for verification (LOGIN_UNAME from exports.sh)
# shellcheck source=../exports.sh
source "$PROJECT_ROOT/exports.sh"

# =============================================================================
# PHASE 1: Execute run_1.sh
# =============================================================================
log_header "Phase 1: Executing run_1.sh"

# Force non-interactive: prevent apt/dpkg from hanging on any config prompts
export DEBIAN_FRONTEND=noninteractive
export DEBIAN_PRIORITY=critical

# Pre-seed debconf (single source: install/utils/debconf_preseed.sh)
"$PROJECT_ROOT/install/utils/debconf_preseed.sh"

# Create minimal root SSH keys so setup_secure_user has something to migrate (avoids lockout warning)
mkdir -p /root/.ssh
if [[ ! -f /root/.ssh/authorized_keys ]]; then
    # Generate a placeholder key so the migration logic runs (real key not needed for test)
    echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI test-key-for-e2e" > /root/.ssh/authorized_keys
    chmod 600 /root/.ssh/authorized_keys
fi

if "$PROJECT_ROOT/run_1.sh"; then
    record_test "run_1.sh execution" "PASS"
else
    record_test "run_1.sh execution" "FAIL"
    print_test_summary
    exit 1
fi

# =============================================================================
# PHASE 2: Verify Results
# =============================================================================
log_header "Phase 2: Verifying run_1.sh Results"

# Verify handoff file exists
if [[ -f /root/handoff_info.txt ]]; then
    record_test "Handoff info file created" "PASS"
    if grep -q "$LOGIN_UNAME" /root/handoff_info.txt; then
        record_test "Handoff contains username" "PASS"
    else
        record_test "Handoff contains username" "FAIL"
    fi
else
    record_test "Handoff info file created" "FAIL"
fi

# Verify user was created (LOGIN_UNAME from exports.sh)
if id -u "$LOGIN_UNAME" &>/dev/null; then
    record_test "User '$LOGIN_UNAME' created" "PASS"
else
    record_test "User '$LOGIN_UNAME' created" "FAIL"
fi

# Verify user has sudo
if sudo -u "$LOGIN_UNAME" sudo -n true 2>/dev/null; then
    record_test "User has sudo (NOPASSWD)" "PASS"
else
    record_test "User has sudo (NOPASSWD)" "FAIL"
fi

# Verify SSH keys migrated to new user
if [[ -f /home/${LOGIN_UNAME}/.ssh/authorized_keys ]]; then
    record_test "SSH keys migrated to new user" "PASS"
else
    record_test "SSH keys migrated to new user" "FAIL"
fi

# Verify SSH config was applied
if [[ -f /etc/ssh/sshd_config.backup ]]; then
    record_test "SSH config backed up" "PASS"
else
    record_test "SSH config backed up" "FAIL"
fi

# Verify sysctl drop-in was created
if [[ -f /etc/sysctl.d/99-eth2-hardening.conf ]]; then
    record_test "Network hardening (sysctl) applied" "PASS"
else
    record_test "Network hardening (sysctl) applied" "FAIL"
fi

# Verify security monitoring script exists
if [[ -f /usr/local/bin/security_monitor.sh ]]; then
    record_test "Security monitoring script installed" "PASS"
else
    record_test "Security monitoring script installed" "FAIL"
fi

# Verify UFW is active (consolidated_security)
if ufw status 2>/dev/null | grep -q "Status: active"; then
    record_test "UFW firewall active" "PASS"
else
    record_test "UFW firewall active" "FAIL"
fi

# Verify fail2ban is running and has active jails
if systemctl is-active --quiet fail2ban 2>/dev/null; then
    record_test "Fail2ban service running" "PASS"
    # At least sshd jail should be in the jail list (confirms jails started)
    if fail2ban-client status 2>/dev/null | grep -q "sshd"; then
        record_test "Fail2ban sshd jail active" "PASS"
    else
        record_test "Fail2ban sshd jail active" "FAIL"
    fi
else
    record_test "Fail2ban service running" "FAIL"
fi

# Verify AIDE is installed and properly initialized
if command -v aide &>/dev/null; then
    record_test "AIDE installed" "PASS"
    if [[ -f /var/lib/aide/aide.db ]]; then
        record_test "AIDE database initialized" "PASS"
    else
        record_test "AIDE database initialized" "FAIL"
    fi
    if [[ -f /usr/local/bin/aide_check.sh ]] && [[ -x /usr/local/bin/aide_check.sh ]]; then
        record_test "AIDE check script installed" "PASS"
        if /usr/local/bin/aide_check.sh &>/dev/null; then
            record_test "AIDE check script runs successfully" "PASS"
        else
            record_test "AIDE check script runs successfully" "FAIL"
        fi
        # Verify crontab entry was added (root's crontab - run_1 runs as root)
        if crontab -l 2>/dev/null | grep -Fq "/usr/local/bin/aide_check.sh"; then
            record_test "AIDE cron job scheduled" "PASS"
        else
            record_test "AIDE cron job scheduled" "FAIL"
        fi
    else
        record_test "AIDE check script installed" "FAIL"
    fi
else
    record_test "AIDE installed" "FAIL"
fi

# =============================================================================
# SUMMARY
# =============================================================================
print_test_summary
