# Agent Context for Ethereum Node Setup

## Quick Reference for AI Agents

### Documentation Location
All project documentation is organized in the `docs/` folder. Key files include:

- **Configuration**: `CONFIGURATION_GUIDE.md` - Architecture and conventions
- **Scripting Standards**: `SHELL_SCRIPTING_BEST_PRACTICES_AND_LINTING_GUIDE.md` - Best practices
- **Security**: `SECURITY_GUIDE.md` - Comprehensive security documentation
- **Testing**: `SHELL_SCRIPT_TEST_RESULTS.md` - Test results and validation

### Code Architecture
- **Configuration**: Centralized in `exports.sh`, templates in `configs/`
- **Common Functions**: Shared utilities in `lib/common_functions.sh`
- **Client Support**: 6 execution clients + 6 consensus clients
- **Installation Scripts**: Individual scripts for each client

### Key Patterns
1. **Template + Custom**: Base configs merged with user variables
2. **Common Functions**: Reusable utilities to avoid code duplication
3. **Strict Shell Mode**: All scripts use `set -Eeuo pipefail`
4. **Standardized Logging**: Colored output with consistent messaging

### When Modifying Scripts
1. Follow shell scripting best practices from `SHELL_SCRIPTING_BEST_PRACTICES_AND_LINTING_GUIDE.md`
2. Use functions from `lib/common_functions.sh` when possible
3. Maintain configuration consistency per `CONFIGURATION_GUIDE.md`
4. Test changes and update documentation as needed

### Client Installation Flow
1. Check system requirements
2. Download and verify client binaries
3. Create configuration from templates + user variables
4. Set up systemd services
5. Start and verify services

For detailed information, refer to the appropriate documentation files in this `docs/` folder.

### Quick Links
- Main README: `README.md`
- Documentation Index: `docs/README.md`
- Configuration Guide: `docs/CONFIGURATION_GUIDE.md`
- Security Guide: `docs/SECURITY_GUIDE.md`

## Agent Rules and Standards

### Core Patterns and Architecture
- Centralized configuration in `exports.sh`; templates live under `configs/`
- Shared utilities in `lib/common_functions.sh` (logging, installs, config merge, security, systemd)
- Strict shell mode across scripts: `set -Eeuo pipefail`
- Standardized logging via `log_info`, `log_warn`, `log_error`

### Script Structure and Privileges
- Install scripts must call `require_root()`; non-install scripts must not
- All scripts should source `exports.sh` and `lib/common_functions.sh` and call `get_script_directories()`
- Use `log_installation_start "Component"` and `log_installation_complete "Component" "service_name"` in install scripts

### Function Usage and Quality
- Prefer common functions over ad-hoc code: `secure_download`, `ensure_directory`, `create_systemd_service`, etc.
- Consistent error handling pattern with explicit exits on failure
- Maintain ShellCheck compliance and avoid code duplication

### Security Integration
- Apply SSH hardening, fail2ban, and file permission hardening via provided security functions
- Use configuration permission helpers (e.g., secure config files) for configs under `configs/`

### Pre-Commit Validation Checklist
- Verify all referenced functions exist in `lib/common_functions.sh`
- Ensure correct root vs non-root usage
- Confirm security functions are integrated where required
- Achieve 0 ShellCheck errors on modified scripts
- Keep error handling consistent and remove unused/duplicate code