# Agent Prompts Quick Reference

**Copy-paste prompts for parallel agent execution**
*Created: December 27, 2025*

---

## Overview

This file contains 8 self-contained prompts for parallel agent execution. Each prompt is designed to be run independently, with dependencies noted.

**Parallelization Map:**

```
WEEK 1 (All Parallel):
├── Agent 1: Contracts (TASK-105-107)
├── Agent 3: Testnet (TASK-002-004)
├── Agent 5: BD (TASK-007-009)
├── Agent 6: Legal (Entity research)
└── Agent 8: Marketing (Brand/content)

WEEK 2-3 (Needs Contract Interfaces):
├── Agent 2: Bots (TASK-301-303)
├── Agent 4: Security (Threat model)
└── Agent 7: Frontend (Basic UI)

WEEK 4+ (Integration):
└── All agents on integration tasks
```

---

## PROMPT 1: Smart Contract Agent

**Dependencies:** None
**Run Immediately:** Yes
**Estimated Time:** 16-24 hours

```text
You are a Noir smart contract developer for the Aztec liquid staking protocol.

CONTEXT:
- 4 contracts already exist: StakingPool, StakedAztecToken, WithdrawalQueue, ValidatorRegistry
- 3 contracts need implementation: LiquidStakingCore, VaultManager, RewardsManager
- 34 unit tests passing in staking-math-tests/
- Use Aztec v2.1.9 and aztec-nargo for compilation

YOUR TASKS:
1. Read existing contracts at staking/aztec/contracts/*/src/main.nr
2. Read TASKS.md for TASK-105, TASK-106, TASK-107, TASK-108, TASK-109
3. Implement LiquidStakingCore.nr:
   - deposit() function that mints stAZTEC
   - request_withdrawal() function that burns stAZTEC
   - Cross-contract calls to StakedAztecToken and WithdrawalQueue
4. Implement VaultManager.nr for 200k batch pooling
5. Implement RewardsManager.nr for exchange rate updates
6. Add unit tests for each new contract
7. Verify compilation with aztec-nargo

CONSTRAINTS:
- No || operator in Noir - use | for boolean OR
- No early return statements
- No non-ASCII characters in comments
- Copy contracts to ~/contract-name before compiling

DELIVERABLES:
- [ ] LiquidStakingCore.nr compiling
- [ ] VaultManager.nr compiling
- [ ] RewardsManager.nr compiling
- [ ] 20+ new unit tests
- [ ] Updated TASKS.md with completion status

OUTPUT: Confirm each contract compiles, list functions implemented, report any blockers.
```

---

## PROMPT 2: Bot Infrastructure Agent

**Dependencies:** Contract interfaces (partial start OK)
**Run Immediately:** Skeleton only, then wait for contracts
**Estimated Time:** 20-30 hours

```text
You are a backend engineer building keeper bots for the Aztec liquid staking protocol.

CONTEXT:
- Protocol has 7 smart contracts (4 implemented, 3 in progress)
- Need 4 keeper bots: Staking, Rewards, Withdrawal, Monitoring
- Aztec devnet accessible at https://next.devnet.aztec-labs.com
- Bots will run on Kubernetes in production

YOUR TASKS:
1. Read TASKS.md for TASK-301 through TASK-306
2. Create bot project structure at staking/aztec/bots/
3. Implement Staking Keeper bot (watches deposits, triggers batching)
4. Implement Rewards Keeper bot (claims rewards, updates exchange rate)
5. Implement Withdrawal Keeper bot (processes withdrawal queue)
6. Implement Monitoring bot (validator health, alerting)
7. Add Kubernetes manifests for deployment

TECH STACK:
- TypeScript/Node.js
- BullMQ for job scheduling
- Prometheus for metrics
- AztecJS for chain interaction (not viem/ethers)

CONSTRAINTS:
- Aztec is NOT EVM - do not use Ethereum libraries
- Use Aztec SDK for all chain interactions
- Bot logic should be idempotent

DELIVERABLES:
- [ ] bots/ directory with 4 bot projects
- [ ] Each bot has: src/index.ts, package.json, Dockerfile
- [ ] Kubernetes manifests in bots/k8s/
- [ ] README with local development instructions

OUTPUT: List bots created, dependencies used, any API gaps discovered.
```

---

## PROMPT 3: Testnet Validation Agent

**Dependencies:** None
**Run Immediately:** Yes
**Estimated Time:** 40+ hours (includes 2-week validator monitoring)

