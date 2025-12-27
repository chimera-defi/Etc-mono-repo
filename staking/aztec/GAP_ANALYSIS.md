# Aztec Liquid Staking - Gap Analysis & Handoff Document

**Prepared by:** Executive Review (CEO/COO/CMO/Director roles)
**Date:** December 27, 2025
**Status:** Comprehensive gap analysis for next phase execution

---

## Executive Summary

The Aztec liquid staking project has strong documentation and a solid technical foundation, but has significant gaps in **legal/regulatory**, **operations**, **go-to-market**, and **product/UX** that must be addressed before mainnet launch. This document identifies 50+ gaps organized by priority and provides specialized agent prompts for parallel execution.

### Current State

| Area | Status | Completeness |
|------|--------|--------------|
| **Economics & Research** | Strong | 85% |
| **Technical Architecture** | Strong | 80% |
| **Smart Contracts** | Partial | 50% (4/7 contracts) |
| **Unit Tests** | Good | 70% (34 tests) |
| **Legal/Regulatory** | Missing | 5% |
| **Operations** | Missing | 10% |
| **Go-to-Market** | Weak | 20% |
| **Product/UX** | Missing | 5% |
| **Security Planning** | Partial | 40% |

---

## Gap Categories

### CRITICAL GAPS (Must Fix Before Fundraising)

#### GAP-001: Legal Entity & Regulatory Strategy
**Priority:** P0 - Blocker
**Impact:** Cannot accept investment without entity
**Current:** Brief mention of "Delaware C-Corp" in FUNDRAISING.md
**Missing:**
- [ ] Entity structure decision (C-Corp vs. Foundation vs. DAO LLC)
- [ ] Jurisdiction analysis (Delaware, Wyoming, Cayman, BVI)
- [ ] Token legal classification (is stAZTEC a security?)
- [ ] OFAC/AML compliance framework for privacy chain
- [ ] Terms of Service draft
- [ ] Privacy Policy draft
- [ ] Securities law opinion (needed for institutional investors)

**Agent Prompt:** See PROMPT-001

---

#### GAP-002: Security Incident Response
**Priority:** P0 - Critical for launch
**Impact:** Protocol breach without playbook = existential risk
**Current:** High-level risk table in ASSUMPTIONS.md
**Missing:**
- [ ] Incident response playbook (detection → triage → response → recovery)
- [ ] Emergency pause procedures (who, how, when)
- [ ] Communication templates (users, partners, regulators)
- [ ] War room setup and escalation paths
- [ ] Post-incident review process
- [ ] Insurance requirements and coverage

**Agent Prompt:** See PROMPT-002

---

#### GAP-003: Key Management & Multi-sig Strategy
**Priority:** P0 - Security critical
**Impact:** Lost keys = lost protocol
**Current:** Brief mention of "3-of-5 multi-sig" in IMPLEMENTATION-PLAN.md
**Missing:**
- [ ] Key generation ceremony process
- [ ] Multi-sig signer selection criteria
- [ ] Backup key procedures
- [ ] Hardware wallet requirements
- [ ] Key rotation schedule
- [ ] Social recovery mechanism

**Agent Prompt:** See PROMPT-003

---

### HIGH PRIORITY GAPS (Must Fix Before Launch)

#### GAP-004: Frontend Specification & UX
**Priority:** P1 - Required for launch
**Impact:** No frontend = no users
**Current:** High-level mention in IMPLEMENTATION-PLAN.md
**Missing:**
- [ ] User journey maps (deposit, withdraw, claim)
- [ ] UI/UX wireframes
- [ ] Design system specification
- [ ] Mobile responsiveness requirements
- [ ] Accessibility requirements (WCAG)
- [ ] Error state designs
- [ ] Analytics/tracking plan (events, funnels)

**Agent Prompt:** See PROMPT-004

---

