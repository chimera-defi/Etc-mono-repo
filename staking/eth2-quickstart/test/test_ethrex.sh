#!/bin/bash
# Ethrex Client Tests
# Tests for the ethrex execution client installation and configuration

set -Eeuo pipefail

# Setup paths and source shared utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_PREFIX="ETHREX"
# shellcheck source=lib/test_utils.sh
source "$SCRIPT_DIR/lib/test_utils.sh"

log_header "Ethrex Execution Client Tests"
log_info "Testing ethrex installation script and configuration"

# =============================================================================
# PHASE 1: Script Structure Tests
# =============================================================================
log_header "Phase 1: Script Structure Tests"

ETHREX_SCRIPT="$PROJECT_ROOT/install/execution/ethrex.sh"
ETHREX_CONFIG="$PROJECT_ROOT/configs/ethrex/ethrex_base.toml"

# Test script exists
assert_file_exists "$ETHREX_SCRIPT" "ethrex.sh installation script"

# Test config exists
assert_file_exists "$ETHREX_CONFIG" "ethrex_base.toml configuration"

# Test script has shebang
if head -1 "$ETHREX_SCRIPT" | grep -q "^#!/bin/bash"; then
    record_test "ethrex.sh has proper shebang" "PASS"
else
    record_test "ethrex.sh has proper shebang" "FAIL"
fi

# Test script sources required files
if grep -q "source.*exports.sh" "$ETHREX_SCRIPT" && grep -q "source.*common_functions.sh" "$ETHREX_SCRIPT"; then
    record_test "ethrex.sh sources required files" "PASS"
else
    record_test "ethrex.sh sources required files" "FAIL"
fi

# Test script has valid syntax
assert_valid_syntax "$ETHREX_SCRIPT" "ethrex.sh"

# Test config has valid syntax (TOML basic check)
if grep -q "^\[" "$ETHREX_CONFIG"; then
    record_test "ethrex_base.toml has TOML sections" "PASS"
else
    record_test "ethrex_base.toml has TOML sections" "FAIL"
fi

# =============================================================================
# PHASE 2: Shellcheck Validation
# =============================================================================
log_header "Phase 2: Shellcheck Validation"

if command -v shellcheck &>/dev/null; then
    if check_shellcheck "$ETHREX_SCRIPT"; then
        record_test "ethrex.sh passes shellcheck" "PASS"
    else
        record_test "ethrex.sh passes shellcheck" "FAIL"
        log_error "Shellcheck errors:"
        run_shellcheck "$ETHREX_SCRIPT" || true
    fi
else
    log_warn "shellcheck not available, skipping"
    record_test "ethrex.sh passes shellcheck" "SKIP"
fi

# =============================================================================
# PHASE 3: Script Content Validation
# =============================================================================
log_header "Phase 3: Script Content Validation"

# Test script uses common functions
for func in log_installation_start check_system_requirements setup_firewall_rules ensure_directory secure_download ensure_jwt_secret create_systemd_service; do
    if grep -q "$func" "$ETHREX_SCRIPT"; then
        record_test "Uses common function: $func" "PASS"
    else
        record_test "Uses common function: $func" "FAIL"
    fi
done

# Test script handles both architectures
if grep -q "x86_64" "$ETHREX_SCRIPT" && grep -q "aarch64" "$ETHREX_SCRIPT"; then
    record_test "Handles multiple architectures" "PASS"
else
    record_test "Handles multiple architectures" "FAIL"
fi

# Test script has fallback build from source
if grep -q "cargo build" "$ETHREX_SCRIPT"; then
    record_test "Has fallback build from source" "PASS"
else
    record_test "Has fallback build from source" "FAIL"
fi

# Test script creates systemd service
if grep -q 'create_systemd_service.*eth1' "$ETHREX_SCRIPT"; then
    record_test "Creates eth1 systemd service" "PASS"
else
    record_test "Creates eth1 systemd service" "FAIL"
fi

# =============================================================================
# PHASE 4: Binary Download Test (if network available)
# =============================================================================
log_header "Phase 4: Binary Download Test"

ETHREX_VERSION="v7.0.0"
ETHREX_BINARY_URL="https://github.com/lambdaclass/ethrex/releases/download/${ETHREX_VERSION}/ethrex-linux-x86_64"

# Test if binary URL is accessible (just check headers, don't download full binary)
if curl -sI --max-time 10 "$ETHREX_BINARY_URL" 2>/dev/null | grep -q "302\|200"; then
    record_test "ethrex binary URL accessible" "PASS"
    
    # Optional: Download and verify binary works (only in Docker or if explicitly requested)
    if is_docker || [[ "${TEST_DOWNLOAD_BINARY:-false}" == "true" ]]; then
        TEST_DIR="/tmp/ethrex_test_$$"
        mkdir -p "$TEST_DIR"
        
        if wget -q --timeout=60 "$ETHREX_BINARY_URL" -O "$TEST_DIR/ethrex" 2>/dev/null; then
            chmod +x "$TEST_DIR/ethrex"
            
            if "$TEST_DIR/ethrex" --version &>/dev/null; then
                record_test "ethrex binary executes successfully" "PASS"
                
                # Verify version output
                BINARY_VERSION=$("$TEST_DIR/ethrex" --version 2>&1)
                if echo "$BINARY_VERSION" | grep -q "ethrex"; then
                    record_test "ethrex reports valid version" "PASS"
                else
                    record_test "ethrex reports valid version" "FAIL"
                fi
            else
                record_test "ethrex binary executes successfully" "FAIL"
            fi
        else
            record_test "ethrex binary downloads successfully" "FAIL"
        fi
        
        rm -rf "$TEST_DIR"
    else
        log_info "Skipping binary execution test (run in Docker or set TEST_DOWNLOAD_BINARY=true)"
    fi
