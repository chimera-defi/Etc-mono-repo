# Aztec Liquid Staking Protocol

Liquid staking infrastructure for Aztec Network (stAZTEC).

---

## Quick Start

```bash
# Run unit tests (works without Docker)
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 64 tests passed

# Run smoke test
./staking/aztec/scripts/smoke-test.sh --minimal
```

⚠️ **Contract compilation requires Docker.** See [docs/INTEGRATION-TESTING.md](docs/INTEGRATION-TESTING.md).

---

## Status

| Component | Status |
|-----------|--------|
| Contract code | ✅ Complete (176 functions, 7 contracts) |
| Unit tests | ✅ 64 passing |
| Compilation | ❌ Requires aztec-nargo (Docker) |
| Integration tests | ❌ Not written |

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
| liquid-staking-core | 37 | Main entry point |
| rewards-manager | 33 | Exchange rate updates |
| vault-manager | 28 | 200k batch staking |
| withdrawal-queue | 24 | FIFO withdrawals |
| aztec-staking-pool | 21 | Base staking |
| validator-registry | 20 | Validator tracking |
| staked-aztec-token | 13 | stAZTEC token |