#### GAP-005: Integration Partnership Strategy
**Priority:** P1 - Required for liquidity
**Impact:** No integrations = illiquid stAZTEC
**Current:** Generic "DEX integration" mention
**Missing:**
- [ ] Specific Aztec DEX identification (which exist?)
- [ ] Partnership outreach playbook
- [ ] Integration technical requirements
- [ ] Co-marketing agreements template
- [ ] Listing requirements and process
- [ ] Liquidity mining program design

**Agent Prompt:** See PROMPT-005

---

#### GAP-006: Community Building & Marketing Strategy
**Priority:** P1 - Required for adoption
**Impact:** No community = no TVL
**Current:** Brief Twitter thread template in FUNDRAISING.md
**Missing:**
- [ ] Community building roadmap (Discord, Telegram, Twitter)
- [ ] Content calendar
- [ ] Influencer/KOL strategy
- [ ] Ambassador program design
- [ ] Educational content plan
- [ ] Launch event planning
- [ ] Ongoing engagement strategy

**Agent Prompt:** See PROMPT-006

---

#### GAP-007: Operations Runbook
**Priority:** P1 - Required for 24/7 operation
**Impact:** Downtime = slashing, user losses
**Current:** High-level bot descriptions
**Missing:**
- [ ] Standard Operating Procedures (SOPs) for each bot
- [ ] On-call rotation schedule and escalation
- [ ] Runbook for common issues
- [ ] Monitoring alert thresholds
- [ ] Performance baselines and SLOs
- [ ] Capacity planning

**Agent Prompt:** See PROMPT-007

---

#### GAP-008: Complete Smart Contracts
**Priority:** P1 - Technical blocker
**Impact:** Incomplete protocol
**Current:** 4/7 contracts complete
**Missing:**
- [ ] LiquidStakingCore.nr (TASK-105, 106, 107)
- [ ] VaultManager.nr (TASK-108)
- [ ] RewardsManager.nr (TASK-109)
- [ ] Integration tests for full flow
- [ ] Cross-contract call testing

**Agent Prompt:** See PROMPT-008

---

### MEDIUM PRIORITY GAPS (Should Fix Before Launch)

#### GAP-009: Insurance Fund Mechanics
**Priority:** P2 - Risk mitigation
**Impact:** Slashing events could drain protocol
**Current:** Mentioned but not designed
**Missing:**
- [ ] Fund sizing model (% of TVL target)
- [ ] Fund accumulation mechanism
- [ ] Payout trigger conditions
- [ ] Governance over fund usage
- [ ] External insurance options (Nexus Mutual, etc.)

**Agent Prompt:** See PROMPT-009

---

#### GAP-010: Governance Framework
**Priority:** P2 - Long-term sustainability
**Impact:** No path to decentralization
**Current:** Not addressed
**Missing:**
- [ ] Governance token decision (yes/no/later)
- [ ] Voting mechanism design
- [ ] Proposal process
- [ ] Time-lock requirements
- [ ] Multi-sig to DAO transition plan

**Agent Prompt:** See PROMPT-010

---

#### GAP-011: Risk Quantification Model
**Priority:** P2 - Investor credibility
**Impact:** Risks listed but not quantified
**Current:** Qualitative risk tables
**Missing:**
- [ ] Probability × Impact matrix
- [ ] Monte Carlo simulation for TVL scenarios
- [ ] Sensitivity analysis for all variables
- [ ] Black swan scenario planning
- [ ] Stress test documentation

**Agent Prompt:** See PROMPT-011

---

#### GAP-012: API & SDK Documentation
**Priority:** P2 - Developer adoption
**Impact:** Hard for others to integrate
**Current:** None
**Missing:**
- [ ] REST/RPC API specification
- [ ] TypeScript SDK design
- [ ] Integration examples
- [ ] Webhook design for events
- [ ] Rate limiting and authentication

**Agent Prompt:** See PROMPT-012

---

### LOW PRIORITY GAPS (Can Address Post-Launch)

