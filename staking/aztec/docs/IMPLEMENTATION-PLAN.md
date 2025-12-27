# Implementation Plan
**Design → Build → Test → Deploy**

*6-month critical path to production launch*
*Last Updated: December 24, 2025*

---

## Overview

**Goal:** Production-ready liquid staking protocol on Aztec mainnet
**Timeline:** 24 weeks (6 months)
**Team:** 3-5 engineers + 1 PM
**Budget:** $500k-$750k

---

## Phase 1: Foundation (Weeks 1-2)

### Team Assembly
- [ ] **Hire Lead Noir Engineer** - Smart contract architecture lead
  - Requirements: Noir experience OR Rust + ZK background
  - Source: Aztec Discord, ZK talent pools, Rust communities
  - Compensation: $120k-$150k + equity

- [ ] **Hire Backend Engineer** - Bot infrastructure
  - Requirements: TypeScript/Node.js, distributed systems
  - Source: Standard tech recruiting
  - Compensation: $100k-$120k + equity

- [ ] **Hire DevOps Engineer** - Validator operations
  - Requirements: Kubernetes, cloud infrastructure, monitoring
  - Source: DevOps communities, cloud-native talent pools
  - Compensation: $90k-$110k + equity

### Technical Setup
- [ ] Provision Aztec testnet environment
  - Deploy test validator node
  - Set up development Aztec sandbox locally
  - Configure RPC endpoints and indexers

- [ ] Local sandbox smoke test (must pass before serious development)
  - Compile a minimal Noir contract
  - Deploy to local sandbox
  - Call one function successfully
  - Record evidence in `ASSUMPTIONS.md` → Validation Log (commands, versions, outputs)

- [ ] Development infrastructure
  - GitHub org + repos (contracts, bots, frontend)
  - CI/CD pipelines (GitHub Actions)
  - Staging environments (testnet, devnet)

### Research & Validation
- [ ] Validate key assumptions on testnet (see ASSUMPTIONS.md)
  - Validator costs (run for 2 weeks, measure resources)
  - Gas costs (deploy test contracts, measure tx costs)
  - Staking mechanics (stake 200k testnet AZTEC, track)

- [ ] Competitive analysis deep-dive
  - Contact Olla team (gauge timeline)
  - Monitor Aztec Discord/Telegram for other teams
  - Document competitor features/roadmaps

**Deliverables:**
- Team hired and onboarded
- Testnet environment operational
- Assumptions validated or updated
- Detailed technical specification (next phase input)

---

## Phase 2: Smart Contract Development (Weeks 3-14)

### Architecture Finalization (Week 3)
- [ ] Design review: 6 core contracts
  1. StakedAztecToken.nr
  2. LiquidStakingCore.nr
  3. VaultManager.nr
  4. RewardsManager.nr
  5. WithdrawalQueue.nr
  6. ValidatorRegistry.nr

- [ ] Define contract interfaces (ABIs)
- [ ] Security considerations document
- [ ] Gas optimization strategy

### Contract Implementation (Weeks 4-10)

**Sprint 1 (Weeks 4-5): Token Contract**
- [ ] StakedAztecToken.nr
  - Public balances (Map<Address, u128>)
  - Exchange rate storage (basis points)
  - Mint/burn functions with access control
  - Transfer logic
- [ ] Unit tests (nargo test)
- [ ] Testnet deployment

**Sprint 2 (Weeks 6-7): Core Logic**
- [ ] LiquidStakingCore.nr
  - Deposit function (mint stAZTEC)
  - Withdrawal request (burn stAZTEC, queue)
  - Claim withdrawal (after unbonding)
- [ ] VaultManager.nr
  - Pool aggregation to 200k batches
  - Validator selection (round-robin)
  - Stake execution
- [ ] Integration tests
- [ ] Testnet deployment

**Sprint 3 (Weeks 8-9): Rewards & Queue**
- [ ] RewardsManager.nr
  - Claim rewards from validators
  - Calculate exchange rate
  - Protocol fee distribution
- [ ] WithdrawalQueue.nr
  - FIFO queue implementation
  - Unbonding period tracking
  - Batch processing
- [ ] Integration tests
- [ ] Testnet deployment

