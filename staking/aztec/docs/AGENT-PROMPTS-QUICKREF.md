# Agent Prompts Quick Reference

**Copy-paste prompts for parallel agent execution**
*Created: December 27, 2025*
*Updated: December 30, 2025 - Contracts complete, frontend/bot prompts updated*

---

## Overview

This file contains 8 self-contained prompts for parallel agent execution. Each prompt follows:
- **Local-first testing** - Test against local sandbox/fork before any testnet
- **Multi-step review** - Per .cursorrules, verify from multiple perspectives
- **Validation requirements** - All deliverables must be tested and verified

**Current Status (2025-12-30):**
- ✅ **Phase 2 COMPLETE:** All 7 contracts implemented (176 functions)
- ✅ **Tests:** 64/64 passing
- 🚀 **Ready:** Frontend (mock), Bots, Security docs can start immediately

**Parallelization Map:**

```
IMMEDIATELY PARALLELIZABLE (No Dependencies):
├── Agent F1: Frontend Setup + UI Kit
├── Agent F2: Frontend Feature Components
├── Agent F3: Frontend Integration
├── Agent B1: Staking + Rewards Bots
├── Agent B2: Withdrawal + Monitoring Bots
├── Agent 4: Security Documentation
├── Agent 5: BD (TASK-007-009)
└── Agent 8: Marketing

See: /workspace/staking/aztec/PARALLEL_WORK_HANDOFF.md for detailed prompts
```

---

## Mandatory Review Protocol (All Agents)

**Every agent must follow this review protocol before marking any deliverable complete:**

### Multi-Step Review Checklist (Per .cursorrules #15, #24)

```
1. DEVELOPER PERSPECTIVE: Can another developer use this?
   - [ ] Code compiles/runs without errors
   - [ ] Dependencies documented
   - [ ] Setup instructions work from scratch

2. REVIEWER PERSPECTIVE: Is this correct?
   - [ ] Logic matches specification
   - [ ] Edge cases handled
   - [ ] No dead code or unused imports

3. USER PERSPECTIVE: Does it actually work?
   - [ ] Happy path tested
   - [ ] Error states handled gracefully
   - [ ] Clear error messages

4. MAINTAINER PERSPECTIVE: Can this be maintained?
   - [ ] Code is readable and commented
   - [ ] No hardcoded values (use config)
   - [ ] Tests exist for core functionality

5. PM PERSPECTIVE: What could go wrong?
   - [ ] Risks documented
   - [ ] Blockers flagged
   - [ ] Assumptions stated explicitly
```

### Verification Commands (Per .cursorrules #24, #61)

Before marking ANY deliverable complete, run ALL applicable:
```bash
# For Noir contracts
~/.nargo/bin/nargo test           # Unit tests
~/aztec-bin/nargo compile         # Compilation

# For TypeScript
npm run lint                      # Linting
npm run type-check                # Type checking
npm test                          # Unit tests

# For any code changes
git diff                          # Review changes
```

---

## Testing Hierarchy

**All testing follows this order - NO EXCEPTIONS:**

```
1. LOCAL SANDBOX (Aztec sandbox on your machine)
   └── Run: aztec start --sandbox
   └── Why: Fast iteration, no network issues, free

2. LOCAL FORK (Fork of devnet/mainnet state)
   └── Run: aztec start --fork https://next.devnet.aztec-labs.com
   └── Why: Real state, local speed

3. DEVNET (https://next.devnet.aztec-labs.com)
   └── Why: Public test environment
   └── ONLY after local tests pass

4. TESTNET (when available)
   └── Why: Pre-mainnet validation
   └── ONLY after devnet tests pass

5. MAINNET
   └── ONLY after full audit and all prior stages pass
```

---

## PROMPT 1: Smart Contract Agent

**Status:** ✅ COMPLETE (2025-12-30)
**Result:** All contracts implemented, 64/64 tests passing

