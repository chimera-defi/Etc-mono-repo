# Security Guide

## Overview
This guide provides comprehensive security information for the Ethereum node setup scripts. The security implementation focuses on network security, file protection, input validation, and monitoring.

## Security Features

### Network Security
- **Localhost Binding**: All services bind to `127.0.0.1` only
- **Firewall Protection**: UFW firewall with comprehensive rules
- **Fail2ban Integration**: Protection against brute force attacks
- **Private Network Blocking**: Prevents network scan abuse

### File Security
- **Secure Permissions**: Configuration files (600), directories (700)
- **Automatic Management**: Scripts set appropriate permissions
- **Secrets Protection**: JWT secrets and keys properly secured

### Input Validation
- **User Input Validation**: Comprehensive validation functions
- **Path Traversal Prevention**: Prevents directory traversal attacks
- **Command Injection Prevention**: Safe command execution
- **URL Validation**: Validates download URLs before use

### Error Handling
- **Sanitized Messages**: Error messages don't leak sensitive information
- **Secure Execution**: Safe command execution patterns
- **No Information Disclosure**: Errors don't expose system details

### Monitoring
- **Security Monitoring**: Real-time monitoring script
- **Process Monitoring**: Detects suspicious activities
- **Resource Monitoring**: Monitors disk, memory, and network usage
- **Log Management**: Automated log rotation and analysis

## Security Scripts

### Core Security Scripts
- **`install/security/consolidated_security.sh`** - Main security setup (firewall, fail2ban, AIDE)
- **`install/security/nginx_harden.sh`** - Nginx proxy abuse protection
- **`install/security/test_security_fixes.sh`** - Security testing suite

### Testing Scripts
- **`docs/verify_security.sh`** - Production security verification
- **`docs/validate_security_safe.sh`** - Safe validation without root

### Usage
```bash
# Security setup is called automatically from run_1.sh
# Test security implementations
./install/security/test_security_fixes.sh

# Comprehensive security verification
./docs/verify_security.sh

# Safe validation (no root required)
./docs/validate_security_safe.sh
```

## Security Workflow

### Installation Security
1. **Initial Setup** (`run_1.sh`):
   - Network security configuration
   - File permission securing
   - Security monitoring setup

2. **Client Installation** (`run_2.sh`):
   - Post-installation hardening
   - Configuration file securing
   - Security validation

### Verification
1. **Test Security**: Run `./test_security_fixes.sh`
2. **Verify Security**: Run `./docs/verify_security.sh`
3. **Monitor Logs**: Check `/var/log/security_monitor.log`

## Security Best Practices

### Configuration
- No hardcoded sensitive values
- JWT secrets referenced by file path
- External IPs determined at runtime

### Scripts
- Follow shell scripting best practices
- Proper error handling and logging
- Input validation and sanitization
- Secure file operations

### System
- Services bind to localhost only
- Firewall rules prevent unauthorized access
- File permissions restrict access
- Security monitoring detects issues

## Monitoring

### Log Files
- **Security Monitoring**: `/var/log/security_monitor.log`
- **AIDE Integrity**: `/var/log/aide_check.log`
- **System Logs**: `/var/log/syslog`
- **Fail2ban Logs**: `/var/log/fail2ban.log`

### AIDE File Integrity Monitoring
AIDE (Advanced Intrusion Detection Environment) creates a baseline of critical system files and detects tampering. Config: `config/aide.conf` (single source). It monitors:
- **`/etc`** – System configuration (SSH, firewall, etc.)
- **`/bin`, `/usr/bin`, `/usr/sbin`** – Executables

The config uses SHA-256 checksums for content integrity (per [AIDE best practices](https://github.com/aide/aide/blob/master/doc/aide.conf.5)). Daily checks run at 2 AM via cron. Review `/var/log/aide_check.log` for changes.

### Monitoring Schedule
- **Security Monitoring**: Every 15 minutes
- **AIDE Integrity Check**: Daily at 2 AM
- **Log Rotation**: Automated via logrotate

### Alert Conditions
- Suspicious processes detected
- Failed SSH attempts
- High resource usage
- Unusual network connections
- File integrity violations

## Troubleshooting

### Common Issues
1. **Scripts not executable**: `chmod +x *.sh`
2. **Permission denied**: Check file ownership
3. **Missing dependencies**: Install required packages
4. **Services not starting**: Check service status and logs

### Getting Help
1. Check logs for error messages
2. Run validation scripts to identify issues
3. Review security documentation
4. Check system requirements

## Security Maintenance

### Regular Tasks
- Monitor security logs for alerts
- Review security test results
- Update system and dependencies
- Verify firewall rules are active

### Quarterly Tasks
- Comprehensive security assessment
- Review and update security policies
- Test security incident response procedures
- Update security documentation

## Conclusion

The security implementation provides enterprise-grade security features that are fully integrated into the installation process. All critical vulnerabilities have been addressed with comprehensive fixes that follow security best practices.

**Status**: PRODUCTION READY with HIGH security level.