**Sprint 4 (Week 10): Registry & Integration**
- [ ] ValidatorRegistry.nr
  - Track OUR validator addresses
  - Performance monitoring integration
  - Emergency pause mechanisms
- [ ] Full system integration tests
- [ ] End-to-end user flows on testnet

### Security Hardening (Weeks 11-14)
- [ ] Internal security review
  - Reentrancy protection
  - Access control verification
  - Integer overflow checks
  - Edge case testing

- [ ] Fuzz testing
  - Foundry-style invariant tests
  - Property-based testing
  - Stress testing (10k+ users simulation)

- [ ] Code freeze & audit prep
  - Documentation for auditors
  - Known issues list
  - Mitigation strategies

**Deliverables:**
- 6 Noir contracts fully implemented
- 100+ unit tests, 50+ integration tests
- Testnet deployment with public demo
- Security review complete, ready for audit

---

## Phase 3: Bot Infrastructure (Weeks 10-16)

*Parallel with contract security hardening*

### Bot #1: Staking Keeper (Weeks 10-11)
- [ ] Monitor LiquidStakingCore deposit pool
- [ ] Trigger batching at 200k threshold
- [ ] Execute stake to validator
- [ ] Track activation status
- [ ] Error handling & retry logic

### Bot #2: Rewards Keeper (Weeks 12-13)
- [ ] Query validator rewards (Aztec RPC)
- [ ] Claim rewards on-chain
- [ ] Calculate new exchange rate
- [ ] Update stAZTEC token contract
- [ ] Distribute protocol fees

### Bot #3: Withdrawal Keeper (Weeks 14-15)
- [ ] Monitor withdrawal queue
- [ ] Check unbonding completion
- [ ] Unstake from validators if needed
- [ ] Fulfill withdrawal requests
- [ ] Manage liquidity buffer

### Bot #4: Monitoring (Week 16)
- [ ] Validator health checks (uptime, sync)
- [ ] Alert on slashing events
- [ ] Gas price monitoring
- [ ] Anomaly detection (TVL drops, rate spikes)
- [ ] PagerDuty/Telegram integrations

### Infrastructure
- [ ] Kubernetes deployment configs
- [ ] Redis queue setup (BullMQ)
- [ ] Prometheus + Grafana dashboards
- [ ] Log aggregation (Sentry)
- [ ] Secrets management (Vault)

**Deliverables:**
- 4 bots operational on testnet
- 99.9% uptime SLA demonstrated
- Monitoring dashboards live
- Infrastructure-as-code (Terraform/Helm)

---

## Phase 4: Security Audits (Weeks 15-22)

### Audit Firm Selection (Week 15)
- [ ] RFPs to 3-5 audit firms
  - Trail of Bits (ZK expertise)
  - OpenZeppelin (smart contract focus)
  - ConsenSys Diligence
  - Zellic (Noir experience)

- [ ] Select 2 firms (budget: $50k each)
- [ ] Schedule audit start dates

### Audit #1 (Weeks 16-19)
- [ ] Provide codebase + documentation
- [ ] Weekly check-ins with auditors
- [ ] Address critical/high issues immediately
- [ ] Retest fixes

### Audit #2 (Weeks 19-22)
- [ ] Second firm reviews (overlap with first)
- [ ] Cross-reference findings
- [ ] Address all medium+ issues
- [ ] Final report generation

### Bug Bounty Prep (Week 22)
- [ ] Set up Immunefi program ($50k-$100k pool)
- [ ] Scope definition (contracts only, not bots)
- [ ] Payout structure

**Deliverables:**
- 2 completed audit reports
- All critical/high issues resolved
- Bug bounty live
- Public audit report publication

---

## Phase 5: Mainnet Preparation (Weeks 20-24)

*Parallel with audits*

### Validator Infrastructure (Week 20)
- [ ] Provision production validator nodes
  - 3 nodes across different regions (redundancy)
  - Monitoring + alerting configured
  - Backup/disaster recovery tested

- [ ] Stake 200k AZTEC to OUR validators
  - Initial capital from treasury or partner
  - Activation period monitoring
  - Slashing insurance in place