#### GAP-013: Multi-chain Expansion Plan
**Priority:** P3 - Future growth
**Current:** Mentioned as backup (Mina, Aleo)
**Missing:**
- [ ] Chain evaluation criteria
- [ ] Technical adaptation requirements
- [ ] Market sizing for each chain
- [ ] Go/no-go decision framework

---

#### GAP-014: Advanced Features (Phase 2)
**Priority:** P3 - Differentiation
**Current:** Listed but not designed
**Missing:**
- [ ] Express withdrawal mechanics
- [ ] Private deposit/withdrawal architecture
- [ ] Governance token economics
- [ ] Restaking integration design

---

#### GAP-015: Data & Analytics Platform
**Priority:** P3 - Business intelligence
**Current:** Prometheus metrics mentioned
**Missing:**
- [ ] Data warehouse architecture
- [ ] Business metrics dashboard
- [ ] Competitive tracking automation
- [ ] User behavior analytics

---

## Unknown Unknowns (Risk Register)

These are potential blind spots that require active research:

### Technical Unknowns

| Unknown | Why It Matters | Research Task |
|---------|---------------|---------------|
| Slashing on delegated stake | Who bears the loss? Users or protocol? | Test on devnet, read Aztec specs |
| Actual unbonding period | 7 days assumed, not verified | Stake/unstake on testnet |
| Contract size limits | Our contracts are 750-850KB each | Verify Aztec deployment limits |
| MEV on Aztec | Sequencer ordering could affect us | Research Aztec MEV landscape |
| Cross-contract call costs | Affects bot economics | Measure on testnet |

### Market Unknowns

| Unknown | Why It Matters | Research Task |
|---------|---------------|---------------|
| Olla launch timeline | Our main competitor | Monitor Discord, GitHub, Twitter |
| Aztec Foundation LST plans | Could be competing or partnering | Direct outreach to Foundation |
| Post-TGE token dynamics | Price volatility affects TVL | Model multiple scenarios |
| DeFi ecosystem maturity | Need integrations to be useful | Map Aztec DeFi landscape |

### Regulatory Unknowns

| Unknown | Why It Matters | Research Task |
|---------|---------------|---------------|
| Privacy chain LST classification | Could be deemed security | Get legal opinion |
| OFAC compliance for privacy txs | Could block US users | Consult compliance expert |
| International regulations | Limits geographic expansion | Research EU, UK, Singapore |

---

## Parallelizable Agent Prompts

The following prompts are designed to be run in parallel by specialized agents. Each is self-contained with clear deliverables.

---

## PROMPT-001: Legal & Regulatory Strategy Agent

```
You are a legal strategy consultant for a crypto startup. Create a comprehensive legal and regulatory framework for an Aztec Network liquid staking protocol (stAZTEC).

**Context:**
- Aztec is a privacy-focused Ethereum L2
- We're building liquid staking (users deposit AZTEC, receive stAZTEC)
- Target: $500k-$750k seed raise
- Launch timeline: 6 months
- Geographic focus: Initially US-friendly if possible

**Your Deliverables:**

1. **docs/LEGAL_STRUCTURE.md** - Entity structure recommendation
   - Compare: Delaware C-Corp, Wyoming DAO LLC, Cayman Foundation, BVI
   - Tax implications for each
   - Investor preference analysis
   - Recommendation with rationale

2. **docs/TOKEN_LEGAL_ANALYSIS.md** - stAZTEC classification
   - Apply Howey test analysis
   - Compare to stETH, rETH precedents
   - Privacy chain considerations
   - Risk mitigation strategies

3. **docs/COMPLIANCE_FRAMEWORK.md** - Regulatory compliance
   - OFAC/AML requirements for privacy chain
   - KYC/KYB considerations
   - Geographic restrictions needed
   - Ongoing compliance procedures

4. **docs/LEGAL_TEMPLATES/** - Draft documents
   - Terms of Service outline
   - Privacy Policy outline
   - Risk disclosures outline

**Key Questions to Address:**
- Can US retail users participate?
- What disclosures are required for institutional investors?
- How do privacy features affect regulatory classification?
- What licenses might be needed?

**Output Format:** Create markdown files with clear sections, citations to relevant law/guidance where applicable.

**Time Estimate:** 8-12 hours
```

