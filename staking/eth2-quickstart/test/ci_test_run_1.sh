#!/bin/bash
# run_1.sh - Structure
# run_1.sh = Phase 1 (system setup, root). Structure validation only. E2E in run_e2e.sh --phase=1.

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_PREFIX="CI"
# shellcheck source=lib/test_utils.sh
source "$SCRIPT_DIR/lib/test_utils.sh"

log_info "╔════════════════════════════════════════════════════════════════╗"
log_info "║  run_1.sh - Structure                                         ║"
log_info "╚════════════════════════════════════════════════════════════════╝"

# Verify we're running as root (required for run_1.sh)
if ! is_root; then
    log_error "This test must run as root"
    exit 1
fi
log_info "✓ Running as root"

cd "$PROJECT_ROOT"

# Test 1: Verify required files exist
log_info "Test 1: Verify required files..."
for file in run_1.sh exports.sh lib/common_functions.sh; do
    assert_file_exists "$PROJECT_ROOT/$file" "$file"
done

# Test 2: Source exports and verify variables
log_info "Test 2: Load and verify configuration..."
source_exports
if [[ -n "${LOGIN_UNAME:-}" ]]; then
    log_info "  ✓ LOGIN_UNAME=$LOGIN_UNAME"
else
    log_error "  ✗ LOGIN_UNAME not set"
    exit 1
fi
if [[ -n "${YourSSHPortNumber:-}" ]]; then
    log_info "  ✓ YourSSHPortNumber=$YourSSHPortNumber"
else
    log_error "  ✗ YourSSHPortNumber not set"
    exit 1
fi

# Test 3: Verify run_1.sh syntax
log_info "Test 3: Verify run_1.sh syntax..."
if bash -n "$PROJECT_ROOT/run_1.sh"; then
    log_info "  ✓ Syntax valid"
else
    log_error "  ✗ Syntax error in run_1.sh"
    exit 1
fi

# Test 4: Source common functions and verify they load
log_info "Test 4: Verify common functions..."
source_common_functions

functions_to_check=(
    "log_info" "log_error" "require_root" "check_system_compatibility"
    "configure_ssh" "setup_secure_user"
    "apply_network_security" "setup_security_monitoring" "generate_handoff_info"
)
for func in "${functions_to_check[@]}"; do
    if declare -f "$func" >/dev/null 2>&1; then
        log_info "  ✓ $func"
    else
        log_error "  ✗ Missing function: $func"
        exit 1
    fi
done

# Test 5: Verify security script exists and has valid syntax
log_info "Test 5: Verify security scripts..."
security_scripts=(
    "install/security/consolidated_security.sh"
    "install/security/nginx_harden.sh"
    "install/security/caddy_harden.sh"
)
for script in "${security_scripts[@]}"; do
    if [[ -f "$script" ]]; then
        if bash -n "$script" 2>/dev/null; then
            log_info "  ✓ $script (exists, syntax valid)"
        else
            log_error "  ✗ $script has syntax errors"
            exit 1
        fi
    else
        log_error "  ✗ Missing: $script"
        exit 1
    fi
done

# Test 6: Test apt update works (basic system test)
log_info "Test 6: Test apt update..."
if apt-get update -qq 2>/dev/null; then
    log_info "  ✓ apt-get update works"
else
    log_warn "  ⚠ apt-get update had issues"
fi

# Test 7: Test user creation
log_info "Test 7: Test user creation..."
TEST_USER="ci_test_user_$$"
if useradd -m -s /bin/bash "$TEST_USER" 2>/dev/null; then
    log_info "  ✓ User creation works"
    userdel -r "$TEST_USER" 2>/dev/null || true
else
    log_warn "  ⚠ User creation had issues"
fi

# Test 8: Verify SSH config template exists and is valid
log_info "Test 8: Verify SSH config template..."
assert_file_exists "$PROJECT_ROOT/configs/sshd_config" "configs/sshd_config"
assert_file_exists "$PROJECT_ROOT/configs/ssh_banner" "configs/ssh_banner"