### Frontend Development (Weeks 20-22)
- [ ] Simple deposit/withdraw UI
  - Wallet/PXE connection (Aztec-compatible wallet tooling; confirm supported options)
  - Deposit flow + transaction confirmation
  - Withdrawal request + claim
  - Portfolio view (stAZTEC balance, exchange rate)

- [ ] Analytics dashboard
  - TVL tracking
  - APR calculation
  - User metrics

### Integrations & Liquidity (Weeks 18-24)

**Goal:** ensure stAZTEC is meaningfully liquid and usable on day 1.

- [ ] Identify/confirm Aztec-native swap venue(s) for canonical stAZTEC/AZTEC pool
- [ ] Draft liquidity bootstrap plan (incentives + LP sourcing + risk policy)
- [ ] Pre-launch partner outreach (DEX + wallet + ecosystem listing)
- [ ] Prepare launch-week comms and integration checklist

#### Distribution plan (inline, canonical)

**Non-negotiables (“liquid” definition):**
- A credible swap venue with usable depth for stAZTEC↔AZTEC
- A canonical pricing reference (often “the primary pool” early on)
- A clear redemption story (withdraw queue + buffer policy documented)
- A distribution channel (Aztec community + at least one partner surface)

**Day‑1 integration targets (categories):**
1) **DEX / swap liquidity (required)**
2) **Lending / collateral (high leverage, optional day 1)**
3) **Wallet/PXE surfaces (distribution)**
4) **Foundation/ecosystem support (accelerator)**

**Liquidity bootstrap plan (initial):**
- Canonical pool: **stAZTEC / AZTEC**
- Optional second pool: only if there’s a credible Aztec-native “bridge asset” demand
- Liquidity sources: protocol-owned liquidity (later), launch partners, community LP incentives
- Incentives: prefer points/grants-style early; treat token incentives as a later/legal-sensitive lever

**Sequencing:**
- Pre-launch: shortlist venue(s) + confirm pool mechanics + token metadata expectations
- Launch week: ship canonical pool + publish liquidity/redemption docs + comms
- Weeks 2–6: add second integration surface (lending or wallet) + iterate incentives if depth is insufficient

### Contract Deployment (Week 23)
- [ ] Mainnet deployment ceremony
  - Multi-sig deployment (3-of-5)
  - Verify contracts on explorer
  - Transfer ownership to governance

- [ ] Initial parameter configuration
  - Protocol fee: 10%
  - Unbonding period: 7 days
  - Liquidity buffer target: 5%

### Launch Preparation (Week 24)
- [ ] Marketing materials
  - Landing page (stAZTEC.io or similar)
  - Documentation site (GitBook)
  - Tutorial videos
  - Social media campaign

- [ ] Community building
  - Aztec Discord announcements
  - Twitter launch thread
  - Partnership announcements (if any)

- [ ] Operations readiness
  - 24/7 on-call rotation
  - Incident response playbook
  - Emergency pause procedures

**Deliverables:**
- Mainnet contracts deployed
- 3 validators operational
- Frontend live (stAZTEC.io)
- Marketing campaign launched

---

## Phase 6: Launch & Iteration (Week 24+)

### Soft Launch (Week 24)
- [ ] Invite-only beta (Aztec community)
- [ ] TVL cap: $1M-$5M (gradual ramp)
- [ ] Monitor for 2 weeks (no major issues)

### Public Launch (Week 26)
- [ ] Remove TVL cap
- [ ] Public marketing push
- [ ] Partnerships (DeFi protocols, wallets)

### Post-Launch Monitoring (Weeks 26-30)
- [ ] Daily metrics reviews (TVL, APR, fees)
- [ ] Weekly retros (team, operations)
- [ ] Monthly assumption validation (see ASSUMPTIONS.md)

