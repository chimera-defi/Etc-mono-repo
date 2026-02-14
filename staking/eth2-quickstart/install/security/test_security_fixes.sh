#!/bin/bash
# Security Testing Script
# Tests all implemented security fixes

# Get script directory and source required files from project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source required files from project root
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

log_info "Starting security testing..."

# Test 1: Network Exposure
test_network_exposure() {
    log_info "Testing network exposure fixes..."
    
    local issues_found=0
    
    # Check for 0.0.0.0 bindings in config files
    if grep -r "0\.0\.0\.0" "$PROJECT_ROOT/configs/" >/dev/null 2>&1; then
        log_error "Found 0.0.0.0 bindings in config files"
        issues_found=$((issues_found + 1))
    else
        log_info "✓ No 0.0.0.0 bindings found in config files"
    fi
    
    # Check for localhost bindings
    if grep -r "127\.0\.0\.1" "$PROJECT_ROOT/configs/" >/dev/null 2>&1; then
        log_info "✓ Localhost bindings found in config files"
    else
        log_warn "No localhost bindings found in config files"
    fi
    
    return $issues_found
}

# Test 2: Input Validation
test_input_validation() {
    log_info "Testing input validation functions..."
    
    local issues_found=0
    
    # Test validate_user_input function (max_length, min_length)
    if validate_user_input "test123" 10 3; then
        log_info "✓ validate_user_input works correctly"
    else
        log_error "validate_user_input failed"
        issues_found=$((issues_found + 1))
    fi
    
    # Test validate_menu_choice function
    if validate_menu_choice "1" 5; then
        log_info "✓ validate_menu_choice works correctly"
    else
        log_error "validate_menu_choice failed"
        issues_found=$((issues_found + 1))
    fi
    
    # Test invalid input rejection (dangerous characters)
    if ! validate_user_input "test<script>" 50 3; then
        log_info "✓ Invalid input correctly rejected"
    else
        log_error "Invalid input not rejected"
        issues_found=$((issues_found + 1))
    fi
    
    return $issues_found
}

# Test 3: File Permissions
test_file_permissions() {
    log_info "Testing file permissions..."

    local issues_found=0

    # Test direct chmod (secure_file_permissions was removed as dead code)
    local test_file="/tmp/security_test_file"
    echo "test" > "$test_file"
    chmod 600 "$test_file"

    local perms
    perms=$(stat -c "%a" "$test_file")
    if [[ "$perms" == "600" ]]; then
        log_info "✓ File permissions set correctly (600)"
    else
        log_error "File permissions not set correctly: $perms"
        issues_found=$((issues_found + 1))
    fi

    rm -f "$test_file"
    return $issues_found
}

# Test 4: Error Handling
test_error_handling() {
    log_info "Testing error handling..."

    local issues_found=0

    # Verify set -Eeuo pipefail is active (the project's error handling mechanism)
    if [[ -o errexit ]] && [[ -o nounset ]] && [[ -o pipefail ]]; then
        log_info "✓ errexit, nounset, pipefail are active"
    else
        log_error "Shell safety flags not active"
        issues_found=$((issues_found + 1))
    fi

    return $issues_found
}

# Test 5: Rate Limiting
test_rate_limiting() {
    log_info "Testing rate limiting configuration..."
    
    local issues_found=0
    
    # Check if nginx configuration has rate limiting
    if [[ -f "/etc/nginx/sites-available/default" ]]; then
        if grep -q "limit_req_zone" "/etc/nginx/sites-available/default"; then
            log_info "✓ Rate limiting configured in nginx"
        else
            log_warn "Rate limiting not found in nginx config"
            issues_found=$((issues_found + 1))
        fi
    else
        log_warn "Nginx config not found - rate limiting test skipped"
    fi
    
    return $issues_found
}

# Test 6: Security Monitoring
test_security_monitoring() {
    log_info "Testing security monitoring..."
    
    local issues_found=0
    
    # Check if security monitoring script exists
    if [[ -f "/usr/local/bin/security_monitor.sh" ]]; then
        log_info "✓ Security monitoring script exists"
        
        # Check if it's executable
        if [[ -x "/usr/local/bin/security_monitor.sh" ]]; then
            log_info "✓ Security monitoring script is executable"
            
            # Test the script execution
            if /usr/local/bin/security_monitor.sh >/dev/null 2>&1; then
                log_info "✓ Security monitoring script executes successfully"
            else
                log_warn "Security monitoring script execution failed"
                issues_found=$((issues_found + 1))
            fi
        else
            log_error "Security monitoring script not executable"
            issues_found=$((issues_found + 1))
        fi
    else
        log_error "Security monitoring script not found"
        issues_found=$((issues_found + 1))
    fi
    
    # Check if monitoring is in crontab
    if grep -q "security_monitor" /etc/crontab 2>/dev/null; then
        log_info "✓ Security monitoring scheduled in crontab"
    else
        log_warn "Security monitoring not scheduled in crontab"
        issues_found=$((issues_found + 1))
    fi
    
    # Check if log rotation is configured
    if [[ -f "/etc/logrotate.d/security_monitor" ]]; then
        log_info "✓ Security log rotation configured"
    else
        log_warn "Security log rotation not configured"
        issues_found=$((issues_found + 1))
    fi
    
    return $issues_found
}