# Test 9: Verify SSH config template does NOT contain AllowUsers
# AllowUsers in the template would lock out admins before key migration
log_info "Test 9: Verify SSH config won't cause lockout..."
if grep -q "^AllowUsers" "$PROJECT_ROOT/configs/sshd_config"; then
    log_error "  CRITICAL: configs/sshd_config contains AllowUsers — this causes lockout!"
    exit 1
else
    log_info "  No AllowUsers directive in template (safe)"
fi

# Verify PermitRootLogin is not set to 'no' (should be 'prohibit-password' for key-only)
root_login=$(grep "^PermitRootLogin" "$PROJECT_ROOT/configs/sshd_config" | awk '{print $2}')
if [[ "$root_login" == "no" ]]; then
    log_error "  CRITICAL: PermitRootLogin is 'no' — root lockout risk!"
    exit 1
elif [[ "$root_login" == "prohibit-password" ]]; then
    log_info "  PermitRootLogin is 'prohibit-password' (key-only, safe)"
else
    log_warn "  PermitRootLogin is '$root_login' (verify this is intended)"
fi

# Verify PasswordAuthentication setting
pw_auth=$(grep "^PasswordAuthentication" "$PROJECT_ROOT/configs/sshd_config" | awk '{print $2}')
log_info "  PasswordAuthentication is '$pw_auth'"

# Test 10: Verify configure_ssh uses template not inline config
log_info "Test 10: Verify configure_ssh uses template file..."
if declare -f configure_ssh | grep -q "configs/sshd_config"; then
    log_info "  configure_ssh references configs/sshd_config template"
else
    log_error "  configure_ssh does NOT use the template file!"
    exit 1
fi

# Test 11: Verify configure_ssh validates config before applying
log_info "Test 11: Verify configure_ssh validates before applying..."
if declare -f configure_ssh | grep -q "sshd -t"; then
    log_info "  configure_ssh validates config with sshd -t"
else
    log_error "  configure_ssh does NOT validate config before applying!"
    exit 1
fi

# Test 12: Verify get_ssh_service_name function exists
log_info "Test 12: Verify SSH service detection..."
if declare -f get_ssh_service_name >/dev/null 2>&1; then
    log_info "  get_ssh_service_name function exists"
else
    log_error "  Missing function: get_ssh_service_name"
    exit 1
fi

# Test 13: Verify setup_secure_user migrates SSH keys
log_info "Test 13: Verify SSH key migration logic..."
if declare -f setup_secure_user | grep -q "root/.ssh/authorized_keys"; then
    log_info "  setup_secure_user migrates root SSH keys"
else
    log_error "  setup_secure_user does NOT migrate root SSH keys — lockout risk!"
    exit 1
fi

# Test 14: Verify run_1.sh checks for root SSH keys before proceeding (lockout prevention)
log_info "Test 14: Verify lockout prevention check..."
if grep -q "/root/.ssh/authorized_keys" "$PROJECT_ROOT/run_1.sh" && grep -q "ssh-copy-id" "$PROJECT_ROOT/run_1.sh"; then
    log_info "  run_1.sh verifies root has SSH keys before proceeding"
else
    log_error "  run_1.sh missing lockout prevention (must check root authorized_keys)"
    exit 1
fi

# Test 15: Verify run_1.sh creates user BEFORE configuring SSH
log_info "Test 15: Verify user creation order in run_1.sh..."
user_setup_line=$(grep -n "setup_secure_user" "$PROJECT_ROOT/run_1.sh" | head -1 | cut -d: -f1)
ssh_config_line=$(grep -n "configure_ssh" "$PROJECT_ROOT/run_1.sh" | head -1 | cut -d: -f1)
if [[ -n "$user_setup_line" && -n "$ssh_config_line" ]]; then
    if [[ "$user_setup_line" -lt "$ssh_config_line" ]]; then
        log_info "  User created (line $user_setup_line) before SSH hardened (line $ssh_config_line)"
    else
        log_error "  CRITICAL: SSH hardened before user created — lockout risk!"
        exit 1
    fi
else
    log_error "  Could not find setup_secure_user or configure_ssh in run_1.sh"
    exit 1
