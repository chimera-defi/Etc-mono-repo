# Gap-Based Tasks & Parallelizable Agent Prompts

**Generated:** December 30, 2025  
**Source:** `docs/STRATEGIC-GAP-ANALYSIS.md` gap inventory  
**Purpose:** Actionable tasks and copy-paste prompts for parallel execution

---

## Quick Reference

| Priority | Tasks | Agents | Can Start |
|----------|-------|--------|-----------|
| **P0 (Critical)** | TASK-GAP-001 through GAP-004 | 4 agents | ✅ Immediately |
| **P1 (High)** | TASK-GAP-005 through GAP-013 | 6 agents | ✅ After contracts ✅ |
| **P2 (Medium)** | TASK-GAP-014 through GAP-020 | 4 agents | ✅ Can start now |
| **P3 (Low)** | TASK-GAP-021+ | 3 agents | ✅ Post-launch |

**Parallelization Map:**
```
Week 1 (All Parallel):
├── Agent LEGAL → TASK-GAP-004
├── Agent VALIDATION → TASK-GAP-003
├── Agent BD → TASK-GAP-014
└── Agent MARKETING → TASK-GAP-015

Week 2-3 (After Contracts ✅):
├── Agent BOTS → TASK-GAP-008, GAP-009, GAP-010 (parallel)
├── Agent FRONTEND → TASK-GAP-013
├── Agent INTEGRATION → TASK-GAP-007
└── Agent SECURITY → TASK-GAP-011
```

---

## P0 CRITICAL PATH TASKS (Start Immediately)

### TASK-GAP-002: Team Hiring & Recruitment

**Status:** 🔴 Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 2-4 weeks (ongoing)  
**Dependencies:** None  
**Blocks:** Everything

**Context:** Cannot execute plan without team. Need 3-5 people: 2 Noir engineers, 1 backend (bots), 1 frontend, 1 DevOps.

**Deliverables:**
- [ ] Job descriptions for all roles
- [ ] Posting strategy (where to post, how to reach candidates)
- [ ] Interview process defined
- [ ] At least 2 candidates in pipeline per role
- [ ] First hire completed (target: Week 2)

**Acceptance Criteria:**
- Job descriptions posted on relevant channels
- Interview process documented
- At least 5 candidates contacted per role
- First hire made within 2 weeks

**Verification:**
```bash
test -f /workspace/staking/aztec/docs/JOB_DESCRIPTIONS.md && echo "✅ Job descriptions exist" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/INTERVIEW_PROCESS.md && echo "✅ Interview process exists" || echo "❌ Missing"
```

**Agent Prompt:** See PROMPT-AGENT-HIRING below

---

### TASK-GAP-003: Assumption Validation & Testnet Research

**Status:** 🔴 Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 2-3 weeks (includes 2-week monitoring)  
**Dependencies:** None  
**Blocks:** Business model decisions, ECONOMICS.md updates

**Context:** Critical assumptions unvalidated. Need to verify: unbonding period, validator costs, gas costs, slashing mechanics, epoch duration.

**Deliverables:**
- [ ] Unbonding period measured (stake → unstake → claim on testnet)
- [ ] Validator costs tracked (2 weeks of actual usage)
- [ ] Gas costs measured (100+ transactions)
- [ ] Slashing mechanics researched (Aztec docs + testnet)
- [ ] Epoch duration observed (testnet monitoring)
- [ ] ASSUMPTIONS.md Validation Log updated with all findings
- [ ] ECONOMICS.md updated with validated numbers

**Acceptance Criteria:**
- Each assumption has ✅ VERIFIED or ❌ UNVERIFIED status with evidence
- Cost spreadsheet created with actual vs estimated
- All measurements repeatable (commands documented)
- ECONOMICS.md reflects validated assumptions

**Verification:**
```bash
# Check ASSUMPTIONS.md updated
grep -q "Validation Log" /workspace/staking/aztec/docs/ASSUMPTIONS.md && echo "✅ Validation log exists" || echo "❌ Missing"
grep -q "✅\|❌\|⚠️" /workspace/staking/aztec/docs/ASSUMPTIONS.md && echo "✅ Status markers present" || echo "❌ Missing"

# Check evidence files
test -f /workspace/staking/aztec/docs/validation/gas-costs.csv && echo "✅ Gas costs recorded" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/validation/unbonding-test.md && echo "✅ Unbonding test documented" || echo "❌ Missing"
```

**Agent Prompt:** See PROMPT-AGENT-VALIDATION below

---

### TASK-GAP-004: Legal Entity Formation & Regulatory Framework

**Status:** 🔴 Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 3-6 weeks  
**Dependencies:** None  
**Blocks:** Fundraising (GAP-002), Hiring (GAP-002)

**Context:** Cannot raise funds or hire without legal entity. Need entity structure decision, formation, and regulatory compliance framework.

**Deliverables:**
- [ ] Entity structure recommendation (Delaware C-Corp vs Cayman vs Swiss)
- [ ] Entity formation checklist and timeline
- [ ] Token legal classification analysis (Howey test)
- [ ] Compliance framework (OFAC/AML for privacy chain)
- [ ] Terms of Service draft
- [ ] Privacy Policy draft
- [ ] Legal counsel engagement

**Acceptance Criteria:**
- Entity structure decision made and documented
- Formation process started (filing submitted or scheduled)
- Token classification analysis complete
- Compliance framework addresses privacy chain specifics
- Legal counsel engaged

**Verification:**
```bash
test -f /workspace/staking/aztec/docs/LEGAL_STRUCTURE.md && echo "✅ Legal structure doc exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/TOKEN_LEGAL_ANALYSIS.md && echo "✅ Token analysis exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/COMPLIANCE_FRAMEWORK.md && echo "✅ Compliance framework exists" || echo "❌ Missing"
grep -q "Recommendation:" /workspace/staking/aztec/docs/LEGAL_STRUCTURE.md && echo "✅ Decision made" || echo "❌ No decision"
```

**Agent Prompt:** See PROMPT-AGENT-LEGAL below

---

## P1 HIGH PRIORITY TASKS (Start After Contracts ✅)

### TASK-GAP-007: Integration Tests

**Status:** 🔴 Not Started  
**Priority:** P1 - High  
**Estimated Time:** 2-3 weeks  
**Dependencies:** Contracts ✅ (complete)  
**Blocks:** Security audit (GAP-011), Mainnet deployment

**Context:** Unit tests exist (64 passing), but no end-to-end integration tests. Need to test full flow: deposit → mint → stake → rewards → withdraw → claim.

**Deliverables:**
- [ ] Integration test suite (50+ tests)
- [ ] Full flow test (deposit → stake → rewards → withdraw → claim)
- [ ] Cross-contract call tests
- [ ] Edge case tests (large amounts, rapid deposits, etc.)
- [ ] Test documentation and CI integration

**Acceptance Criteria:**
- 50+ integration tests passing
- Full flow test passes end-to-end
- Tests run in CI
- Test coverage documented

