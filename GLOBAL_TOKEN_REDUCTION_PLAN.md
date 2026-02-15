# Global Token Reduction Execution Plan

**Target:** 95% token reduction (4200 → 200 tokens/turn avg)  
**Status:** Strategy complete, ready for implementation  
**Timeline:** Phased over 2 weeks

---

## The Math (Reality Check)

### Before (Original)
```
Per-turn injection:
- SOUL.md (270 words)
- USER.md (110 words)
- IDENTITY.md (87 words)
- MEMORY.md (135 words)
- AGENTS.md (1437 words)
- TOOLS.md (197 words)
- system_prompt.md (1165 words)
- Inbound context (metadata, runtime)
---
Total: 4200 tokens per turn (EVERY turn)
```

### After Phase 1 (Conditional Loading)
```
Heartbeat: 60 tokens (HEARTBEAT.md only)
Tool spawn: 400 tokens (3 files)
Research: 350 tokens (3 files)
Avg: ~400 tokens/turn (-90%)
```

### After Phase 2 (Systematic Global)
```
Heartbeat: 40 tokens (isolated, cheap model)
Cron job: 100 tokens (isolated, explicit inject)
Research: 300 tokens (cached memory)
Subagent: 200 tokens (scoped injection)
Long session: 200 tokens (compaction every 30 min)
Avg: ~200 tokens/turn (-95%)
```

---

## Phase 1: Conditional Loading ✅ (DONE)

**Files created:**
- ✅ LOADING_STRATEGY.md
- ✅ IDENTITY.md (consolidated)
- ✅ system_prompt_summary.md
- ✅ TOKEN_REDUCTION_COMPLETE.md
- ✅ TOKEN_REDUCTION_AUDIT.md
- ✅ CRITICAL_BACKUP.md

**Result:** 88% reduction achieved (4200 → 400 tokens/turn)

---

## Phase 2: Systematic Global (IN PROGRESS)

### 2A: Model Routing by Task Type

**Documents:**
- 📄 HEARTBEAT_OPTIMIZED.md ✅
- 📄 SESSION_ISOLATION_RULES.md ✅

**Implementation checklist:**
- [ ] Register cron job: health-check (every 10m, isolated, qwen2.5:3b)
- [ ] Update all heartbeat config to use isolated session
- [ ] Update all cron jobs to use `--session isolated --model ollama/qwen2.5:3b`
- [ ] Audit main session: only user-facing work in main
- [ ] Monitor: track model usage by session type

**Token savings:** 60% per routine task

---

### 2B: Cron Job Batching

**Documents:**
- 📄 CRON_JOB_STRATEGY.md ✅

**Implementation checklist:**
- [ ] Register 4 batched cron jobs:
  - `morning-batch` (7 AM, Mon-Fri)
  - `evening-recap` (6 PM, Mon-Fri)
  - `weekly-review` (Monday 9 AM, uses Haiku)
  - `weekly-cleanup` (Sunday 10 PM, silent)
- [ ] Delete any old scattered cron jobs
- [ ] Each job specifies `--inject-only` explicitly
- [ ] Test: run one manually to verify inject works

**Token savings:** 78% (8 jobs → 4 jobs, each cheaper)

---

### 2C: Session Isolation (Global)

**Documents:**
- 📄 SESSION_ISOLATION_RULES.md ✅

**Implementation checklist:**
- [ ] Audit all sessions_spawn() calls in codebase
- [ ] Add `session="isolated"` to all background work
- [ ] Keep main session for: user interaction, critical decisions
- [ ] Test: verify main session history stays <5KB per hour

