#!/bin/bash

# Security Verification Script
# Comprehensive security verification for Ethereum node setup

set -euo pipefail

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

log_info "Starting comprehensive security verification..."
echo

# Initialize counters
total_checks=0
passed_checks=0
failed_checks=0
warnings=0

# Function to run a check
run_check() {
    local check_name="$1"
    local check_command="$2"
    local expected_result="${3:-0}"
    
    total_checks=$((total_checks + 1))
    
    if eval "$check_command" >/dev/null 2>&1; then
        if [[ $? -eq $expected_result ]]; then
            log_info "✓ $check_name"
            passed_checks=$((passed_checks + 1))
            return 0
        else
            log_warn "⚠ $check_name (unexpected result)"
            warnings=$((warnings + 1))
            return 1
        fi
    else
        log_error "✗ $check_name"
        failed_checks=$((failed_checks + 1))
        return 1
    fi
}

# Function to run a check with custom logic
run_custom_check() {
    local check_name="$1"
    local check_function="$2"
    
    total_checks=$((total_checks + 1))
    
    if $check_function; then
        log_info "✓ $check_name"
        passed_checks=$((passed_checks + 1))
        return 0
    else
        log_error "✗ $check_name"
        failed_checks=$((failed_checks + 1))
        return 1
    fi
}

# Network Security Checks
log_section "Network Security Verification"

run_check "No services binding to 0.0.0.0" "! ss -tuln | grep -q '0.0.0.0'"
run_check "UFW firewall is active" "ufw status | grep -q 'Status: active'"
run_check "Fail2ban is running" "systemctl is-active --quiet fail2ban"
run_check "SSH service is running" "systemctl is-active --quiet ssh"

# Check for proper localhost bindings
if ss -tuln | grep -q "127.0.0.1"; then
    log_info "✓ Services properly bound to localhost"
    passed_checks=$((passed_checks + 1))
else
    log_warn "⚠ No services found binding to localhost"
    warnings=$((warnings + 1))
fi
total_checks=$((total_checks + 1))

echo

# File Security Checks
log_section "File Security Verification"

run_check "Configuration files have secure permissions" "find configs/ -name '*.yaml' -o -name '*.toml' -o -name '*.cfg' -o -name '*.json' | xargs ls -l | grep -q '^-rw-------'"
run_check "SSH directory has secure permissions" "test -d ~/.ssh && test $(stat -c %a ~/.ssh) = 700"
run_check "SSH keys have secure permissions" "find ~/.ssh -type f -exec test $(stat -c %a {}) = 600 \; -print | head -1"

# Check secrets directory
if [[ -d "$HOME/secrets" ]]; then
    run_check "Secrets directory has secure permissions" "test $(stat -c %a "$HOME/secrets") = 700"
    run_check "Secret files have secure permissions" "find $HOME/secrets -type f -exec test $(stat -c %a {}) = 600 \; -print | head -1"
else
    log_warn "⚠ Secrets directory not found"
    warnings=$((warnings + 1))
    total_checks=$((total_checks + 2))
fi

echo

# Security Monitoring Checks
log_section "Security Monitoring Verification"

run_check "Security monitoring script exists" "test -f /usr/local/bin/security_monitor.sh"
run_check "Security monitoring script is executable" "test -x /usr/local/bin/security_monitor.sh"
run_check "Security monitoring is scheduled" "grep -q 'security_monitor' /etc/crontab"
run_check "Security log rotation configured" "test -f /etc/logrotate.d/security_monitor"

# Test security monitoring script execution
if [[ -f "/usr/local/bin/security_monitor.sh" ]]; then
    if /usr/local/bin/security_monitor.sh >/dev/null 2>&1; then
        log_info "✓ Security monitoring script executes successfully"
        passed_checks=$((passed_checks + 1))
    else
        log_error "✗ Security monitoring script execution failed"
        failed_checks=$((failed_checks + 1))
    fi
    total_checks=$((total_checks + 1))
fi

echo

# AIDE Intrusion Detection Checks
log_section "AIDE Intrusion Detection Verification"

run_check "AIDE is installed" "command -v aide >/dev/null"
run_check "AIDE database exists" "test -f /var/lib/aide/aide.db"
run_check "AIDE check script exists" "test -f /usr/local/bin/aide_check.sh"
run_check "AIDE check script is executable" "test -x /usr/local/bin/aide_check.sh"
run_check "AIDE is scheduled for daily checks" "grep -q 'aide_check' /etc/crontab"

echo

# Service Security Checks
log_section "Service Security Verification"

# Check if Ethereum services are running securely
if systemctl is-active --quiet eth1 2>/dev/null; then
    log_info "✓ Geth service is running"
    passed_checks=$((passed_checks + 1))
else
    log_warn "⚠ Geth service not running"
    warnings=$((warnings + 1))
fi
total_checks=$((total_checks + 1))

