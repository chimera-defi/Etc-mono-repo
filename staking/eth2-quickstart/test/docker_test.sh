#!/bin/bash
# Docker Test Runner - Runs tests inside an isolated container
# This script executes with REAL system calls (no mocks) inside Docker

set -Eeuo pipefail

# Setup paths and source shared utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_PREFIX="INFO"
# shellcheck source=lib/test_utils.sh
source "$SCRIPT_DIR/lib/test_utils.sh"

# Parse arguments
TEST_MODE="${1:-full}"

log_header "Docker Integration Tests"
log_info "Running inside container with REAL system calls"
log_info "Test mode: $TEST_MODE"
log_info "User: $(whoami)"
log_info "Working directory: $(pwd)"

# =============================================================================
# PHASE 1: Environment Verification
# =============================================================================
log_header "Phase 1: Environment Verification"

# Check we're in a container
if is_docker; then
    record_test "Running inside Docker container" "PASS"
else
    log_warn "Not running in Docker - tests may affect host system!"
    record_test "Running inside Docker container" "FAIL"
fi

# Check required tools
for tool in bash curl wget git sudo ufw jq tar; do
    assert_command_exists "$tool"
done

# =============================================================================
# PHASE 2: Shellcheck and Syntax
# =============================================================================
log_header "Phase 2: Shellcheck and Syntax Validation"

# Run shellcheck on key files
shellcheck_pass=0
shellcheck_fail=0

for script in "$PROJECT_ROOT"/*.sh "$PROJECT_ROOT"/lib/*.sh; do
    [[ -f "$script" ]] || continue
    if check_shellcheck "$script"; then
        shellcheck_pass=$((shellcheck_pass + 1))
    else
        shellcheck_fail=$((shellcheck_fail + 1))
        log_error "Shellcheck failed: $script"
    fi
done

if [[ $shellcheck_fail -eq 0 ]]; then
    record_test "Shellcheck: $shellcheck_pass scripts passed" "PASS"
else
    record_test "Shellcheck: $shellcheck_fail scripts failed" "FAIL"
fi

# Syntax check
syntax_pass=0
syntax_fail=0

for script in "$PROJECT_ROOT"/*.sh "$PROJECT_ROOT"/lib/*.sh "$PROJECT_ROOT"/install/*/*.sh; do
    [[ -f "$script" ]] || continue
    if bash -n "$script" 2>/dev/null; then
        syntax_pass=$((syntax_pass + 1))
    else
        syntax_fail=$((syntax_fail + 1))
        log_error "Syntax error: $script"
    fi
done

if [[ $syntax_fail -eq 0 ]]; then
    record_test "Syntax check: $syntax_pass scripts valid" "PASS"
else
    record_test "Syntax check: $syntax_fail scripts invalid" "FAIL"
fi

# =============================================================================
# PHASE 3: Source File Verification
# =============================================================================
log_header "Phase 3: Source File Verification"

# Test exports.sh loads
if source_exports 2>/dev/null; then
    record_test "exports.sh loads successfully" "PASS"
    
    # Check key variables
    if [[ -n "${LOGIN_UNAME:-}" ]]; then
        record_test "LOGIN_UNAME is set" "PASS"
    else
        record_test "LOGIN_UNAME is set" "FAIL"
    fi
    
    if [[ -n "${SERVER_NAME:-}" ]]; then
        record_test "SERVER_NAME is set" "PASS"
    else
        record_test "SERVER_NAME is set" "FAIL"
    fi
    
    if [[ -n "${FEE_RECIPIENT:-}" ]]; then
        record_test "FEE_RECIPIENT is set" "PASS"
    else
        record_test "FEE_RECIPIENT is set" "FAIL"
    fi
else
    record_test "exports.sh loads successfully" "FAIL"
fi

# Test common_functions.sh loads
if source_common_functions 2>/dev/null; then
    record_test "common_functions.sh loads successfully" "PASS"
    
    # Check key functions exist (use common_functions' log_info, not test's)
    for func in ensure_directory download_file create_systemd_service; do
        assert_function_exists "$func"
    done
else
    record_test "common_functions.sh loads successfully" "FAIL"
fi

# =============================================================================
# PHASE 4: Function Unit Tests (Real System Calls)
# =============================================================================
log_header "Phase 4: Function Unit Tests (Real System Calls)"

# Re-source to ensure functions are available
source_exports
source_common_functions

# Test ensure_directory - creates real directory
test_dir="/tmp/test_ensure_dir_$$"
if ensure_directory "$test_dir" && [[ -d "$test_dir" ]]; then
    record_test "ensure_directory creates real directory" "PASS"
    rm -rf "$test_dir"
else
    record_test "ensure_directory creates real directory" "FAIL"
fi

