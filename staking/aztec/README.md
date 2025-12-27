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
| Get the numbers | [docs/ECONOMICS.md](docs/ECONOMICS.md) |
| Validate assumptions | [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md) |
| Plan development | [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md) |
| Pick up a task | [docs/TASKS.md](docs/TASKS.md) |
| Continue contract development | [contracts/AGENT_HANDOFF.md](contracts/AGENT_HANDOFF.md) |
| Run smoke tests | [scripts/smoke-test.sh](scripts/smoke-test.sh) |
| **See gaps & next agent prompts** | **[GAP_ANALYSIS.md](GAP_ANALYSIS.md)** 🆕 |

## Directory Structure

```
staking/aztec/
├── README.md                   # This file - main index
├── docs/                       # Research and planning documentation
│   ├── EXECUTIVE-SUMMARY.md    # One-page strategic overview
│   ├── ASSUMPTIONS.md          # Assumptions registry + competitor tracker + validation log
│   ├── ECONOMICS.md            # Financial models (source of truth for numbers)
│   ├── IMPLEMENTATION-PLAN.md  # 6-month build roadmap
│   ├── FUNDRAISING.md          # Seed deck outline and pitch narrative
│   ├── TASKS.md                # Discrete task breakdown + agent prompts
│   └── liquid-staking-analysis.md  # Technical architecture reference
├── contracts/                  # Noir smart contracts
│   ├── aztec-staking-pool/     # Base staking pool (760KB, 19 functions)
│   ├── staked-aztec-token/     # stAZTEC token (778KB, 16 functions)
│   ├── withdrawal-queue/       # FIFO withdrawal queue (824KB, 19 functions)
│   ├── validator-registry/     # Validator tracking (838KB, 23 functions)
│   ├── staking-math-tests/     # Unit tests (34 tests)
│   └── AGENT_HANDOFF.md        # Development handoff notes
└── scripts/                    # Development and testing scripts
    ├── smoke-test.sh           # Environment verification
    ├── setup-env.sh            # Environment setup
    └── query-devnet.mjs        # Devnet query utility
```

## Current Status

### Contracts Implemented

| Contract | Status | Size | Functions |
|----------|--------|------|-----------|
| StakingPool | Compiled | 760KB | 19 |
| StakedAztecToken | Compiled | 778KB | 16 |
| WithdrawalQueue | Compiled | 824KB | 19 |
| ValidatorRegistry | Compiled | 838KB | 23 |
| **LiquidStakingCore** | TODO | - | - |
| **VaultManager** | TODO | - | - |
| **RewardsManager** | TODO | - | - |

### Testing

- **Unit Tests**: 34 tests passing (staking math)
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
# Expected: 34 tests passed
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

## Critical Gaps (Executive Summary)

A comprehensive gap analysis identified 15+ gaps. **See [GAP_ANALYSIS.md](GAP_ANALYSIS.md) for full details and 12 specialized agent prompts.**

| Category | Status | Blocker? |
|----------|--------|----------|
| Legal/Regulatory | 🔴 Missing | Yes - before fundraising |
| Security/Incident Response | 🔴 Missing | Yes - before launch |
| Smart Contracts | 🟡 50% (4/7) | Yes - technical blocker |
| Operations | 🔴 Missing | Yes - before launch |
| Frontend/UX | 🔴 Missing | Yes - before launch |
| Community/Marketing | 🟡 20% | No - can ramp up |

### Immediate Actions

1. **Start Legal (PROMPT-001)** - Entity formation, token classification
2. **Complete Contracts (PROMPT-008)** - LiquidStakingCore, VaultManager, RewardsManager
3. **Map Integrations (PROMPT-005)** - Identify Aztec DEXs and partners

## Next Technical Steps

1. **TASK-105**: Create LiquidStakingCore.nr skeleton
2. **TASK-106**: Implement deposit() function
3. **TASK-107**: Implement withdrawal request function

See [docs/TASKS.md](docs/TASKS.md) for the complete task list.

## External Resources

- [Aztec Network](https://aztec.network/)
- [Aztec Documentation](https://docs.aztec.network/)
- [Aztec Staking Dashboard](https://stake.aztec.network/)
- [Noir Documentation](https://noir-lang.org/docs/)
- [Devnet RPC](https://next.devnet.aztec-labs.com)

---

**Questions?** See [docs/TASKS.md](docs/TASKS.md) for contact information and task assignments.