**Verification:**
```bash
cd /workspace/staking/aztec/contracts/integration-tests
test -d . && echo "✅ Integration tests dir exists" || echo "❌ Missing"
# When tests exist:
# ~/.nargo/bin/nargo test
# Expected: 50+ tests passed
```

**Agent Prompt:** See PROMPT-AGENT-INTEGRATION below

---

### TASK-GAP-008: Staking Keeper Bot

**Status:** 🔴 Not Started  
**Priority:** P1 - High  
**Estimated Time:** 1-2 weeks  
**Dependencies:** Contracts ✅ (complete)  
**Blocks:** Testnet deployment

**Context:** Deposits accumulate but don't automatically stake. Need bot to watch for deposits, trigger batching at 200k threshold, execute stakes to validators.

**Deliverables:**
- [ ] `bots/staking-keeper/` directory with full implementation
- [ ] Event watcher for deposits
- [ ] Batch threshold logic (200k AZTEC)
- [ ] Validator selection (round-robin)
- [ ] Error handling and retries
- [ ] Prometheus metrics
- [ ] Kubernetes deployment manifest
- [ ] Tests (80%+ coverage)

**Acceptance Criteria:**
- Bot watches for deposits successfully
- Triggers batching at threshold
- Executes stakes to validators
- Handles errors gracefully
- Tests pass
- Deploys to Kubernetes

**Verification:**
```bash
test -d /workspace/staking/aztec/bots/staking-keeper && echo "✅ Bot dir exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/bots/staking-keeper/src/index.ts && echo "✅ Bot code exists" || echo "❌ Missing"
cd /workspace/staking/aztec/bots/staking-keeper && npm test && echo "✅ Tests pass" || echo "❌ Tests fail"
```

**Agent Prompt:** See PROMPT-AGENT-BOTS below (Staking Keeper section)

---

### TASK-GAP-009: Rewards Keeper Bot

**Status:** 🔴 Not Started  
**Priority:** P1 - High  
**Estimated Time:** 1-2 weeks  
**Dependencies:** Contracts ✅ (complete)  
**Blocks:** Testnet deployment

**Context:** Rewards accumulate but aren't claimed or distributed. Need bot to claim rewards from validators, update exchange rate, distribute protocol fees.

**Deliverables:**
- [ ] `bots/rewards-keeper/` directory with full implementation
- [ ] Scheduled job (daily or configurable interval)
- [ ] Reward claiming logic
- [ ] Exchange rate update logic
- [ ] Fee distribution (50% insurance, 50% treasury)
- [ ] Prometheus metrics
- [ ] Kubernetes deployment manifest
- [ ] Tests (80%+ coverage)

**Acceptance Criteria:**
- Bot claims rewards successfully
- Exchange rate updates correctly
- Fees distributed as specified
- Tests pass
- Deploys to Kubernetes

**Verification:**
```bash
test -d /workspace/staking/aztec/bots/rewards-keeper && echo "✅ Bot dir exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/bots/rewards-keeper/src/index.ts && echo "✅ Bot code exists" || echo "❌ Missing"
cd /workspace/staking/aztec/bots/rewards-keeper && npm test && echo "✅ Tests pass" || echo "❌ Tests fail"
```

**Agent Prompt:** See PROMPT-AGENT-BOTS below (Rewards Keeper section)

---

### TASK-GAP-010: Withdrawal Keeper Bot

**Status:** 🔴 Not Started  
**Priority:** P1 - High  
**Estimated Time:** 1-2 weeks  
**Dependencies:** Contracts ✅ (complete)  
**Blocks:** Testnet deployment

**Context:** Withdrawal requests queue but aren't processed. Need bot to monitor queue, process ready withdrawals, manage liquidity buffer.

**Deliverables:**
- [ ] `bots/withdrawal-keeper/` directory with full implementation
- [ ] Queue monitor (checks for claimable requests)
- [ ] Withdrawal processor (processes ready claims)
- [ ] Liquidity manager (triggers unstaking if needed)
- [ ] Prometheus metrics
- [ ] Kubernetes deployment manifest
- [ ] Tests (80%+ coverage)

**Acceptance Criteria:**
- Bot monitors queue successfully
- Processes ready withdrawals
- Manages liquidity buffer
- Tests pass
- Deploys to Kubernetes

**Verification:**
```bash
test -d /workspace/staking/aztec/bots/withdrawal-keeper && echo "✅ Bot dir exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/bots/withdrawal-keeper/src/index.ts && echo "✅ Bot code exists" || echo "❌ Missing"
cd /workspace/staking/aztec/bots/withdrawal-keeper && npm test && echo "✅ Tests pass" || echo "❌ Tests fail"
```

**Agent Prompt:** See PROMPT-AGENT-BOTS below (Withdrawal Keeper section)

---

### TASK-GAP-011: Security Audit Preparation & Scheduling

**Status:** 🔴 Not Started  
**Priority:** P1 - High  
**Estimated Time:** 2-3 weeks prep + scheduling  
**Dependencies:** Integration tests (GAP-007)  
**Blocks:** Mainnet deployment

**Context:** Need 2 independent audits before mainnet. Must prepare audit package, schedule audits, address pre-audit findings.

**Deliverables:**
- [ ] Security threat model document
- [ ] Invariants documentation
- [ ] NatSpec comments on all contracts
- [ ] Pre-audit checklist completed
- [ ] 2 audit firms contacted and scheduled
- [ ] Audit scope document
- [ ] Bug bounty program designed

**Acceptance Criteria:**
- Threat model covers all attack vectors
- All contracts have NatSpec comments
- Pre-audit checklist items addressed
- 2 audits scheduled (dates confirmed)
- Bug bounty scope defined

**Verification:**
```bash
test -f /workspace/staking/aztec/docs/SECURITY.md && echo "✅ Security doc exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/INVARIANTS.md && echo "✅ Invariants doc exists" || echo "❌ Missing"
grep -q "@notice" /workspace/staking/aztec/contracts/liquid-staking-core/src/main.nr && echo "✅ NatSpec present" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/AUDIT_SCHEDULE.md && echo "✅ Audits scheduled" || echo "❌ Missing"
```

**Agent Prompt:** See PROMPT-AGENT-SECURITY below

---

### TASK-GAP-012: Validator Deployment & Infrastructure

**Status:** 🔴 Not Started  
**Priority:** P1 - High  
**Estimated Time:** 2-3 weeks  
**Dependencies:** Assumption validation (GAP-003) for cost confirmation  
**Blocks:** Testnet deployment

**Context:** Need 3 validator nodes running to stake AZTEC. Must deploy, configure, monitor, and manage validators.

**Deliverables:**
- [ ] Validator deployment guide (Docker/Kubernetes)
- [ ] 3 validator nodes deployed (testnet)
- [ ] Key management strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Disaster recovery plan
- [ ] Cost tracking (actual vs estimated)

