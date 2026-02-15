# Session Isolation Rules (Global Application)

**Purpose:** Use isolated sessions for background work, keep main session lean  
**Impact:** Main session history stays small; faster context assembly; cheaper background work

---

## Session Type Rules

### Main Session (User-Facing, Expensive)

**Use when:**
- User is directly chatting (Telegram, Discord, etc.)
- Research/analysis that user requested
- Critical decisions requiring full context
- Crash recovery

**Load policy:**
- IDENTITY.md (always)
- MEMORY.md (condensed, if relevant)
- active-tasks.md (if resuming work)
- system_prompt_summary.md (always)

**Model:** Claude Haiku or Opus (depending on task)  
**History:** Preserved (long-term continuity)

**Example:**
```
User: "Summarize the benchmark results"
→ Use main session (user-facing)
→ Load: IDENTITY.md + MEMORY.md + active-tasks.md
→ History: kept for context
```

---

### Isolated Session (Background, Cheap)

**Use when:**
- Cron jobs (heartbeat, daily recap, etc.)
- Subagent spawns for specific tasks
- Analysis that doesn't need user interaction
- Batch processing

**Load policy:**
- ONLY what the job needs (explicit inject-only)
- No IDENTITY.md (infer from context)
- No full MEMORY.md (use active-tasks.md if needed)
- NO system_prompt.md (only summary, if any)

**Model:** ollama/qwen2.5:3b (fast, local, cheap)  
**History:** Fresh each run (no context bleed)

**Example:**
```
Cron: morning-batch
→ Use isolated session
→ Load: active-tasks.md ONLY
→ Model: qwen2.5:3b
→ History: discarded after run
```

---

## Migration Rules (Apply Globally)

### Rule 1: Heartbeat → Isolated + Cheap Model

**Before:**
```bash
# Heartbeat runs in main session with full context
HEARTBEAT_OK  # Uses default model + all files
```

**After:**
```bash
openclaw cron add --name "health-check" \
  --every "10m" \
  --session isolated \
  --model ollama/qwen2.5:3b \
  --inject-only "HEARTBEAT.md"
```

**Savings:** 90% (isolated session + cheap model + minimal files)

---

### Rule 2: Cron Jobs → Isolated (All of Them)

**Before:**
```bash
# Each job injects full context, uses default model
cron add --name "morning-brief" --cron "0 7 * * *" --message "..."
```

**After:**
```bash
# Explicit session + model + injection rules
cron add --name "morning-brief" \
  --cron "0 7 * * *" \
  --session isolated \
  --model ollama/qwen2.5:3b \
  --inject-only "active-tasks.md,project-status.md"
```

**Savings:** 80% per job

---

### Rule 3: Subagent Spawns → Isolated (Unless User-Triggered)

**Before:**
```python
sessions_spawn(task="benchmark models")
# Uses main session, full context injection
```

**After:**
```python
sessions_spawn(
    task="benchmark models",
    session="isolated",  # Not main
    model="ollama/qwen2.5:3b",  # Cheap
    inject_system_prompt=False,  # No full file
    inject_summary=True  # Summary only
)
```

**Savings:** 700 tokens per spawn

---

### Rule 4: Heavy Analysis → Isolated + Mid-Tier Model

**Before:**
```python
# Complex analysis runs in main session
sessions_spawn(task="weekly code review")
```

**After:**
```python
sessions_spawn(
    task="weekly code review",
    session="isolated",  # Don't pollute main
    model="claude/claude-haiku",  # Quality over speed
    thinking="low",  # Some reasoning
    timeout_seconds=600  # Longer timeout OK
)
```

**Tradeoff:** Slightly more expensive than qwen2.5 (but cheaper than Opus), but main session stays clean

---

## Cost Breakdown (Per Day)

### Before (No Isolation)
```
Main session: Every message loads ~400 tokens context
10 messages/day × 400 = 4000 tokens

Cron/heartbeat: Also use main session context
8 cron jobs × 400 = 3200 tokens

Total: 7200 tokens/day
```

### After (Full Isolation)
```
Main session: 10 messages × 400 = 4000 tokens (unchanged)

Isolated cron/heartbeat: 
- Cheap model (qwen2.5): 50-150 tokens each
- 8 cron jobs × 100 = 800 tokens

Total: 4800 tokens/day (-33%)
```

---

## Implementation Checklist

| Item | Before | After | Status |
|---|---|---|---|
| Heartbeat | Main session | Isolated | TODO |
| Cron jobs | Main session | Isolated | TODO |
| Subagent spawns | Main session | Isolated | TODO |
| Cheap model usage | None | qwen2.5 for routine | TODO |
| Session_isolation_rules.md | N/A | This doc | ✅ |

---

## Exceptions (When NOT to Isolate)

**Stay in main session if:**
1. User explicitly asked (interactive request)
2. Decision requires full conversational context
3. Task is time-sensitive and needs immediate announcements
4. Crash recovery (read active-tasks.md)

**Example of exception:**
```
User: "Analyze yesterday's performance" (interactive)
→ Use main session (user is waiting for answer)
→ Not isolated (needs context)
```

---

## Per-Task Routing (Apply Everywhere)

Use this decision tree globally:

```
Is this user-facing (interactive)?
  YES → Main session, default model (Haiku/Opus)
  NO  → Continue...

Is this a routine check/monitor?
  YES → Isolated, qwen2.5:3b
  NO  → Continue...

Is this a critical decision?
  YES → Main session, Opus (if quality needed)
  NO  → Continue...

Is this a one-off analysis?
  YES → Isolated, Haiku (if quality needed)
  NO  → Continue...

Is this batch processing?
  YES → Isolated, qwen2.5:3b (cheap + fast)
  NO  → Main session, default
```

---

## Monitoring

Check session cost weekly:
```bash
# Expected: 60% usage in main, 40% in isolated (cheap)
openclaw sessions_list --filter "model|cost"
```

If main session >70% usage: Some isolation rules were skipped.

---

## Long-Term Maintenance

Every month:
1. Audit all cron jobs: are they isolated?
2. Check subagent spawns: using cheap model for routine?
3. Review main session: any unnecessary background work?
4. Token spend: is it ~4800/day (post-isolation)?

**Prevents:** Gradual creep back to full-context-everywhere pattern