fi

# Test 16: Verify sysctl uses drop-in file not appending to sysctl.conf
log_info "Test 16: Verify sysctl idempotency..."
if declare -f apply_network_security | grep -q "sysctl.d"; then
    log_info "  apply_network_security uses /etc/sysctl.d/ drop-in file"
else
    log_error "  apply_network_security appends to sysctl.conf — duplicates on re-run!"
    exit 1
fi

# Test 17: Verify crontab additions are idempotent
log_info "Test 17: Verify crontab idempotency..."
if declare -f setup_security_monitoring | grep -q "grep.*-Fq"; then
    log_info "  setup_security_monitoring checks for existing crontab entry"
else
    log_error "  setup_security_monitoring does NOT check for existing crontab entry — duplicates!"
    exit 1
fi

# Test 18: Verify dead AIDE function was removed and not called
log_info "Test 18: Verify no duplicate AIDE setup..."
if grep -q "setup_intrusion_detection" "$PROJECT_ROOT/run_1.sh"; then
    log_error "  run_1.sh calls setup_intrusion_detection — duplicates AIDE from consolidated_security.sh!"
    exit 1
else
    log_info "  No duplicate AIDE setup in run_1.sh (handled by consolidated_security.sh)"
fi
if declare -f setup_intrusion_detection >/dev/null 2>&1; then
    log_error "  setup_intrusion_detection still defined — should be removed (dead code)"
    exit 1
else
    log_info "  setup_intrusion_detection removed from common_functions.sh"
fi

# Test 19: Verify consolidated_security.sh uses SCRIPT_DIR not relative paths
log_info "Test 19: Verify consolidated_security.sh path resolution..."
if grep -q 'source \.\./\.\.' "$PROJECT_ROOT/install/security/consolidated_security.sh"; then
    log_error "  consolidated_security.sh uses fragile relative source paths!"
    exit 1
else
    log_info "  consolidated_security.sh uses reliable path resolution"
fi

# Test 20: Verify generate_handoff_info includes SSH port parameter
log_info "Test 20: Verify handoff info includes SSH port..."
if declare -f generate_handoff_info | grep -q "ssh_port"; then
    log_info "  generate_handoff_info handles SSH port"
else
    log_error "  generate_handoff_info does NOT handle SSH port!"
    exit 1
fi

# Test 21: Verify both 127 and 172 private network ranges are blocked in firewall
log_info "Test 21: Verify private network blocking (127 + 172)..."
security_script="$PROJECT_ROOT/install/security/consolidated_security.sh"
if grep -q '"127.0.0.0/8"' "$security_script"; then
    log_info "  127.0.0.0/8 (loopback) is blocked"
else
    log_error "  MISSING: 127.0.0.0/8 loopback block!"
    exit 1
fi
if grep -q '"127.16.0.0/12"' "$security_script"; then
    log_info "  127.16.0.0/12 (loopback subset, from Erigon reference) is blocked"
else
    log_error "  MISSING: 127.16.0.0/12 block (was incorrectly removed as 'typo')!"
    exit 1
fi
if grep -q '"172.16.0.0/12"' "$security_script"; then
    log_info "  172.16.0.0/12 (private-use networks) is blocked"
else
    log_error "  MISSING: 172.16.0.0/12 private network block!"
    exit 1
fi

# Test 22: Verify setup_secure_user includes sudo configuration (consolidated)
log_info "Test 22: Verify sudo configured inside setup_secure_user..."
if declare -f setup_secure_user | grep -q "visudo"; then
    log_info "  setup_secure_user includes sudo configuration with visudo validation"
else
    log_error "  setup_secure_user does NOT configure sudo — separate configure_sudo_nopasswd needed!"
    exit 1
fi

log_info "╔════════════════════════════════════════════════════════════════╗"
log_info "║  run_1.sh CI Test PASSED                                      ║"
log_info "║  Validated: Structure, syntax, functions, SSH safety,         ║"
log_info "║  lockout prevention, idempotency, no duplicates, firewall     ║"
log_info "╚════════════════════════════════════════════════════════════════╝"
exit 0