**Acceptance Criteria:**
- 3 validators running on testnet
- All validators healthy (monitoring confirms)
- Key management secure
- Costs tracked and documented
- Recovery plan tested

**Verification:**
```bash
# Check validator deployment docs
test -f /workspace/staking/aztec/docs/VALIDATOR_DEPLOYMENT.md && echo "✅ Deployment guide exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/ops/validators/docker-compose.yml && echo "✅ Docker compose exists" || echo "❌ Missing"
# Check validators are running (manual verification needed)
```

**Agent Prompt:** See PROMPT-AGENT-VALIDATORS below

---

### TASK-GAP-013: Frontend Development

**Status:** 🔴 Not Started  
**Priority:** P1 - High  
**Estimated Time:** 3-4 weeks  
**Dependencies:** Contracts ✅ (complete)  
**Blocks:** User acquisition

**Context:** No user interface exists. Need frontend for users to deposit, withdraw, view portfolio, track withdrawals.

**Deliverables:**
- [ ] `frontend/` directory with Next.js app
- [ ] Deposit flow (AZTEC → stAZTEC)
- [ ] Withdrawal flow (stAZTEC → Queue → Claim)
- [ ] Portfolio view (balances, rewards, pending withdrawals)
- [ ] Wallet connection (Aztec-compatible)
- [ ] Responsive design (mobile + desktop)
- [ ] Tests (component + integration)
- [ ] Production build working

**Acceptance Criteria:**
- All user flows work end-to-end
- Responsive on mobile and desktop
- Tests pass
- Production build succeeds
- Deployed to staging

**Verification:**
```bash
test -d /workspace/staking/aztec/frontend && echo "✅ Frontend dir exists" || echo "❌ Missing"
cd /workspace/staking/aztec/frontend && npm run build && echo "✅ Build succeeds" || echo "❌ Build fails"
cd /workspace/staking/aztec/frontend && npm test && echo "✅ Tests pass" || echo "❌ Tests fail"
```

**Agent Prompt:** See PROMPT-AGENT-FRONTEND below

---

## P2 MEDIUM PRIORITY TASKS (Can Start Now)

### TASK-GAP-014: Business Development & Partnerships

**Status:** 🔴 Not Started  
**Priority:** P2 - Medium  
**Estimated Time:** 2-3 weeks  
**Dependencies:** None  
**Blocks:** Liquidity, integrations

**Context:** Need DEX integrations, lending partnerships, wallet integrations for stAZTEC to be useful.

**Deliverables:**
- [ ] Aztec DeFi ecosystem map (all protocols identified)
- [ ] Partnership targets prioritized (Tier 1: launch critical, Tier 2: post-launch)
- [ ] Outreach templates (email, DM)
- [ ] Integration requirements document
- [ ] Liquidity bootstrap plan
- [ ] At least 3 partnership discussions active

**Acceptance Criteria:**
- 10+ integration targets identified with contacts
- Partnership playbook complete
- At least 3 active discussions
- Liquidity plan has specific numbers

**Verification:**
```bash
test -f /workspace/staking/aztec/docs/AZTEC_DEFI_MAP.md && echo "✅ Ecosystem map exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/PARTNERSHIP_PLAYBOOK.md && echo "✅ Playbook exists" || echo "❌ Missing"
grep -c "|" /workspace/staking/aztec/docs/PARTNERSHIP_PLAYBOOK.md | head -1
# Expected: At least 10 rows
```

**Agent Prompt:** See PROMPT-AGENT-BD below

---

### TASK-GAP-015: Marketing & Community Building

**Status:** 🔴 Not Started  
**Priority:** P2 - Medium  
**Estimated Time:** 2-3 weeks  
**Dependencies:** None  
**Blocks:** User acquisition

**Context:** No social media presence, no community. Need to build awareness before launch.

**Deliverables:**
- [ ] Marketing strategy document
- [ ] Content calendar (3 months)
- [ ] Brand positioning and messaging
- [ ] Twitter launch thread (10 tweets)
- [ ] Discord announcement
- [ ] Community channels set up (Discord, Twitter)
- [ ] Influencer/KOL target list
- [ ] Launch plan

**Acceptance Criteria:**
- Marketing plan complete
- Content calendar has 3 months of content
- Launch materials ready
- Community channels active
- 5+ influencer targets identified

**Verification:**
```bash
test -f /workspace/staking/aztec/docs/MARKETING_PLAN.md && echo "✅ Marketing plan exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/CONTENT_CALENDAR.md && echo "✅ Content calendar exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/LAUNCH_PLAN.md && echo "✅ Launch plan exists" || echo "❌ Missing"
```

**Agent Prompt:** See PROMPT-AGENT-MARKETING below

---

### TASK-GAP-016: Operations Runbook & Monitoring

**Status:** 🔴 Not Started  
**Priority:** P2 - Medium  
**Dependencies:** Bots (GAP-008/009/010) for bot-specific procedures  
**Estimated Time:** 1-2 weeks  
**Blocks:** Production readiness

**Context:** Need operational procedures for 24/7 operation. Runbooks, monitoring, on-call procedures.

**Deliverables:**
- [ ] Operations runbook (common issues, resolutions)
- [ ] Monitoring specification (metrics, alerts, dashboards)
- [ ] On-call guide (rotation, escalation)
- [ ] Capacity planning document
- [ ] Health check scripts
- [ ] Incident response procedures

**Acceptance Criteria:**
- Runbook covers all components
- Monitoring dashboards configured
- On-call rotation established
- Health checks working

**Verification:**
```bash
test -f /workspace/staking/aztec/docs/RUNBOOK.md && echo "✅ Runbook exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/MONITORING_SPEC.md && echo "✅ Monitoring spec exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/scripts/health-check.sh && echo "✅ Health check exists" || echo "❌ Missing"
```

**Agent Prompt:** See PROMPT-AGENT-OPS below

---

### TASK-GAP-017: Insurance Fund Design

**Status:** 🔴 Not Started  
**Priority:** P2 - Medium  
**Estimated Time:** 1 week  
**Dependencies:** Contracts ✅ (complete) for implementation  
**Blocks:** Risk management

**Context:** Need insurance fund to cover slashing events. Must design sizing, accumulation, payout triggers.

**Deliverables:**
- [ ] Insurance fund design document
- [ ] Fund sizing model (% of TVL)
- [ ] Accumulation mechanism (% of fees)
- [ ] Payout trigger conditions
- [ ] External insurance options analysis
- [ ] Implementation in RewardsManager (if not done)

**Acceptance Criteria:**
- Fund sizing model justified
- Accumulation mechanism clear
- Payout triggers defined
- External options evaluated

**Verification:**
```bash
test -f /workspace/staking/aztec/docs/INSURANCE_FUND_DESIGN.md && echo "✅ Design exists" || echo "❌ Missing"
grep -q "sizing model" /workspace/staking/aztec/docs/INSURANCE_FUND_DESIGN.md && echo "✅ Sizing model included" || echo "❌ Missing"
```

