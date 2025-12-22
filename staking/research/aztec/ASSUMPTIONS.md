# Assumptions Registry

**Critical assumptions underlying business model and technical architecture.**
*Last Updated: December 22, 2025*

---

## Status Legend

- ✅ **VERIFIED** - Confirmed via official documentation or testnet
- ⚠️ **ESTIMATED** - Industry benchmark, requires validation
- ❌ **UNVERIFIED** - Assumption, needs research/testing
- 🔄 **IN PROGRESS** - Currently being validated

---

## Network & Protocol Assumptions

| Assumption | Current Value | Status | Impact if Wrong | Verification Plan |
|------------|---------------|--------|-----------------|-------------------|
| **Minimum stake** | 200,000 AZTEC | ✅ VERIFIED | Critical - changes pool mechanics | [Aztec Staking Dashboard](https://stake.aztec.network/) |
| **Staking APR** | 8% | ⚠️ ESTIMATED | High - affects revenue projections | Monitor first 3 months post-launch |
| **Unbonding period** | 7 days | ❌ UNVERIFIED | Medium - affects UX | Testnet validation required |
| **Slashing penalty** | 5-10% | ❌ UNVERIFIED | Medium - affects insurance fund sizing | Review Aztec protocol specs |
| **Epoch duration** | ~6 minutes | ⚠️ ESTIMATED | Low - affects bot timing | Testnet measurement |
| **Gas costs per tx** | $0.20-$0.50 | ⚠️ ESTIMATED | Medium - affects profitability | Testnet validation required |

---

## Infrastructure Cost Assumptions

| Item | Monthly Cost | Status | Source | Validation |
|------|-------------|--------|--------|------------|
| **Validator hardware** | $400/node | ⚠️ ESTIMATED | Ethereum analogue (8GB RAM, 4 vCPU) | Deploy testnet validator |
| **Kubernetes cluster** | $150 | ✅ VERIFIED | [AWS EKS Pricing](https://aws.amazon.com/eks/pricing/) | Actual vendor quote |
| **Redis (managed)** | $50 | ✅ VERIFIED | [AWS ElastiCache](https://aws.amazon.com/elasticache/pricing/) | Actual vendor quote |
| **Grafana Cloud** | $49 | ✅ VERIFIED | [Grafana Pricing](https://grafana.com/pricing/) | Public pricing page |
| **PagerDuty** | $19 | ✅ VERIFIED | [PagerDuty Pricing](https://www.pagerduty.com/pricing/) | Public pricing page |
| **Sentry** | $26 | ✅ VERIFIED | [Sentry Pricing](https://sentry.io/pricing/) | Public pricing page |
| **Total monthly ops** | $409 | ⚠️ ESTIMATED | Excludes validator costs | Testnet validation |

**Critical Dependency:** Validator cost could range $200-$800/month. Break-even calculations sensitive to this assumption.

---

## Competitive Intelligence

| Assumption | Status | Source | Verification Date | Notes |
|------------|--------|--------|-------------------|-------|
| **Olla by Kryha building liquid staking** | ✅ VERIFIED | [Aztec @Devconnect 2025](https://luma.com/heydpbsj) | Dec 22, 2025 | Featured at official event |
| **Multiple teams building fractional staking** | ✅ VERIFIED | [Aztec TGE Blog](https://aztec.network/blog/aztec-tge-next-steps) | Dec 22, 2025 | Confirmed in official communications |
| **No production protocol live yet** | ✅ VERIFIED | Manual research | Dec 22, 2025 | Checked Olla (pre-launch), staking dashboard |
| **6-12 month window before saturation** | ⚠️ ESTIMATED | Team analysis | Dec 22, 2025 | Depends on Olla timeline |

**Competitor Research Summary:**
- **Olla (Kryha):** Announced at Devconnect 2025, no mainnet launch date public
- **Team 2:** Referenced in Aztec communications, identity unknown
- **Our edge:** Technical readiness, self-operated validators, capital efficiency

---

## Market & Revenue Assumptions

| Assumption | Value | Status | Impact if Wrong | Mitigation |
|------------|-------|--------|-----------------|------------|
| **Aztec market cap** | $1.5B-$3B | ⚠️ ESTIMATED | High - determines TAM | Conservative projections |
| **Staking participation rate** | 40-60% | ⚠️ ESTIMATED | High - determines TAM | Use 40% (conservative) |
| **Our market share** | 30-50% | ⚠️ ESTIMATED | Critical - revenue projections | Target 30% (conservative) |
| **Protocol fee acceptable** | 10% | ⚠️ ESTIMATED | High - could price us out | Competitor analysis (Lido 10%) |
| **User preference: liquid vs native** | 70% prefer liquid | ⚠️ ESTIMATED | High - determines demand | Ethereum: 33% choose liquid staking |

**TAM Calculation:**
```
Conservative: $1.5B × 40% staked × 30% share = $180M TVL
Optimistic: $3B × 60% staked × 50% share = $900M TVL
```

**Revenue at Conservative TAM ($180M TVL):**
```
$180M × 8% APR × 10% fee = $1.44M annual revenue
Monthly: $120k
Profit after $56k costs: $64k/month (53% margin)
```

---

## Technical Assumptions

| Assumption | Status | Validation Method | Risk |
|------------|--------|-------------------|------|
| **Noir can handle complex staking logic** | ✅ VERIFIED | [Token tutorial](https://docs.aztec.network/developers/docs/tutorials/contract_tutorials/token_contract) demonstrates similar patterns | Low |
| **Aztec testnet available for validation** | ✅ VERIFIED | [Public testnet live](https://testnet.aztec.network/) since May 2025 | Low |
| **#[public] functions sufficient for MVP** | ✅ VERIFIED | Token contracts use public functions | Low |
| **Bot infrastructure can achieve <1% downtime** | ⚠️ ESTIMATED | Standard DevOps practices | Medium |
| **Smart contract audits available** | ✅ VERIFIED | Multiple firms audit Noir (Trail of Bits, OpenZeppelin) | Low |
| **3 bots sufficient (not 6)** | ⚠️ ESTIMATED | Based on self-operated validator model | Medium |

---

## Risks Introduced by Wrong Assumptions

### High-Impact Scenarios

**1. Validator Costs Higher Than Expected ($800/month vs $400)**
- Impact: Monthly costs increase to $656
- Break-even TVL: $98M (up from $62M)
- Mitigation: Start with 1-2 validators, scale gradually

**2. Staking APR Lower Than Expected (5% vs 8%)**
- Impact: Revenue reduced by 37.5%
- At $100M TVL: $500k annual (vs $800k)
- Mitigation: Lower protocol fee to 8% to stay competitive

**3. Olla Launches in 2 Months**
- Impact: Lose first-mover advantage
- Market share: 20-30% instead of 30-50%
- Mitigation: Speed to market, superior UX, privacy features

**4. Aztec Ecosystem Smaller Than Expected**
- Impact: TVL growth slower, break-even delayed 6-12 months
- Mitigation: Multi-chain expansion (Mina, Aleo as backup)

---

## Validation Roadmap

### Week 1-2 (Immediate)
- [ ] Deploy test validator on Aztec testnet
- [ ] Measure actual validator resource requirements
- [ ] Monitor testnet for 2 weeks to measure APR
- [ ] Test transaction gas costs on testnet

### Month 1
- [ ] Research Olla roadmap (community channels, team outreach)
- [ ] Validate unbonding period via testnet staking
- [ ] Confirm slashing mechanics in Aztec docs
- [ ] Interview Aztec validators about operational costs

### Month 2-3
- [ ] Benchmark bot infrastructure costs on testnet
- [ ] Validate epoch duration and timing
- [ ] Stress test 200k batch pooling mechanics
- [ ] Survey potential users about protocol fee tolerance

### Ongoing
- [ ] Weekly Aztec ecosystem monitoring (new competitors)
- [ ] Monthly assumption review (update this registry)
- [ ] Quarterly competitive analysis (Olla progress)

---

## Decision Triggers

**STOP if:**
- ❌ Validator costs >$1,000/month (economics break)
- ❌ Staking APR <4% (insufficient demand)
- ❌ Olla launches + captures >60% market in first 3 months
- ❌ Aztec changes minimum stake to <50,000 AZTEC (eliminates need)

**ACCELERATE if:**
- ✅ Validator costs <$300/month (better margins)
- ✅ Staking APR >10% (higher demand)
- ✅ Olla delays beyond 6 months
- ✅ Aztec Foundation offers grant/partnership

---

**Next Review:** January 15, 2026 (or upon major assumption invalidation)

**Owner:** Technical Lead / CEO

**Sources:**
- [Aztec Documentation](https://docs.aztec.network/)
- [Aztec Testnet](https://testnet.aztec.network/)
- [Olla Announcement](https://luma.com/heydpbsj)
- [AWS Pricing](https://aws.amazon.com/pricing/)
- [Ethereum Liquid Staking Market Data](https://dune.com/hildobby/eth2-staking)
