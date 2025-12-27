# Aztec Liquid Staking Protocol

**Production-ready liquid staking infrastructure for Aztec Network**

Last Updated: December 27, 2025

---

## Overview

This directory contains all research, planning, and implementation for an Aztec-native liquid staking protocol (stAZTEC). The project enables users to stake any amount of AZTEC (bypassing the 200,000 AZTEC minimum) and receive liquid staking tokens.

## Quick Navigation

| If you want to... | Go to... |
|------------------|----------|
| Understand the opportunity (5 min) | [docs/EXECUTIVE-SUMMARY.md](docs/EXECUTIVE-SUMMARY.md) |
| **See what's missing (GAP ANALYSIS)** | [docs/STRATEGIC-GAP-ANALYSIS.md](docs/STRATEGIC-GAP-ANALYSIS.md) |
| **Run parallel agents** | [docs/AGENT-PROMPTS-QUICKREF.md](docs/AGENT-PROMPTS-QUICKREF.md) |
| Get the numbers | [docs/ECONOMICS.md](docs/ECONOMICS.md) |
| Validate assumptions | [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md) |
| Plan development | [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md) |
| Pick up a task | [docs/TASKS.md](docs/TASKS.md) |
| Continue contract development | [contracts/AGENT_HANDOFF.md](contracts/AGENT_HANDOFF.md) |
| Run smoke tests | [scripts/smoke-test.sh](scripts/smoke-test.sh) |

## Directory Structure

```
staking/aztec/
├── README.md                   # This file - main index
├── PROGRESS.md                 # Development progress tracking (NEW)
├── docs/                       # Research and planning documentation
│   ├── EXECUTIVE-SUMMARY.md    # One-page strategic overview
│   ├── STRATEGIC-GAP-ANALYSIS.md # Gap analysis + parallel agent prompts
│   ├── AGENT-PROMPTS-QUICKREF.md # Copy-paste prompts for agents
│   ├── ASSUMPTIONS.md          # Assumptions registry + competitor tracker
│   ├── ECONOMICS.md            # Financial models (source of truth)
│   ├── IMPLEMENTATION-PLAN.md  # 6-month build roadmap
│   ├── FUNDRAISING.md          # Seed deck outline
│   ├── TASKS.md                # Discrete task breakdown
│   └── liquid-staking-analysis.md  # Technical architecture
├── contracts/                  # Noir smart contracts (ALL COMPLETE)
│   ├── aztec-staking-pool/     # Base staking pool (19 functions)
│   ├── staked-aztec-token/     # stAZTEC token (16 functions)
│   ├── withdrawal-queue/       # FIFO withdrawal queue (19 functions)
│   ├── validator-registry/     # Validator tracking (23 functions)
│   ├── liquid-staking-core/    # Main entry point (24 functions) NEW
│   ├── vault-manager/          # Batch pooling (22 functions) NEW
│   ├── rewards-manager/        # Exchange rate (21 functions) NEW
│   ├── staking-math-tests/     # Unit tests (56 tests)
│   ├── AGENT_HANDOFF.md        # Development handoff notes
│   └── NOIR_GUIDE.md           # Noir/Aztec patterns guide
└── scripts/                    # Development and testing scripts
    ├── smoke-test.sh           # Environment verification
    ├── setup-env.sh            # Environment setup
    └── query-devnet.mjs        # Devnet query utility
```

## Current Status

### ✅ ALL CONTRACTS COMPLETE

| Contract | Status | Functions | Description |
|----------|--------|-----------|-------------|
| StakingPool | ✅ Complete | 16 | Base staking pool logic |
| StakedAztecToken | ✅ Complete | 13 | stAZTEC liquid staking token |
| WithdrawalQueue | ✅ Complete | 16 | FIFO queue with unbonding |
| ValidatorRegistry | ✅ Complete | 20 | Validator tracking |
| **LiquidStakingCore** | ✅ **NEW** | 29 | Main entry point |
| **VaultManager** | ✅ **NEW** | 24 | 200k batch pooling |
| **RewardsManager** | ✅ **NEW** | 29 | Exchange rate updates |

**Total: 147 functions across 7 contracts**

### Testing

- **Unit Tests**: **56 tests passing** (expanded from 34)
- **CI**: GitHub Actions workflow for automated testing
- **Devnet**: Accessible at `https://next.devnet.aztec-labs.com`

## Quick Start

### Run Smoke Test

```bash
# Verify environment and run tests
./staking/aztec/scripts/smoke-test.sh
```

### Run Unit Tests

```bash
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 56 tests passed
```

### Compile a Contract

```bash
# aztec-nargo requires working directory under $HOME
cp -r staking/aztec/contracts/aztec-staking-pool ~/aztec-contracts
cd ~/aztec-contracts && ~/aztec-bin/nargo compile
```

## Key Metrics

| Metric | Value |
|--------|-------|
| Market Opportunity | $124M-$207M addressable |
| Break-even TVL | $2.25M (56M AZTEC) |
| Current staked on Aztec | $22.8M (570M AZTEC) |
| Competition | Olla (Kryha) - announced, not launched |
| Time to launch | 6 months |

## Documentation Index

### Strategic Planning

1. **[EXECUTIVE-SUMMARY.md](docs/EXECUTIVE-SUMMARY.md)** - Start here for executives/investors
2. **[ECONOMICS.md](docs/ECONOMICS.md)** - Source of truth for all numbers
3. **[ASSUMPTIONS.md](docs/ASSUMPTIONS.md)** - What we know vs. estimate
4. **[FUNDRAISING.md](docs/FUNDRAISING.md)** - Investor materials

### Technical Implementation

5. **[IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md)** - 6-month roadmap
6. **[TASKS.md](docs/TASKS.md)** - Assignable task breakdown
7. **[liquid-staking-analysis.md](docs/liquid-staking-analysis.md)** - Architecture deep-dive

### Development

8. **[AGENT_HANDOFF.md](contracts/AGENT_HANDOFF.md)** - Continue development
9. **[contracts/aztec-staking-pool/QUICKSTART.md](contracts/aztec-staking-pool/QUICKSTART.md)** - Setup guide

## Next Steps

### Phase 2 Complete! Ready for Integration Testing

1. **TASK-201**: Write Integration Test - Full Deposit Flow
2. **TASK-202**: Write Integration Test - Withdrawal Flow
3. **TASK-203**: Write Integration Test - Staking Batch Trigger

### For Local Testing

```bash
# Install Aztec tools (requires Docker)
bash -i <(curl -s install.aztec.network)
aztec-up

# Start local sandbox
aztec start --sandbox

# Compile contracts
cd staking/aztec/contracts/liquid-staking-core
aztec-nargo compile
```

See [docs/TASKS.md](docs/TASKS.md) for the complete task list.
See [PROGRESS.md](PROGRESS.md) for detailed development progress.

## External Resources

- [Aztec Network](https://aztec.network/)
- [Aztec Documentation](https://docs.aztec.network/)
- [Aztec Staking Dashboard](https://stake.aztec.network/)
- [Noir Documentation](https://noir-lang.org/docs/)
- [Devnet RPC](https://next.devnet.aztec-labs.com)

---

**Questions?** See [docs/TASKS.md](docs/TASKS.md) for contact information and task assignments.