**Agent Prompt:** See PROMPT-AGENT-INSURANCE below

---

## PARALLELIZABLE AGENT PROMPTS

### PROMPT-AGENT-HIRING: Team Recruitment Agent

```text
You are the CEO/HR lead responsible for building the team for the Aztec liquid staking protocol.

## CONTEXT
- Need to hire 3-5 people: 2 Noir engineers, 1 backend (bots), 1 frontend, 1 DevOps
- No team exists yet - this blocks everything
- Target: First hire within 2 weeks

## YOUR TASKS

1. **Create Job Descriptions** (`docs/JOB_DESCRIPTIONS.md`)
   - Noir Engineer (2 positions)
   - Backend Engineer (TypeScript, bots)
   - Frontend Engineer (Next.js, Aztec)
   - DevOps Engineer (Kubernetes, validators)
   - For each: Responsibilities, requirements, nice-to-haves, compensation range

2. **Define Interview Process** (`docs/INTERVIEW_PROCESS.md`)
   - Screening criteria
   - Technical interview format
   - Reference check process
   - Offer process

3. **Create Posting Strategy** (`docs/RECRUITMENT_STRATEGY.md`)
   - Where to post (job boards, Discord, Twitter, etc.)
   - How to reach candidates (Aztec community, Noir developers)
   - Outreach templates

4. **Start Outreach**
   - Post job descriptions
   - Reach out to 5+ candidates per role
   - Track in spreadsheet or CRM

## VERIFICATION CHECKLIST
- [ ] Job descriptions created for all 4 roles
- [ ] Interview process documented
- [ ] Posting strategy defined
- [ ] At least 5 candidates contacted per role
- [ ] First interview scheduled

## VERIFICATION COMMANDS
```bash
test -f /workspace/staking/aztec/docs/JOB_DESCRIPTIONS.md && echo "✅ Job descriptions exist" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/INTERVIEW_PROCESS.md && echo "✅ Interview process exists" || echo "❌ Missing"
grep -q "Noir Engineer\|Backend Engineer\|Frontend Engineer\|DevOps" /workspace/staking/aztec/docs/JOB_DESCRIPTIONS.md && echo "✅ All roles covered" || echo "❌ Missing roles"
```

## OUTPUT
Report back with:
1. Job descriptions created
2. Interview process defined
3. Candidates contacted (number per role)
4. First interview scheduled (date)
```

---

### PROMPT-AGENT-VALIDATION: Assumption Validation Agent

```text
You are a DevOps engineer validating critical assumptions for the Aztec staking protocol.

## CONTEXT
- Several assumptions are unverified (see ASSUMPTIONS.md)
- Need to measure: unbonding period, validator costs, gas costs, slashing, epoch timing
- Results will update ECONOMICS.md

## CRITICAL: LOCAL-FIRST VALIDATION
1. START with local sandbox (2 days minimum)
2. Only proceed to devnet after local tests pass
3. Local sandbox: `aztec start --sandbox`
4. Fork mode: `aztec start --fork https://next.devnet.aztec-labs.com`

## YOUR TASKS

1. **Local Validation (Days 1-2)**
   - Deploy test contracts to local sandbox
   - Execute 100+ transactions locally
   - Measure gas consumption patterns
   - Document epoch timing

2. **Devnet Validation (Days 3-14)**
   - Connect to https://next.devnet.aztec-labs.com
   - Measure unbonding period (stake → unstake → claim)
   - Track validator costs (if running validator)
   - Measure gas costs (100+ transactions)
   - Research slashing mechanics (Aztec docs + testnet)
   - Observe epoch duration

3. **Update Documentation**
   - Update ASSUMPTIONS.md Validation Log with findings
   - Create cost spreadsheet (`docs/validation/gas-costs.csv`)
   - Update ECONOMICS.md with validated numbers

## VALIDATION OUTPUT FORMAT
For each assumption:
```
### [Assumption Name]
- **Status:** ✅ VERIFIED / ❌ UNVERIFIED / ⚠️ PARTIALLY VERIFIED
- **Method:** [How tested - local sandbox / devnet / docs review]
- **Result:** [Specific value measured]
- **Evidence:** [Links to logs, tx hashes, screenshots]
- **Date:** [YYYY-MM-DD]
- **Impact if wrong:** [What breaks if assumption is wrong]
```

## VERIFICATION CHECKLIST
- [ ] Local sandbox working before devnet tests
- [ ] Each assumption has evidence (not just claims)
- [ ] ASSUMPTIONS.md Validation Log updated with dated entries
- [ ] Gas cost spreadsheet created
- [ ] ECONOMICS.md updated with validated numbers
- [ ] All measurements repeatable (commands documented)

## VERIFICATION COMMANDS
```bash
# Check ASSUMPTIONS.md updated
grep -q "Validation Log" /workspace/staking/aztec/docs/ASSUMPTIONS.md && echo "✅ Validation log exists" || echo "❌ Missing"
grep -q "✅\|❌\|⚠️" /workspace/staking/aztec/docs/ASSUMPTIONS.md && echo "✅ Status markers present" || echo "❌ Missing"

# Check evidence files
test -f /workspace/staking/aztec/docs/validation/gas-costs.csv && echo "✅ Gas costs recorded" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/validation/unbonding-test.md && echo "✅ Unbonding test documented" || echo "❌ Missing"
```

## OUTPUT
Report back with:
1. For each assumption: Status + evidence
2. Cost spreadsheet location
3. ECONOMICS.md updates made
4. Blockers encountered
5. Recommendations based on findings
```

---

### PROMPT-AGENT-LEGAL: Legal Entity & Regulatory Agent

```text
You are a legal strategy consultant for a crypto startup building an Aztec liquid staking protocol.

## CONTEXT
- Aztec is a privacy-focused Ethereum L2
- Building liquid staking (users deposit AZTEC, receive stAZTEC)
- Target: $500k-$750k seed raise
- Launch timeline: 6 months
- Geographic focus: Initially US-friendly if possible

## YOUR DELIVERABLES

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

## KEY QUESTIONS TO ADDRESS
- Can US retail users participate?
- What disclosures are required for institutional investors?
- How do privacy features affect regulatory classification?
- What licenses might be needed?

## VERIFICATION CHECKLIST
- [ ] All 4 deliverables created and populated
- [ ] Legal structure decision made and documented
- [ ] Token classification analysis complete
- [ ] Compliance framework addresses privacy chain specifics
- [ ] Templates provide actionable starting points

## VERIFICATION COMMANDS
```bash
test -f /workspace/staking/aztec/docs/LEGAL_STRUCTURE.md && echo "✅ LEGAL_STRUCTURE.md exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/TOKEN_LEGAL_ANALYSIS.md && echo "✅ TOKEN_LEGAL_ANALYSIS.md exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/COMPLIANCE_FRAMEWORK.md && echo "✅ COMPLIANCE_FRAMEWORK.md exists" || echo "❌ Missing"
test -d /workspace/staking/aztec/docs/LEGAL_TEMPLATES && echo "✅ LEGAL_TEMPLATES/ exists" || echo "❌ Missing"
grep -q "Recommendation:" /workspace/staking/aztec/docs/LEGAL_STRUCTURE.md && echo "✅ Decision included" || echo "❌ No decision"
grep -q "Howey" /workspace/staking/aztec/docs/TOKEN_LEGAL_ANALYSIS.md && echo "✅ Howey test included" || echo "❌ Missing"
```

