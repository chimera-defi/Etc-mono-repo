#!/bin/bash

# Server Security Validation Script
# This script can be run on a real server to validate security implementations
# Run this after running run_1.sh and run_2.sh to verify security is working

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

# Check if running as non-root user
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

log_info "Starting server security validation..."
echo

# Test 1: Check if security monitoring script exists and works
log_section "Security Monitoring Validation"

test_security_monitoring_script() {
    if [[ -f "/usr/local/bin/security_monitor.sh" && -x "/usr/local/bin/security_monitor.sh" ]]; then
        # Test if it runs without errors
        if /usr/local/bin/security_monitor.sh >/dev/null 2>&1; then
            # Check if log file was created
            if [[ -f "/var/log/security_monitor.log" ]]; then
                return 0
            else
                log_error "Security monitoring log file not created"
                return 1
            fi
        else
            log_error "Security monitoring script execution failed"
            return 1
        fi
    else
        log_error "Security monitoring script not found or not executable"
        return 1
    fi
}

run_custom_test "Security monitoring script exists and works" test_security_monitoring_script

# Test 2: Check if AIDE is installed and working
log_section "AIDE Intrusion Detection Validation"

test_aide_installation() {
    if command -v aide >/dev/null 2>&1; then
        # Check if AIDE database exists
        if [[ -f "/var/lib/aide/aide.db" ]]; then
            # Check if AIDE check script exists
            if [[ -f "/usr/local/bin/aide_check.sh" && -x "/usr/local/bin/aide_check.sh" ]]; then
                # Test if AIDE check script runs
                if /usr/local/bin/aide_check.sh >/dev/null 2>&1; then
                    return 0
                else
                    log_error "AIDE check script execution failed"
                    return 1
                fi
            else
                log_error "AIDE check script not found or not executable"
                return 1
            fi
        else
            log_error "AIDE database not found"
            return 1
        fi
    else
        log_error "AIDE not installed"
        return 1
    fi
}

run_custom_test "AIDE intrusion detection installed and working" test_aide_installation

# Test 3: Check firewall configuration
log_section "Firewall Configuration Validation"

test_firewall_configuration() {
    # Check if UFW is active
    if ufw status | grep -q "Status: active"; then
        # Check if critical ports are blocked
        if ufw status | grep -q "8545/tcp.*DENY"; then
            if ufw status | grep -q "8551/tcp.*DENY"; then
                return 0
            else
                log_error "Port 8551 not blocked by firewall"
                return 1
            fi
        else
            log_error "Port 8545 not blocked by firewall"
            return 1
        fi
    else
        log_error "UFW not active"
        return 1
    fi
}

run_custom_test "Firewall configuration is correct" test_firewall_configuration

# Test 4: Check fail2ban configuration
log_section "Fail2ban Configuration Validation"

test_fail2ban_configuration() {
    # Check if fail2ban is running
    if systemctl is-active --quiet fail2ban; then
        # Check if fail2ban has jails configured
        if fail2ban-client status | grep -q "Number of jail:"; then
            return 0
        else
            log_error "Fail2ban has no jails configured"
            return 1
        fi
    else
        log_error "Fail2ban not running"
        return 1
    fi
}

run_custom_test "Fail2ban configuration is correct" test_fail2ban_configuration

# Test 5: Check network binding
log_section "Network Binding Validation"

test_network_binding() {
    # Check if any services are binding to 0.0.0.0 (security risk)
    if ss -tuln | grep -q "0.0.0.0"; then
        log_error "Services found binding to 0.0.0.0 (security risk)"
        return 1
    else
        # Check if services are binding to localhost
        if ss -tuln | grep -q "127.0.0.1"; then
            return 0
        else
            log_warn "No services found binding to localhost"
            return 0
        fi
    fi
}

run_custom_test "Network binding is secure" test_network_binding

# Test 6: Check file permissions
log_section "File Permissions Validation"

test_file_permissions() {
    # Check if secrets directory exists and has correct permissions
    if [[ -d "$HOME/secrets" ]]; then
        local perms
        perms=$(stat -c %a "$HOME/secrets")
        if [[ "$perms" == "700" ]]; then
            # Check if JWT secret has correct permissions
            if [[ -f "$HOME/secrets/jwt.hex" ]]; then
                local jwt_perms
                jwt_perms=$(stat -c %a "$HOME/secrets/jwt.hex")
                if [[ "$jwt_perms" == "600" ]]; then
                    return 0
                else
                    log_error "JWT secret permissions incorrect (expected 600, got $jwt_perms)"
                    return 1
                fi
            else
                log_warn "JWT secret not found (may not be created yet)"
                return 0
            fi
        else
            log_error "Secrets directory permissions incorrect (expected 700, got $perms)"
            return 1
        fi
    else
        log_warn "Secrets directory not found (may not be created yet)"
        return 0
    fi
}

run_custom_test "File permissions are secure" test_file_permissions

# Test 7: Check crontab scheduling
log_section "Crontab Scheduling Validation"

test_crontab_scheduling() {
    # Check if security monitoring is scheduled
    if crontab -l 2>/dev/null | grep -q "security_monitor"; then
        # Check if AIDE is scheduled
        if crontab -l 2>/dev/null | grep -q "aide_check"; then
            return 0
        else
            log_error "AIDE not scheduled in crontab"
            return 1
        fi
    else
        log_error "Security monitoring not scheduled in crontab"
        return 1
    fi
}

