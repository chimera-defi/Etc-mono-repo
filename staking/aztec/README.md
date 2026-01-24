# Aztec Liquid Staking Protocol

Liquid staking infrastructure for Aztec Network (stAZTEC).

---

## Quick Start

```bash
# Run unit tests (works without Docker)
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 74 tests passed

# Run smoke test
./staking/aztec/scripts/smoke-test.sh --minimal
```

⚠️ **Contract compilation requires Docker.** See [docs/INTEGRATION-TESTING.md](docs/INTEGRATION-TESTING.md).

---

## Status

| Component | Status |
|-----------|--------|
| Contract code | ✅ Complete (66 functions, 3 contracts) |
| Unit tests | ✅ 74 passing |
| Compilation | ✅ Works with aztec CLI `aztec compile` (Docker) |
| Integration tests | ✅ 6 passing (`./staking/aztec/scripts/integration-test.sh`) |

---

## Key Files

| File | Purpose |
|------|---------|
| [docs/INTEGRATION-TESTING.md](docs/INTEGRATION-TESTING.md) | Environment setup guide |
| [contracts/AGENT_HANDOFF.md](contracts/AGENT_HANDOFF.md) | Contract development notes |
| [docs/EXECUTIVE-SUMMARY.md](docs/EXECUTIVE-SUMMARY.md) | Business overview |
| [docs/liquid-staking-analysis.md](docs/liquid-staking-analysis.md) | Technical architecture |

---

## Contracts

| Contract | Functions | Description |
|----------|-----------|-------------|
| staked-aztec-token | 20 | stAZTEC token + exchange rate source of truth |
| liquid-staking-core | 26 | Main entry point (deposit/withdraw/fees) |
| withdrawal-queue | 20 | FIFO unbonding queue |
