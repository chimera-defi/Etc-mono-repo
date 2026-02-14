#!/bin/bash
# CI Test Script for run_2.sh (Phase 2 - Client Installation)
# Runs inside Docker container
# Tests script structure and validates installation would work
# Note: Full E2E with snap requires special Docker setup, so we test components

set -Eeuo pipefail

# Setup paths and source shared utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_PREFIX="CI"
# shellcheck source=lib/test_utils.sh
source "$SCRIPT_DIR/lib/test_utils.sh"

log_info "╔════════════════════════════════════════════════════════════════╗"
log_info "║  CI Test: run_2.sh (Phase 2 - Structure Validation)           ║"
log_info "╚════════════════════════════════════════════════════════════════╝"

cd "$PROJECT_ROOT"

# Source exports to get variables
source_exports
source_common_functions

# Test 1: Verify required files exist
log_info "Test 1: Verify required files..."
for file in run_2.sh exports.sh lib/common_functions.sh; do
    assert_file_exists "$PROJECT_ROOT/$file" "$file"
done

# Test 2: Verify run_2.sh syntax
log_info "Test 2: Verify run_2.sh syntax..."
if bash -n "$PROJECT_ROOT/run_2.sh"; then
    log_info "  ✓ Syntax valid"
else
    log_error "  ✗ Syntax error in run_2.sh"
    exit 1
fi

# Test 3: Verify all install scripts exist and have valid syntax
log_info "Test 3: Verify install scripts..."
install_scripts=(
    "install/utils/install_dependencies.sh"
    "install/execution/geth.sh"
    "install/consensus/prysm.sh"
    "install/mev/install_mev_boost.sh"
    "install/mev/install_commit_boost.sh"
    "install/utils/select_clients.sh"
)
for script in "${install_scripts[@]}"; do
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

# Test 4: Verify common functions can be sourced
log_info "Test 4: Verify functions load correctly..."
if bash -c "source '$PROJECT_ROOT/exports.sh' && source '$PROJECT_ROOT/lib/common_functions.sh' && declare -f log_info >/dev/null" 2>/dev/null; then
    log_info "  ✓ Common functions load correctly"
else
    log_error "  ✗ Failed to load common functions"
    exit 1
fi

# Test 5: Test key functions work
log_info "Test 5: Test key functions..."

# Test validate_menu_choice
if validate_menu_choice "1" 3; then
    log_info "  ✓ validate_menu_choice works"
else
    log_error "  ✗ validate_menu_choice failed"
    exit 1
fi

# Test ensure_directory
test_dir="/tmp/ci_test_dir_$$"
if ensure_directory "$test_dir" && [[ -d "$test_dir" ]]; then
    log_info "  ✓ ensure_directory works"
    rm -rf "$test_dir"
else
    log_error "  ✗ ensure_directory failed"
    exit 1
fi

# Test 6: Create JWT secret
log_info "Test 6: Test JWT secret creation..."
jwt_file="$HOME/secrets/jwt.hex"
mkdir -p "$HOME/secrets"
if ensure_jwt_secret "$jwt_file"; then
    if [[ -f "$jwt_file" ]]; then
        jwt_len=$(wc -c < "$jwt_file")
        if [[ $jwt_len -ge 64 ]]; then
            log_info "  ✓ JWT secret created (${jwt_len} chars)"
        else
            log_error "  ✗ JWT secret too short"
            exit 1
        fi
    else
        log_error "  ✗ JWT secret file not found"
        exit 1
    fi
else
    log_error "  ✗ ensure_jwt_secret failed"
    exit 1
fi

# Test 7: Verify config files exist
log_info "Test 7: Verify config files..."
config_files=(
    "configs/prysm/prysm_beacon_conf.yaml"
    "configs/prysm/prysm_validator_conf.yaml"
    "configs/teku/teku_beacon_base.yaml"
    "configs/lodestar/lodestar_beacon_base.json"
    "configs/besu/besu_base.toml"
    "configs/ethrex/ethrex_base.toml"
)
for config in "${config_files[@]}"; do
    if [[ -f "$config" ]]; then
        log_info "  ✓ $config"
    else
        log_error "  ✗ Missing: $config"
        exit 1
    fi
done

log_info "╔════════════════════════════════════════════════════════════════╗"
log_info "║  ✓ run_2.sh - Structure PASSED                                ║"
log_info "║  Validated: Structure, syntax, functions, configs             ║"
log_info "╚════════════════════════════════════════════════════════════════╝"
exit 0