else
    record_test "ethrex binary URL accessible" "FAIL"
    log_warn "Could not access ethrex binary URL - network issue?"
fi

# =============================================================================
# PHASE 5: Configuration Integration Tests
# =============================================================================
log_header "Phase 5: Configuration Integration Tests"

# Test exports.sh has ethrex variables
source_exports 2>/dev/null || true

if [[ -n "${ETHREX_CACHE:-}" ]]; then
    record_test "ETHREX_CACHE defined in exports.sh" "PASS"
else
    record_test "ETHREX_CACHE defined in exports.sh" "FAIL"
fi

if [[ -n "${ETHREX_HTTP_PORT:-}" ]]; then
    record_test "ETHREX_HTTP_PORT defined in exports.sh" "PASS"
else
    record_test "ETHREX_HTTP_PORT defined in exports.sh" "FAIL"
fi

if [[ -n "${ETHREX_ENGINE_PORT:-}" ]]; then
    record_test "ETHREX_ENGINE_PORT defined in exports.sh" "PASS"
else
    record_test "ETHREX_ENGINE_PORT defined in exports.sh" "FAIL"
fi

# =============================================================================
# PHASE 6: Client Selection Integration Tests
# =============================================================================
log_header "Phase 6: Client Selection Integration Tests"

SELECT_CLIENTS_SCRIPT="$PROJECT_ROOT/install/utils/select_clients.sh"

if [[ -f "$SELECT_CLIENTS_SCRIPT" ]]; then
    # Test ethrex is listed in client selection
    if grep -q "Ethrex" "$SELECT_CLIENTS_SCRIPT"; then
        record_test "Ethrex listed in client selection" "PASS"
    else
        record_test "Ethrex listed in client selection" "FAIL"
    fi
    
    # Test ethrex install path is correct
    if grep -q "../execution/ethrex.sh" "$SELECT_CLIENTS_SCRIPT"; then
        record_test "Correct ethrex install path in selection" "PASS"
    else
        record_test "Correct ethrex install path in selection" "FAIL"
    fi
    
    # Test ethrex is in recommendations
    if grep -q "Ethrex" "$SELECT_CLIENTS_SCRIPT" | grep -q -i "client diversity\|early adopter"; then
        record_test "Ethrex in recommendations" "PASS"
    else
        # Check alternative recommendation patterns
        if grep -A5 "Client Diversity" "$SELECT_CLIENTS_SCRIPT" | grep -q "Ethrex"; then
            record_test "Ethrex in client diversity recommendations" "PASS"
        else
            record_test "Ethrex in client diversity recommendations" "FAIL"
        fi
    fi
else
    log_warn "select_clients.sh not found"
    record_test "Client selection script exists" "FAIL"
fi

# =============================================================================
# PHASE 7: CLI Options Validation
# =============================================================================
log_header "Phase 7: CLI Options Validation"

# Verify script uses verified CLI options
VERIFIED_OPTIONS=(
    "--network"
    "--datadir"
    "--syncmode"
    "--http.addr"
    "--http.port"
    "--ws.enabled"
    "--ws.addr"
    "--ws.port"
    "--authrpc.addr"
    "--authrpc.port"
    "--authrpc.jwtsecret"
    "--p2p.port"
    "--target.peers"
    "--metrics"
    "--metrics.addr"
    "--metrics.port"
    "--log.level"
)

# Check for port variable usage (optimization check)
PORT_VARS=(
    "ETHREX_HTTP_PORT"
    "ETHREX_WS_PORT"
    "ETHREX_ENGINE_PORT"
    "ETHREX_P2P_PORT"
    "ETHREX_METRICS_PORT"
)

for var in "${PORT_VARS[@]}"; do
    if grep -q "\$$var" "$ETHREX_SCRIPT"; then
        record_test "Uses port variable: \$$var" "PASS"
    else
        record_test "Uses port variable: \$$var" "FAIL"
    fi
done

for opt in "${VERIFIED_OPTIONS[@]}"; do
    if grep -q -- "$opt" "$ETHREX_SCRIPT"; then
        record_test "Uses CLI option: $opt" "PASS"
    else
        record_test "Uses CLI option: $opt" "FAIL"
    fi
done

# Verify script does NOT use deprecated/invalid options
INVALID_OPTIONS=(
    "--discovery.port"  # Not a valid option in v7.0.0
    "--builder.extra-data"  # Removed from our command (optional)
)

for opt in "${INVALID_OPTIONS[@]}"; do
    if grep -q -- "$opt" "$ETHREX_SCRIPT"; then
        record_test "Does not use invalid option: $opt" "FAIL"
    else
        record_test "Does not use invalid option: $opt" "PASS"
    fi
done

# =============================================================================
# SUMMARY
# =============================================================================
print_test_summary
exit $?