---

## PROMPT-002: Security Incident Response Agent

```
You are a security operations expert. Create a comprehensive incident response framework for a liquid staking protocol on Aztec Network.

**Context:**
- 4+ smart contracts in Noir
- 3-4 keeper bots (TypeScript)
- 3 validator nodes
- Expected TVL: $10M-$100M
- Small team (3-5 people initially)

**Your Deliverables:**

1. **docs/INCIDENT_RESPONSE_PLAYBOOK.md** - Full playbook
   - Incident classification (P0-P4 severity)
   - Detection → Triage → Response → Recovery flow
   - Role assignments (Incident Commander, Comms Lead, Tech Lead)
   - Communication templates (internal, users, partners, regulators)
   - Post-incident review process

2. **docs/EMERGENCY_PROCEDURES.md** - Emergency actions
   - Contract pause procedure (who, how, when)
   - Validator shutdown procedure
   - Fund recovery procedure
   - Key compromise response

3. **docs/WAR_ROOM_SETUP.md** - Crisis management
   - War room checklist
   - Escalation matrix
   - External contacts (auditors, legal, insurers)
   - Communication channels (backup if primary compromised)

4. **scripts/emergency-pause.sh** - Emergency script template

**Scenarios to Address:**
- Smart contract exploit (funds at risk)
- Validator slashing event
- Private key compromise
- Exchange rate manipulation
- Prolonged service outage

**Output Format:** Markdown files with clear procedures, checklists, and decision trees.

**Time Estimate:** 6-8 hours
```

---

## PROMPT-003: Key Management Agent

```
You are a cryptographic security expert. Design a comprehensive key management strategy for an Aztec liquid staking protocol.

**Context:**
- Multi-sig needed for contract upgrades, parameter changes
- Keeper bot private keys for automated transactions
- Admin keys for emergency actions
- Small team initially (3-5 people)

**Your Deliverables:**

1. **docs/KEY_MANAGEMENT_STRATEGY.md** - Overall strategy
   - Key types and purposes
   - Storage requirements (hot vs cold)
   - Access control matrix
   - Rotation schedule

2. **docs/MULTISIG_SETUP.md** - Multi-sig design
   - Threshold recommendation (e.g., 3-of-5)
   - Signer selection criteria
   - Geographic distribution requirements
   - Backup signer process

3. **docs/KEY_CEREMONY.md** - Key generation ceremony
   - Pre-ceremony checklist
   - Ceremony procedure (air-gapped generation)
   - Verification steps
   - Documentation requirements

4. **docs/KEY_RECOVERY.md** - Recovery procedures
   - Social recovery mechanism
   - Backup key activation
   - Lost key response
   - Compromised key response

**Constraints:**
- Must work with Aztec/Noir contracts
- Must support hardware wallets
- Must be auditable
- Budget-conscious (startup phase)

**Output Format:** Detailed markdown with diagrams where helpful.

**Time Estimate:** 4-6 hours
```

---

## PROMPT-004: Frontend & UX Agent