## OUTPUT FORMAT
Markdown files with clear sections, citations to relevant law/guidance where applicable.

## NEXT STEPS AFTER COMPLETION
1. Update GAP-004 status to "✅ Resolved" in STRATEGIC-GAP-ANALYSIS.md
2. Unblock GAP-002 (Fundraising) and GAP-002 (Hiring)
3. Engage legal counsel for entity formation
```

---

### PROMPT-AGENT-BOTS: Bot Infrastructure Agent (All 3 Bots)

```text
You are a backend engineer building keeper bots for the Aztec liquid staking protocol.

## CONTEXT
- Contracts are complete (7/7, 176 functions, 64 tests passing)
- Need 3 bots: Staking Keeper, Rewards Keeper, Withdrawal Keeper
- Aztec is NOT EVM - do not use ethers.js, viem, wagmi
- Use AztecJS for chain interaction (or mock if SDK not ready)

## PROJECT STRUCTURE
```
/workspace/staking/aztec/bots/
├── staking-keeper/
│   ├── src/index.ts
│   ├── src/config.ts
│   ├── src/watcher.ts
│   ├── src/executor.ts
│   ├── package.json
│   └── README.md
├── rewards-keeper/
├── withdrawal-keeper/
├── shared/
│   ├── src/aztec-client.ts
│   ├── src/logger.ts
│   ├── src/metrics.ts
│   └── src/retry.ts
└── k8s/
    ├── staking-keeper.yaml
    ├── rewards-keeper.yaml
    └── withdrawal-keeper.yaml
```

## YOUR TASKS

### 1. Create Shared Utilities (`bots/shared/`)
- Aztec client wrapper (mock initially, replace with real SDK)
- Structured logging
- Prometheus metrics
- Exponential backoff retry logic

### 2. Staking Keeper (`bots/staking-keeper/`)
- Watch for deposits (poll or events)
- Check pending pool >= 200k threshold
- Call VaultManager.execute_batch_stake()
- Round-robin validator selection
- Error handling and retries
- Prometheus metrics

### 3. Rewards Keeper (`bots/rewards-keeper/`)
- Scheduled job (daily or configurable)
- Claim rewards from validators
- Call RewardsManager.process_rewards()
- Update exchange rate
- Distribute fees (50% insurance, 50% treasury)

### 4. Withdrawal Keeper (`bots/withdrawal-keeper/`)
- Monitor withdrawal queue
- Check for claimable requests
- Process ready withdrawals
- Manage liquidity buffer (trigger unstaking if needed)

### 5. Kubernetes Manifests (`bots/k8s/`)
- Deployment manifests for all 3 bots
- ConfigMaps for configuration
- Service manifests for metrics
- Health checks and liveness probes

### 6. Tests
- Unit tests for each bot (80%+ coverage)
- Integration tests with mocked contracts
- Run: `npm test` in each bot directory

## TECH STACK
- TypeScript/Node.js (ESM modules)
- AztecJS for chain interaction (NOT viem/ethers)
- BullMQ for job scheduling (rewards keeper)
- Prometheus for metrics
- Jest for testing

## VERIFICATION CHECKLIST
- [ ] All 3 bots created and implemented
- [ ] Shared utilities created
- [ ] `npm run lint` - No linting errors
- [ ] `npm run type-check` - TypeScript compiles
- [ ] `npm test` - All tests pass (80%+ coverage)
- [ ] Each bot starts without errors (mock mode)
- [ ] Kubernetes manifests valid
- [ ] README in bots/ with setup instructions

## VERIFICATION COMMANDS
```bash
# Verify bots exist
test -d /workspace/staking/aztec/bots/staking-keeper && echo "✅ Staking bot exists" || echo "❌ Missing"
test -d /workspace/staking/aztec/bots/rewards-keeper && echo "✅ Rewards bot exists" || echo "❌ Missing"
test -d /workspace/staking/aztec/bots/withdrawal-keeper && echo "✅ Withdrawal bot exists" || echo "❌ Missing"
test -d /workspace/staking/aztec/bots/shared && echo "✅ Shared utilities exist" || echo "❌ Missing"

# Verify tests pass
cd /workspace/staking/aztec/bots/staking-keeper && npm test && echo "✅ Staking bot tests pass" || echo "❌ Tests fail"
cd /workspace/staking/aztec/bots/rewards-keeper && npm test && echo "✅ Rewards bot tests pass" || echo "❌ Tests fail"
cd /workspace/staking/aztec/bots/withdrawal-keeper && npm test && echo "✅ Withdrawal bot tests pass" || echo "❌ Tests fail"

# Verify K8s manifests
kubectl apply --dry-run=client -f /workspace/staking/aztec/bots/k8s/ && echo "✅ K8s manifests valid" || echo "❌ Invalid"
```

## OUTPUT
Report back with:
1. Bots created and their status
2. Test coverage for each bot
3. Dependencies used (list packages)
4. Any Aztec SDK gaps discovered
5. Files created
```

---

### PROMPT-AGENT-INTEGRATION: Integration Testing Agent

```text
You are a smart contract engineer writing integration tests for the Aztec liquid staking protocol.

## CONTEXT
- All 7 contracts complete (176 functions, 64 unit tests passing)
- Need end-to-end integration tests
- Test full flow: deposit → mint → stake → rewards → withdraw → claim
- Requires aztec-nargo for compilation (Docker-based)

## YOUR TASKS

1. **Create Integration Test Suite** (`contracts/integration-tests/`)
   - Project structure with Nargo.toml
   - Test setup and teardown
   - Contract deployment helpers

2. **Write Integration Tests** (50+ tests)
   - Full flow test (deposit → stake → rewards → withdraw → claim)
   - Cross-contract call tests
   - Edge cases (large amounts, rapid deposits, etc.)
   - Error scenarios (insufficient balance, invalid inputs)
   - Access control tests

3. **Test Scenarios**
   - Single user deposit → stake → withdraw
   - Multiple users deposit → batch staking
   - Rewards claiming → exchange rate update
   - Withdrawal queue processing
   - Validator round-robin selection

4. **CI Integration**
   - GitHub Actions workflow
   - Run tests on PR and main branch
   - Report test results

## VERIFICATION CHECKLIST
- [ ] Integration test suite created
- [ ] 50+ tests written
- [ ] Full flow test passes
- [ ] All tests pass: `nargo test`
- [ ] CI workflow configured
- [ ] Test documentation complete

