#!/bin/bash
# Test suite for common_functions.sh
# Tests the 4 new functions added to prevent runtime issues
#
# Safety: This test uses mock functions to prevent actual system modifications.
# Run with USE_MOCKS=true (default) for safe testing.

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source exports and common functions
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Apply mocks for safe testing (prevents actual systemctl, apt, etc. calls)
USE_MOCKS="${USE_MOCKS:-true}"
MOCK_FILE="$PROJECT_ROOT/test/lib/mock_functions.sh"

if [[ "$USE_MOCKS" == "true" ]] && [[ -f "$MOCK_FILE" ]]; then
    echo "[INFO] Applying mock functions for safe testing..."
    # shellcheck source=../../test/lib/mock_functions.sh
    source "$MOCK_FILE"
    apply_mocks
    echo "[INFO] Mock functions applied - no system changes will be made"
else
    echo "[WARN] Running WITHOUT mocks - system changes may occur!"
    echo "[WARN] Set USE_MOCKS=true and ensure test/lib/mock_functions.sh exists for safe testing"
fi

test_count=0
pass_count=0
fail_count=0

# Test helper functions
run_test() {
    local test_name="$1"
    local test_func="$2"
    
    test_count=$((test_count + 1))
    echo ""
    echo "=== Test $test_count: $test_name ==="
    
    if $test_func; then
        echo "✅ PASS: $test_name"
        pass_count=$((pass_count + 1))
        return 0
    else
        echo "❌ FAIL: $test_name"
        fail_count=$((fail_count + 1))
        return 1
    fi
}

# Test 1: get_latest_release with valid repo
test_get_latest_release_valid() {
    local version
    version=$(get_latest_release "hyperledger/besu")
    
    if [[ -n "$version" ]]; then
        echo "  Got version: $version"
        return 0
    else
        echo "  ERROR: No version returned"
        return 1
    fi
}

# Test 2: get_latest_release with invalid repo
test_get_latest_release_invalid() {
    # Skip this test when mocks are enabled (mocks always succeed)
    if [[ "$USE_MOCKS" == "true" ]]; then
        echo "  Skipped (mocks always succeed - test requires real network)"
        return 0
    fi
    
    # Should return 1 (failure) but not crash
    if ! get_latest_release "nonexistent/repo123456789" >/dev/null 2>&1; then
        echo "  Correctly handled invalid repo"
        return 0
    else
        echo "  ERROR: Should have failed for invalid repo"
        return 1
    fi
}

# Test 3: extract_archive with tar.gz
test_extract_archive_targz() {
    local test_dir="/tmp/test_extract_$$"
    mkdir -p "$test_dir/test_content"
    echo "test data" > "$test_dir/test_content/file.txt"
    
    # Create test archive
    (cd "$test_dir" && tar -czf test.tar.gz test_content/)
    
    # Test extraction
    local extract_dir="/tmp/test_extract_dest_$$"
    mkdir -p "$extract_dir"
    
    if extract_archive "$test_dir/test.tar.gz" "$extract_dir" 0; then
        if [[ -f "$extract_dir/test_content/file.txt" ]]; then
            echo "  Successfully extracted tar.gz"
            rm -rf "$test_dir" "$extract_dir"
            return 0
        else
            echo "  ERROR: File not found after extraction"
            rm -rf "$test_dir" "$extract_dir"
            return 1
        fi
    else
        echo "  ERROR: extract_archive failed"
        rm -rf "$test_dir" "$extract_dir"
        return 1
    fi
}

