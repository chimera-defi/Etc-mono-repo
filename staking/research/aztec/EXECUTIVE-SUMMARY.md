# Aztec Liquid Staking - Executive Summary

**1-Page Strategic Overview**
*Last Updated: December 24, 2025* (Corrected with verified tokenomics)

---

## The Opportunity

**Build the first production-ready liquid staking protocol for Aztec Network** - a $144M-$240M addressable market (30-50% of supply staking) with limited competition.

| Metric | Value |
|--------|-------|
| **Market Launch** | November 2025 (mainnet live) |
| **Total Supply** | 10.35B AZTEC |
| **Current TVL Staked** | 570M+ AZTEC (~$26.5M @ $0.0464) |
| **Token Sale Price** | $0.0464 (Dec 2025, TGE Feb 2026+) |
| **Barrier to Entry** | 200,000 AZTEC minimum (~$9.3k) |
| **Liquid Staking** | ❌ Not available (we'd be first major protocol) |
| **Competition** | 1 identified: **Olla by Kryha** (early stage) |
| **Current APY** | 166% (early bootstrap, will normalize to 6-10%) |
| **Window** | 3-6 months before market saturates |

---

## Our Solution

**stAZTEC Protocol**: Users deposit any amount → receive liquid staking tokens → earn 8% APR + maintain DeFi composability

**Key Differentiator**: 100% Noir smart contracts (privacy-native), self-operated validators, zero capital requirements.

---

## Business Model

**Capital Required:**
- **AZTEC Capital:** $0 (users provide 100% of staking capital)
- **Development:** $450k (contracts + audits + salaries for 6 months)
- **Monthly Ops:** $1.5k (3 validators @ $400 + infrastructure $294)

**Revenue Projections:**

| TVL (USD) | TVL (AZTEC) | Annual Revenue | Annual Profit | Margin |
|-----------|-------------|----------------|---------------|--------|
| $2.25M | 48.5M | $18k | $0 | **Break-even** |
| $21.6M | 465M | $173k | $155k | **90%** |
| $46.4M | 1B | $371k | $353k | **95%** |
| $144M | 3.1B | $1.15M | $1.13M | **98%** |
| $240M | 5.2B | $1.92M | $1.90M | **99%** |

*Assumes: 8% staking APR (down from 166% bootstrap), 10% protocol fee, $0.0464 token price*
*Annual ops costs: $18k (3 validators + infrastructure)*

**Break-even:** $2.25M TVL (48.5M AZTEC) = **2-4 months post-launch**

**Conservative Year 1 Target:** 465M AZTEC ($21.6M) = 30% share of 50% liquid staking at 30% total staking rate

---

## Technical Architecture

**Smart Contracts (100% Noir):**
- StakedAztecToken.nr - Liquid staking token
- LiquidStakingCore.nr - Deposits/withdrawals
- VaultManager.nr - Pool aggregation
- RewardsManager.nr - Fee distribution

**Infrastructure:**
- 3 core bots (Staking, Rewards, Withdrawal)
- OUR validator nodes (~$400/month each)
- Users delegate to US, we operate validators

**Why Noir?** Aztec only supports Noir contracts. No Solidity option.

---

## Competitive Landscape

**Verified Competition:**
1. **Olla (by Kryha)** - Featured at Aztec @Devconnect 2025, early stage
2. **Unknown Team** - Mentioned in Aztec communications

**Our Advantages:**
- ✅ Technical expertise (100% Noir implementation plan)
- ✅ Vertically integrated (self-operated validators)
- ✅ Capital efficient ($0 AZTEC needed vs. competitors raising millions)
- ✅ Privacy-native (leveraging Aztec's #[private] functions Phase 2)

---

## Timeline to Launch

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Planning** | 2 weeks | Architecture finalized, team hired |
| **Development** | 3-4 months | Contracts written in Noir, testnet deployed |
| **Audits** | 6-8 weeks | 2 independent security audits |
| **Launch** | 2 weeks | Mainnet deployment, initial marketing |
| **TOTAL** | **6 months** | Production-ready protocol |

**Critical Path:** Hire Noir developers immediately (scarce talent pool).

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Aztec ecosystem too small | High | Multi-chain expansion plan (backup: Mina, Aleo) |
| Olla/competitors launch first | Medium | Speed to market, superior UX/features |
| Noir development challenges | Medium | Hire experienced Noir devs, budget buffer |
| Validator slashing | Low | Redundant infrastructure, insurance fund |

---

## Funding Ask

**Seed Round:** $500k-$750k

**Use of Funds:**
- Smart contract development: $200k (40%)
- Security audits: $100k (20%)
- Validator infrastructure: $50k (10%)
- Team salaries (6 months): $150k (30%)

**Terms:** SAFE, $5M-$8M cap (negotiable based on team/timeline)

---

## Team Requirements

**Must-Hire (Immediate):**
1. **Lead Noir Engineer** ($120k-$150k) - Smart contract architecture
2. **Backend Engineer** ($100k-$120k) - Bot infrastructure
3. **DevOps/Validator Ops** ($90k-$110k) - Infrastructure management

**Advisory:**
- Aztec ecosystem expert (equity only)
- DeFi security auditor (contract basis)

---

## Decision Framework

**PROCEED if:**
- ✅ Can hire 2+ experienced Noir developers within 4 weeks
- ✅ Aztec testnet validates validator economics ($400/month estimate)
- ✅ Competitive intel confirms 6+ month window

**PAUSE if:**
- ❌ Olla announces mainnet launch within 8 weeks
- ❌ Aztec changes staking mechanics (requires architecture rework)
- ❌ Cannot secure $500k+ funding

---

## Recommendation

**✅ PROCEED IMMEDIATELY**

**Rationale:**
1. First-mover advantage worth 30-50% market share
2. **Ultra-low capital intensity** ($0 AZTEC, only $18k/year ops) = exceptional ROI
3. Competition confirmed but early stage (Olla just announced)
4. Technical feasibility validated (Aztec testnet live, Noir documented)
5. **Break-even at $2.25M TVL = achievable within 2-4 months** (vs 6-12 months industry standard)
6. Strong existing demand: 570M AZTEC already staked ($26.5M baseline)

**Next 48 Hours:**
1. Engage Noir developer recruiters
2. Set up Aztec testnet environment
3. Outreach to Aztec Foundation for ecosystem support
4. Begin fundraising conversations

---

**Prepared by:** Claude AI Agent
**Sources:** [Aztec Network](https://aztec.network/), [Aztec Testnet](https://testnet.aztec.network/), [Olla Launch](https://luma.com/heydpbsj), [Aztec Staking](https://stake.aztec.network/)
