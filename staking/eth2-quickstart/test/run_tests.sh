#!/bin/bash

# Comprehensive Test Runner for Ethereum Node Setup Scripts
# Supports multiple test modes: lint, unit, integration, full

set -Eeuo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Test configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RESULTS_DIR="${SCRIPT_DIR}/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="${RESULTS_DIR}/test_results_${TIMESTAMP}.txt"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0
TESTS_WARNED=0

# Default test mode
TEST_MODE="${TEST_MODE:-all}"
USE_MOCKS="${USE_MOCKS:-true}"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

log_header() {
    echo -e "\n${BOLD}${BLUE}=========================================${NC}"
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BOLD}${BLUE}=========================================${NC}\n"
}

log_subheader() {
    echo -e "\n${CYAN}--- $1 ---${NC}\n"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_test() {
    local status="$1"
    local name="$2"
    local details="${3:-}"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    case "$status" in
        "PASS")
            TESTS_PASSED=$((TESTS_PASSED + 1))
            echo -e "${GREEN}✓${NC} ${name}"
            ;;
        "FAIL")
            TESTS_FAILED=$((TESTS_FAILED + 1))
            echo -e "${RED}✗${NC} ${name}"
            if [[ -n "$details" ]]; then
                echo -e "  ${RED}→ $details${NC}"
            fi
            ;;
        "SKIP")
            TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
            echo -e "${YELLOW}⊘${NC} ${name} (skipped)"
            ;;
        "WARN")
            TESTS_WARNED=$((TESTS_WARNED + 1))
            echo -e "${YELLOW}⚠${NC} ${name} (warning)"
            ;;
    esac
    
    # Log to results file
    echo "[$status] $name: $details" >> "$RESULTS_FILE"
}

# =============================================================================
# PHASE 0: ENVIRONMENT SETUP
# =============================================================================

setup_test_environment() {
    log_header "PHASE 0: Test Environment Setup"
    
    # Create results directory
    mkdir -p "$RESULTS_DIR"
    
    # Initialize results file
    cat > "$RESULTS_FILE" << EOF
# Ethereum Node Setup Script Test Results
# Generated: $(date)
# Test Mode: $TEST_MODE
# Use Mocks: $USE_MOCKS

EOF
    
    # Check we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/exports.sh" ]]; then
        log_error "exports.sh not found in $PROJECT_ROOT"
        exit 1
    fi
    
    log_info "Project root: $PROJECT_ROOT"
    log_info "Results file: $RESULTS_FILE"
    log_info "Test mode: $TEST_MODE"
    log_info "Using mocks: $USE_MOCKS"
    
    # Export for child scripts
    export PROJECT_ROOT
    export USE_MOCKS
    export TEST_MODE
}

# =============================================================================
# PHASE 1: LINT AND STATIC ANALYSIS
# =============================================================================

run_lint_tests() {
    log_header "PHASE 1: Lint and Static Analysis"
    
    # Check shellcheck is available
    if ! command -v shellcheck &> /dev/null; then
        log_warn "shellcheck not found - skipping lint tests"
        return 0
    fi
    
    log_subheader "Running shellcheck on all scripts"
    
    local scripts_checked=0
    local scripts_passed=0
    local scripts_failed=0
    
    # Find all shell scripts
    while IFS= read -r script; do
        scripts_checked=$((scripts_checked + 1))
        local script_name="${script#"$PROJECT_ROOT"/}"
        
        # Run shellcheck with common exclusions
        if shellcheck -x --exclude=SC2317,SC1091,SC1090,SC2034,SC2031,SC2181 "$script" 2>/dev/null; then
            log_test "PASS" "shellcheck: $script_name"
            scripts_passed=$((scripts_passed + 1))
        else
            log_test "FAIL" "shellcheck: $script_name" "Has shellcheck warnings"
            scripts_failed=$((scripts_failed + 1))
        fi
    done < <(find "$PROJECT_ROOT" -name "*.sh" -type f ! -path "*/test/*")
    
    log_info "Shellcheck: $scripts_passed/$scripts_checked scripts passed"
    
    log_subheader "Checking script syntax (bash -n)"
    
    while IFS= read -r script; do
        local script_name="${script#"$PROJECT_ROOT"/}"
        
        if bash -n "$script" 2>/dev/null; then
            log_test "PASS" "syntax: $script_name"
        else
            log_test "FAIL" "syntax: $script_name" "Syntax error"
        fi
    done < <(find "$PROJECT_ROOT" -name "*.sh" -type f ! -path "*/test/*")
    
    log_subheader "Checking for shebangs"
    
    while IFS= read -r script; do
        local script_name="${script#"$PROJECT_ROOT"/}"
        
        if head -1 "$script" | grep -q "^#!/"; then
            log_test "PASS" "shebang: $script_name"
        else
            log_test "FAIL" "shebang: $script_name" "Missing shebang"
        fi
    done < <(find "$PROJECT_ROOT" -name "*.sh" -type f ! -path "*/test/*")
}

