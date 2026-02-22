# PR #220: Stack Consistency Unification — Implementation Summary

## 🎯 Objective
Ensure local setup flows are consistent across ETH2 quickstart, Aztec, Monad, and future MegaETH integration.

## ✅ Completed (This Commit)

### 1. **Command Contract** (Specification)
- **File**: `staking/research/infra-kit/COMMAND_CONTRACT.md`
- **Purpose**: Define the unified command interface all stacks must expose
- **Commands Defined**:
  - `bootstrap [FLAGS]` — full initial setup with optional monitoring/firewall/hardening
  - `preflight [FLAGS]` — validate environment before startup
  - `smoke [FLAGS]` — quick health check (RPC, syncing, etc.)
  - `status [FLAGS]` — report service state and metrics
  - `start [FLAGS]` — start service with optional wait
  - `stop [FLAGS]` — gracefully stop service (with --force option)
  - `logs [FLAGS]` — tail service logs (with --follow, --since support)
- **Exit Codes**: Standardized (0=success, 1=error, 2=bad args)
- **JSON Output**: All commands support `--json` for tooling integration

### 2. **Unified CLI Dispatcher** (Implementation)
- **File**: `scripts/stack-ops/stack-cli.sh`
- **Features**:
  - Single entry point for all stack operations
  - Auto-detects stack from systemd units (no --stack arg needed if only one is active)
  - Smart script path matching (handles naming variations like `e2e_smoke_test.sh` → `smoke` command)
  - Clear error messages with exit code 2 for bad arguments
- **Usage**:
  ```bash
  ./scripts/stack-ops/stack-cli.sh --stack=aztec bootstrap --with-firewall
  ./scripts/stack-ops/stack-cli.sh --stack=monad status --json
  ./scripts/stack-ops/stack-cli.sh status  # auto-detect
  ```

### 3. **Aztec Stack Completion** (Missing Commands)
- `staking/aztec/infra/scripts/stop_aztec.sh` — graceful service shutdown
- `staking/aztec/infra/scripts/start_aztec.sh` — start with timeout/wait options
- `staking/aztec/infra/scripts/logs_aztec.sh` — journalctl wrapper with `--follow` support
- `staking/aztec/infra/scripts/status_aztec.sh` — service state + RPC health check (JSON capable)

### 4. **Monad Stack Completion** (Missing Commands)
- `staking/monad/infra/scripts/stop.sh` — graceful service shutdown
- `staking/monad/infra/scripts/start.sh` — start with timeout/wait options
- `staking/monad/infra/scripts/logs.sh` — journalctl wrapper with `--follow` support
- `staking/monad/infra/scripts/status.sh` — service state + RPC health check (JSON capable)

### 5. **Documentation & Guides**
- `scripts/stack-ops/README.md` — Complete CLI usage guide with examples
- Updated `staking/research/infra-kit/README.md` — Added links to COMMAND_CONTRACT and quick start

### 6. **Testing**
All changes tested locally:
```bash
✅ stack-cli.sh --help
✅ stack-cli.sh --stack=aztec status --json
✅ stack-cli.sh --stack=monad preflight --json
✅ stack-cli.sh --stack=monad logs --tail=5
✅ bash staking/aztec/infra/scripts/status_aztec.sh --help
✅ bash staking/monad/infra/scripts/start.sh --timeout=30
```

## 📊 Implementation Status (by Stack)

| Command | eth2-quickstart | Aztec | Monad | MegaETH |
|---------|---|---|---|---|
| `bootstrap` | Partial (run_1.sh, run_2.sh) | ✅ | ✅ | — |
| `preflight` | — | — | ✅ preflight_check.sh | — |
| `smoke` | — | — | ✅ e2e_smoke_test.sh | — |
| **`status`** | **—** | **✅ NEW** | **✅ NEW** | — |
| **`start`** | **—** | **✅ NEW** | **✅ NEW** | — |
| **`stop`** | **—** | **✅ NEW** | **✅ NEW** | — |
| **`logs`** | **—** | **✅ NEW** | **✅ NEW** | — |

## 🚧 Known Blockers & Limitations

### P0 (Before Production Use)
1. **Ethereum (eth2-quickstart)** — needs `bootstrap.sh` wrapper for run_1.sh + run_2.sh
   - Currently uses legacy naming pattern
   - Recommend: wrap both phases into single bootstrap command
   - Status: **Blocked on P1 engineering**

2. **Ethereum (eth2-quickstart)** — no smoke/preflight/status implementations yet
   - Test suite exists (`test/run_tests.sh`) but not in standard form
   - Status: **Blocked on P1 engineering**

3. **MegaETH** — repository not found in local scope
   - No runnable setup discovered
   - Dispatcher has placeholder but will fail at runtime
   - Status: **Blocked on repository availability**

### P1 (Low-Medium Risk, Recommended Soon)
- [ ] Create Ethereum bootstrap wrapper (combines run_1 + run_2)
- [ ] Add Ethereum smoke-test harness
- [ ] Standardize error logging across all stacks
- [ ] Extract shared firewall rules into infra-kit library

### P2 (Medium Risk)
- [ ] Extract shared systemd unit templates
- [ ] Create CI test gate for command contract compliance
- [ ] Add pre-commit hooks for script validation

## 🔍 Design Decisions (Low-Risk)

1. **Wrapper Pattern** — New scripts wrap existing infrastructure; no breaking changes
2. **Backward Compatible** — Operators can still use stack-specific scripts directly
3. **Fallback Naming** — Dispatcher tries multiple script name patterns (e.g., smoke → e2e_smoke_test.sh)
4. **Standard Exit Codes** — Enable easy shell composition and CI/CD integration
5. **JSON-Optional** — All commands support `--json` but output is human-readable by default

## 📝 Files Changed
```
ADDED (13):
  STACK_UNIFICATION_CHANGES.md (comprehensive change log)
  scripts/stack-ops/{stack-cli.sh, README.md}
  staking/aztec/infra/scripts/{stop_aztec, start_aztec, logs_aztec, status_aztec}.sh
  staking/monad/infra/scripts/{stop, start, logs, status}.sh
  staking/research/infra-kit/COMMAND_CONTRACT.md

MODIFIED (1):
  staking/research/infra-kit/README.md (added links + quick start)
```

## 🎓 References
- **Command Contract**: `staking/research/infra-kit/COMMAND_CONTRACT.md`
- **Environment Contract**: `staking/research/infra-kit/ENV_CONTRACT.md`
- **Port Registry**: `staking/research/infra-kit/PORT_REGISTRY.md`
- **Stack Operations Guide**: `scripts/stack-ops/README.md`
- **Change Summary**: `STACK_UNIFICATION_CHANGES.md`

## 🔗 Related

- Depends on: Completion of stack consistency audit (`406dae2`)
- Enables: Unified operator playbooks and monitoring integration
- Blocked by: Ethereum wrapper, MegaETH repo availability

## Next PR (Recommended)

**Title**: `chore: add Ethereum bootstrap wrapper and smoke tests`
- Wrap eth2-quickstart run_1.sh + run_2.sh into single bootstrap command
- Add smoke-test harness matching monad/aztec pattern
- Create Ethereum status.sh reporting service state

---

**Status**: ✅ Ready for review and testing. All low-risk changes; eth2 integration deferred to next PR.
