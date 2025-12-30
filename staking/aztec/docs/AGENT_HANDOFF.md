# Agent Handoff Guide - stAZTEC Protocol

**Created:** December 30, 2025  
**Purpose:** Clear instructions for triggering and executing parallel agent work

---

## Quick Start

**To trigger the next group of agents:**
1. Open `docs/GAP_TASKS_AND_PROMPTS.md`
2. Find tasks marked 🔴 Open in the "Task Status Tracking" table
3. Copy the corresponding `PROMPT-AGENT-*` prompt
4. Assign to agent (AI assistant or team member)
5. Agent executes task and updates status to ✅ Complete

---

## Current Status

### ✅ Completed (Ready for Review)
- **TASK-GAP-014:** BD & Partnerships → See `MARKETING_AND_BD.md`
- **TASK-GAP-015:** Marketing & Community → See `MARKETING_AND_BD.md` + `LAUNCH_MATERIALS.md`

### 🔴 Ready to Start (P0 - Critical, Can Start Immediately)
- **TASK-GAP-002:** Team Hiring → Needs CEO/HR agent
- **TASK-GAP-003:** Assumption Validation → Needs DevOps/Technical agent
- **TASK-GAP-004:** Legal Entity → Needs Legal/COO agent

### 🟡 Blocked (P1 - High Priority, Needs Contracts ✅)
- **TASK-GAP-007:** Integration Tests → Needs contracts deployed to testnet
- **TASK-GAP-008:** Staking Bot → Needs contracts deployed
- **TASK-GAP-009:** Rewards Bot → Needs contracts deployed
- **TASK-GAP-010:** Withdrawal Bot → Needs contracts deployed
- **TASK-GAP-011:** Security Audit → Needs contracts complete
- **TASK-GAP-012:** Validator Deployment → Needs contracts deployed
- **TASK-GAP-013:** Frontend → Needs contracts deployed

---

## Next Group of Agents (Week 1 - P0 Critical)

These can start **immediately** and run **in parallel**:

### Agent 1: LEGAL/COO → TASK-GAP-004
**What they'll do:**
- Research legal entity structure (LLC vs Corp, jurisdiction)
- Create entity formation plan
- Research regulatory requirements (Howey test, OFAC/AML)
- Create legal structure document

**Trigger:** Copy `PROMPT-AGENT-LEGAL` from `GAP_TASKS_AND_PROMPTS.md` (line ~200)

**Deliverables:**
- `docs/LEGAL_STRUCTURE.md`
- `docs/ENTITY_FORMATION_PLAN.md`
- `docs/REGULATORY_ANALYSIS.md`

**Estimated Time:** 1-2 weeks

---

### Agent 2: VALIDATION/DEVOPS → TASK-GAP-003
**What they'll do:**
- Deploy contracts to Aztec testnet
- Measure unbonding period (stake → unstake → claim)
- Track validator costs (2 weeks of actual usage)
- Measure gas costs (100+ transactions)
- Research slashing mechanics
- Update `ASSUMPTIONS.md` with verified data

**Trigger:** Copy `PROMPT-AGENT-VALIDATION` from `GAP_TASKS_AND_PROMPTS.md` (line ~100)

**Deliverables:**
- Updated `docs/ASSUMPTIONS.md` with ✅ VERIFIED markers
- `docs/VALIDATION_RESULTS.md` with measurements
- Updated `docs/ECONOMICS.md` with validated numbers

**Estimated Time:** 2-3 weeks (includes 2-week monitoring period)

---

### Agent 3: CEO/HR → TASK-GAP-002
**What they'll do:**
- Create job descriptions (2 Noir engineers, 1 backend, 1 frontend, 1 DevOps)
- Define posting strategy (where to post, how to reach candidates)
- Create interview process
- Start candidate outreach

**Trigger:** Copy `PROMPT-AGENT-HIRING` from `GAP_TASKS_AND_PROMPTS.md` (line ~50)

**Deliverables:**
- `docs/JOB_DESCRIPTIONS.md`
- `docs/INTERVIEW_PROCESS.md`
- Candidate pipeline (at least 2 per role)

**Estimated Time:** 2-4 weeks (ongoing)

---

## Following Group (Week 2-3 - P1 High Priority)

These start **after contracts are deployed to testnet**:

### Agent 4: BOTS/BACKEND → TASK-GAP-008, GAP-009, GAP-010
**What they'll do:**
- Implement `staking-keeper` bot (batches deposits, stakes to validators)
- Implement `rewards-keeper` bot (claims rewards, updates exchange rate)
- Implement `withdrawal-keeper` bot (processes withdrawal queue)
- All 3 bots can be built in parallel

**Trigger:** Copy `PROMPT-AGENT-BOTS` from `GAP_TASKS_AND_PROMPTS.md` (line ~400)

**Deliverables:**
- `bots/staking-keeper/` (complete implementation)
- `bots/rewards-keeper/` (complete implementation)
- `bots/withdrawal-keeper/` (complete implementation)
- All bots tested and running on testnet