# =============================================================================
# PHASE 2: SOURCE FILE VERIFICATION
# =============================================================================

run_source_verification() {
    log_header "PHASE 2: Source File and Function Verification"
    
    log_subheader "Verifying exports.sh"
    
    # Test exports.sh loads without errors
    if (source "$PROJECT_ROOT/exports.sh" 2>/dev/null); then
        log_test "PASS" "exports.sh: loads successfully"
    else
        log_test "FAIL" "exports.sh: load failed"
    fi
    
    # Check required variables exist
    source "$PROJECT_ROOT/exports.sh" 2>/dev/null || true
    
    local required_vars=(
        "LOGIN_UNAME"
        "YourSSHPortNumber"
        "SERVER_NAME"
        "FEE_RECIPIENT"
        "MEV_RELAYS"
        "MEV_PORT"
        "COMMIT_BOOST_PORT"
        "ENGINE_PORT"
        "GETH_CACHE"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -n "${!var:-}" ]]; then
            log_test "PASS" "exports.sh: $var is set"
        else
            log_test "FAIL" "exports.sh: $var is not set"
        fi
    done
    
    log_subheader "Verifying lib/common_functions.sh"
    
    # Test common_functions.sh loads without errors
    if (source "$PROJECT_ROOT/lib/common_functions.sh" 2>/dev/null); then
        log_test "PASS" "common_functions.sh: loads successfully"
    else
        log_test "FAIL" "common_functions.sh: load failed"
    fi
    
    # Check required functions exist
    source "$PROJECT_ROOT/lib/common_functions.sh" 2>/dev/null || true
    
    local required_functions=(
        "log_info"
        "log_warn"
        "log_error"
        "check_user"
        "ensure_directory"
        "command_exists"
        "get_latest_release"
        "extract_archive"
        "download_file"
        "secure_download"
        "create_systemd_service"
        "enable_systemd_service"
        "enable_and_start_systemd_service"
        "stop_all_services"
        "add_ppa_repository"
        "install_dependencies"
        "setup_firewall_rules"
        "ensure_jwt_secret"
        "validate_menu_choice"
        "check_system_requirements"
        "check_system_compatibility"
        "require_root"
        "setup_secure_user"
        "configure_ssh"
        "generate_handoff_info"
        "apply_network_security"
        "setup_security_monitoring"
        "log_installation_start"
        "log_installation_complete"
        "display_client_setup_info"
        "create_temp_config_dir"
        "get_script_directories"
        "merge_client_config"
    )
    
    for func in "${required_functions[@]}"; do
        if declare -f "$func" > /dev/null 2>&1; then
            log_test "PASS" "function exists: $func"
        else
            log_test "FAIL" "function missing: $func"
        fi
    done
    
    log_subheader "Verifying lib/utils.sh"
    
    if (source "$PROJECT_ROOT/lib/utils.sh" 2>/dev/null); then
        log_test "PASS" "utils.sh: loads successfully"
    else
        log_test "FAIL" "utils.sh: load failed"
    fi
    
    # Check utils.sh functions (backward-compat shim)
    # Note: utils.sh is deprecated - functions are now in common_functions.sh
    source "$PROJECT_ROOT/lib/utils.sh" 2>/dev/null || true
    
    # Only check for functions that should exist for backward compatibility
    local utils_functions=(
        "require_root"
        "append_once"
    )
    
    for func in "${utils_functions[@]}"; do
        if declare -f "$func" > /dev/null 2>&1; then
            log_test "PASS" "utils function exists: $func"
        else
            log_test "FAIL" "utils function missing: $func"
        fi
    done
}

