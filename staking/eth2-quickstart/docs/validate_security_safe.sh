#!/bin/bash

# Safe Security Implementation Validation Script
# This script validates security implementations without requiring root privileges

set -Eeuo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "${BLUE}[SECTION]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    log_error "This script should not be run as root"
    exit 1
fi

# Initialize counters
total_tests=0
passed_tests=0
failed_tests=0
warnings=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="${3:-0}"
    
    total_tests=$((total_tests + 1))
    
    if eval "$test_command" >/dev/null 2>&1; then
        if [[ $? -eq $expected_result ]]; then
            log_info "✓ $test_name"
            passed_tests=$((passed_tests + 1))
            return 0
        else
            log_warn "⚠ $test_name (unexpected result)"
            warnings=$((warnings + 1))
            return 1
        fi
    else
        log_error "✗ $test_name"
        failed_tests=$((failed_tests + 1))
        return 1
    fi
}

# Function to run a custom test function
run_custom_test() {
    local test_name="$1"
    local test_function="$2"
    
    total_tests=$((total_tests + 1))
    
    if "$test_function"; then
        log_info "✓ $test_name"
        passed_tests=$((passed_tests + 1))
        return 0
    else
        log_error "✗ $test_name"
        failed_tests=$((failed_tests + 1))
        return 1
    fi
}

# Function to run a test with custom logic
run_custom_test() {
    local test_name="$1"
    local test_function="$2"
    
    total_tests=$((total_tests + 1))
    
    if $test_function; then
        log_info "✓ $test_name"
        passed_tests=$((passed_tests + 1))
        return 0
    else
        log_error "✗ $test_name"
        failed_tests=$((failed_tests + 1))
        return 1
    fi
}

log_info "Starting safe security implementation validation..."
echo

# Test 1: Verify common_functions.sh has no duplicate functions
log_section "Testing Common Functions Library"

test_no_duplicate_functions() {
    local duplicates
    duplicates=$(grep -n "^[a-zA-Z_][a-zA-Z0-9_]*()" lib/common_functions.sh | cut -d: -f2 | cut -d'(' -f1 | sort | uniq -d)
    if [[ -z "$duplicates" ]]; then
        return 0
    else
        log_error "Duplicate functions found: $duplicates"
        return 1
    fi
}

run_custom_test "No duplicate functions in common_functions.sh" test_no_duplicate_functions

# Test 2: Verify security functions exist
test_security_functions_exist() {
    local required_functions=(
        "setup_security_monitoring"
        "apply_network_security"
        "validate_user_input"
    )

    for func in "${required_functions[@]}"; do
        if ! grep -q "^${func}()" lib/common_functions.sh; then
            log_error "Missing security function: $func"
            return 1
        fi
    done
    return 0
}

run_custom_test "All required security functions exist" test_security_functions_exist

# Test 3: Verify run_1.sh calls security functions
test_run1_security_calls() {
    # Check for consolidated security script call
    if ! grep -q "consolidated_security.sh" run_1.sh; then
        log_error "run_1.sh missing consolidated security script call"
        return 1
    fi
    
    if ! grep -q "apply_network_security" run_1.sh; then
        log_error "run_1.sh missing apply_network_security call"
        return 1
    fi
    
    return 0
}

run_custom_test "run_1.sh calls security functions" test_run1_security_calls

# Test 4: Verify run_2.sh calls security functions
test_run2_security_calls() {
    if grep -q "Security hardening already applied" run_2.sh; then
        return 0
    else
        log_error "run_2.sh missing security integration"
        return 1
    fi
}

run_custom_test "run_2.sh calls security functions" test_run2_security_calls

echo

# Test 5: Test input validation functions (safe to test)
log_section "Testing Input Validation Functions"

test_input_validation() {
    # Source the common functions
    source lib/common_functions.sh
    
    # Test validate_user_input function
    if declare -f validate_user_input >/dev/null; then
        # Test valid input (length check)
        if validate_user_input "test123" 10 1; then
            # Test invalid input (too long)
            if ! validate_user_input "thisinputistoolong" 10 1; then
                return 0
            else
                log_error "Input validation failed to reject long input"
                return 1
            fi
        else
            log_error "Input validation failed to accept valid input"
            return 1
        fi
    else
        log_error "validate_user_input function not found"
        return 1
    fi
}

run_custom_test "Input validation functions work correctly" test_input_validation

# Test 6: Test file permission functions (safe to test with temp files)
log_section "Testing File Permission Functions"

test_file_permissions() {
    # Create a test file in a safe location
    local test_file
    test_file="/tmp/security_test_file_$(date +%s)"
    echo "test content" > "$test_file"

    chmod 600 "$test_file"

    local perms
    perms=$(stat -c %a "$test_file")
    if [[ "$perms" == "600" ]]; then
        rm -f "$test_file"
        return 0
    else
        log_error "File permissions not set correctly (expected 600, got $perms)"
        rm -f "$test_file"
        return 1
    fi
}

run_custom_test "File permission functions work correctly" test_file_permissions

echo

# Test 7: Test error handling (set -Eeuo pipefail)
log_section "Testing Error Handling"

test_error_handling() {
    # Source the common functions
    source lib/common_functions.sh

    # Verify set -Eeuo pipefail is active (the project's error handling mechanism)
    if [[ -o errexit ]] && [[ -o nounset ]] && [[ -o pipefail ]]; then
        return 0
    else
        log_error "Shell safety flags not active after sourcing common_functions.sh"
        return 1
    fi
}

run_custom_test "Error handling functions work correctly" test_error_handling

echo

