# Staking Research & Development

This folder contains research, analysis, and development work related to liquid staking protocols and infrastructure.

## 📁 Folder Structure

```
staking/
├── README.md                          # This file
└── research/
    ├── liquid-staking-landscape-2025.md   # Comprehensive market research
    └── OPPORTUNITIES.md                    # Priority-ranked opportunities
    └── aztec/                              # Aztec liquid staking deep dive + build plan
        ├── README.md                       # Aztec research index (start here)
        ├── EXECUTIVE-SUMMARY.md            # 1-page overview
        ├── ECONOMICS.md                    # Source of truth for numbers + formulas
        ├── ASSUMPTIONS.md                  # Assumptions registry + validation plan
        ├── IMPLEMENTATION-PLAN.md          # 6-month build plan
        ├── FUNDRAISING.md                  # Seed deck outline + pitch narrative
        ├── TASKS.md                        # Discrete task breakdown
        └── liquid-staking-analysis.md      # Long-form technical analysis (reference)
```

## 🎯 Purpose

This research aims to identify opportunities in the liquid staking ecosystem across three key areas:

1. **Institutional Staking Infrastructure** - Enterprise-grade staking solutions for funds, ETFs, and traditional finance
2. **Retail/Degen Liquid Staking** - High-yield, user-friendly products for individual investors
3. **Emerging Chain Expansion** - First-mover advantages on new blockchains lacking liquid staking

## 📊 Key Research Documents

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

### Current review notes (what’s missing / next validation)
- We have strong directionality, but the highest-leverage gaps are **testnet validation** (unbonding, slashing, tx costs, validator requirements) and **distribution/liquidity planning** for day-1.
- The Aztec packet now keeps competitor tracking and validation logs **inline** to avoid doc sprawl:
  - `staking/research/aztec/ASSUMPTIONS.md` (assumptions + competitor tracker + validation log)
  - `staking/research/aztec/IMPLEMENTATION-PLAN.md` (includes integrations/liquidity plan inline)

### [Aztec Liquid Staking Packet](./research/aztec/README.md)
Deep-dive on building an Aztec-native liquid staking protocol (market, architecture, economics, plan).

- **If you only read one Aztec doc**: `./research/aztec/EXECUTIVE-SUMMARY.md`
- **If you need the numbers**: `./research/aztec/ECONOMICS.md` (source of truth)

## 🔥 Top Opportunities (TL;DR)

1. **Aztec Network** - Native staking live, liquid staking NOT available yet. Two teams building. URGENT first-mover opportunity.
2. **Bitcoin Liquid Staking** - Via Babylon protocol. Massive TAM, early stage.
3. **Institutional Infrastructure** - SEC clarity achieved (May 2025), institutions actively seeking staking solutions.

## 📈 Market Context

- **Total Market Size:** $66B+ locked in liquid staking
- **Ethereum Staking:** 29% of supply staked (~34M ETH)
- **Institutional Holdings:** 6M ETH (5%+ of circulating supply)
- **Regulatory Status:** Reported regulatory clarity (May 2025). Treat as *directional* until we add a primary citation to the specific SEC statement/guidance.

## 🚀 Next Steps

See [OPPORTUNITIES.md](./research/OPPORTUNITIES.md) for detailed action plan, but immediate priorities:

1. Aztec deep dive and team outreach
2. Babylon Bitcoin staking research
3. Institutional customer discovery interviews
4. Competitive protocol analysis

## 📅 Research Date

All research current as of **December 24, 2025** (see per-document “Last Updated” for details).

## 🔗 Quick Links

- [Aztec Staking Dashboard](https://stake.aztec.network/)
- [EigenLayer](https://www.eigenlayer.xyz/)
- [Lido Finance](https://lido.fi/)
- [Rocket Pool](https://rocketpool.net/)
- [DefiLlama Liquid Staking Rankings](https://defillama.com/protocols/liquid-staking)

---

For questions or updates to this research, please contact the staking research team.