```
You are a product designer specializing in DeFi applications. Create a comprehensive frontend specification for an Aztec liquid staking protocol (stAZTEC).

**Context:**
- Core flows: Deposit AZTEC → Receive stAZTEC, Withdraw stAZTEC → Queue → Claim AZTEC
- Target users: AZTEC holders who want liquidity while staking
- Aztec is privacy-focused (unique UX considerations)
- Must work with Aztec-compatible wallets/PXE

**Your Deliverables:**

1. **docs/USER_JOURNEYS.md** - User journey maps
   - New user onboarding flow
   - Deposit flow (step by step)
   - Withdrawal request flow
   - Claim flow (after unbonding)
   - Portfolio view flow
   - Error scenarios and recovery

2. **docs/UI_WIREFRAMES.md** - Wireframe descriptions
   - Landing/marketing page
   - App dashboard
   - Deposit modal
   - Withdrawal modal
   - Transaction history
   - Settings/preferences

3. **docs/DESIGN_SYSTEM.md** - Design specifications
   - Color palette (light/dark mode)
   - Typography scale
   - Component library requirements
   - Responsive breakpoints
   - Accessibility requirements (WCAG 2.1 AA)

4. **docs/ANALYTICS_PLAN.md** - Tracking strategy
   - Key metrics to track
   - Event taxonomy
   - Funnel definitions
   - A/B testing strategy

**Key UX Challenges:**
- Explaining unbonding period to users
- Showing exchange rate appreciation over time
- Handling transaction confirmation in privacy context
- Clear error messaging

**Output Format:** Detailed markdown with ASCII diagrams for wireframes.

**Time Estimate:** 8-10 hours
```

---

## PROMPT-005: Integration & Partnership Agent

```
You are a business development strategist for DeFi protocols. Create an integration and partnership strategy for an Aztec liquid staking protocol.

**Context:**
- stAZTEC needs liquidity to be useful
- Must identify Aztec-native DeFi protocols
- Need partnerships before launch
- Competitor (Olla by Kryha) also building

**Your Deliverables:**

1. **docs/AZTEC_DEFI_MAP.md** - Ecosystem mapping
   - List all known Aztec-native protocols (DEXs, lending, etc.)
   - Status of each (live, testnet, announced)
   - Integration priority ranking
   - Contact information where available

2. **docs/PARTNERSHIP_PLAYBOOK.md** - Outreach strategy
   - Ideal partner profile
   - Value proposition for each partner type
   - Outreach templates (email, DM)
   - Negotiation guidance
   - Term sheet templates

3. **docs/INTEGRATION_REQUIREMENTS.md** - Technical requirements
   - What partners need from us (ABIs, docs, support)
   - What we need from partners
   - Integration testing requirements
   - Maintenance expectations

4. **docs/LIQUIDITY_MINING_DESIGN.md** - Incentive program
   - Program structure options
   - Token economics (if using incentives)
   - Timeline and phases
   - Success metrics

**Key Questions:**
- Which Aztec DEXs exist and are they live?
- Can we get foundation support/grants?
- What's the typical integration timeline?
- How do competitors approach partnerships?

**Output Format:** Markdown with tables, templates, and actionable lists.

**Time Estimate:** 6-8 hours
```

---

## PROMPT-006: Community & Marketing Agent

```
You are a crypto marketing strategist. Create a comprehensive community building and marketing strategy for an Aztec liquid staking protocol launching in 6 months.

**Context:**
- Seed-stage startup ($500k-$750k raise)
- Target TVL: $10M+ in first 3 months
- Competitor: Olla (Kryha) also building
- Aztec community: 16,700+ token sale participants

**Your Deliverables:**

1. **docs/COMMUNITY_STRATEGY.md** - Community building plan
   - Platform strategy (Discord, Telegram, Twitter, Farcaster)
   - Community roles and moderation plan
   - Engagement tactics
   - Community metrics to track
   - Growth timeline

2. **docs/CONTENT_CALENDAR.md** - 3-month content plan
   - Pre-launch content themes
   - Launch week content
   - Post-launch content
   - Content types (educational, updates, memes, AMAs)
   - Distribution channels

3. **docs/INFLUENCER_STRATEGY.md** - KOL/Influencer approach
   - Target influencer profiles
   - Outreach approach
   - Compensation structures
   - Risk management (FTC compliance)

4. **docs/LAUNCH_PLAN.md** - Launch event plan
   - Pre-announcement teasers
   - Launch day activities
   - First week engagement
   - Press/media outreach
   - Partnership announcements

5. **docs/AMBASSADOR_PROGRAM.md** - Ambassador design
   - Ambassador tiers
   - Responsibilities
   - Rewards structure
   - Application process

**Constraints:**
- Bootstrap budget (minimal paid marketing initially)
- Must differentiate from Olla
- Privacy-native positioning is key

**Output Format:** Detailed markdown with timelines and actionable items.

**Time Estimate:** 8-10 hours
```

