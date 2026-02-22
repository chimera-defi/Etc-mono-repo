# Stack Unification Changes (2026-02-21)

## Summary

This commit unified the local setup flows across ETH2 quickstart integration points, Aztec, and Monad stacks through:

1. **Command Contract** — normalized command interface across all stacks
2. **Unified CLI dispatcher** — single entry point for all stack operations
3. **Missing script implementations** — added stop, start, logs, status scripts for Aztec and Monad
4. **Improved auto-detection** — flexible script path matching for naming variations
5. **Updated documentation** — linked new contract docs from infra-kit README

## Files Added

### Documentation
- `staking/research/infra-kit/COMMAND_CONTRACT.md` — Defines required commands and their semantics (bootstrap, preflight, smoke, status, start, stop, logs)
- `scripts/stack-ops/README.md` — Usage guide for the unified CLI

### Scripts - Core Dispatcher
- `scripts/stack-ops/stack-cli.sh` — Unified command dispatcher with auto-detection and smart script path matching

### Scripts - Aztec (New)
- `staking/aztec/infra/scripts/stop_aztec.sh` — Gracefully stop Aztec node service
- `staking/aztec/infra/scripts/start_aztec.sh` — Start Aztec node service with wait/timeout
- `staking/aztec/infra/scripts/logs_aztec.sh` — Tail Aztec service logs with jq support
- `staking/aztec/infra/scripts/status_aztec.sh` — Report Aztec node status with JSON output

### Scripts - Monad (New)
- `staking/monad/infra/scripts/stop.sh` — Gracefully stop Monad validator service
- `staking/monad/infra/scripts/start.sh` — Start Monad validator service with wait/timeout
- `staking/monad/infra/scripts/logs.sh` — Tail Monad service logs with jq support
- `staking/monad/infra/scripts/status.sh` — Report Monad validator status with JSON output

## Files Modified

- `staking/research/infra-kit/README.md` — Added section linking to COMMAND_CONTRACT.md and stack-ops quick start

## Key Features

### Unified Interface
All scripts follow a consistent pattern:
```bash
# Each stack can be managed with the same command set:
./scripts/stack-ops/stack-cli.sh --stack=aztec bootstrap --with-monitoring
./scripts/stack-ops/stack-cli.sh --stack=monad status --json
./scripts/stack-ops/stack-cli.sh --stack=ethereum logs --follow
```

### Auto-Detection
Stack-cli.sh automatically detects which stack is running by checking systemd units:
```bash
./scripts/stack-ops/stack-cli.sh status  # Works if only one stack is active
```

### Smart Script Matching
The dispatcher flexibly matches script names to handle variations:
- `bootstrap_aztec.sh` ✓
- `preflight_check.sh` ✓
- `e2e_smoke_test.sh` ✓ (matched to `smoke` command)
- `status_server.py` ✗ (Python scripts not yet supported)

### JSON Output
All new scripts support `--json` output for tooling integration:
```bash
./scripts/stack-ops/stack-cli.sh status --json | jq '.rpc_healthy'
```

## Testing Performed

- ✅ `stack-cli.sh --help` — Shows usage
- ✅ `stack-cli.sh --stack=aztec status --json` — Routes to status_aztec.sh, returns JSON
- ✅ `stack-cli.sh --stack=monad preflight --json` — Routes to preflight_check.sh
- ✅ `stack-cli.sh --stack=monad logs --tail=5` — Routes to logs.sh
- ✅ Script help pages display correctly with `--help` flag
- ✅ Exit codes follow contract: 0=success, 1=error, 2=bad args

## Low-Risk Design Decisions

1. **No breaking changes** — All existing scripts remain unchanged
2. **Wrapper pattern** — New scripts wrap systemd operations, not replacing existing infrastructure
3. **Fallback naming** — Dispatcher tries multiple naming patterns before failing
4. **Idempotent operations** — start/stop/logs are safe to call multiple times
5. **Standard exit codes** — Allow easy scripting and CI/CD integration

## Implementation Status (Command Contract)

| Command | eth2-quickstart | Aztec | Monad | MegaETH |
|---------|---|---|---|---|
| bootstrap | Partial (run_1/2.sh) | ✅ | ✅ | — |
| preflight | — | — | ✅ | — |
| smoke | — | — | ✅ | — |
| status | — | ✅ (NEW) | ✅ (NEW) | — |
| start | — | ✅ (NEW) | ✅ (NEW) | — |
| stop | — | ✅ (NEW) | ✅ (NEW) | — |
| logs | — | ✅ (NEW) | ✅ (NEW) | — |

## Known Limitations

1. **Ethereum** — eth2-quickstart uses run_1.sh/run_2.sh pattern; needs wrapper scripts to match contract
2. **MegaETH** — Setup not yet available in local scope; placeholder in dispatcher
3. **status.py** — Monad has status_server.py (Python); new status.sh wrapper calls systemd instead
4. **No env-var normalization** — Scripts still use stack-specific env names; mapped in ENV_CONTRACT.md docs

## Documentation References

- **Command Contract**: `staking/research/infra-kit/COMMAND_CONTRACT.md` — full semantics
- **Environment Contract**: `staking/research/infra-kit/ENV_CONTRACT.md` — env var mapping
- **Port Registry**: `staking/research/infra-kit/PORT_REGISTRY.md` — port allocation
- **Stack Operations**: `scripts/stack-ops/README.md` — CLI usage guide

## Next Steps (Recommended)

### P1 (Medium Risk)
1. Wrap eth2-quickstart's run_1.sh/run_2.sh with bootstrap.sh helper
2. Add bootstrap wrapper for Ethereum that auto-detects client choice
3. Create smoke-test harness for Ethereum

### P2 (Low-Medium Risk)
1. Add MegaETH adapter once repository path is provided
2. Create shared systemd unit templates in infra-kit
3. Extract firewall/hardening rules into shared library

### P3 (CI Integration)
1. Add CI check that verifies each stack implements 7 required commands
2. Create integration test suite for stack-cli.sh
3. Add pre-commit hook to validate script syntax

## Blockers Resolved

- ✅ Aztec status reporting — Created status_aztec.sh
- ✅ Monad status command — Created status.sh wrapper
- ✅ Start/stop standardization — Created start/stop.sh for both stacks
- ⏳ Ethereum bootstrap wrapper — Recommended for P1
- ⏳ MegaETH integration — Blocked on repository path availability

## Backward Compatibility

All changes are backward compatible:
- Existing scripts remain unchanged
- New wrappers add new commands (not replace)
- stack-cli.sh is an opt-in convenience layer
- Operators can continue using stack-specific scripts directly
