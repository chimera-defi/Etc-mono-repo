# Staking Research & Development

This folder contains research, analysis, and development work related to liquid staking protocols and infrastructure.

## Folder Structure

```
staking/
├── README.md                              # This file
├── aztec/                                 # Aztec liquid staking (consolidated)
│   ├── README.md                          # Aztec project index (START HERE)
│   ├── docs/                              # Research and planning documentation
│   │   ├── EXECUTIVE-SUMMARY.md           # 1-page strategic overview
│   │   ├── ECONOMICS.md                   # Source of truth for numbers
│   │   ├── ASSUMPTIONS.md                 # Assumptions + competitor tracker
│   │   ├── IMPLEMENTATION-PLAN.md         # 6-month build plan
│   │   ├── FUNDRAISING.md                 # Seed deck outline
│   │   ├── TASKS.md                       # Discrete task breakdown
│   │   └── liquid-staking-analysis.md     # Technical architecture reference
│   ├── contracts/                         # Noir smart contracts
│   │   ├── aztec-staking-pool/            # Base staking pool (760KB)
│   │   ├── staked-aztec-token/            # stAZTEC token (778KB)
│   │   ├── withdrawal-queue/              # Withdrawal queue (824KB)
│   │   ├── validator-registry/            # Validator tracking (838KB)
│   │   ├── staking-math-tests/            # Unit tests (34 tests)
│   │   └── AGENT_HANDOFF.md               # Development handoff notes
│   └── scripts/                           # Development scripts
│       ├── smoke-test.sh                  # Environment verification
│       ├── setup-env.sh                   # Environment setup
│       └── query-devnet.mjs               # Devnet query utility
└── research/                              # General staking research
    ├── liquid-staking-landscape-2025.md   # Market research
    └── OPPORTUNITIES.md                   # Priority-ranked opportunities
└── monad/                                 # Monad validator infra + liquid staking
    ├── README.md                          # Monad infra entrypoint
    ├── RUNBOOK.md                         # Ops runbook
    ├── DEPLOY_CHECKLIST.md                # Production checklist
    └── liquid/                            # Liquid staking skeleton
```

## Purpose

This research aims to identify opportunities in the liquid staking ecosystem across three key areas:

1. **Institutional Staking Infrastructure** - Enterprise-grade staking solutions for funds, ETFs, and traditional finance
2. **Retail/Degen Liquid Staking** - High-yield, user-friendly products for individual investors
3. **Emerging Chain Expansion** - First-mover advantages on new blockchains lacking liquid staking

## Key Research Documents

### [Aztec Liquid Staking](./aztec/README.md) (Consolidated)

Complete Aztec liquid staking project including research, contracts, and development infrastructure.

**Quick Links:**
- Start here: [aztec/README.md](./aztec/README.md)
- Executive summary: [aztec/docs/EXECUTIVE-SUMMARY.md](./aztec/docs/EXECUTIVE-SUMMARY.md)
- Source of truth for numbers: [aztec/docs/ECONOMICS.md](./aztec/docs/ECONOMICS.md)
- Continue development: [aztec/contracts/AGENT_HANDOFF.md](./aztec/contracts/AGENT_HANDOFF.md)

**Status:**
- 4 contracts compiled and verified (StakingPool, StakedAztecToken, WithdrawalQueue, ValidatorRegistry)
- 34 unit tests passing
- CI/CD pipeline active

### [Liquid Staking Landscape 2025](./research/liquid-staking-landscape-2025.md)

Comprehensive analysis of the current liquid staking ecosystem including:
- Major protocol comparisons (Lido, Rocket Pool, StakeWise, etc.)
- Liquid restaking landscape (EigenLayer, Etherfi, Renzo, etc.)
- Multi-chain analysis (Solana, Cosmos, etc.)
- Market trends and institutional adoption
- Competitive analysis matrix

### [Opportunities](./research/OPPORTUNITIES.md)

### [Monad Validator Infra](./monad/README.md)

Validator ops scripts, runbook, and deployment checklist for Monad.

Priority-ranked list of market opportunities with actionable next steps:
- **Tier 1:** Aztec liquid staking, Bitcoin staking, Institutional infrastructure
- **Tier 2:** Multi-chain aggregation, Berachain partnership, EigenLayer products
- **Tier 3:** Long-term exploratory opportunities

## Top Opportunities (TL;DR)

1. **Aztec Network** - Native staking live, liquid staking NOT available yet. Two teams building. URGENT first-mover opportunity.
2. **Bitcoin Liquid Staking** - Via Babylon protocol. Massive TAM, early stage.
3. **Institutional Infrastructure** - SEC clarity achieved (May 2025), institutions actively seeking staking solutions.

## Market Context

- **Total Market Size:** $66B+ locked in liquid staking
- **Ethereum Staking:** 29% of supply staked (~34M ETH)
- **Institutional Holdings:** 6M ETH (5%+ of circulating supply)
- **Regulatory Status:** Reported regulatory clarity (May 2025)

## Quick Start (Aztec)

```bash
# Run smoke test
./staking/aztec/scripts/smoke-test.sh

# Run unit tests
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
```

## Quick Links

- [Aztec Staking Dashboard](https://stake.aztec.network/)
- [Aztec Devnet](https://next.devnet.aztec-labs.com)
- [Aztec Documentation](https://docs.aztec.network/)
- [EigenLayer](https://www.eigenlayer.xyz/)
- [DefiLlama Liquid Staking Rankings](https://defillama.com/protocols/liquid-staking)

---

**Last Updated:** December 27, 2025