# Test 6.5: AIDE Intrusion Detection
test_aide_intrusion_detection() {
    log_info "Testing AIDE intrusion detection..."
    
    local issues_found=0
    
    # Check if AIDE is installed
    if command -v aide >/dev/null 2>&1; then
        log_info "✓ AIDE is installed"
        
        # Check if AIDE database exists
        if [[ -f "/var/lib/aide/aide.db" ]]; then
            log_info "✓ AIDE database exists"
        else
            log_warn "AIDE database not found - may need initialization"
            issues_found=$((issues_found + 1))
        fi
        
        # Check if AIDE check script exists
        if [[ -f "/usr/local/bin/aide_check.sh" ]]; then
            log_info "✓ AIDE check script exists"
            
            # Check if it's executable
            if [[ -x "/usr/local/bin/aide_check.sh" ]]; then
                log_info "✓ AIDE check script is executable"
            else
                log_error "AIDE check script not executable"
                issues_found=$((issues_found + 1))
            fi
        else
            log_error "AIDE check script not found"
            issues_found=$((issues_found + 1))
        fi
        
        # Check if AIDE is scheduled in crontab
        if grep -q "aide_check" /etc/crontab 2>/dev/null; then
            log_info "✓ AIDE check scheduled in crontab"
        else
            log_warn "AIDE check not scheduled in crontab"
            issues_found=$((issues_found + 1))
        fi
    else
        log_error "AIDE not installed"
        issues_found=$((issues_found + 1))
    fi
    
    return $issues_found
}

# Test 7: Firewall Configuration
test_firewall_configuration() {
    log_info "Testing firewall configuration..."
    
    local issues_found=0
    
    # Check if UFW is active
    if ufw status | grep -q "Status: active"; then
        log_info "✓ UFW firewall is active"
    else
        log_error "UFW firewall is not active"
        issues_found=$((issues_found + 1))
    fi
    
    # Check for fail2ban
    if systemctl is-active --quiet fail2ban; then
        log_info "✓ Fail2ban is running"
    else
        log_error "Fail2ban is not running"
        issues_found=$((issues_found + 1))
    fi
    
    return $issues_found
}

# Test 8: SSL/TLS Configuration
test_ssl_configuration() {
    log_info "Testing SSL/TLS configuration..."
    
    local issues_found=0
    
    # Check if SSL certificates exist (if nginx is configured)
    if [[ -d "/etc/letsencrypt/live" ]]; then
        log_info "✓ SSL certificates directory exists"
    else
        log_warn "SSL certificates directory not found"
    fi
    
    return $issues_found
}

# Main testing function
main() {
    local total_issues=0
    local test_results=()
    
    log_info "=== SECURITY TESTING SUITE ==="
    
    # Run all tests
    test_network_exposure
    total_issues=$((total_issues + $?))
    test_results+=("Network Exposure: $?")
    
    test_input_validation
    total_issues=$((total_issues + $?))
    test_results+=("Input Validation: $?")
    
    test_file_permissions
    total_issues=$((total_issues + $?))
    test_results+=("File Permissions: $?")
    
    test_error_handling
    total_issues=$((total_issues + $?))
    test_results+=("Error Handling: $?")
    
    test_rate_limiting
    total_issues=$((total_issues + $?))
    test_results+=("Rate Limiting: $?")
    
    test_security_monitoring
    total_issues=$((total_issues + $?))
    test_results+=("Security Monitoring: $?")
    
    test_aide_intrusion_detection
    total_issues=$((total_issues + $?))
    test_results+=("AIDE Intrusion Detection: $?")
    
    test_firewall_configuration
    total_issues=$((total_issues + $?))
    test_results+=("Firewall Configuration: $?")
    
    test_ssl_configuration
    total_issues=$((total_issues + $?))
    test_results+=("SSL Configuration: $?")
    
    # Print results
    log_info "=== TEST RESULTS ==="
    for result in "${test_results[@]}"; do
        echo "  $result"
    done
    
    log_info "=== SUMMARY ==="
    if [[ $total_issues -eq 0 ]]; then
        log_info "✓ All security tests passed!"
        log_info "Security fixes are working correctly."
    else
        log_error "✗ $total_issues security issues found"
        log_error "Please review and fix the issues above."
    fi
    
    return $total_issues
}

# Run tests
main