# =============================================================================
# PHASE 3: SCRIPT SOURCE PATH VERIFICATION
# =============================================================================

run_source_path_tests() {
    log_header "PHASE 3: Script Source Path Verification"
    
    log_subheader "Checking relative source paths from each script location"
    
    # Define expected source patterns for different directories
    declare -A expected_sources=(
        ["install/execution"]="../../exports.sh ../../lib/common_functions.sh"
        ["install/consensus"]="../../exports.sh ../../lib/common_functions.sh"
        ["install/mev"]="../../exports.sh ../../lib/common_functions.sh"
        ["install/security"]="../../exports.sh ../../lib/common_functions.sh"
        ["install/web"]="../../exports.sh ../../lib/common_functions.sh"
        ["install/utils"]="../../lib/common_functions.sh"
        ["install/ssl"]="../../exports.sh ../../lib/common_functions.sh"
    )
    
    for dir in "${!expected_sources[@]}"; do
        local full_dir="$PROJECT_ROOT/$dir"
        [[ -d "$full_dir" ]] || continue
        
        while IFS= read -r script; do
            [[ -f "$script" ]] || continue
            local script_name="${script#"$PROJECT_ROOT"/}"
            local script_dir
            script_dir="$(dirname "$script")"
            
            # Check each expected source
            for source_file in ${expected_sources[$dir]}; do
                # Resolve the relative path
                local resolved_path="$script_dir/$source_file"
                resolved_path=$(cd "$script_dir" && realpath "$source_file" 2>/dev/null || echo "")
                
                if [[ -n "$resolved_path" && -f "$resolved_path" ]]; then
                    log_test "PASS" "$script_name: source $source_file resolves"
                else
                    # Check if script actually sources this file
                    if grep -q "source.*$source_file" "$script" 2>/dev/null; then
                        log_test "FAIL" "$script_name: source $source_file does not resolve"
                    fi
                fi
            done
        done < <(find "$full_dir" -maxdepth 1 -name "*.sh" -type f)
    done
}

# =============================================================================
# PHASE 4: CONFIGURATION FILE VERIFICATION
# =============================================================================

run_config_verification() {
    log_header "PHASE 4: Configuration File Verification"
    
    log_subheader "Checking client configuration files exist"
    
    local config_files=(
        "configs/besu/besu_base.toml"
        "configs/ethrex/ethrex_base.toml"
        "configs/grandine/grandine_base.toml"
        "configs/lodestar/lodestar_beacon_base.json"
        "configs/lodestar/lodestar_validator_base.json"
        "configs/nethermind/nethermind_base.cfg"
        "configs/nimbus/nimbus_base.toml"
        "configs/nimbus/nimbus_eth1_base.toml"
        "configs/prysm/prysm_beacon_conf.yaml"
        "configs/prysm/prysm_validator_conf.yaml"
        "configs/teku/teku_beacon_base.yaml"
        "configs/teku/teku_validator_base.yaml"
    )
    
    for config in "${config_files[@]}"; do
        if [[ -f "$PROJECT_ROOT/$config" ]]; then
            log_test "PASS" "config exists: $config"
            
            # Basic syntax check based on file type
            case "$config" in
                *.json)
                    if jq empty "$PROJECT_ROOT/$config" 2>/dev/null; then
                        log_test "PASS" "config valid JSON: $config"
                    else
                        log_test "FAIL" "config invalid JSON: $config"
                    fi
                    ;;
                *.yaml|*.yml)
                    # Basic YAML check - verify file has valid structure
                    # Check for key: value patterns (allowing URLs with http://)
                    if grep -qE "^[a-zA-Z_-]+:" "$PROJECT_ROOT/$config"; then
                        log_test "PASS" "config valid YAML structure: $config"
                    else
                        log_test "WARN" "config may have YAML issues: $config"
                    fi
                    ;;
            esac
        else
            log_test "FAIL" "config missing: $config"
        fi
    done
}

