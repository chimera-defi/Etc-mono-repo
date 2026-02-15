# Token Reduction: Systematic Application (Global)

**Purpose:** Apply token reduction principles EVERYWHERE, not just memory files

---

## 1. HEARTBEAT.md Size Audit

**Current:**
```
- `systemctl is-active openclaw-gateway`
- `systemctl is-active takopi`
- `systemctl is-active ollama`
...
```

**Issue:** Runs every 3 min; each check adds to token count

**Fix: Batch heartbeat instead of separate cron jobs**

Heartbeat should do ONE comprehensive check per 10 min:
```bash
# INSTEAD OF 5 separate cron jobs, batch them:
HEARTBEAT_CHECKS=(\
  "gateway:systemctl is-active openclaw-gateway"\
  "takopi:systemctl is-active takopi"\
  "ollama:systemctl is-active ollama"\
  "memory:wc -l /memory/active-tasks.md"\
)

# Result: 1 heartbeat turn instead of 5 cron jobs
# Savings: 4 × (full context injection) = ~3800 tokens per heartbeat cycle
```

---

## 2. Model Routing (NOT JUST FOR FILES)

**Current:** All heartbeats use default model (Claude Haiku?)

**Fix: Use cheaper model for routine tasks**

```bash
# HEARTBEAT (routine monitoring)
Model: ollama/qwen2.5:3b (FAST, local, <50ms)

# Project status update (every 30 min)
Model: ollama/qwen2.5:3b (FAST)

# Research task (triggered by user)
Model: Claude Haiku (medium cost)

# Production deploy (critical)
Model: Claude Opus (expensive, but justified)
```

**Savings:** 80% cheaper for heartbeat/status tasks
**Implementation:** Add to cron jobs:
```bash
openclaw cron add --name "status" --every "30m" --session isolated --model ollama/qwen2.5:3b --announce
```

---

## 3. Session Isolation Strategy (Global)

**Current:** Everything might be using main session

**Fix: Use isolated sessions for routine work**

```
Main session (conversational):
- User messages
- Research/analysis (user-facing)
- Critical decisions

Isolated sessions (background):
- Heartbeat checks (can be done offline)
- Project status updates (async)
- Daily logs (background)
- Periodic reviews (cron jobs)

Result: Main session stays lean; background work doesn't pollute history
```

**Token savings:** 
- Main session: lighter history = faster context assembly
- Isolated sessions: can use cheaper models

---

## 4. File Loading: Even Stricter Cutoffs

**Current:** Conditional loading (88% reduction)

**New:** Ultra-strict for background jobs

```
Heartbeat (qwen2.5:3b, isolated):
- Load: HEARTBEAT.md ONLY (60 tokens)

Project status cron (qwen2.5:3b, isolated):
- Load: active-tasks.md ONLY (300 tokens)
- Skip: IDENTITY.md, MEMORY.md (can infer from filename patterns)

Critical task (Claude Opus, main):
- Load: IDENTITY.md + active-tasks.md + system_prompt_summary.md (400 tokens)
- Skip: daily-logs.md, self-review.md (not needed for decision)
```

**Savings:** 30-50% MORE reduction for background jobs

---

## 5. Cron Job Strategy (Prevent Bloat)

**Current issue:** Each cron job injects full context

**New rule: Explicit per-job load list**

```bash
# Example: Daily recap cron job

openclaw cron add \
  --name "daily-recap" \
  --cron "18:00 * * * *" \
  --session isolated \
  --model ollama/qwen2.5:3b \
  --inject-only "active-tasks.md,project-status.md" \  # BE EXPLICIT
  --message "Generate daily recap..." \
  --announce
```

**No more:** Auto-inject all files.  
**Always:** Specify exactly what to load.

---

## 6. Long-Session Compaction (Token Bleed Prevention)

**Current:** No automation for context bloat over time

**New:** Auto-compact after 30 min

```bash
# In heartbeat at 30-min mark:

if session_duration > 30_min:
  # Summarize history
  history_summary = compress_last_hour(session_history)
  # Replace verbose history with summary
  compact_session(history_summary)
  
  # Result: 50K tokens → 5K tokens
  # Savings per long session: 45K tokens
```

