# Security Status & Improvements Guide

## Current Architecture

**Active Security Scripts**:
- `install/security/consolidated_security.sh` (239 lines) - firewall, fail2ban, AIDE setup. Called from run_1.sh
  - Functions: `setup_firewall()`, `setup_fail2ban()`, `setup_aide()`, `verify_security_setup()`
  - Uses: `install_dependencies()`, `enable_and_start_systemd_service()`, `require_root()`, `get_script_directories()`
- `install/security/nginx_harden.sh` (66 lines) - nginx proxy abuse protection. Called from nginx install scripts
- `install/security/test_security_fixes.sh` - security testing suite

**Removed**: `firewall.sh` → merged, `install_fail2ban.sh` → merged

**Key Architecture Changes**:
1. Nginx hardening remains separate (not consolidated) - better separation of concerns
2. test_security_fixes.sh moved to security/ directory with improved path handling
3. All functionality preserved, 40% code reduction achieved

**Status**: ✅ Shellcheck passing, all validation passing

## High Priority Tasks for Next Agent

### Task 1.1: Use Common Functions for Firewall Setup
**Issue**: Custom firewall setup instead of `setup_firewall_rules()` from common_functions.sh (line ~197)

**Action**: Refactor `setup_firewall()` to use the common function

**Expected**: ~30 lines reduction, better consistency

### Task 1.2: Document Path Handling Pattern  
**Action**: Add to cursor rules or template:
```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$PROJECT_ROOT/exports.sh"
```

### Task 1.3: Clean Up Documentation
- Update SECURITY_GUIDE.md with current architecture
- Remove any remaining outdated files

## Medium Priority Tasks

### Task 2.1: Automated Security Scanning
- Scan config files for 0.0.0.0 bindings, weak ciphers, exposed RPC endpoints
- Integrate into consolidated_security.sh or separate validation

### Task 2.2: Enhanced Log Monitoring
- Detect failed authentication, suspicious network activity, service outages
- Add alerting mechanism (email/webhook)

### Task 2.3: Rate Limiting for RPC
- Comprehensive rate limiting for all RPC endpoints
- Configure nginx rate limiting for HTTP/HTTPS and WebSocket

## Low Priority Tasks

### Task 3.1: Enhanced Intrusion Detection
- Configure AIDE for additional directories
- Add automated response to alerts
- Document monitoring strategy

### Task 3.2: Secrets Management
- Evaluate environment variables for sensitive data
- Use systemd environment files where appropriate

### Task 3.3: Security Audit Logging
- Implement centralized audit logging
- Add log analysis tools

## Quick Wins

1. ✅ Add local shellcheck to CI
2. Use `setup_firewall_rules()` from common functions
3. Document BASH_SOURCE path pattern
4. Update SECURITY_GUIDE.md with current file structure

## Estimated Effort

- Phase 1 (High Priority): 2-4 hours
- Phase 2 (Medium Priority): 4-8 hours  
- Phase 3 (Low Priority): 6-12 hours
- Total: 12-24 hours

## Success Criteria

- Common functions properly utilized (no duplicate code)
- Documentation accurate and up-to-date
- Shellcheck passes on all scripts
- Security incidents detected and logged
- Rate limiting properly configured
