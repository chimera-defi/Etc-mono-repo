# Staking Research & Development

This folder contains research, analysis, and development work related to liquid staking protocols and infrastructure.

## Folder Structure

```
staking/
├── README.md                              # This file
├── AGENTS.md                              # Agent guidelines & workflow rules
├── aztec/                                 # Aztec liquid staking protocol
│   ├── README.md                          # Aztec project index (START HERE)
│   ├── PROGRESS.md                        # Current phase status
│   ├── HANDOFF.md                         # Latest agent handoff
│   ├── PARALLEL_WORK_HANDOFF.md           # Frontend & bot parallel work specs
│   ├── AGENT_INDEX.md                     # Quick-start matrix for agents
│   ├── docs/                              # Research, planning, and guides
│   │   ├── EXECUTIVE-SUMMARY.md           # 1-page strategic overview
│   │   ├── ECONOMICS.md                   # Source of truth for numbers
│   │   ├── ASSUMPTIONS.md                 # Assumptions + competitor tracker
│   │   ├── IMPLEMENTATION-PLAN.md         # 6-month build plan
│   │   ├── NOIR_GUIDE.md                  # Noir language patterns & migration
│   │   ├── FUNDRAISING.md                 # Seed deck outline
│   │   ├── TASKS.md                       # Discrete task breakdown
│   │   └── liquid-staking-analysis.md     # Historical architecture reference
│   ├── contracts/                         # Noir smart contracts
│   │   ├── liquid-staking-core/           # Main staking logic (deposit, withdraw, fees)
│   │   ├── staked-aztec-token/            # stAZTEC ERC20-like token
│   │   ├── withdrawal-queue/              # FIFO unbonding queue
│   │   └── staking-math-tests/            # Unit test suite (74 tests)
│   ├── scripts/                           # Development scripts
│   │   ├── smoke-test.sh                  # Environment verification
│   │   ├── setup-env.sh                   # Environment setup
│   │   ├── integration-test.sh            # Integration tests
│   │   └── query-devnet.mjs              # Devnet query utility
│   ├── frontend/                          # Next.js frontend scaffold
│   └── archive/                           # Superseded handoff documents
├── monad/                                 # Monad validator infra + liquid staking
│   ├── README.md                          # Monad project entrypoint
│   ├── infra/                             # Validator setup, ops, monitoring
│   │   ├── README.md                      # Scripts index (START HERE)
│   │   ├── SETUP.md                       # End-to-end host setup guide
│   │   ├── RUNBOOK.md                     # Operational runbook
│   │   ├── DEPLOY_CHECKLIST.md            # Production deployment checklist
│   │   ├── scripts/                       # 26+ operational scripts
│   │   ├── config/                        # Configuration templates
│   │   ├── systemd/                       # Systemd overrides
│   │   ├── monitoring/                    # Prometheus + Grafana + Loki stack
│   │   └── landing/                       # Static landing page
│   └── liquid/                            # Liquid staking MVP skeleton
│       ├── spec.md                        # MVP requirements
│       ├── ops.md                         # Operational responsibilities
│       └── interfaces.md                  # Integration points
└── research/                              # General staking research
    ├── OPPORTUNITIES.md                   # Priority-ranked opportunities
    ├── liquid-staking-landscape-2025.md   # Market research
    └── monad-validator-plan.md            # Monad strategy document
```

## Purpose

This research aims to identify opportunities in the liquid staking ecosystem across three key areas:

1. **Institutional Staking Infrastructure** - Enterprise-grade staking solutions for funds, ETFs, and traditional finance
2. **Retail/Degen Liquid Staking** - High-yield, user-friendly products for individual investors
3. **Emerging Chain Expansion** - First-mover advantages on new blockchains lacking liquid staking

## Key Research Documents

### [Aztec Liquid Staking](./aztec/README.md) - Phase 2 Complete

Privacy-focused liquid staking using Aztec Network and Noir smart contracts.

**Quick Links:**
- Start here: [aztec/README.md](./aztec/README.md)
- Executive summary: [aztec/docs/EXECUTIVE-SUMMARY.md](./aztec/docs/EXECUTIVE-SUMMARY.md)
- Source of truth for numbers: [aztec/docs/ECONOMICS.md](./aztec/docs/ECONOMICS.md)
- Current status: [aztec/PROGRESS.md](./aztec/PROGRESS.md)
- Continue development: [aztec/HANDOFF.md](./aztec/HANDOFF.md)

**Status:**
- 3 production contracts (LiquidStakingCore, StakedAztecToken, WithdrawalQueue)
- 74 unit tests passing
- Phase 3 (devnet deployment) starting

### [Monad Validator Infra](./monad/README.md) - Operational

Validator ops scripts, runbook, monitoring stack, and deployment checklist for Monad.

**Quick Links:**
- Start here: [monad/infra/README.md](./monad/infra/README.md)
- Setup guide: [monad/infra/SETUP.md](./monad/infra/SETUP.md)
- Runbook: [monad/infra/RUNBOOK.md](./monad/infra/RUNBOOK.md)

### [Liquid Staking Landscape 2025](./research/liquid-staking-landscape-2025.md)

Comprehensive analysis of the current liquid staking ecosystem including:
- Major protocol comparisons (Lido, Rocket Pool, StakeWise, etc.)
- Liquid restaking landscape (EigenLayer, Etherfi, Renzo, etc.)
- Multi-chain analysis (Solana, Cosmos, etc.)
- Market trends and institutional adoption
- Competitive analysis matrix

### [Opportunities](./research/OPPORTUNITIES.md)

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

**Last Updated:** February 2026