## VERIFICATION COMMANDS
```bash
# Verify integration tests exist
test -d /workspace/staking/aztec/contracts/integration-tests && echo "✅ Integration tests dir exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/contracts/integration-tests/src/main.nr && echo "✅ Test file exists" || echo "❌ Missing"

# Run tests (when ready)
cd /workspace/staking/aztec/contracts/integration-tests
~/.nargo/bin/nargo test
# Expected: 50+ tests passed
```

## OUTPUT
Report back with:
1. Tests created (list scenarios)
2. Test results (pass/fail count)
3. CI workflow status
4. Any blockers encountered
```

---

### PROMPT-AGENT-SECURITY: Security Audit Preparation Agent

```text
You are a security engineer preparing the Aztec staking protocol for audits.

## CONTEXT
- All 7 contracts complete (176 functions)
- Need 2 independent audits before mainnet
- Must prepare audit package, schedule audits

## YOUR TASKS

1. **Create Security Documentation** (`docs/SECURITY.md`)
   - Threat model (all attack vectors)
   - Trust model (admin, bots, validators, users)
   - Assets at risk
   - Security controls implemented

2. **Create Invariants Document** (`docs/INVARIANTS.md`)
   - List ALL properties that must always hold
   - Example: "total_shares == sum(user_shares)"
   - Example: "exchange_rate >= initial_rate (no loss)"
   - Make testable (can write assertions)

3. **Add NatSpec Comments** (all contracts)
   - Every public function needs @notice, @dev, @param, @return
   - Update all 7 contracts

4. **Create Pre-Audit Checklist** (`docs/SECURITY-CHECKLIST.md`)
   - Reentrancy protection
   - Access control review
   - Integer overflow checks
   - Input validation
   - Event emission

5. **Create Bug Bounty Scope** (`docs/BUG-BOUNTY-SCOPE.md`)
   - In-scope contracts
   - Out-of-scope (bots, frontend)
   - Severity definitions
   - Payout structure

6. **Schedule Audits**
   - Research audit firms (Trail of Bits, OpenZeppelin, etc.)
   - Contact 3+ firms
   - Get quotes and timelines
   - Schedule 2 audits
   - Create `docs/AUDIT_SCHEDULE.md`

## VERIFICATION CHECKLIST
- [ ] All contracts have NatSpec on every public function
- [ ] SECURITY.md covers all threat categories
- [ ] INVARIANTS.md testable (can write assertions)
- [ ] Checklist covers OWASP smart contract top 10
- [ ] Bug bounty scope clear and complete
- [ ] 2 audits scheduled (dates confirmed)

## VERIFICATION COMMANDS
```bash
# Verify security docs exist
test -f /workspace/staking/aztec/docs/SECURITY.md && echo "✅ Security doc exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/INVARIANTS.md && echo "✅ Invariants doc exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/SECURITY-CHECKLIST.md && echo "✅ Checklist exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/BUG-BOUNTY-SCOPE.md && echo "✅ Bug bounty scope exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/AUDIT_SCHEDULE.md && echo "✅ Audits scheduled" || echo "❌ Missing"

# Check NatSpec coverage (sample)
grep -r "@notice" /workspace/staking/aztec/contracts/liquid-staking-core/src/main.nr | wc -l
# Expected: At least 10+ @notice comments (one per public function)
```

## OUTPUT
Report back with:
1. Documents created/updated
2. Critical risks identified
3. Missing security controls
4. Recommended pre-audit fixes
5. Audit schedule (firms, dates, costs)
```

---

### PROMPT-AGENT-VALIDATORS: Validator Deployment Agent

```text
You are a DevOps engineer deploying validator infrastructure for Aztec staking.

## CONTEXT
- Need 3 validator nodes to stake AZTEC
- Must deploy, configure, monitor, manage
- Validator costs need validation (assumed $400/month)

## YOUR TASKS

1. **Create Deployment Guide** (`docs/VALIDATOR_DEPLOYMENT.md`)
   - Docker/Kubernetes deployment
   - Key management strategy
   - Monitoring setup
   - Disaster recovery

2. **Deploy Validators** (`ops/validators/`)
   - Docker Compose or Kubernetes manifests
   - 3 validator nodes (different regions if possible)
   - Configuration files
   - Key management (hardware wallets or secure storage)

3. **Set Up Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Alerting (PagerDuty, Slack, etc.)
   - Health checks

4. **Track Costs**
   - Actual resource usage (CPU, RAM, disk, bandwidth)
   - Cost spreadsheet
   - Compare to estimated $400/month
   - Update ECONOMICS.md if costs differ

5. **Test Disaster Recovery**
   - Node failure scenario
   - Key compromise scenario
   - Recovery procedures

## VERIFICATION CHECKLIST
- [ ] Deployment guide complete
- [ ] 3 validators deployed (testnet)
- [ ] All validators healthy (monitoring confirms)
- [ ] Key management secure
- [ ] Costs tracked and documented
- [ ] Recovery plan tested

## VERIFICATION COMMANDS
```bash
# Check deployment docs
test -f /workspace/staking/aztec/docs/VALIDATOR_DEPLOYMENT.md && echo "✅ Deployment guide exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/ops/validators/docker-compose.yml && echo "✅ Docker compose exists" || echo "❌ Missing"

# Check validators are running (manual verification needed)
# curl validator endpoints or check monitoring dashboards
```

## OUTPUT
Report back with:
1. Validators deployed (status, locations)
2. Monitoring configured (dashboards, alerts)
3. Costs tracked (actual vs estimated)
4. Recovery plan tested (results)
```

---

### PROMPT-AGENT-FRONTEND: Frontend Development Agent

```text
You are a frontend engineer building the staking protocol interface.

## CONTEXT
- No frontend exists yet
- Contracts complete (can integrate)
- Must work with Aztec wallets/PXE (NOT MetaMask)
- Target: simple deposit/withdraw UI

## CRITICAL: LOCAL-FIRST DEVELOPMENT
1. Build with MOCK DATA first (no chain connection)
2. Add local sandbox integration after mocks work
3. DO NOT connect to devnet until local tests pass

## YOUR TASKS

1. **Create Frontend Project** (`frontend/`)
   - Next.js 14 (App Router)
   - TypeScript
   - TailwindCSS
   - AztecJS (NOT wagmi/viem)

2. **Implement Pages** (MOCK DATA FIRST)
   - / (landing with TVL, APR stats - mocked)
   - /stake (deposit form - mock success)
   - /unstake (withdrawal form - mock success)
   - /portfolio (balances - mocked data)

3. **Implement Components**
   - WalletConnect (Aztec-compatible, mock in dev)
   - StakeForm (amount input, submit)
   - UnstakeForm (amount input, queue position)
   - PortfolioView (balances, pending)
   - TransactionStatus (pending, confirmed, failed)

4. **Add Tests**
   - Component tests for each component
   - Mock the Aztec SDK
   - Test user flows with mocks
   - Run: `npm test`

