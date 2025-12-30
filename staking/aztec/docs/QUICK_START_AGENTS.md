# Quick Start Guide for Agents

**Last Updated:** December 30, 2025  
**Purpose:** Fast onboarding for agents picking up work

---

## 🚀 Start Here

1. **Read:** `docs/GAP_TASKS_AND_PROMPTS.md` - See all tasks and prompts
2. **Pick a task** from the task list
3. **Copy the prompt** for your task
4. **Run verification commands** before marking complete
5. **Update task status** in tracking table

---

## Available Tasks by Priority

### P0 Critical (Start Immediately)

| Task | Agent Prompt | Can Start | Blocks |
|------|--------------|-----------|--------|
| **GAP-002: Team Hiring** | PROMPT-AGENT-HIRING | ✅ Now | Everything |
| **GAP-003: Assumption Validation** | PROMPT-AGENT-VALIDATION | ✅ Now | Business model |
| **GAP-004: Legal Entity** | PROMPT-AGENT-LEGAL | ✅ Now | Fundraising |

### P1 High Priority (After Contracts ✅)

| Task | Agent Prompt | Can Start | Blocks |
|------|--------------|-----------|--------|
| **GAP-007: Integration Tests** | PROMPT-AGENT-INTEGRATION | ✅ Now | Audit, Mainnet |
| **GAP-008: Staking Bot** | PROMPT-AGENT-BOTS | ✅ Now | Testnet |
| **GAP-009: Rewards Bot** | PROMPT-AGENT-BOTS | ✅ Now | Testnet |
| **GAP-010: Withdrawal Bot** | PROMPT-AGENT-BOTS | ✅ Now | Testnet |
| **GAP-011: Security Audit** | PROMPT-AGENT-SECURITY | ✅ Now | Mainnet |
| **GAP-012: Validators** | PROMPT-AGENT-VALIDATORS | ⚠️ After GAP-003 | Testnet |
| **GAP-013: Frontend** | PROMPT-AGENT-FRONTEND | ✅ Now | Users |

### P2 Medium Priority (Can Start Now)

| Task | Agent Prompt | Can Start | Blocks |
|------|--------------|-----------|--------|
| **GAP-014: BD & Partnerships** | PROMPT-AGENT-BD | ✅ Now | Liquidity |
| **GAP-015: Marketing** | PROMPT-AGENT-MARKETING | ✅ Now | Users |
| **GAP-016: Operations** | PROMPT-AGENT-OPS | ⚠️ After bots | Production |
| **GAP-017: Insurance Fund** | PROMPT-AGENT-INSURANCE | ✅ Now | Risk |

---

## Parallelization Opportunities

**Week 1 (All Can Run in Parallel):**
- Agent LEGAL (GAP-004)
- Agent VALIDATION (GAP-003)
- Agent BD (GAP-014)
- Agent MARKETING (GAP-015)

**Week 2-3 (After Contracts ✅):**
- Agent BOTS (GAP-008, GAP-009, GAP-010) - All 3 bots in parallel
- Agent FRONTEND (GAP-013)
- Agent INTEGRATION (GAP-007)
- Agent SECURITY (GAP-011)

---

## Verification Before Completion

**Every agent must:**

1. **Run verification commands** from your prompt
2. **Check all deliverables exist** (`test -f` commands)
3. **Update task status** in `docs/GAP_TASKS_AND_PROMPTS.md`
4. **Update gap status** in `docs/STRATEGIC-GAP-ANALYSIS.md` Part 12

**Example:**
```bash
# After completing your task, run:
cd /workspace/staking/aztec
# Run verification commands from your prompt
# Update tracking tables
# Commit changes
```

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `docs/GAP_TASKS_AND_PROMPTS.md` | **Tasks and prompts** (start here) |
| `docs/STRATEGIC-GAP-ANALYSIS.md` | Gap analysis and tracking |
| `docs/AGENT-PROMPTS-QUICKREF.md` | Additional prompts (8 total) |
| `PARALLEL_WORK_HANDOFF.md` | Frontend + bot specific prompts |
| `AGENT_INDEX.md` | Quick reference |

---

## Common Commands

```bash
# Verify contracts (must pass)
cd /workspace/staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 64 tests passed ✅

# Check gap status
grep -q "✅\|🔴\|🟡" /workspace/staking/aztec/docs/STRATEGIC-GAP-ANALYSIS.md && echo "✅ Gap tracking active"

# Update task status (edit docs/GAP_TASKS_AND_PROMPTS.md)
# Change status from 🔴 Open to ✅ Complete
```

---

**Questions?** Check `docs/GAP_TASKS_AND_PROMPTS.md` for your specific task and prompt.