```text
## COMPLETED WORK

All 7 contracts fully implemented:
- liquid-staking-core (37 functions) - Main entry point
- rewards-manager (33 functions) - Exchange rate updates
- vault-manager (28 functions) - Batch staking, round-robin
- withdrawal-queue (24 functions) - FIFO with unbonding
- aztec-staking-pool (21 functions) - Base staking logic
- validator-registry (20 functions) - Validator tracking
- staked-aztec-token (13 functions) - stAZTEC token

Tests: 64/64 passing in staking-math-tests/
Verification: ~/.nargo/bin/nargo test

## NEXT STEPS FOR CONTRACTS

The next phase is compilation testing with aztec-nargo:

```bash
# Extract aztec-nargo from Docker
mkdir -p ~/aztec-bin
sudo docker create --name extract-nargo aztecprotocol/aztec:latest
sudo docker cp extract-nargo:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/
sudo docker rm extract-nargo

# Compile a contract
cp -r /workspace/staking/aztec/contracts/liquid-staking-core ~/liquid-staking-core
cd ~/liquid-staking-core
~/aztec-bin/nargo compile
```

See: /workspace/staking/aztec/contracts/AGENT_HANDOFF.md
```

---

## PROMPT 2: Bot Infrastructure Agent

**Dependencies:** Contract interfaces (can start skeleton immediately)
**Run Immediately:** Skeleton yes, integration after contracts
**Testing Environment:** LOCAL SANDBOX FIRST, then devnet
**Estimated Time:** 20-30 hours

```text
You are a backend engineer building keeper bots for the Aztec liquid staking protocol.

## CONTEXT
- Protocol has 7 smart contracts (4 implemented, 3 in progress)
- Need 4 keeper bots: Staking, Rewards, Withdrawal, Monitoring
- Aztec is NOT EVM - do not use Ethereum libraries (viem, ethers)

## CRITICAL: LOCAL-FIRST DEVELOPMENT
1. Build and test against LOCAL SANDBOX first
2. Use mock data for contract interfaces not yet available
3. Run local Aztec sandbox: `aztec start --sandbox`
4. DO NOT interact with devnet until local tests pass

## YOUR TASKS
1. **Pre-flight:**
   - Review TASKS.md for TASK-301 through TASK-306
   - Check Aztec SDK documentation for client patterns

2. **Create bot project structure:**
   ```
   staking/aztec/bots/
   ├── staking-keeper/
   │   ├── src/index.ts
   │   ├── src/config.ts
   │   ├── src/__tests__/
   │   ├── package.json
   │   └── Dockerfile
   ├── rewards-keeper/
   ├── withdrawal-keeper/
   ├── monitoring/
   ├── shared/          # Shared utilities
   └── k8s/             # Kubernetes manifests
   ```

3. **Implement Staking Keeper:**
   - Watch for deposit events
   - Trigger batching at 200k threshold
   - Execute stake to validator
   - Error handling with exponential backoff

4. **Implement Rewards Keeper:**
   - Scheduled job (configurable interval)
   - Claim rewards from validators
   - Update exchange rate
   - Distribute protocol fees

5. **Implement Withdrawal Keeper:**
   - Monitor withdrawal queue
   - Process ready withdrawals
   - Manage liquidity buffer

6. **Implement Monitoring Bot:**
   - Validator health checks
   - TVL tracking
   - Prometheus metrics export
   - Alert integration (configurable)

7. **Add tests (MANDATORY):**
   - Unit tests for each bot (80%+ coverage)
   - Integration tests with mocked contracts
   - Run: `npm test` in each bot directory

## TECH STACK
- TypeScript/Node.js (ESM modules)
- AztecJS for chain interaction (NOT viem/ethers)
- BullMQ for job scheduling
- Prometheus for metrics
- Jest for testing

## VERIFICATION CHECKLIST (ALL MUST PASS)
- [ ] `npm run lint` - No linting errors in any bot
- [ ] `npm run type-check` - TypeScript compiles
- [ ] `npm test` - All tests pass (80%+ coverage)
- [ ] Each bot starts without errors (local mock mode)
- [ ] Kubernetes manifests valid: `kubectl apply --dry-run=client -f k8s/`
- [ ] README in bots/ with setup instructions
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Bots created and their status
2. Test coverage for each bot
3. Dependencies used (list packages)
4. Any Aztec SDK gaps discovered
5. Files created
```