---

## PROMPT-007: Operations Agent

```
You are a DevOps/SRE expert. Create comprehensive operations documentation for a liquid staking protocol with 4 bots and 3 validators.

**Context:**
- Infrastructure: Kubernetes on AWS/GCP
- 4 bots: Staking Keeper, Rewards Keeper, Withdrawal Keeper, Monitoring
- 3 validator nodes across regions
- Small team (1-2 DevOps initially)
- Target uptime: 99.9%

**Your Deliverables:**

1. **docs/RUNBOOK.md** - Operational runbook
   - Common issues and resolutions
   - Restart procedures for each component
   - Log locations and analysis
   - Metric interpretation guide

2. **docs/MONITORING_SPEC.md** - Monitoring specification
   - Metrics to collect (with thresholds)
   - Alert definitions (P1/P2/P3)
   - Dashboard specifications
   - SLO definitions

3. **docs/ONCALL_GUIDE.md** - On-call procedures
   - Rotation schedule template
   - Escalation matrix
   - Response time SLAs
   - Handoff procedures

4. **docs/CAPACITY_PLANNING.md** - Capacity planning
   - Resource requirements by TVL tier
   - Scaling triggers
   - Cost projections
   - Growth planning

5. **scripts/health-check.sh** - Health check script template

**Components to Cover:**
- Staking Keeper bot
- Rewards Keeper bot
- Withdrawal Keeper bot
- Monitoring bot
- Validator nodes (3)
- Redis queue
- Kubernetes cluster

**Output Format:** Detailed markdown with code samples where applicable.

**Time Estimate:** 8-10 hours
```

---

## PROMPT-008: Smart Contract Completion Agent

```
Continue development on the Aztec liquid staking pool smart contracts.

**Current State:**
- Environment is set up with nargo (1.0.0-beta.17) and aztec-nargo (1.0.0-beta.11+aztec)
- 4 contracts compiled and verified:
  - StakingPool (base contract): 760KB, 19 functions
  - StakedAztecToken: 778KB, 16 functions
  - WithdrawalQueue: 824KB, 19 functions
  - ValidatorRegistry: 838KB, 23 functions
- 34 staking math unit tests passing
- Devnet accessible at https://next.devnet.aztec-labs.com

**Your Tasks:**
1. First, run verification:
   - cd staking/aztec/contracts/staking-math-tests && ~/.nargo/bin/nargo test
   - Expected: 34 tests passed

2. Implement TASK-105: LiquidStakingCore.nr skeleton
   - Main entry point that integrates all other contracts
   - Storage for: total_deposited, pending_pool, contract references
   - Admin functions for setup

3. Implement TASK-106: deposit() function
   - Accept AZTEC amount
   - Calculate stAZTEC to mint using exchange rate
   - Call StakedAztecToken.mint()
   - Update accounting
   - Emit events for bot monitoring

4. Implement TASK-107: request_withdrawal() function
   - Accept stAZTEC amount
   - Calculate AZTEC amount using exchange rate
   - Call StakedAztecToken.burn()
   - Call WithdrawalQueue.add_request()
   - Return request ID

5. Write integration tests for the full flow

**Key Files:**
- Contracts: staking/aztec/contracts/*/src/main.nr
- Tests: staking/aztec/contracts/staking-math-tests/src/main.nr
- Tasks: staking/aztec/docs/TASKS.md

**Important Noir Notes:**
- Noir doesn't support || operator - use | for boolean OR
- Noir doesn't support early return - restructure logic
- No non-ASCII characters in comments
- aztec-nargo requires working directory under $HOME

**Deliverables:**
- contracts/liquid-staking-core/src/main.nr (new contract)
- Updated staking-math-tests with integration tests
- Updated TASKS.md with completion status
- Updated AGENT_HANDOFF.md

**Time Estimate:** 12-16 hours
```