# Test validate_menu_choice
if validate_menu_choice "3" 5; then
    record_test "validate_menu_choice accepts valid input" "PASS"
else
    record_test "validate_menu_choice accepts valid input" "FAIL"
fi

if ! validate_menu_choice "10" 5 2>/dev/null; then
    record_test "validate_menu_choice rejects invalid input" "PASS"
else
    record_test "validate_menu_choice rejects invalid input" "FAIL"
fi

# Test extract_archive with real tar
test_archive_dir="/tmp/test_archive_$$"
mkdir -p "$test_archive_dir/content"
echo "test data" > "$test_archive_dir/content/file.txt"
(cd "$test_archive_dir" && tar -czf test.tar.gz content/)
extract_dest="/tmp/test_extract_dest_$$"
mkdir -p "$extract_dest"

if extract_archive "$test_archive_dir/test.tar.gz" "$extract_dest" 0 && [[ -f "$extract_dest/content/file.txt" ]]; then
    record_test "extract_archive extracts real tar.gz" "PASS"
else
    record_test "extract_archive extracts real tar.gz" "FAIL"
fi
rm -rf "$test_archive_dir" "$extract_dest"

# Test command_exists
if command_exists "bash"; then
    record_test "command_exists finds bash" "PASS"
else
    record_test "command_exists finds bash" "FAIL"
fi

if ! command_exists "nonexistent_command_xyz123"; then
    record_test "command_exists returns false for missing command" "PASS"
else
    record_test "command_exists returns false for missing command" "FAIL"
fi

# =============================================================================
# PHASE 5: System Integration Tests
# =============================================================================
log_header "Phase 5: System Integration Tests"

# Test UFW (firewall) - requires sudo
if sudo ufw status >/dev/null 2>&1; then
    record_test "UFW is available and accessible" "PASS"
else
    record_test "UFW is available and accessible" "FAIL"
fi

# Test apt-get works
if sudo apt-get update -qq 2>/dev/null; then
    record_test "apt-get update works" "PASS"
else
    record_test "apt-get update works" "FAIL"
fi

# Test systemctl is available (may not fully work without systemd running)
if command -v systemctl &>/dev/null; then
    record_test "systemctl command available" "PASS"
else
    record_test "systemctl command available" "FAIL"
fi

# Test JWT secret creation
jwt_dir="/tmp/test_jwt_$$"
jwt_file="$jwt_dir/secrets/jwt.hex"
mkdir -p "$jwt_dir/secrets"

if ensure_jwt_secret "$jwt_file" 2>/dev/null && [[ -f "$jwt_file" ]]; then
    jwt_content=$(cat "$jwt_file")
    # JWT is 64 hex chars (32 bytes) - openssl rand -hex 32 format
    if [[ ${#jwt_content} -eq 64 ]] && [[ "$jwt_content" =~ ^[a-fA-F0-9]+$ ]]; then
        record_test "ensure_jwt_secret creates valid JWT" "PASS"
    else
        record_test "ensure_jwt_secret creates valid JWT" "FAIL"
    fi
else
    record_test "ensure_jwt_secret creates valid JWT" "FAIL"
fi
rm -rf "$jwt_dir"

# =============================================================================
# PHASE 6: Install Script Structure Tests
# =============================================================================
log_header "Phase 6: Install Script Structure Tests"

# Check install scripts have proper structure
for script in "$PROJECT_ROOT"/install/execution/*.sh "$PROJECT_ROOT"/install/consensus/*.sh; do
    [[ -f "$script" ]] || continue
    script_name=$(basename "$script")
    
    # Check for shebang
    if head -1 "$script" | grep -q "^#!/bin/bash"; then
        record_test "$script_name has shebang" "PASS"
    else
        record_test "$script_name has shebang" "FAIL"
    fi
    
    # Check for source statements
    if grep -q "source.*exports.sh" "$script" && grep -q "source.*common_functions.sh" "$script"; then
        record_test "$script_name sources required files" "PASS"
    else
        record_test "$script_name sources required files" "FAIL"
    fi
done

# =============================================================================
# PHASE 7: Client-Specific Tests
# =============================================================================
log_header "Phase 7: Client-Specific Tests"

# Run ethrex-specific tests
if [[ -f "$SCRIPT_DIR/test_ethrex.sh" ]]; then
    log_info "Running ethrex client tests..."
    if TEST_DOWNLOAD_BINARY=true "$SCRIPT_DIR/test_ethrex.sh"; then
        record_test "Ethrex client test suite" "PASS"
    else
        record_test "Ethrex client test suite" "FAIL"
    fi
else
    record_test "Ethrex client test suite" "SKIP"
fi

# =============================================================================
# SUMMARY
# =============================================================================
print_test_summary
exit $?