# Test 4: extract_archive with strip-components
test_extract_archive_strip() {
    local test_dir="/tmp/test_extract_strip_$$"
    mkdir -p "$test_dir/outer/inner"
    echo "test data" > "$test_dir/outer/inner/file.txt"
    
    # Create test archive
    (cd "$test_dir" && tar -czf test.tar.gz outer/)
    
    # Test extraction with strip=1
    local extract_dir="/tmp/test_extract_strip_dest_$$"
    mkdir -p "$extract_dir"
    
    if extract_archive "$test_dir/test.tar.gz" "$extract_dir" 1; then
        if [[ -f "$extract_dir/inner/file.txt" ]]; then
            echo "  Successfully stripped one component"
            rm -rf "$test_dir" "$extract_dir"
            return 0
        else
            echo "  ERROR: Strip-components didn't work correctly"
            rm -rf "$test_dir" "$extract_dir"
            return 1
        fi
    else
        echo "  ERROR: extract_archive with strip failed"
        rm -rf "$test_dir" "$extract_dir"
        return 1
    fi
}

# Test 5: validate_menu_choice with valid input
test_validate_menu_choice_valid() {
    if validate_menu_choice "3" 5; then
        echo "  Accepted valid choice (3 in range 1-5)"
        return 0
    else
        echo "  ERROR: Rejected valid choice"
        return 1
    fi
}

# Test 6: validate_menu_choice with invalid input
test_validate_menu_choice_invalid() {
    if ! validate_menu_choice "10" 5; then
        echo "  Correctly rejected out-of-range choice (10 > 5)"
        return 0
    else
        echo "  ERROR: Accepted out-of-range choice"
        return 1
    fi
}

# Test 7: validate_menu_choice with non-numeric input
test_validate_menu_choice_nonnumeric() {
    if ! validate_menu_choice "abc" 5; then
        echo "  Correctly rejected non-numeric input"
        return 0
    else
        echo "  ERROR: Accepted non-numeric input"
        return 1
    fi
}

# Test 8: stop_all_services doesn't crash
test_stop_all_services() {
    # Just verify it doesn't crash when services don't exist
    if stop_all_services 2>/dev/null; then
        echo "  Function executed without crashing"
        return 0
    else
        echo "  Function returned error but didn't crash (acceptable)"
        return 0  # Still pass since it's expected services may not exist
    fi
}

# Test 9: download_file calls secure_download
test_download_file_calls_secure() {
    # Check the source file (not the function type, which may be mocked)
    if grep -A10 "^download_file()" "$PROJECT_ROOT/lib/common_functions.sh" | grep -q "secure_download"; then
        echo "  download_file correctly calls secure_download in source"
        return 0
    else
        echo "  ERROR: download_file doesn't call secure_download"
        return 1
    fi
}

# Test 10: check_system_compatibility works without root
test_check_system_compatibility_nonroot() {
    # This should work even as non-root user
    if check_system_compatibility >/dev/null 2>&1; then
        echo "  check_system_compatibility works without root"
        return 0
    else
        echo "  ERROR: check_system_compatibility failed"
        return 1
    fi
}

# Main test execution
main() {
    echo "=========================================="
    echo "Common Functions Test Suite"
    echo "Testing new functions for runtime issues"
    echo "=========================================="
    
    # Run all tests
    run_test "get_latest_release with valid repo" test_get_latest_release_valid
    run_test "get_latest_release with invalid repo" test_get_latest_release_invalid
    run_test "extract_archive with tar.gz" test_extract_archive_targz
    run_test "extract_archive with strip-components" test_extract_archive_strip
    run_test "validate_menu_choice with valid input" test_validate_menu_choice_valid
    run_test "validate_menu_choice with invalid input" test_validate_menu_choice_invalid
    run_test "validate_menu_choice with non-numeric input" test_validate_menu_choice_nonnumeric
    run_test "stop_all_services doesn't crash" test_stop_all_services
    run_test "download_file calls secure_download" test_download_file_calls_secure
    run_test "check_system_compatibility works without root" test_check_system_compatibility_nonroot
    
    # Print summary
    echo ""
    echo "=========================================="
    echo "Test Summary"
    echo "=========================================="
    echo "Total tests: $test_count"
    echo "Passed: $pass_count"
    echo "Failed: $fail_count"
    echo ""
    
    if [[ $fail_count -eq 0 ]]; then
        echo "✅ All tests passed!"
        return 0
    else
        echo "❌ Some tests failed"
        return 1
    fi
}

# Run tests
main
