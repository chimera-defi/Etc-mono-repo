# Stack Consistency Audit & Unification (2026-02-21)

**Scope:** ETH2 quickstart, Aztec, Monad, MegaETH (discovery)
**Status:** Aztec + Monad unified; Ethereum partial; MegaETH blocked

---

## 1. Audit Findings

### Inventory Summary

| Stack | Bootstrap | Preflight | Smoke | Status | Start | Stop | Logs |
|-------|-----------|-----------|-------|--------|-------|------|------|
| eth2-quickstart | Partial (run_1/2.sh) | — | — | — | — | — | — |
| Aztec | ✅ | — | — | ✅ | ✅ | ✅ | ✅ |
| Monad | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MegaETH | — | — | — | — | — | — | — |

### Consistency Matrix

| Dimension | eth2-quickstart | Aztec | Monad | Verdict |
|-----------|-----------------|-------|-------|---------|
| Env vars | exports.sh + user_config.env | Split dev/infra | MONAD_*, RPC_URL, etc. | **Partial** — no cross-stack base schema |
| Ports | 8545/8546/8551, etc. | 8080/8880/40400 | 8787/8792, monitoring | **Partial** — see PORT_REGISTRY.md |
| Scripts | run_1.sh, run_2.sh | Dev vs infra split | Preflight/smoke/status | **Good** — naming differs |
| systemd | Abstracted helpers | Explicit unit gen | Explicit install | **Consistent** outcome |

### High-Signal Findings

1. Shared pattern: shell-first, systemd-managed, optional compose
2. Drift is in **contract shape** (naming/env/ports), not tooling type
3. ENV_CONTRACT.md + PORT_REGISTRY.md now codify cross-stack contracts
4. MegaETH: no runnable setup found in scope

---

## 2. Implementation (This PR)

### Added

- **COMMAND_CONTRACT.md** — normalized command interface (bootstrap, preflight, smoke, status, start, stop, logs)
- **stack-cli.sh** — unified dispatcher with auto-detect and smart script matching
- **Aztec:** stop_aztec.sh, start_aztec.sh, logs_aztec.sh, status_aztec.sh
- **Monad:** stop.sh, start.sh, logs.sh, status.sh
- **scripts/stack-ops/README.md** — CLI usage guide

### Design Decisions

- Wrapper pattern — no breaking changes
- Exit codes: 0=success, 1=error, 2=bad args
- `--json` optional on all commands
- Root checks (EUID) and numeric validation (--timeout, --tail) in privileged scripts

### References

- [COMMAND_CONTRACT.md](COMMAND_CONTRACT.md)
- [ENV_CONTRACT.md](ENV_CONTRACT.md)
- [PORT_REGISTRY.md](PORT_REGISTRY.md)
- [scripts/stack-ops/README.md](../../scripts/stack-ops/README.md)

---

## 3. Blockers & Next Steps

### P0 (Before Production)

1. **Ethereum** — needs bootstrap.sh wrapper for run_1.sh + run_2.sh; no status/preflight/smoke in standard form
2. **MegaETH** — repo not found; dispatcher placeholder fails at runtime

### P1 (Recommended Soon)

- [ ] Ethereum bootstrap wrapper
- [ ] Ethereum smoke-test harness
- [ ] Align JSON output schema (Monad uses STATUS_PORT vs STACK_RPC_URL)
- [ ] Extract shared firewall rules

### P2 (Medium Term)

- [ ] Port allocation validation in preflight
- [ ] Shared systemd unit templates
- [ ] CI gate for command contract compliance

---

## 4. Evidence Snapshot

Files inspected during audit:
- eth2-quickstart: run_1.sh, run_2.sh, exports.sh, test/run_tests.sh
- infra-kit: README, SPEC, DESIGN, PLAN, AZTEC_NODE_SPEC
- Aztec: scripts/*, infra/scripts/*
- Monad: infra/scripts/*, monitoring/docker-compose.yml