---

## PROMPT 3: Testnet Validation Agent

**Dependencies:** None
**Run Immediately:** Yes
**Testing Environment:** LOCAL FIRST (2 days), then devnet (2 weeks)
**Estimated Time:** 40+ hours (includes 2-week monitoring)

```text
You are a DevOps engineer validating Aztec staking assumptions.

## CONTEXT
- Several critical assumptions are unverified (see ASSUMPTIONS.md)
- Need to measure: unbonding period, validator costs, gas costs, epoch timing
- Results will update break-even calculations in ECONOMICS.md

## CRITICAL: LOCAL-FIRST VALIDATION
1. START with local sandbox to verify tooling works
2. Run local tests for at least 2 days before devnet
3. Local sandbox: `aztec start --sandbox`
4. Fork mode: `aztec start --fork https://next.devnet.aztec-labs.com`

## YOUR TASKS
1. **Pre-flight (LOCAL ONLY):**
   - Install Aztec tooling locally
   - Start local sandbox
   - Deploy a test contract to local sandbox
   - Verify you can query block data locally

2. **Local Validation (Days 1-2):**
   - Deploy test contracts to local sandbox
   - Execute 100+ transactions locally
   - Measure gas consumption patterns
   - Document epoch timing (block intervals)

3. **Devnet Validation (Days 3-14):**
   - ONLY proceed after local tests pass
   - Connect to https://next.devnet.aztec-labs.com
   - Execute TASK-002: Research validator requirements
   - Execute TASK-003: Measure real transaction costs
   - Execute TASK-004: Research unbonding period
   - Execute TASK-006: Research slashing mechanics

4. **Cost Tracking (2 weeks):**
   - If running validator, track actual resource usage
   - CPU, RAM, disk, bandwidth daily metrics
   - Calculate actual vs. estimated costs

5. **Update Documentation:**
   - ASSUMPTIONS.md Validation Log with all findings
   - Each finding: date, method, result, artifacts/links
   - Mark verified/unverified with evidence

## VALIDATION OUTPUT FORMAT
For each assumption, provide:
```
### [Assumption Name]
- **Status:** ✅ VERIFIED / ❌ UNVERIFIED / ⚠️ PARTIALLY VERIFIED
- **Method:** [How you tested - local sandbox / devnet / docs review]
- **Result:** [Specific value measured]
- **Evidence:** [Links to logs, tx hashes, screenshots]
- **Date:** [YYYY-MM-DD]
- **Impact if wrong:** [What breaks if this assumption is wrong]
```

## VERIFICATION CHECKLIST
- [ ] Local sandbox working before devnet tests
- [ ] Each assumption has evidence (not just claims)
- [ ] ASSUMPTIONS.md Validation Log updated with dated entries
- [ ] Gas cost spreadsheet created
- [ ] All measurements repeatable (commands documented)
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. For each assumption: Status + evidence
2. Cost spreadsheet location
3. Blockers encountered
4. Recommendations based on findings
```

---

## PROMPT 4: Security Documentation Agent

**Dependencies:** Contracts (can start threat model immediately)
**Run Immediately:** Threat model yes, NatSpec after contracts
**Testing Environment:** N/A (documentation only, but review LOCAL artifacts)
**Estimated Time:** 12-16 hours

```text
You are a security engineer preparing the Aztec staking protocol for audits.

## CONTEXT
- 4 contracts compiled, 3 in development
- No security documentation exists yet
- Need 2 external audits planned
- Bug bounty to launch on Immunefi

