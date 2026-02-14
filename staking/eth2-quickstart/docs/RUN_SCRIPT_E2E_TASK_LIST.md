# Run Script E2E - Task List (from PR #77)

This document tracks the implementation of PR #77 "Client script issues" - script-relative path resolution and run_2.sh non-interactive mode for CI/Docker E2E testing.

## Summary of PR Changes

1. **Script-relative path resolution** - Replace `source ../../exports.sh` with `SCRIPT_DIR`/`PROJECT_ROOT` pattern so scripts work when run from any cwd (e.g. CI at `/workspace`)
2. **run_2.sh flag mode** - Add `--execution=`, `--consensus=`, `--mev=`, `--skip-deps` for non-interactive CI
3. **CI_E2E support** - `setup_firewall_rules()` skips UFW when `CI_E2E=true` (Docker lacks kernel modules)
4. **check_system_requirements()** - Never fails, only warns (allows CI with limited resources)
5. **run_install_script()** - New function for run_2.sh flag mode
6. **E2E test infrastructure** - `run_e2e.sh --phase=1|2`, `ci_test_e2e.sh` (full E2E), `ci_test_run_2.sh` (structure validation only)

## Verification Checklist

- [ ] All install scripts load when run from /workspace (any cwd)
- [ ] run_2.sh --execution=geth --consensus=prysm --mev=mev-boost --skip-deps completes in Docker
- [ ] CI_E2E=true skips UFW in setup_firewall_rules
- [ ] check_system_requirements never exits non-zero
- [ ] config/user_config.env overrides LOGIN_UNAME for CI
- [ ] run_e2e.sh --phase=2 builds, starts container, runs E2E, cleans up
- [ ] Shellcheck passes on all modified scripts
