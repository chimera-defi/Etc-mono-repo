#!/bin/bash
# Shared Test Utilities
# Common functions and variables used across all test scripts
# Source this file at the beginning of any test script

# =============================================================================
# SHELLCHECK CONFIGURATION (centralized)
# =============================================================================
# Exclusions with rationale:
# SC2317 - Unreachable code (false positive in test scripts)
# SC1091 - Not following source files (relative paths)
# SC1090 - Can't follow non-constant source (variable paths)
# SC2034 - Unused variables (template scripts)
# SC2031 - Variable modified in subshell (testing pattern)
# SC2181 - Check exit code directly (common in whiptail/dialog scripts)
SHELLCHECK_EXCLUDES="SC2317,SC1091,SC1090,SC2034,SC2031,SC2181"

# =============================================================================
# PATH RESOLUTION
# =============================================================================
# These must be set by the sourcing script BEFORE sourcing this file:
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Then source this file to get PROJECT_ROOT

# Derive PROJECT_ROOT from SCRIPT_DIR if not already set
if [[ -z "${PROJECT_ROOT:-}" ]]; then
    # Determine depth from test directory
    if [[ "$SCRIPT_DIR" == */test/lib ]]; then
        PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    elif [[ "$SCRIPT_DIR" == */test ]]; then
        PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
    else
        PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
    fi
fi

# =============================================================================
# COLOR DEFINITIONS (single source of truth)
# =============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================
# Default prefix can be overridden by setting LOG_PREFIX before sourcing
LOG_PREFIX="${LOG_PREFIX:-TEST}"

log_info() { echo -e "${GREEN}[$LOG_PREFIX]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[$LOG_PREFIX]${NC} $*"; }
log_error() { echo -e "${RED}[$LOG_PREFIX]${NC} $*"; }
log_header() { echo -e "\n${BLUE}=== $* ===${NC}\n"; }

# =============================================================================
# TEST RESULT TRACKING
# =============================================================================
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

record_test() {
    local name="$1"
    local result="$2"
    TESTS_RUN=$((TESTS_RUN + 1))
    if [[ "$result" == "PASS" ]]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓${NC} $name"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗${NC} $name"
    fi
}

print_test_summary() {
    log_header "Test Summary"
    echo "Total tests: $TESTS_RUN"
    echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
    echo ""
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}Some tests failed.${NC}"
        return 1
    fi
}

# =============================================================================
# COMMON TEST UTILITIES
# =============================================================================

# Check if running inside Docker container
is_docker() {
    [[ -f /.dockerenv ]] || grep -q docker /proc/1/cgroup 2>/dev/null
}

# Check if running as root
is_root() {
    [[ $EUID -eq 0 ]]
}

# Verify a file exists
assert_file_exists() {
    local file="$1"
    local description="${2:-$file}"
    if [[ -f "$file" ]]; then
        record_test "$description exists" "PASS"
        return 0
    else
        record_test "$description exists" "FAIL"
        return 1
    fi
}

# Verify a command exists
assert_command_exists() {
    local cmd="$1"
    if command -v "$cmd" &>/dev/null; then
        record_test "Command available: $cmd" "PASS"
        return 0
    else
        record_test "Command available: $cmd" "FAIL"
        return 1
    fi
}

# Verify script syntax
assert_valid_syntax() {
    local script="$1"
    local description="${2:-$(basename "$script")}"
    if bash -n "$script" 2>/dev/null; then
        record_test "$description has valid syntax" "PASS"
        return 0
    else
        record_test "$description has valid syntax" "FAIL"
        return 1
    fi
}

# Verify function exists after sourcing
assert_function_exists() {
    local func="$1"
    if declare -f "$func" >/dev/null 2>&1; then
        record_test "Function exists: $func" "PASS"
        return 0
    else
        record_test "Function exists: $func" "FAIL"
        return 1
    fi
}

# =============================================================================
# SHELLCHECK UTILITIES
# =============================================================================

# Run shellcheck with standard exclusions
run_shellcheck() {
    local script="$1"
    shellcheck -x --exclude="$SHELLCHECK_EXCLUDES" "$script"
}

# Check if shellcheck passes (silent)
check_shellcheck() {
    local script="$1"
    shellcheck -x --exclude="$SHELLCHECK_EXCLUDES" "$script" >/dev/null 2>&1
}

# =============================================================================
# SOURCE PROJECT FILES
# =============================================================================

# Helper to source project files with proper paths
source_exports() {
    # shellcheck source=../../exports.sh
    source "$PROJECT_ROOT/exports.sh"
}

source_common_functions() {
    # shellcheck source=../../lib/common_functions.sh
    source "$PROJECT_ROOT/lib/common_functions.sh"
}

# =============================================================================
# E2E TEST UTILITIES
# =============================================================================

log_subheader() { echo -e "\n${BLUE}--- $* ---\n"; }

# Run script, capture output to log file. Returns script exit code.
# Usage: run_script_with_log log_file script arg1 arg2
run_script_with_log() {
    local log_file="$1"
    shift
    "$@" 2>&1 | tee "$log_file"
    return "${PIPESTATUS[0]}"
}

# Print last N lines of log file with indent
dump_log_tail() {
    local log_file="$1"
    local lines="${2:-20}"
    local indent="${3:-}"
    if [[ -f "$log_file" ]]; then
        tail -n "$lines" "$log_file" | while IFS= read -r line; do echo "${indent}${line}"; done
    fi
}

# Verify client/component is installed. Records PASS/FAIL.
# Usage: verify_installed "Name" command -v geth
# Usage: verify_installed "Besu" test -f "$HOME/besu/bin/besu"
verify_installed() {
    local name="$1"
    shift
    if "$@" &>/dev/null; then
        record_test "$name installed" "PASS"
        return 0
    else
        record_test "$name installed" "FAIL"
        return 1
    fi
}