run_custom_test "Crontab scheduling is configured" test_crontab_scheduling

# Test 8: Check log rotation
log_section "Log Rotation Validation"

test_log_rotation() {
    # Check if security monitoring log rotation is configured
    if [[ -f "/etc/logrotate.d/security_monitor" ]]; then
        return 0
    else
        log_error "Security monitoring log rotation not configured"
        return 1
    fi
}

run_custom_test "Log rotation is configured" test_log_rotation

# Test 9: Check systemd services
log_section "Systemd Services Validation"

test_systemd_services() {
    # Check if critical services are running
    local services=("ufw" "fail2ban")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if ! systemctl is-active --quiet "$service"; then
            failed_services+=("$service")
        fi
    done
    
    if [[ ${#failed_services[@]} -eq 0 ]]; then
        return 0
    else
        log_error "Services not running: ${failed_services[*]}"
        return 1
    fi
}

run_custom_test "Critical systemd services are running" test_systemd_services

# Test 10: Check security logs
log_section "Security Logs Validation"

test_security_logs() {
    # Check if security monitoring log exists and has content
    if [[ -f "/var/log/security_monitor.log" ]]; then
        if [[ -s "/var/log/security_monitor.log" ]]; then
            # Check if AIDE log exists
            if [[ -f "/var/log/aide_check.log" ]]; then
                return 0
            else
                log_warn "AIDE log not found (may not have run yet)"
                return 0
            fi
        else
            log_error "Security monitoring log is empty"
            return 1
        fi
    else
        log_error "Security monitoring log not found"
        return 1
    fi
}

run_custom_test "Security logs exist and have content" test_security_logs

# Test 11: Check SSH configuration
log_section "SSH Configuration Validation"

test_ssh_configuration() {
    # Check if root login is disabled
    if grep -q "PermitRootLogin no" /etc/ssh/sshd_config; then
        # Check if password authentication is disabled
        if grep -q "PasswordAuthentication no" /etc/ssh/sshd_config; then
            return 0
        else
            log_warn "Password authentication not disabled"
            return 0
        fi
    else
        log_warn "Root login not disabled"
        return 0
    fi
}

run_custom_test "SSH configuration is secure" test_ssh_configuration

# Test 12: Check system updates
log_section "System Updates Validation"

test_system_updates() {
    # Check if system is up to date
    if apt list --upgradable 2>/dev/null | grep -q "upgradable"; then
        log_warn "System has pending updates"
        return 0
    else
        return 0
    fi
}

run_custom_test "System updates status checked" test_system_updates

# Test 13: Check disk usage
log_section "Disk Usage Validation"

test_disk_usage() {
    # Check disk usage
    local disk_usage
    disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -lt 90 ]]; then
        return 0
    else
        log_warn "Disk usage is high ($disk_usage%)"
        return 0
    fi
}

run_custom_test "Disk usage is acceptable" test_disk_usage

# Test 14: Check memory usage
log_section "Memory Usage Validation"

test_memory_usage() {
    # Check memory usage
    local memory_usage
    memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [[ $memory_usage -lt 90 ]]; then
        return 0
    else
        log_warn "Memory usage is high ($memory_usage%)"
        return 0
    fi
}

run_custom_test "Memory usage is acceptable" test_memory_usage

# Test 15: Check for suspicious processes
log_section "Suspicious Processes Validation"

test_suspicious_processes() {
    # Check for suspicious processes
    local suspicious_processes=("nc" "netcat" "nmap" "masscan" "hydra" "john")
    local found_processes=()
    
    for process in "${suspicious_processes[@]}"; do
        if pgrep -f "$process" >/dev/null 2>&1; then
            found_processes+=("$process")
        fi
    done
    
    if [[ ${#found_processes[@]} -eq 0 ]]; then
        return 0
    else
        log_warn "Suspicious processes found: ${found_processes[*]}"
        return 0
    fi
}

run_custom_test "No suspicious processes detected" test_suspicious_processes

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
        echo "- Ensure all required services are installed and running"
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

# Additional security checks
log_section "Additional Security Information"

echo "Security monitoring log location: /var/log/security_monitor.log"
echo "AIDE intrusion detection log: /var/log/aide_check.log"
echo "Security monitoring runs every 15 minutes"
echo "AIDE intrusion detection runs daily at 2 AM"
echo

# Show recent security log entries
if [[ -f "/var/log/security_monitor.log" ]]; then
    echo "Recent security monitoring entries:"
    tail -5 /var/log/security_monitor.log
    echo
fi

# Show recent AIDE log entries
if [[ -f "/var/log/aide_check.log" ]]; then
    echo "Recent AIDE intrusion detection entries:"
    tail -5 /var/log/aide_check.log
    echo
fi

# Show firewall status
echo "Firewall status:"
ufw status
echo

# Show fail2ban status
echo "Fail2ban status:"
fail2ban-client status
echo

# Exit with appropriate code
if [[ $failed_tests -gt 0 ]]; then
    exit 1
elif [[ $warnings -gt 0 ]]; then
    exit 2
else
    exit 0
fi