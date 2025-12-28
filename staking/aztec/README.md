# Aztec Liquid Staking Protocol

Liquid staking infrastructure for Aztec Network (stAZTEC).

---

## Quick Start

```bash
# Run unit tests (only thing that works without aztec-nargo)
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 64 tests passed
```

⚠️ **Contracts cannot compile** without `aztec-nargo`. See [NEXT_AGENT_PROMPT.md](NEXT_AGENT_PROMPT.md) for environment setup.

---

## Current Status

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
| [NEXT_AGENT_PROMPT.md](NEXT_AGENT_PROMPT.md) | 🔴 **Start here** - Environment setup |
| [contracts/AGENT_HANDOFF.md](contracts/AGENT_HANDOFF.md) | Contract development notes |
| [docs/EXECUTIVE-SUMMARY.md](docs/EXECUTIVE-SUMMARY.md) | Business overview |
| [docs/ECONOMICS.md](docs/ECONOMICS.md) | Financial models |
| [docs/liquid-staking-analysis.md](docs/liquid-staking-analysis.md) | Technical architecture |

---

## Directory Structure

```
staking/aztec/
├── contracts/           # Noir smart contracts
│   ├── liquid-staking-core/   # Main entry point
│   ├── staked-aztec-token/    # stAZTEC token
│   ├── withdrawal-queue/      # Withdrawal management
│   ├── vault-manager/         # Batch staking
│   ├── rewards-manager/       # Exchange rates
│   ├── validator-registry/    # Validator tracking
│   ├── aztec-staking-pool/    # Base staking
│   └── staking-math-tests/    # Unit tests (64 tests)
├── docs/                # Planning documents
└── scripts/             # Dev scripts
```

---

## External Resources

- [Aztec Docs](https://docs.aztec.network/)
- [Noir Docs](https://noir-lang.org/docs/)
- [Aztec Staking](https://stake.aztec.network/)