5. **Development Modes**
   - `npm run dev:mock` - Mock data only
   - `npm run dev:local` - Local sandbox
   - `npm run dev:devnet` - Devnet (after local works)

## VERIFICATION CHECKLIST
- [ ] `npm run lint` - No errors
- [ ] `npm run type-check` - TypeScript compiles
- [ ] `npm test` - All tests pass
- [ ] `npm run build` - Production build succeeds
- [ ] App works with mock data (no chain needed)
- [ ] Responsive on mobile and desktop
- [ ] README has setup instructions

## VERIFICATION COMMANDS
```bash
# Verify frontend exists
test -d /workspace/staking/aztec/frontend && echo "✅ Frontend dir exists" || echo "❌ Missing"
cd /workspace/staking/aztec/frontend && npm run build && echo "✅ Build succeeds" || echo "❌ Build fails"
cd /workspace/staking/aztec/frontend && npm test && echo "✅ Tests pass" || echo "❌ Tests fail"
```

## OUTPUT
Report back with:
1. Pages created and status
2. Components created
3. Aztec SDK methods needed (found/missing)
4. Test coverage
5. Any blockers
```

---

### PROMPT-AGENT-BD: Business Development Agent

```text
You are a business development lead for the Aztec liquid staking protocol.

## CONTEXT
- First-mover opportunity in Aztec liquid staking
- Known competitor: Olla by Kryha (announced, not launched)
- Need DEX liquidity, lending integrations, wallet partnerships

## YOUR TASKS

1. **Map Aztec DeFi Ecosystem** (`docs/AZTEC_DEFI_MAP.md`)
   - Research ALL Aztec-native DeFi protocols
   - Categories: DEX, Lending, Stablecoins, Wallets, Bridges
   - For each: Name, Status, Contact, Integration effort
   - Prioritize by: Day-1 viability, User reach, Technical effort

2. **Create Partnership Playbook** (`docs/PARTNERSHIP_PLAYBOOK.md`)
   - Ideal partner profile
   - Value proposition for each partner type
   - Outreach templates (email, DM)
   - Negotiation guidance
   - Term sheet templates

3. **Create Integration Requirements** (`docs/INTEGRATION_REQUIREMENTS.md`)
   - What partners need from us (ABIs, docs, support)
   - What we need from partners
   - Integration testing requirements
   - Maintenance expectations

4. **Create Liquidity Bootstrap Plan** (`docs/LIQUIDITY_BOOTSTRAP_PLAN.md`)
   - Initial pools: stAZTEC/AZTEC
   - Required depth for acceptable slippage (<2% on $10k trade)
   - Incentive options: points, LM, grants
   - Risk mitigation: thin liquidity, bank runs

5. **Competitive Intelligence**
   - Update ASSUMPTIONS.md Competitor Tracker
   - For Olla: Find repo/docs, timeline, approach
   - Search for unknown teams: Discord, Twitter, GitHub, grants
   - Track signals: job postings, testnet deployments, announcements

6. **Start Outreach**
   - Contact top 5 priority partners
   - Schedule partnership calls
   - Track in CRM or spreadsheet

## VERIFICATION CHECKLIST
- [ ] 10+ integration targets identified with contact info
- [ ] Liquidity bootstrap plan has specific numbers
- [ ] Competitor tracker updated with evidence
- [ ] Outreach templates ready to send
- [ ] At least 3 partnership discussions active

## VERIFICATION COMMANDS
```bash
test -f /workspace/staking/aztec/docs/AZTEC_DEFI_MAP.md && echo "✅ Ecosystem map exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/PARTNERSHIP_PLAYBOOK.md && echo "✅ Playbook exists" || echo "❌ Missing"
grep -q "DEX" /workspace/staking/aztec/docs/AZTEC_DEFI_MAP.md && echo "✅ DEXs identified" || echo "❌ Missing"
grep -c "|" /workspace/staking/aztec/docs/PARTNERSHIP_PLAYBOOK.md | head -1
# Expected: At least 10 rows
```

## OUTPUT
Report back with:
1. Top 5 priority partners
2. Liquidity requirements calculated
3. Competitive intel updates
4. Documents created
5. Partnership discussions active (number)
```

---

### PROMPT-AGENT-MARKETING: Marketing & Community Agent

```text
You are the CMO building community and marketing for the Aztec staking protocol.

## CONTEXT
- No social media presence
- No community yet
- Need awareness before launch
- Competitor Olla announced at Devconnect

## YOUR TASKS

1. **Create Marketing Plan** (`docs/MARKETING_PLAN.md`)
   - Brand positioning
   - Tagline: [Compelling one-liner]
   - Key differentiators: [3 points]
   - Target audience: [Primary, secondary]
   - Messaging framework

2. **Create Content Calendar** (`docs/CONTENT_CALENDAR.md`)
   - 3-month content plan
   - Pre-launch content themes
   - Launch week content
   - Post-launch content
   - Content types (educational, updates, memes, AMAs)

3. **Create Launch Materials**
   - Twitter launch thread (10 tweets) → `docs/LAUNCH_THREAD.md`
   - Discord announcement → `docs/DISCORD_ANNOUNCEMENT.md`
   - Press release template

4. **Set Up Community Channels**
   - Discord server (if not exists)
   - Twitter account (if not exists)
   - Community roles and moderation plan

5. **Create Influencer Strategy** (`docs/INFLUENCER_STRATEGY.md`)
   - Target influencer profiles
   - Outreach approach
   - Compensation structures
   - Risk management (FTC compliance)

6. **Create Launch Plan** (`docs/LAUNCH_PLAN.md`)
   - Pre-announcement teasers
   - Launch day activities
   - First week engagement
   - Press/media outreach