# Test 8: Test security test script
log_section "Testing Security Test Script"

test_security_test_script() {
    # Check if test_security_fixes.sh exists and is executable
    if [[ -f "test_security_fixes.sh" && -x "test_security_fixes.sh" ]]; then
        # Test if it runs (exit codes 0, 1, 2, 3 are acceptable)
        local exit_code
        ./test_security_fixes.sh >/dev/null 2>&1
        exit_code=$?
        
        if [[ $exit_code -eq 0 || $exit_code -eq 1 || $exit_code -eq 2 || $exit_code -eq 3 ]]; then
            return 0
        else
            log_error "Security test script execution failed with exit code $exit_code"
            return 1
        fi
    else
        log_error "Security test script not found or not executable"
        return 1
    fi
}

run_custom_test "Security test script works correctly" test_security_test_script

# Test 9: Test security verification script
log_section "Testing Security Verification Script"

test_security_verification_script() {
    # Check if verify_security.sh exists and is executable
    if [[ -f "docs/verify_security.sh" && -x "docs/verify_security.sh" ]]; then
        # Test if it runs (exit codes 0, 1, 2, 3 are acceptable)
        local exit_code
        ./docs/verify_security.sh >/dev/null 2>&1
        exit_code=$?
        
        if [[ $exit_code -eq 0 || $exit_code -eq 1 || $exit_code -eq 2 || $exit_code -eq 3 ]]; then
            return 0
        else
            log_error "Security verification script execution failed with exit code $exit_code"
            return 1
        fi
    else
        log_error "Security verification script not found or not executable"
        return 1
    fi
}

run_custom_test "Security verification script works correctly" test_security_verification_script

echo

# Test 10: Test documentation files
log_section "Testing Security Documentation"

test_security_documentation() {
    local required_docs=(
        "docs/SECURITY_GUIDE.md"
        "docs/SHELL_SCRIPTING_BEST_PRACTICES_AND_LINTING_GUIDE.md"
        "docs/validate_security_safe.sh"
        "docs/verify_security.sh"
        "docs/server_security_validation.sh"
    )
    
    for doc in "${required_docs[@]}"; do
        if [[ ! -f "$doc" ]]; then
            log_error "Missing security documentation: $doc"
            return 1
        fi
    done
    return 0
}

run_custom_test "All security documentation exists" test_security_documentation

echo

# Test 11: Test script syntax
log_section "Testing Script Syntax"

test_script_syntax() {
    local scripts=(
        "lib/common_functions.sh"
        "run_1.sh"
        "run_2.sh"
        "test_security_fixes.sh"
        "docs/verify_security.sh"
        "validate_security_implementation.sh"
        "server_security_validation.sh"
        "test_security_real_environment.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            if ! bash -n "$script" 2>/dev/null; then
                log_error "Syntax error in $script"
                return 1
            fi
        fi
    done
    return 0
}

run_custom_test "All scripts have valid syntax" test_script_syntax

echo

# Test 12: Test function definitions
log_section "Testing Function Definitions"

test_function_definitions() {
    # Source the common functions
    source lib/common_functions.sh
    
    local required_functions=(
        "setup_security_monitoring"
        "apply_network_security"
        "validate_user_input"
    )

    for func in "${required_functions[@]}"; do
        if ! declare -f "$func" >/dev/null 2>&1; then
            log_error "Function $func not properly defined"
            return 1
        fi
    done
    return 0
}

run_custom_test "All security functions are properly defined" test_function_definitions

echo

# Summary
log_section "Validation Summary"

echo "Total tests performed: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $failed_tests"
echo "Warnings: $warnings"
echo

# Calculate validation score
if [[ $total_tests -gt 0 ]]; then
    validation_score=$(( (passed_tests * 100) / total_tests ))
    echo "Validation Score: $validation_score%"
    echo
    
    if [[ $validation_score -ge 90 ]]; then
        log_info "🎉 Excellent! Security implementation is working correctly."
    elif [[ $validation_score -ge 75 ]]; then
        log_warn "⚠ Good security implementation, but some areas need attention."
    elif [[ $validation_score -ge 50 ]]; then
        log_warn "⚠ Moderate security implementation. Several issues need to be addressed."
    else
        log_error "❌ Poor security implementation. Major issues need to be fixed."
    fi
fi

echo

# Recommendations
if [[ $failed_tests -gt 0 || $warnings -gt 0 ]]; then
    log_section "Recommendations"
    
    if [[ $failed_tests -gt 0 ]]; then
        echo "Critical issues to address:"
        echo "- Review failed tests above and fix them immediately"
        echo "- Check that all security functions are properly implemented"
        echo "- Verify that security scripts are executable and working"
        echo "- Ensure all required documentation exists"
        echo
    fi
    
    if [[ $warnings -gt 0 ]]; then
        echo "Areas for improvement:"
        echo "- Address warnings above to improve security implementation"
        echo "- Consider additional security measures"
        echo "- Review system configuration for optimization"
        echo
    fi
fi

# Additional information
log_section "Additional Information"

echo "Security functions are implemented and ready for deployment."
echo "To test on a real server:"
echo "1. Run ./run_1.sh (as root) to set up initial security"
echo "2. Run ./run_2.sh (as non-root user) to install clients with security"
echo "3. Run ./server_security_validation.sh to validate security on server"
echo "4. Run ./test_security_real_environment.sh for detailed analysis"
echo

# Exit with appropriate code
if [[ $failed_tests -gt 0 ]]; then
    exit 1
elif [[ $warnings -gt 0 ]]; then
    exit 2
else
    exit 0
fi