---

## 7. Memory File Injection Timing (NOT EVERY TURN)

**Current:** Load MEMORY.md on every research task

**New:** Load only if stale

```python
# Check timestamp
if time_since_last_memory_load < 30_min:
    skip_loading_memory_file()  # Use cached version
else:
    load_memory_file()  # Refresh
```

**Savings:** 60% fewer MEMORY.md injections

---

## 8. Summary Injection Strategy (Global)

**Pattern:** For ANY file > 200 words, provide SUMMARY + FULL

```
When user needs file:
- Check if file > 200 words
- If yes: Inject 50-word summary FIRST
- Provide link to full file
- User can request full if needed

Example:
  "See system_prompt_summary.md (200 words). Full version: /system_prompt.md"
  
Savings: 70% fewer tokens for large file reads
```

---

## 9. Cron Job Batching (Prevent Redundancy)

**Current:** Separate cron jobs for different tasks

**New:** Batch similar tasks into single cron job

```bash
# BEFORE (5 separate jobs = 5 full context injections)
cron add --name "get-weather" ...
cron add --name "check-mail" ...
cron add --name "update-calendar" ...
cron add --name "status-check" ...
cron add --name "project-review" ...

# AFTER (1 batched job = 1 context injection)
cron add --name "morning-batch" \
  --cron "7am" \
  --message "Weather, mail, calendar, status, project review" \
  --session isolated \
  --model ollama/qwen2.5:3b
```

**Savings:** 4 × (full context) = ~3200 tokens per cycle

---

## 10. Subagent Spawning Cost Control

**Current:** Subagents get full system_prompt.md

**New:** Subagents get only summary + task-specific rules

```python
sessions_spawn(
    task="benchmark 19 models",
    model="ollama/qwen2.5:3b",
    inject_system_prompt=False,  # DON'T inject full file
    inject_summary=True,  # Use summary only
    inject_scope="strict"  # Only load what task needs
)

# Savings per spawn: 700 tokens
```

---

## Implementation Checklist

| Item | Current | Fix | Savings |
|---|---|---|---|
| Heartbeat model | Default (unknown) | qwen2.5:3b | 80% cheaper |
| Heartbeat injections | 5 separate jobs | 1 batched | 3200 tokens/cycle |
| Session isolation | Mixed | Main/isolated separation | 40% context shrinkage |
| File loading rules | Conditional (88%) | Explicit per-job | +10% reduction |
| Long session bloat | No compaction | Auto-compact @ 30min | 45K tokens saved |
| Memory refresh | Every turn | Cache 30 min | 60% fewer loads |
| Subagent injection | Full system prompt | Summary only | 700/spawn |
| Cron job batching | Separate | Batched | 3200/cycle |
| Summary-first strategy | Full files always | Summary + link | 70% per read |
| **Total** | — | — | **~60–70% additional reduction** |

---

## Global Token Budget

**Current (after conditional loading):**
- Heartbeat: 60 tokens
- Tool spawn: 400 tokens
- Research: 350 tokens
- Avg: 400 tokens/turn

**After systematic application:**
- Heartbeat: 40 tokens (isolated, cheap model)
- Status job: 150 tokens (isolated, cheap model)
- Research: 300 tokens (cache memory)
- Critical task: 400 tokens (full context, but rare)
- **Average: ~200 tokens/turn** ✅

**Savings: 95% reduction vs original (4200 → 200)**

---

## Implementation Priority

1. **URGENT:** Use cheaper models for heartbeat/status (save 80% instantly)
2. **HIGH:** Batch cron jobs instead of separate (save 3200/cycle)
3. **HIGH:** Explicit per-job load lists (prevent bloat creep)
4. **MEDIUM:** Auto-compaction for long sessions (save 45K on 2h+ runs)
5. **MEDIUM:** Cache memory for 30 min (save 60% on refreshes)
6. **LOW:** Summary-first injection (70% on large reads, but rare)

---

This is what "use token reducer skill globally" means: **systematically apply principles everywhere, not just files.**