**Estimated Time:** 2-3 weeks (parallel work)

---

### Agent 5: FRONTEND → TASK-GAP-013
**What they'll do:**
- Build Next.js frontend with Aztec wallet integration
- Implement deposit, withdraw, view balance flows
- Create responsive UI with TailwindCSS
- Deploy to Vercel

**Trigger:** Copy `PROMPT-AGENT-FRONTEND` from `GAP_TASKS_AND_PROMPTS.md` (line ~600)

**Deliverables:**
- `frontend/` directory with complete Next.js app
- Deployed to Vercel (staging URL)
- User onboarding flow complete

**Estimated Time:** 2-3 weeks

---

### Agent 6: INTEGRATION → TASK-GAP-007
**What they'll do:**
- Write integration tests (end-to-end flows)
- Test deposit → stake → rewards → withdraw cycle
- Test edge cases (large deposits, withdrawals, slashing)
- Create testnet deployment scripts

**Trigger:** Copy `PROMPT-AGENT-INTEGRATION` from `GAP_TASKS_AND_PROMPTS.md` (line ~300)

**Deliverables:**
- `test/integration/` directory with E2E tests
- Testnet deployment scripts
- All tests passing

**Estimated Time:** 1-2 weeks

---

### Agent 7: SECURITY → TASK-GAP-011
**What they'll do:**
- Engage security audit firm (Trail of Bits, OpenZeppelin, etc.)
- Coordinate audit process
- Review audit findings
- Create remediation plan

**Trigger:** Copy `PROMPT-AGENT-SECURITY` from `GAP_TASKS_AND_PROMPTS.md` (line ~700)

**Deliverables:**
- Audit report (external)
- Remediation plan
- All critical/high issues fixed

**Estimated Time:** 8-16 weeks (external audit timeline)

---

## How to Use Prompts

### Step 1: Find the Prompt
Open `docs/GAP_TASKS_AND_PROMPTS.md` and search for `PROMPT-AGENT-[NAME]`

### Step 2: Copy the Prompt
Copy the entire prompt block (from ````text` to ````)

### Step 3: Assign to Agent
- **AI Assistant:** Paste prompt into new conversation
- **Team Member:** Send prompt via email/Slack with context

### Step 4: Agent Executes
Agent follows prompt instructions, creates deliverables, runs verification commands

### Step 5: Update Status
Update `GAP_TASKS_AND_PROMPTS.md` Task Status Tracking table:
- Change 🔴 Open → ✅ Complete
- Add completion date
- Mark verification ✅

---

## Verification Process

Each prompt includes `VERIFICATION COMMANDS` - bash commands that prove completion:

```bash
# Example from TASK-GAP-003
grep -q "✅ VERIFIED" /workspace/staking/aztec/docs/ASSUMPTIONS.md && echo "✅ Verified" || echo "❌ Not verified"
```

**Run these commands** after agent completes work to verify deliverables exist and meet criteria.

---

## Parallelization Strategy

**Week 1 (All Parallel - No Dependencies):**
```
┌─────────────────┐
│ Agent LEGAL     │ → TASK-GAP-004
├─────────────────┤
│ Agent VALIDATION│ → TASK-GAP-003
├─────────────────┤
│ Agent HIRING    │ → TASK-GAP-002
└─────────────────┘
```

**Week 2-3 (After Contracts Deployed):**
```
┌─────────────────┐
│ Agent BOTS      │ → TASK-GAP-008, 009, 010 (parallel)
├─────────────────┤
│ Agent FRONTEND  │ → TASK-GAP-013
├─────────────────┤
│ Agent INTEGRATION│ → TASK-GAP-007
├─────────────────┤
│ Agent SECURITY  │ → TASK-GAP-011 (long timeline)
└─────────────────┘
```

---

## Key Documents Reference

| Document | Purpose | When to Use |
|----------|---------|-------------|
| `GAP_TASKS_AND_PROMPTS.md` | All tasks + prompts | **Start here** - find tasks and prompts |
| `MARKETING_AND_BD.md` | Marketing + BD strategy | Reference for marketing/BD work |
| `LAUNCH_MATERIALS.md` | Copy-paste content | Use for launch announcements |
| `STRATEGIC-GAP-ANALYSIS.md` | Gap analysis | Context for why tasks exist |
| `AGENT_INDEX.md` | Quick reference | Overview of all docs |

---

## Next Steps

1. **Review completed work:** Check `MARKETING_AND_BD.md` and `LAUNCH_MATERIALS.md`
2. **Start P0 tasks:** Assign LEGAL, VALIDATION, and HIRING agents (can start immediately)
3. **Wait for contracts:** Once contracts deployed to testnet, start P1 tasks (BOTS, FRONTEND, INTEGRATION)
4. **Track progress:** Update `GAP_TASKS_AND_PROMPTS.md` Task Status Tracking table weekly

---

**Document Owner:** Project Lead  
**Last Updated:** December 30, 2025  
**Related:** `GAP_TASKS_AND_PROMPTS.md` (source of all prompts)