## YOUR TASKS
1. **Read all existing contracts:**
   - staking/aztec/contracts/*/src/main.nr
   - Understand access control patterns
   - Identify privileged functions

2. **Create SECURITY.md:**
   ```markdown
   # Security Documentation

   ## Trust Model
   - Admin: [powers, risks]
   - Bots: [powers, risks]
   - Validators: [powers, risks]
   - Users: [powers, risks]

   ## Assets at Risk
   - User AZTEC deposits
   - Staking rewards
   - stAZTEC token supply

   ## Threat Model
   | Threat | Likelihood | Impact | Mitigation |
   |--------|------------|--------|------------|

   ## Attack Vectors
   - Reentrancy
   - Integer overflow
   - Access control bypass
   - Oracle manipulation
   - Front-running

   ## Security Controls
   - [List implemented controls]
   ```

3. **Add NatSpec comments to ALL contracts:**
   ```noir
   /// @notice Brief description
   /// @dev Implementation details
   /// @param name Parameter description
   /// @return Return value description
   ```

4. **Create INVARIANTS.md:**
   - List ALL properties that must always hold
   - Example: "total_shares == sum(user_shares)"
   - Example: "exchange_rate >= initial_rate (no loss)"

5. **Create SECURITY-CHECKLIST.md:**
   - Reentrancy protection (CEI pattern)
   - Access control on privileged functions
   - Integer overflow checks
   - Input validation
   - Event emission for state changes

6. **Create BUG-BOUNTY-SCOPE.md:**
   - In-scope contracts
   - Out-of-scope (bots, frontend)
   - Severity definitions
   - Payout structure

## VERIFICATION CHECKLIST
- [ ] All contracts have NatSpec on every public function
- [ ] SECURITY.md covers all threat categories
- [ ] INVARIANTS.md testable (can write assertions)
- [ ] Checklist covers OWASP smart contract top 10
- [ ] Bug bounty scope clear and complete
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Documents created/updated
2. Critical risks identified
3. Missing security controls
4. Recommended pre-audit fixes
```

---

## PROMPT 5: Business Development Agent

**Dependencies:** None
**Run Immediately:** Yes
**Testing Environment:** N/A (research only)
**Estimated Time:** 8-12 hours

```text
You are a business development lead for the Aztec liquid staking protocol.

## CONTEXT
- First-mover opportunity in Aztec liquid staking
- Known competitor: Olla by Kryha (announced, not launched)
- Need DEX liquidity, lending integrations, wallet partnerships

## YOUR TASKS
1. **Execute TASK-007: Map Aztec DeFi surface area**
   - Research ALL Aztec-native DeFi protocols
   - Categories: DEX, Lending, Stablecoins, Wallets, Bridges
   - For each: Name, Status, Contact, Integration effort
   - Prioritize by: Day-1 viability, User reach, Technical effort

2. **Execute TASK-008: Liquidity bootstrap plan**
   - Define initial pools: stAZTEC/AZTEC
   - Estimate required depth for acceptable slippage (<2% on $10k trade)
   - Incentive options: points, LM, grants
   - Risk mitigation: thin liquidity, bank runs

3. **Execute TASK-009: Competitive intelligence**
   - Update ASSUMPTIONS.md Competitor Tracker
   - For Olla: Find repo/docs, timeline, approach
   - Search for unknown teams: Discord, Twitter, GitHub, grants
   - Track signals: job postings, testnet deployments, announcements

4. **Create PARTNERSHIPS.md:**
   ```markdown
   # Partnership Targets

   ## Tier 1 (Launch Critical)
   | Partner | Type | Contact | Status | Notes |

   ## Tier 2 (Post-Launch)
   | Partner | Type | Contact | Status | Notes |

   ## Outreach Templates
   ### DEX Listing Request
   ### Lending Collateral Proposal
   ### Wallet Integration Request

   ## Integration Requirements
   - Technical requirements for each type
   - Timeline expectations
   ```

## VERIFICATION CHECKLIST
- [ ] 10+ integration targets identified with contact info
- [ ] Liquidity bootstrap plan has specific numbers
- [ ] Competitor tracker updated with evidence
- [ ] Outreach templates ready to send
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Top 5 priority partners
2. Liquidity requirements calculated
3. Competitive intel updates
4. Documents created
```

---

## PROMPT 6: Legal/Entity Setup Agent

**Dependencies:** None
**Run Immediately:** Yes
**Testing Environment:** N/A (research only)
**Estimated Time:** 6-10 hours

```text
You are the COO researching legal and operational foundations.

## CONTEXT
- No legal entity exists
- Planning to raise $500k-$750k seed
- Operating a DeFi protocol (regulatory considerations)

## CRITICAL DISCLAIMER
This is RESEARCH only. All recommendations require lawyer review.
Mark items requiring legal counsel clearly.

## YOUR TASKS
1. **Research entity structures:**
   - Delaware C-Corp: Pros, cons, process, costs
   - Cayman Foundation: Pros, cons, process, costs
   - Swiss Foundation: Pros, cons, process, costs
   - DAO wrapper options: Legal status, limitations

2. **Regulatory analysis:**
   - Howey Test analysis for stAZTEC
   - Staking rewards tax treatment (US, EU, APAC)
   - Money transmission considerations
   - Jurisdiction ranking by friendliness

3. **Create LEGAL-OPERATIONAL.md:**
   ```markdown
   # Legal & Operational Setup

   ## Entity Structure Recommendation
   - Recommended: [X]
   - Rationale: [Why]
   - REQUIRES LAWYER REVIEW: [List items]

   ## Formation Checklist
   - [ ] Step 1: ...
   - [ ] Step 2: ...

   ## Regulatory Analysis
   - Token classification: [Analysis]
   - REQUIRES LAWYER REVIEW: [Specific questions]

   ## Hiring Templates
   - Employment agreement template
   - Contractor agreement template
   - REQUIRES LAWYER REVIEW: [Which clauses]

   ## SAFE Terms Template
   - Standard terms
   - Recommended cap: $X-$Y
   - REQUIRES LAWYER REVIEW: [Which terms]
   ```

## VERIFICATION CHECKLIST
- [ ] All recommendations have rationale
- [ ] Items requiring lawyer review clearly marked
- [ ] Multiple jurisdictions compared
- [ ] Formation steps are actionable
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Recommended entity structure with rationale
2. List of items requiring lawyer review
3. Formation timeline estimate
4. Documents created
```

---

## PROMPT 7: Frontend Development Agent

**Dependencies:** Contract interfaces (mock first, then integrate)
**Run Immediately:** Can mock, integrate after contracts
**Testing Environment:** LOCAL MOCK DATA FIRST, then local sandbox
**Estimated Time:** 16-24 hours

```text
You are a frontend engineer building the staking protocol interface.

## CONTEXT
- No frontend exists yet
- Target: simple deposit/withdraw UI
- Must work with Aztec wallets/PXE (NOT MetaMask)

## CRITICAL: LOCAL-FIRST DEVELOPMENT
1. Build with MOCK DATA first (no chain connection)
2. Add local sandbox integration after mocks work
3. DO NOT connect to devnet until local tests pass
4. Use: `aztec start --sandbox` for local testing

## YOUR TASKS
1. **Pre-flight research:**
   - Read Aztec wallet/PXE documentation
   - Understand authentication flow (NOT like MetaMask)
   - Find example frontend code in Aztec repos

2. **Create frontend project:**
   ```
   staking/aztec/frontend/
   ├── src/
   │   ├── app/           # Next.js pages
   │   ├── components/    # React components
   │   ├── hooks/         # Custom hooks
   │   ├── lib/           # Utilities
   │   └── mocks/         # Mock data for development
   ├── public/
   ├── package.json
   └── README.md
   ```

3. **Implement pages (MOCK DATA FIRST):**
   - / (landing with TVL, APR stats - mocked)
   - /stake (deposit form - mock success)
   - /unstake (withdrawal form - mock success)
   - /portfolio (balances - mocked data)

4. **Implement components:**
   - WalletConnect (Aztec-compatible, mock in dev)
   - StakeForm (amount input, submit)
   - UnstakeForm (amount input, queue position)
   - PortfolioView (balances, pending)
   - TransactionStatus (pending, confirmed, failed)

5. **Add tests (MANDATORY):**
   - Component tests for each component
   - Mock the Aztec SDK
   - Test user flows with mocks
   - Run: `npm test`

6. **Development modes:**
   - `npm run dev:mock` - Mock data only
   - `npm run dev:local` - Local sandbox
   - `npm run dev:devnet` - Devnet (after local works)

## TECH STACK
- Next.js 14 (App Router)
- TailwindCSS
- AztecJS (NOT wagmi/viem)
- React Query for data fetching
- Jest + React Testing Library

## VERIFICATION CHECKLIST
- [ ] `npm run lint` - No errors
- [ ] `npm run type-check` - TypeScript compiles
- [ ] `npm test` - All tests pass
- [ ] `npm run build` - Production build succeeds
- [ ] App works with mock data (no chain needed)
- [ ] README has setup instructions
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Pages created and status
2. Components created
3. Aztec SDK methods needed (found/missing)
4. Test coverage
5. Any blockers
```

---

## PROMPT 8: Marketing/Community Agent

**Dependencies:** None
**Run Immediately:** Yes
**Testing Environment:** N/A (documentation only)
**Estimated Time:** 6-10 hours

```text
You are the CMO building community and marketing for the Aztec staking protocol.

## CONTEXT
- No social media presence
- No community yet
- Need awareness before launch
- Competitor Olla announced at Devconnect

## YOUR TASKS
1. **Create MARKETING-PLAN.md:**
   ```markdown
   # Marketing Plan

   ## Brand Positioning
   - Tagline: [Compelling one-liner]
   - Key differentiators: [3 points]
   - Target audience: [Primary, secondary]

   ## Messaging Framework
   | Audience | Pain Point | Our Solution | Proof Point |

   ## Content Calendar (3 months)
   | Week | Content Type | Topic | Channel | Status |

   ## Channel Strategy
   - Twitter: [Strategy]
   - Discord: [Strategy]
   - Aztec Forums: [Strategy]
   - Blog: [Strategy]
   ```

2. **Draft Twitter launch thread (10 tweets):**
   - Hook, problem, solution, differentiation, CTA
   - Save as: staking/aztec/docs/LAUNCH-THREAD.md

3. **Draft Discord announcement:**
   - Short version for Aztec Discord
   - Save as: staking/aztec/docs/DISCORD-ANNOUNCEMENT.md

4. **Create content templates:**
   - Educational thread template
   - Feature announcement template
   - Weekly update template

5. **List influencer/KOL targets:**
   - Aztec ecosystem (devs, community)
   - DeFi liquid staking (Lido/Rocket Pool voices)
   - Privacy/ZK community
   - Save as section in MARKETING-PLAN.md

6. **Draft Aztec Foundation outreach:**
   - Request for ecosystem support
   - Grant application outline (if applicable)

## VERIFICATION CHECKLIST
- [ ] Messaging consistent with EXECUTIVE-SUMMARY.md
- [ ] Numbers match ECONOMICS.md
- [ ] No unverified claims (per .cursorrules #52)
- [ ] Content calendar is realistic
- [ ] All templates ready to use
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Documents created
2. Key messages defined
3. Influencer target list (5+ names)
4. Content calendar summary
```

---

## Coordination Protocol

### Handoff Between Agents

When completing work, update these files:
1. **TASKS.md** - Mark completed tasks
2. **ASSUMPTIONS.md** - Add validation results
3. **contracts/AGENT_HANDOFF.md** - Update for contract work

### Conflict Resolution

If two agents modify the same file:
1. First agent commits and pushes
2. Second agent pulls, merges, resolves conflicts
3. Both update TASKS.md with status

### Definition of Done

A deliverable is complete when:
1. All checklist items pass
2. Multi-step review completed
3. Tests pass (if applicable)
4. Documentation updated
5. TASKS.md updated

---

**Last Updated:** December 27, 2025