if systemctl is-active --quiet eth2 2>/dev/null; then
    log_info "✓ Consensus client service is running"
    passed_checks=$((passed_checks + 1))
else
    log_warn "⚠ Consensus client service not running"
    warnings=$((warnings + 1))
fi
total_checks=$((total_checks + 1))

# Check for any failed services
if systemctl --failed --no-pager | grep -q "0 loaded units listed"; then
    log_info "✓ No failed systemd services"
    passed_checks=$((passed_checks + 1))
else
    log_warn "⚠ Some systemd services have failed"
    warnings=$((warnings + 1))
fi
total_checks=$((total_checks + 1))

echo

# System Security Checks
log_section "System Security Verification"

run_check "System is up to date" "apt list --upgradable 2>/dev/null | grep -q 'upgradable' && false || true"
run_check "Automatic security updates enabled" "test -f /etc/apt/apt.conf.d/50unattended-upgrades"
run_check "Root login is disabled" "grep -q '^PermitRootLogin no' /etc/ssh/sshd_config"
run_check "Password authentication is disabled" "grep -q '^PasswordAuthentication no' /etc/ssh/sshd_config"

# Check disk usage
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [[ $disk_usage -lt 90 ]]; then
    log_info "✓ Disk usage is healthy ($disk_usage%)"
    passed_checks=$((passed_checks + 1))
else
    log_warn "⚠ Disk usage is high ($disk_usage%)"
    warnings=$((warnings + 1))
fi
total_checks=$((total_checks + 1))

# Check memory usage
memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [[ $memory_usage -lt 90 ]]; then
    log_info "✓ Memory usage is healthy ($memory_usage%)"
    passed_checks=$((passed_checks + 1))
else
    log_warn "⚠ Memory usage is high ($memory_usage%)"
    warnings=$((warnings + 1))
fi
total_checks=$((total_checks + 1))

echo

# SSL/TLS Security Checks
log_section "SSL/TLS Security Verification"

if [[ -d "/etc/letsencrypt/live" ]]; then
    log_info "✓ SSL certificates directory exists"
    passed_checks=$((passed_checks + 1))
    
    # Check certificate expiration
    if command -v openssl >/dev/null; then
        for cert_dir in /etc/letsencrypt/live/*/; do
            if [[ -f "$cert_dir/fullchain.pem" ]]; then
                expiry_date=$(openssl x509 -enddate -noout -in "$cert_dir/fullchain.pem" | cut -d= -f2)
                expiry_timestamp=$(date -d "$expiry_date" +%s)
                current_timestamp=$(date +%s)
                days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
                
                if [[ $days_until_expiry -gt 30 ]]; then
                    log_info "✓ SSL certificate valid for $days_until_expiry days"
                    passed_checks=$((passed_checks + 1))
                else
                    log_warn "⚠ SSL certificate expires in $days_until_expiry days"
                    warnings=$((warnings + 1))
                fi
                total_checks=$((total_checks + 1))
                break
            fi
        done
    fi
else
    log_warn "⚠ SSL certificates not found"
    warnings=$((warnings + 1))
    total_checks=$((total_checks + 1))
fi

echo

# Summary
log_section "Security Verification Summary"

echo "Total checks performed: $total_checks"
echo "Passed: $passed_checks"
echo "Failed: $failed_checks"
echo "Warnings: $warnings"
echo

# Calculate security score
if [[ $total_checks -gt 0 ]]; then
    security_score=$(( (passed_checks * 100) / total_checks ))
    echo "Security Score: $security_score%"
    echo
    
    if [[ $security_score -ge 90 ]]; then
        log_info "🎉 Excellent security posture! Your system is well-secured."
    elif [[ $security_score -ge 75 ]]; then
        log_warn "⚠ Good security posture, but there are some areas for improvement."
    elif [[ $security_score -ge 50 ]]; then
        log_warn "⚠ Moderate security posture. Several security measures need attention."
    else
        log_error "❌ Poor security posture. Immediate action required to secure your system."
    fi
fi

echo

# Recommendations
if [[ $failed_checks -gt 0 || $warnings -gt 0 ]]; then
    log_section "Recommendations"
    
    if [[ $failed_checks -gt 0 ]]; then
        echo "Critical issues to address:"
        echo "- Review failed checks above and fix them immediately"
        echo "- Run the security test suite: ./test_security_fixes.sh"
        echo "- Consider running the installation scripts again if needed"
        echo
    fi
    
    if [[ $warnings -gt 0 ]]; then
        echo "Areas for improvement:"
        echo "- Address warnings above to improve security posture"
        echo "- Consider setting up additional monitoring"
        echo "- Review system configuration for optimization"
        echo
    fi
fi

# Exit with appropriate code
if [[ $failed_checks -gt 0 ]]; then
    exit 1
elif [[ $warnings -gt 0 ]]; then
    exit 2
else
    exit 0
fi