# =============================================================================
# PHASE 5: UNIT TESTS
# =============================================================================

run_unit_tests() {
    log_header "PHASE 5: Unit Tests"
    
    # Source mock functions if enabled
    if [[ "$USE_MOCKS" == "true" ]]; then
        log_info "Loading mock functions..."
        source "$SCRIPT_DIR/lib/mock_functions.sh"
    fi
    
    log_subheader "Running common_functions test suite"
    
    if [[ -f "$PROJECT_ROOT/install/test/test_common_functions.sh" ]]; then
        if bash "$PROJECT_ROOT/install/test/test_common_functions.sh"; then
            log_test "PASS" "test_common_functions.sh: all tests passed"
        else
            log_test "FAIL" "test_common_functions.sh: some tests failed"
        fi
    else
        log_test "SKIP" "test_common_functions.sh: file not found"
    fi
    
    log_subheader "Testing individual functions"
    
    # Source required files
    source "$PROJECT_ROOT/exports.sh" 2>/dev/null || true
    source "$PROJECT_ROOT/lib/common_functions.sh" 2>/dev/null || true
    
    if [[ "$USE_MOCKS" == "true" ]]; then
        source "$SCRIPT_DIR/lib/mock_functions.sh"
        apply_mocks
    fi
    
    # Test validate_menu_choice
    if validate_menu_choice "3" 5; then
        log_test "PASS" "validate_menu_choice(3, 5) returns true"
    else
        log_test "FAIL" "validate_menu_choice(3, 5) should return true"
    fi
    
    if ! validate_menu_choice "10" 5; then
        log_test "PASS" "validate_menu_choice(10, 5) returns false"
    else
        log_test "FAIL" "validate_menu_choice(10, 5) should return false"
    fi
    
    if ! validate_menu_choice "abc" 5; then
        log_test "PASS" "validate_menu_choice(abc, 5) returns false"
    else
        log_test "FAIL" "validate_menu_choice(abc, 5) should return false"
    fi
    
    # Test ensure_directory
    local test_dir="/tmp/test_ensure_dir_$$"
    ensure_directory "$test_dir"
    if [[ -d "$test_dir" ]]; then
        log_test "PASS" "ensure_directory creates directory"
        rmdir "$test_dir"
    else
        log_test "FAIL" "ensure_directory failed to create directory"
    fi
    
    # Test command_exists
    if command_exists "bash"; then
        log_test "PASS" "command_exists(bash) returns true"
    else
        log_test "FAIL" "command_exists(bash) should return true"
    fi
    
    if ! command_exists "nonexistent_command_12345"; then
        log_test "PASS" "command_exists(nonexistent) returns false"
    else
        log_test "FAIL" "command_exists(nonexistent) should return false"
    fi
    
    # Test get_script_directories (if we can)
    if [[ "$USE_MOCKS" != "true" ]]; then
        # This function sets SCRIPT_DIR and PROJECT_ROOT
        # We can't easily test it without being in a script context
        log_test "SKIP" "get_script_directories: requires script context"
    fi
}

# =============================================================================
# PHASE 6: INTEGRATION TESTS (with mocks)
# =============================================================================