### Phase 2 Planning (Month 4+)
- [ ] Privacy features (#[private] deposits/withdrawals)
- [ ] Express withdrawal (instant, fee-based)
- [ ] Governance token (if needed)
- [ ] Additional validator nodes (scale with TVL)

---

## Risk Mitigation

### Technical Risks

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Noir bugs/limitations | Medium | Prototype early (Week 3), pivot if needed |
| Smart contract vulnerability | Low | 2 audits, bug bounty, gradual TVL ramp |
| Validator slashing | Low | Redundant infrastructure, insurance fund |
| Bot downtime | Medium | HA architecture, auto-failover, monitoring |

### Execution Risks

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Can't hire Noir devs | High | Start recruiting Week 1, accept Rust+ZK |
| Audits delayed | Medium | Book audits early (Week 15), buffer in timeline |
| Olla launches first | Medium | Speed to market, differentiate on features |
| Aztec ecosystem slow growth | Medium | Multi-chain expansion plan |

---

## Success Metrics

### Week 12 (Contract Development Complete)
- 🎯 6 contracts deployed to testnet
- 🎯 100+ tests passing
- 🎯 Public demo functional

### Week 22 (Audits Complete)
- 🎯 2 audit reports, all critical issues resolved
- 🎯 Bug bounty live
- 🎯 Bots operational on testnet

### Week 24 (Mainnet Launch)
- 🎯 Contracts deployed to mainnet
- 🎯 3 validators operational
- 🎯 Frontend live

### Month 3 Post-Launch
- 🎯 $10M+ TVL
- 🎯 500+ unique depositors
- 🎯 99.9% validator uptime
- 🎯 No critical security incidents

### Month 6 Post-Launch
- 🎯 $50M+ TVL (comfortably funds a small team; protocol-only ops break-even is far lower—see ECONOMICS.md)
- 🎯 2,000+ unique depositors
- 🎯 10%+ market share
- 🎯 Revenue positive

---

## Testnet Validation Checklist

**Before starting contract development (Week 3):**

- [ ] Deploy test validator node
  - Sync with Aztec testnet
  - Measure: CPU, RAM, disk, bandwidth usage
  - Run for 2 weeks minimum
  - Document actual costs vs $400/month estimate

- [ ] Stake testnet AZTEC
  - Acquire 200k testnet AZTEC (faucet or request)
  - Stake to test validator
  - Monitor activation process
  - Track rewards accrual
  - Measure unbonding period

- [ ] Deploy test contracts
  - Simple token contract (baseline)
  - Measure gas costs for:
    - Deployment
    - Minting
    - Transfers
    - Complex operations (looping, storage)
  - Compare to $0.20-$0.50 estimate

- [ ] Validate RPC reliability
  - Query validator metrics
  - Test event subscriptions
  - Measure API latency
  - Check data availability (historical queries)

**Decision Point:** If costs >2x estimates OR major technical blockers found, PAUSE and reassess.

---

## Tools & Resources

### Development
- **Noir:** https://noir-lang.org/docs/
- **Aztec.nr:** https://docs.aztec.network/developers/docs/guides/smart_contracts
- **Aztec Sandbox:** https://docs.aztec.network/developers/docs/getting_started/sandbox
- **Testnet:** https://testnet.aztec.network/
- **Internal Noir Guide:** `staking/aztec/contracts/NOIR_GUIDE.md`

### Infrastructure
- **Kubernetes:** EKS (AWS) or GKE (Google Cloud)
- **Monitoring:** Prometheus + Grafana Cloud
- **Alerting:** PagerDuty
- **Error Tracking:** Sentry
- **Queue:** BullMQ (Redis)

### Security
- **Audit Firms:** Trail of Bits, OpenZeppelin, Zellic
- **Bug Bounty:** Immunefi
- **Multi-sig:** Gnosis Safe (if available on Aztec)

---

## Next Steps (This Week)

1. **Start recruiting** Noir engineers (post to Aztec Discord, ZK talent pools)
2. **Provision testnet** environment (set up Aztec sandbox locally)
3. **Deploy test validator** (measure actual costs for 2 weeks)
4. **Reach out to Aztec Foundation** (ecosystem support, potential grant)
5. **Begin fundraising** (angels, seed VCs familiar with DeFi/ZK)

---

**Owner:** Project Lead / CEO
**Last Review:** December 22, 2025
**Next Review:** Week 12 (contract development checkpoint)

**Key Dependencies:**
- Noir developer hiring (Week 1-2) - CRITICAL PATH
- Testnet validation (Week 1-3) - GO/NO-GO decision
- Audit firm booking (Week 15) - Long lead time
- Aztec network stability (ongoing) - External dependency