---

## PROMPT-009: Insurance Fund Agent

```
You are a DeFi risk management expert. Design an insurance fund mechanism for an Aztec liquid staking protocol.

**Context:**
- Protocol takes 10% of staking rewards as fee
- Validators can be slashed for misbehavior
- Expected TVL: $10M-$100M
- No external insurance products for Aztec yet

**Your Deliverables:**

1. **docs/INSURANCE_FUND_DESIGN.md** - Fund design
   - Fund sizing model (% of TVL or absolute)
   - Accumulation mechanism (% of fees)
   - Triggering conditions (what counts as claimable event)
   - Payout procedures
   - Fund governance

2. **docs/SLASHING_SCENARIOS.md** - Scenario analysis
   - Aztec slashing mechanics (research current specs)
   - Who bears loss (validator vs delegators)
   - Historical slashing data (if available)
   - Worst-case scenarios

3. **docs/EXTERNAL_INSURANCE.md** - External options
   - Nexus Mutual coverage analysis
   - Other DeFi insurance options
   - Cost-benefit analysis
   - Integration requirements

**Key Questions:**
- What % of TVL should insurance fund target?
- How fast should it accumulate?
- What events trigger payouts?
- Who decides on payouts?

**Output Format:** Markdown with models and calculations.

**Time Estimate:** 4-6 hours
```

---

## PROMPT-010: Governance Agent

```
You are a DAO governance expert. Design a governance framework for an Aztec liquid staking protocol.

**Context:**
- Currently: Admin-controlled (seed stage)
- Goal: Progressive decentralization
- May or may not have governance token
- Aztec is privacy-focused (governance implications)

**Your Deliverables:**

1. **docs/GOVERNANCE_FRAMEWORK.md** - Overall framework
   - Governance token decision framework (yes/no/when)
   - If yes: token distribution, vesting, voting weight
   - If no: alternative governance (multi-sig evolution)
   - Parameter governance (what can be changed)

2. **docs/PROPOSAL_PROCESS.md** - Proposal system
   - Proposal types (routine vs major)
   - Submission requirements
   - Discussion period
   - Voting period
   - Execution delay (timelock)

3. **docs/DECENTRALIZATION_ROADMAP.md** - Transition plan
   - Phase 1: Admin control (0-6 months)
   - Phase 2: Multi-sig expansion (6-12 months)
   - Phase 3: Token governance (12-18 months)
   - Phase 4: Full DAO (18+ months)

**Key Questions:**
- Should stAZTEC holders have governance rights?
- How to handle privacy in governance voting?
- What parameters should be governable?

**Output Format:** Markdown with decision trees and timelines.

**Time Estimate:** 4-6 hours
```

---

## PROMPT-011: Risk Quantification Agent

```
You are a quantitative risk analyst. Create a risk quantification model for an Aztec liquid staking protocol.

**Context:**
- Qualitative risks documented in ASSUMPTIONS.md
- Need quantified probability × impact analysis
- Investors want to see risk modeling
- Current estimates in ECONOMICS.md are deterministic

**Your Deliverables:**

1. **docs/RISK_QUANTIFICATION.md** - Risk matrix
   - Probability × Impact matrix for all identified risks
   - Likelihood estimates (with methodology)
   - Impact quantification ($, TVL %, reputation)
   - Risk ranking

2. **docs/SENSITIVITY_ANALYSIS.md** - Variable sensitivity
   - Token price sensitivity
   - APY sensitivity
   - Validator cost sensitivity
   - Market share sensitivity
   - Combined sensitivity scenarios

3. **docs/SCENARIO_ANALYSIS.md** - Scenario modeling
   - Base case (current estimates)
   - Bull case (best outcomes)
   - Bear case (worst outcomes)
   - Black swan scenarios

4. **models/monte_carlo.md** - Monte Carlo framework
   - Input distributions
   - Simulation methodology
   - Output interpretation
   - Key findings

**Data Sources:**
- ECONOMICS.md for baseline assumptions
- ASSUMPTIONS.md for risk registry
- liquid-staking-landscape-2025.md for market data

**Output Format:** Markdown with tables, formulas, and methodology explanations.

**Time Estimate:** 6-8 hours
```