## VERIFICATION CHECKLIST
- [ ] Messaging consistent with EXECUTIVE-SUMMARY.md
- [ ] Numbers match ECONOMICS.md
- [ ] No unverified claims (per .cursorrules #52)
- [ ] Content calendar is realistic
- [ ] All templates ready to use
- [ ] Community channels set up

## VERIFICATION COMMANDS
```bash
test -f /workspace/staking/aztec/docs/MARKETING_PLAN.md && echo "✅ Marketing plan exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/CONTENT_CALENDAR.md && echo "✅ Content calendar exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/LAUNCH_PLAN.md && echo "✅ Launch plan exists" || echo "❌ Missing"
grep -q "Content Calendar\|Week\|Month" /workspace/staking/aztec/docs/MARKETING_PLAN.md && echo "✅ Calendar present" || echo "❌ Missing"
```

## OUTPUT
Report back with:
1. Documents created
2. Key messages defined
3. Influencer target list (5+ names)
4. Content calendar summary
5. Community channels set up (which ones)
```

---

### PROMPT-AGENT-OPS: Operations Runbook Agent

```text
You are a DevOps/SRE expert creating operations documentation.

## CONTEXT
- 4 bots: Staking Keeper, Rewards Keeper, Withdrawal Keeper, Monitoring
- 3 validator nodes
- Small team (1-2 DevOps initially)
- Target uptime: 99.9%

## YOUR TASKS

1. **Create Runbook** (`docs/RUNBOOK.md`)
   - Common issues and resolutions
   - Restart procedures for each component
   - Log locations and analysis
   - Metric interpretation guide

2. **Create Monitoring Specification** (`docs/MONITORING_SPEC.md`)
   - Metrics to collect (with thresholds)
   - Alert definitions (P1/P2/P3)
   - Dashboard specifications
   - SLO definitions

3. **Create On-Call Guide** (`docs/ONCALL_GUIDE.md`)
   - Rotation schedule template
   - Escalation matrix
   - Response time SLAs
   - Handoff procedures

4. **Create Capacity Planning** (`docs/CAPACITY_PLANNING.md`)
   - Resource requirements by TVL tier
   - Scaling triggers
   - Cost projections
   - Growth planning

5. **Create Health Check Scripts** (`scripts/health-check.sh`)
   - Check all components
   - Return exit codes
   - Suitable for Kubernetes liveness probes

## VERIFICATION CHECKLIST
- [ ] Runbook covers all components
- [ ] Monitoring spec includes all metrics
- [ ] On-call guide includes escalation matrix
- [ ] Health check script works
- [ ] Capacity planning includes cost projections

## VERIFICATION COMMANDS
```bash
test -f /workspace/staking/aztec/docs/RUNBOOK.md && echo "✅ Runbook exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/MONITORING_SPEC.md && echo "✅ Monitoring spec exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/ONCALL_GUIDE.md && echo "✅ On-call guide exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/scripts/health-check.sh && echo "✅ Health check exists" || echo "❌ Missing"
test -x /workspace/staking/aztec/scripts/health-check.sh && echo "✅ Script executable" || echo "❌ Not executable"
```

## OUTPUT
Report back with:
1. Documents created
2. Monitoring dashboards configured (which ones)
3. Alert thresholds defined
4. Health check script tested
```

---

### PROMPT-AGENT-INSURANCE: Insurance Fund Agent

```text
You are a DeFi risk management expert designing an insurance fund.

## CONTEXT
- Protocol takes 10% of staking rewards as fee
- Validators can be slashed for misbehavior
- Expected TVL: $10M-$100M
- No external insurance products for Aztec yet

## YOUR TASKS

1. **Create Insurance Fund Design** (`docs/INSURANCE_FUND_DESIGN.md`)
   - Fund sizing model (% of TVL or absolute)
   - Accumulation mechanism (% of fees)
   - Triggering conditions (what counts as claimable event)
   - Payout procedures
   - Fund governance

2. **Create Slashing Scenarios** (`docs/SLASHING_SCENARIOS.md`)
   - Aztec slashing mechanics (research current specs)
   - Who bears loss (validator vs delegators)
   - Historical slashing data (if available)
   - Worst-case scenarios

3. **Create External Insurance Analysis** (`docs/EXTERNAL_INSURANCE.md`)
   - Nexus Mutual coverage analysis
   - Other DeFi insurance options
   - Cost-benefit analysis
   - Integration requirements

4. **Implement in RewardsManager** (if not already done)
   - Insurance fund storage
   - Fee split logic (50% insurance, 50% treasury)
   - Fund cap logic

## VERIFICATION CHECKLIST
- [ ] Fund sizing model is justified
- [ ] Accumulation mechanism clear
- [ ] Payout triggers defined
- [ ] External options evaluated
- [ ] Implementation complete (if applicable)

## VERIFICATION COMMANDS
```bash
test -f /workspace/staking/aztec/docs/INSURANCE_FUND_DESIGN.md && echo "✅ Design exists" || echo "❌ Missing"
test -f /workspace/staking/aztec/docs/SLASHING_SCENARIOS.md && echo "✅ Scenarios exist" || echo "❌ Missing"
grep -q "sizing model" /workspace/staking/aztec/docs/INSURANCE_FUND_DESIGN.md && echo "✅ Sizing model included" || echo "❌ Missing"
```

## OUTPUT
Report back with:
1. Fund design complete
2. Sizing model justified
3. External options evaluated
4. Implementation status (if applicable)
```

---

## Execution Timeline

### Week 1 (All Parallel - P0 Tasks)
- **Agent LEGAL** → TASK-GAP-004 (Legal Entity)
- **Agent VALIDATION** → TASK-GAP-003 (Assumption Validation)
- **Agent BD** → TASK-GAP-014 (Partnerships)
- **Agent MARKETING** → TASK-GAP-015 (Community)

### Week 2-3 (After Contracts ✅ - P1 Tasks)
- **Agent BOTS** → TASK-GAP-008, GAP-009, GAP-010 (all 3 bots in parallel)
- **Agent FRONTEND** → TASK-GAP-013
- **Agent INTEGRATION** → TASK-GAP-007
- **Agent SECURITY** → TASK-GAP-011

### Week 3-4 (P1/P2 Tasks)
- **Agent VALIDATORS** → TASK-GAP-012
- **Agent OPS** → TASK-GAP-016
- **Agent INSURANCE** → TASK-GAP-017

---

## Task Status Tracking

Update this table as tasks are completed:

| Task ID | Title | Status | Assigned To | Target Date | Actual Date | Verification |
|---------|-------|--------|-------------|-------------|-------------|--------------|
| GAP-002 | Team Hiring | 🔴 Open | [CEO] | Week 2 | - | ❌ |
| GAP-003 | Assumption Validation | 🔴 Open | [DevOps] | Week 1-2 | - | ❌ |
| GAP-004 | Legal Entity | 🔴 Open | [COO] | Week 2-4 | - | ❌ |
| GAP-007 | Integration Tests | 🔴 Open | [Engineer] | Week 3-4 | - | ❌ |
| GAP-008 | Staking Bot | 🔴 Open | [Backend] | Week 3-4 | - | ❌ |
| GAP-009 | Rewards Bot | 🔴 Open | [Backend] | Week 3-4 | - | ❌ |
| GAP-010 | Withdrawal Bot | 🔴 Open | [Backend] | Week 3-4 | - | ❌ |
| GAP-011 | Security Audit | 🔴 Open | [Security] | Week 8-16 | - | ❌ |
| GAP-012 | Validator Deployment | 🔴 Open | [DevOps] | Week 4-6 | - | ❌ |
| GAP-013 | Frontend | 🔴 Open | [Frontend] | Week 3-5 | - | ❌ |
| GAP-014 | BD & Partnerships | 🔴 Open | [BD] | Week 1-2 | - | ❌ |
| GAP-015 | Marketing | 🔴 Open | [Marketing] | Week 1-2 | - | ❌ |
| GAP-016 | Operations | 🔴 Open | [DevOps] | Week 3-4 | - | ❌ |
| GAP-017 | Insurance Fund | 🔴 Open | [Risk] | Week 5 | - | ❌ |

---

**Document Version:** 1.0  
**Last Updated:** December 30, 2025  
**Next Review:** Weekly during active development