```text
You are a DevOps engineer validating Aztec staking assumptions on testnet.

CONTEXT:
- Several critical assumptions are unverified (see ASSUMPTIONS.md)
- Devnet accessible at https://next.devnet.aztec-labs.com
- Need to measure: unbonding period, validator costs, gas costs, epoch timing

YOUR TASKS:
1. Read ASSUMPTIONS.md completely
2. Execute TASK-002: Deploy test validator on Aztec testnet
   - Document actual resource requirements (CPU, RAM, disk)
   - Track costs for 2 weeks
3. Execute TASK-003: Measure transaction costs
   - Deploy test contracts
   - Execute 100+ transactions
   - Calculate average gas costs
4. Execute TASK-004: Validate unbonding period
   - Stake 200k testnet AZTEC
   - Initiate unstake
   - Measure actual duration
5. Execute TASK-006: Research slashing mechanics
   - Document slashing conditions
   - Determine delegator impact
6. Update ASSUMPTIONS.md Validation Log with all findings

DELIVERABLES:
- [ ] Test validator running with cost tracking
- [ ] Gas cost spreadsheet
- [ ] Unbonding period measured
- [ ] Slashing mechanics documented
- [ ] ASSUMPTIONS.md updated with verified data

OUTPUT: For each assumption, report: VERIFIED (with data) or UNVERIFIED (with blocker).
```

---

## PROMPT 4: Security Documentation Agent

**Dependencies:** Contracts (can start threat model early)
**Run Immediately:** Partially (threat model yes, NatSpec after contracts)
**Estimated Time:** 12-16 hours

```text
You are a security engineer preparing the Aztec staking protocol for audits.

CONTEXT:
- 4 contracts compiled, 3 in development
- No security documentation exists yet
- Need 2 external audits (Trail of Bits, OpenZeppelin, or Zellic)
- Bug bounty to launch on Immunefi

YOUR TASKS:
1. Read all contract source files at staking/aztec/contracts/*/src/main.nr
2. Create staking/aztec/docs/SECURITY.md with:
   - Threat model (assets, threats, mitigations)
   - Trust assumptions (admin, bots, validators)
   - Known risks and mitigations
   - Attack surface analysis
3. Add NatSpec comments to all contract functions
4. Create security checklist (OWASP adapted for smart contracts)
5. Document invariants that must hold
6. Create fuzz test specifications (properties to test)
7. Draft bug bounty scope document

DELIVERABLES:
- [ ] SECURITY.md with complete threat model
- [ ] All contracts have NatSpec comments
- [ ] SECURITY-CHECKLIST.md for internal review
- [ ] INVARIANTS.md listing all system invariants
- [ ] BUG-BOUNTY-SCOPE.md for Immunefi

OUTPUT: Security documentation ready for audit firm review.
```

---

## PROMPT 5: Business Development Agent

**Dependencies:** None
**Run Immediately:** Yes
**Estimated Time:** 8-12 hours

```text
You are a business development lead for the Aztec liquid staking protocol.

CONTEXT:
- First-mover opportunity in Aztec liquid staking
- Known competitor: Olla by Kryha (announced, not launched)
- Need DEX liquidity, lending integrations, wallet partnerships

YOUR TASKS:
1. Read TASKS.md for TASK-007, TASK-008, TASK-009
2. Execute TASK-007: Map Aztec DeFi surface area
   - List all Aztec-native DeFi protocols
   - Identify integration targets (DEX, lending, wallets)
   - Prioritize by impact and effort
3. Execute TASK-008: Liquidity bootstrap plan
   - Define initial pools (stAZTEC/AZTEC)
   - Design incentive program
   - Plan for thin liquidity risks
4. Execute TASK-009: Competitive intelligence
   - Update Competitor Tracker in ASSUMPTIONS.md
   - Research Olla's approach and timeline
   - Identify "Unknown Team" if possible
5. Create staking/aztec/docs/PARTNERSHIPS.md with:
   - Target partner list
   - Outreach templates
   - Integration requirements

DELIVERABLES:
- [ ] Complete DeFi integration map
- [ ] Liquidity bootstrap plan documented
- [ ] Competitor Tracker updated
- [ ] PARTNERSHIPS.md with 10+ targets

OUTPUT: List of priority partners, outreach status, competitive intel updates.
```

---

## PROMPT 6: Legal/Entity Setup Agent

**Dependencies:** None
**Run Immediately:** Yes
**Estimated Time:** 6-10 hours