---

## PROMPT-012: SDK & API Agent

```
You are a developer experience (DX) expert. Design the API and SDK for an Aztec liquid staking protocol.

**Context:**
- Contracts are in Noir (Aztec-specific)
- Need TypeScript SDK for frontend and integrations
- Need REST API for querying state
- Bots already use Aztec RPC

**Your Deliverables:**

1. **docs/API_SPECIFICATION.md** - REST API design
   - Endpoints for querying state
   - Response formats (JSON)
   - Authentication requirements
   - Rate limiting
   - Versioning strategy

2. **docs/SDK_DESIGN.md** - TypeScript SDK design
   - Class structure
   - Method signatures
   - Error handling
   - Example usage

3. **docs/INTEGRATION_GUIDE.md** - Integration guide
   - Quick start (5 minutes)
   - Deposit integration
   - Withdrawal integration
   - Querying positions
   - Event subscriptions

4. **docs/WEBHOOK_DESIGN.md** - Webhook system
   - Event types
   - Payload formats
   - Delivery guarantees
   - Retry logic

**Constraints:**
- Must work with Aztec's unique architecture
- Must handle privacy considerations
- Should be familiar to Ethereum developers

**Output Format:** Markdown with code examples.

**Time Estimate:** 6-8 hours
```

---

## Execution Recommendations

### Immediate (This Week)

1. **Legal Agent (PROMPT-001)** - Start immediately, longest lead time
2. **Contract Completion Agent (PROMPT-008)** - Technical blocker
3. **Integration Agent (PROMPT-005)** - Need ecosystem mapping ASAP

### Next Week

4. **Security Agent (PROMPT-002)** - Required before any deployment
5. **Key Management Agent (PROMPT-003)** - Required for testnet deployment
6. **Operations Agent (PROMPT-007)** - Required for bot deployment

### Before Fundraising

7. **Risk Quantification Agent (PROMPT-011)** - Investors will ask
8. **Frontend Agent (PROMPT-004)** - Need wireframes for pitch

### Before Launch

9. **Community Agent (PROMPT-006)** - 3 months before launch
10. **Insurance Agent (PROMPT-009)** - Required for user confidence
11. **Governance Agent (PROMPT-010)** - Document the path
12. **SDK Agent (PROMPT-012)** - Required for integrations

---

## Verification Checklist

Before considering the project ready for mainnet:

### Legal
- [ ] Entity formed
- [ ] Token legal opinion obtained
- [ ] Terms of Service finalized
- [ ] Privacy Policy finalized
- [ ] Compliance framework documented

### Security
- [ ] 2 independent audits completed
- [ ] Bug bounty live ($50k+ pool)
- [ ] Incident response playbook tested
- [ ] Key management ceremony completed
- [ ] Multi-sig operational

### Technical
- [ ] All 7 contracts deployed to testnet
- [ ] 100+ unit tests passing
- [ ] Integration tests for full flow
- [ ] All 4 bots operational on testnet
- [ ] 2 weeks of testnet operation without issues

### Operations
- [ ] Monitoring dashboards live
- [ ] Alert thresholds configured
- [ ] On-call rotation established
- [ ] Runbooks documented
- [ ] Disaster recovery tested

### Business
- [ ] At least 1 DEX partnership confirmed
- [ ] Community channels established
- [ ] Launch marketing prepared
- [ ] Support processes documented

---

**Document Version:** 1.0
**Last Updated:** December 27, 2025
**Next Review:** After agent prompt completion