run_integration_tests() {
    log_header "PHASE 6: Integration Tests"
    
    if [[ "$USE_MOCKS" != "true" ]]; then
        log_warn "Integration tests require USE_MOCKS=true"
        log_test "SKIP" "Integration tests: mocks disabled"
        return 0
    fi
    
    # Source everything with mocks
    source "$PROJECT_ROOT/exports.sh" 2>/dev/null || true
    source "$PROJECT_ROOT/lib/common_functions.sh" 2>/dev/null || true
    source "$SCRIPT_DIR/lib/mock_functions.sh"
    apply_mocks
    reset_mock_log
    
    log_subheader "Testing install script structure"
    
    # Test that install scripts can be sourced without errors
    local install_scripts=(
        "install/execution/geth.sh"
        "install/consensus/prysm.sh"
        "install/mev/install_mev_boost.sh"
    )
    
    for script in "${install_scripts[@]}"; do
        local full_path="$PROJECT_ROOT/$script"
        if [[ -f "$full_path" ]]; then
            # Just check syntax, don't execute
            if bash -n "$full_path" 2>/dev/null; then
                log_test "PASS" "$script: syntax valid"
            else
                log_test "FAIL" "$script: syntax error"
            fi
        else
            log_test "SKIP" "$script: not found"
        fi
    done
    
    log_subheader "Testing MEV implementations test suite"
    
    if [[ -f "$PROJECT_ROOT/install/mev/test_mev_implementations.sh" ]]; then
        # The test script checks for installed components, so it will mostly skip
        # But we can verify it runs without errors
        if bash -n "$PROJECT_ROOT/install/mev/test_mev_implementations.sh" 2>/dev/null; then
            log_test "PASS" "test_mev_implementations.sh: syntax valid"
        else
            log_test "FAIL" "test_mev_implementations.sh: syntax error"
        fi
    fi
    
    # Print mock summary
    print_mock_summary
}

# =============================================================================
# SUMMARY
# =============================================================================

print_summary() {
    log_header "TEST SUMMARY"
    
    echo -e "Total tests run: ${BOLD}$TESTS_RUN${NC}"
    echo -e "  ${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"
    echo -e "  ${YELLOW}Skipped: $TESTS_SKIPPED${NC}"
    echo -e "  ${YELLOW}Warnings: $TESTS_WARNED${NC}"
    echo ""
    
    local exit_code=0
    if [[ $TESTS_FAILED -eq 0 ]]; then
        if [[ $TESTS_WARNED -gt 0 ]]; then
            echo -e "${GREEN}${BOLD}All tests passed!${NC} (${TESTS_WARNED} warnings)"
        else
            echo -e "${GREEN}${BOLD}All tests passed!${NC}"
        fi
    else
        echo -e "${RED}${BOLD}Some tests failed. Review the output above.${NC}"
        exit_code=1
    fi
    
    echo ""
    echo "Results saved to: $RESULTS_FILE"
    
    return $exit_code
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    local run_lint=true
    local run_unit=true
    local run_integration=true
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --lint-only)
                run_unit=false
                run_integration=false
                ;;
            --unit)
                run_lint=true
                run_integration=false
                ;;
            --integration)
                run_lint=true
                run_unit=true
                ;;
            --full)
                run_lint=true
                run_unit=true
                run_integration=true
                ;;
            --no-mocks)
                USE_MOCKS=false
                ;;
            --help)
                echo "Usage: $0 [--lint-only|--unit|--integration|--full] [--no-mocks]"
                echo ""
                echo "Options:"
                echo "  --lint-only     Run only shellcheck and syntax validation"
                echo "  --unit          Run lint + unit tests"
                echo "  --integration   Run lint + unit + integration tests"
                echo "  --full          Run all tests (default)"
                echo "  --no-mocks      Disable mock functions (use real system calls)"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
        shift
    done
    
    # Run test phases
    setup_test_environment
    
    if $run_lint; then
        run_lint_tests
        run_source_verification
        run_source_path_tests
        run_config_verification
    fi
    
    if $run_unit; then
        run_unit_tests
    fi
    
    if $run_integration; then
        run_integration_tests
    fi
    
    print_summary
}

# Run main
main "$@"