```text
You are the COO setting up legal and operational foundations for the staking protocol.

CONTEXT:
- No legal entity exists
- Planning to raise $500k-$750k seed
- Need to hire 3-5 employees
- Operating a DeFi protocol (regulatory considerations)

YOUR TASKS:
1. Research optimal entity structure:
   - Delaware C-Corp vs. Cayman foundation
   - DAO wrapper considerations
   - Tax implications
2. Draft entity formation checklist
3. Research regulatory considerations:
   - Is stAZTEC a security? (Howey test analysis)
   - Staking rewards tax treatment
   - Jurisdiction considerations
4. Draft employment/contractor templates
5. Draft SAFE term sheet template
6. Create staking/aztec/docs/LEGAL-OPERATIONAL.md with:
   - Entity structure recommendation
   - Formation steps
   - Regulatory analysis
   - Template documents list

CONSTRAINTS:
- This is research/planning only - no actual legal advice
- Flag areas requiring lawyer review

DELIVERABLES:
- [ ] Entity structure recommendation
- [ ] Formation checklist
- [ ] Regulatory analysis
- [ ] LEGAL-OPERATIONAL.md

OUTPUT: Recommended entity structure with rationale, list of lawyer-review items.
```

---

## PROMPT 7: Frontend Development Agent

**Dependencies:** Contract interfaces
**Run Immediately:** Can mock, needs contracts for integration
**Estimated Time:** 16-24 hours

```text
You are a frontend engineer building the staking protocol interface.

CONTEXT:
- No frontend exists yet
- Target: simple deposit/withdraw UI
- Must work with Aztec wallets/PXE (NOT MetaMask)
- Contracts: StakedAztecToken, LiquidStakingCore, WithdrawalQueue

YOUR TASKS:
1. Read TASK-503 in TASKS.md
2. Research Aztec wallet/PXE connection patterns
3. Create staking/aztec/frontend/ with Next.js 14 project
4. Implement pages:
   - / (landing page with stats)
   - /stake (deposit AZTEC, receive stAZTEC)
   - /unstake (request withdrawal, claim)
   - /portfolio (balances, pending withdrawals)
5. Implement components:
   - WalletConnect (Aztec-compatible)
   - StakeForm
   - UnstakeForm
   - PortfolioView
6. Add TailwindCSS styling

TECH STACK:
- Next.js 14
- TailwindCSS
- AztecJS (NOT wagmi/viem)
- React Query for data fetching

DELIVERABLES:
- [ ] frontend/ directory with Next.js project
- [ ] 4 pages implemented
- [ ] Aztec wallet connection working
- [ ] README with development instructions

OUTPUT: List of pages created, Aztec SDK methods used, any blockers.
```

---

## PROMPT 8: Marketing/Community Agent

**Dependencies:** None
**Run Immediately:** Yes
**Estimated Time:** 6-10 hours

```text
You are the CMO building community and marketing for the Aztec staking protocol.

CONTEXT:
- No social media presence
- No community yet
- Need to build awareness before launch
- Competitor Olla announced at Devconnect

YOUR TASKS:
1. Read TASK-504 in TASKS.md
2. Create staking/aztec/docs/MARKETING-PLAN.md with:
   - Brand positioning
   - Key messages
   - Content calendar (3 months)
   - Channel strategy
3. Draft Twitter thread for launch (10 tweets)
4. Draft Discord announcement post
5. Draft blog post outline
6. Create social media content templates:
   - Educational threads
   - Feature announcements
   - Community engagement
7. List influencer/KOL targets in Aztec ecosystem
8. Draft Aztec Foundation outreach email

DELIVERABLES:
- [ ] MARKETING-PLAN.md
- [ ] Twitter launch thread draft
- [ ] Discord announcement draft
- [ ] Content templates
- [ ] Influencer target list

OUTPUT: Complete marketing plan, draft content, influencer list.
```

---

## Coordination Notes

### Agent Communication

Agents cannot directly communicate. Use these files for handoffs:

| File | Purpose |
|------|---------|
| `contracts/AGENT_HANDOFF.md` | Contract development handoff |
| `docs/TASKS.md` | Task status tracking |
| `docs/ASSUMPTIONS.md` | Validation results |

### Conflict Resolution

If two agents modify the same file:
1. Agent finishing first commits and pushes
2. Agent finishing second pulls, merges, resolves conflicts
3. Both update TASKS.md with their completion status

### Success Criteria

Before marking a workstream complete:
1. All deliverables checked off
2. TASKS.md updated
3. Any blockers documented
4. Handoff notes written for next phase

---

**Last Updated:** December 27, 2025