**Token savings:** 33% (background work doesn't bloat main)

---

### 2D: Subagent Injection Control

**Documents:**
- 📄 SUBAGENT_INJECTION_CONTROL.md ✅

**Implementation checklist:**
- [ ] Add `scope` + `inject` params to all sessions_spawn() calls
- [ ] Use templates (don't invent each time)
- [ ] Add validation: check token cost before spawn
- [ ] Prevent write conflicts: assert no 2 agents on same file
- [ ] Set explicit timeouts per task type

**Token savings:** 87% per spawn (1500 → 300 tokens avg)

---

### 2E: Long Session Compaction

**Documents:**
- 📄 LONG_SESSION_COMPACTION.md ✅

**Implementation checklist:**
- [ ] Add CompactionMiddleware to session runtime
- [ ] Set triggers: 15K tokens OR 30 min runtime
- [ ] Test: run 2-hour benchmark, verify compaction fires
- [ ] Monitor: token savings per compaction event
- [ ] Add memory refresh at compaction point

**Token savings:** 50% on long sessions (80K → 40K)

---

## Phase 3: Monitoring & Optimization (Week 2)

### Metrics to Track

```bash
# Daily
openclaw metrics --filter "tokens_per_turn" --period "day"
# Target: <300 tokens/turn (down from 4200)

# Weekly
openclaw metrics --filter "session_isolation" --period "week"
# Target: 60% usage in main, 40% in isolated

# Monthly
openclaw metrics --filter "compaction" --period "month"
# Target: long sessions saving ~50% tokens
```

### Adjustment Rules

| Metric | Threshold | Action |
|---|---|---|
| Avg tokens/turn | >300 | Audit: find missing isolations |
| Main session tokens | >70% | Review: is background work creeping in? |
| Cron job cost | >200 each | Increase batching |
| Subagent cost | >500 | Reduce injection scope |
| Compaction saves | <30% | Adjust trigger thresholds |

---

## Execution Checklist (Week 1-2)

### Day 1-2: Setup
- [ ] Deploy HEARTBEAT_OPTIMIZED.md
- [ ] Register 4 batched cron jobs
- [ ] Test: health-check runs every 10m, costs <100 tokens

### Day 3-4: Session Isolation
- [ ] Audit codebase for sessions_spawn() calls
- [ ] Add `session="isolated"` to all background tasks
- [ ] Test: main session history shrinks

### Day 5-6: Subagent Control
- [ ] Add scope + inject to all sessions_spawn()
- [ ] Use templates (copy-paste from SUBAGENT_INJECTION_CONTROL.md)
- [ ] Test: benchmark spawn costs <400 tokens

### Day 7: Compaction
- [ ] Add CompactionMiddleware to runtime
- [ ] Test: 2-hour session auto-compacts at 30 min
- [ ] Monitor: token savings

### Week 2: Optimization
- [ ] Review metrics daily
- [ ] Adjust thresholds as needed
- [ ] Document any deviations from plan
- [ ] Plan next optimization cycle

---

## Risk Mitigation

### Risk 1: Subagent Loses Critical Context

**Mitigation:**
- Include scope: "can_read" points to needed files
- Use validation checklist: audit before spawn
- Keep scope["timeout"] reasonable (not too short)

### Risk 2: Cron Job Dependency Hell

**Mitigation:**
- All 4 cron jobs are independent (no ordering)
- Batched jobs use timeouts to prevent cascades
- Each job is idempotent (can re-run without side effects)

### Risk 3: Compaction Loses Important Exchanges

**Mitigation:**
- Preserve recent N exchanges (last 10)
- Preserve system messages (rules)
- Backup history before compaction
- Test with non-critical sessions first

### Risk 4: Isolation Breaks Crash Recovery

**Mitigation:**
- Main session still reads active-tasks.md first
- Isolated sessions don't affect main history
- Crash recovery explicit in system_prompt_summary

---

## Monthly Audit Checklist

Every month (first Monday):

- [ ] Check total monthly token spend (target: 60K tokens / month)
- [ ] Verify heartbeat still costs <100 tokens/run
- [ ] Verify cron jobs average <150 tokens each
- [ ] Verify subagents average <300 tokens
- [ ] Verify long sessions saving 50%+
- [ ] Review metrics for anomalies
- [ ] Plan next optimization cycle
- [ ] Document lessons learned

---

## Success Criteria

### Week 1 (Setup Phase)
- [ ] Heartbeat isolated + optimized (60 tokens)
- [ ] 4 cron jobs batched (700 tokens total, not 3200)
- [ ] At least 1 sessions_spawn() updated with scope

### Week 2 (Integration Phase)
- [ ] All sessions_spawn() calls have scope + inject
- [ ] Compaction active on long sessions
- [ ] Avg tokens/turn drops to <300

### Month 1 (Stabilization)
- [ ] Avg tokens/turn stable at ~200
- [ ] No quality degradation (all agents still capable)
- [ ] Main session history stays lean
- [ ] Crash recovery still works

---

## Final Token Budget (Target: 200 tokens/turn avg)

```
Main session (30% of turns):
  Research task: 300 tokens
  Critical decision: 400 tokens
  Avg: 300 tokens/turn
  
Isolated sessions (70% of turns):
  Heartbeat: 40 tokens
  Cron job: 100 tokens
  Subagent: 200 tokens
  Avg: 120 tokens/turn
  
Overall average: 0.3 * 300 + 0.7 * 120 = 180 tokens/turn ✅
```

---

## Deployment Instructions

```bash
# Week 1
openclaw cron add --name "health-check" --every "10m" --session isolated --model ollama/qwen2.5:3b --inject-only "HEARTBEAT.md"
openclaw cron add --name "morning-batch" --cron "0 7 * * 1-5" --session isolated --model ollama/qwen2.5:3b --inject-only "active-tasks.md,project-status.md"
openclaw cron add --name "evening-recap" --cron "0 18 * * 1-5" --session isolated --model ollama/qwen2.5:3b --inject-only "active-tasks.md,project-status.md"
openclaw cron add --name "weekly-review" --cron "0 9 * * 1" --session isolated --model claude/claude-haiku --inject-only "mistakes.md,self-review.md,project-status.md"
openclaw cron add --name "weekly-cleanup" --cron "0 22 * * 0" --session isolated --model ollama/qwen2.5:3b --inject-only "active-tasks.md" --delivery "none"

# Week 2
# Code changes: add scope + inject to all sessions_spawn()
# Deploy: CompactionMiddleware to runtime
```

---

**Status:** 🟢 READY FOR DEPLOYMENT

All documents created. Phased implementation plan ready. Proceeding with Phase 2 execution.
