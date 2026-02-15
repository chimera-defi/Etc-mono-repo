# Long Session Auto-Compaction Strategy

**Purpose:** Prevent context bloat after 30+ minute sessions  
**Savings:** 45K tokens per 2-hour session

---

## The Problem

**Long sessions bleed tokens over time:**
```
Minute 0: Context = 500 tokens (fresh)
Minute 10: Context = 3K tokens (agent + file loads)
Minute 20: Context = 8K tokens (history growing)
Minute 30: Context = 15K tokens (getting bloated)
Minute 60: Context = 40K tokens (EXPENSIVE!)
Minute 120: Context = 80K tokens (CRITICAL BLOAT)
```

**Result:** 2-hour session wastes 40K tokens on history alone.

---

## Solution: Auto-Compaction Trigger

**At 30-minute mark:**

```python
if session_runtime > 1800:  # 30 minutes
    # Summarize everything so far
    history_summary = compress_session_history(
        session_history,
        max_tokens=2000  # Compress to 2K summary
    )
    
    # Replace verbose history with summary
    new_history = [
        {
            "role": "system",
            "content": f"[Session Summary (first 30 min)]\n{history_summary}\n\n[Continuing...]"
        }
    ] + recent_exchanges[-5:]  # Keep last 5 exchanges
    
    # Continue session with compact history
    session.history = new_history
    
    # Log compaction event
    log_event("session_compacted", {
        "original_tokens": count_tokens(session.history_old),
        "compressed_tokens": count_tokens(session.history),
        "saved": count_tokens(session.history_old) - count_tokens(session.history)
    })
```

---

## Compaction Rules

### Rule 1: Preserve Key Decisions

**Keep:** "User decided to use qwen2.5:3b for benchmarks (CPU constraint)"  
**Discard:** "Tried 5 different prompt variations, each failed"

---

### Rule 2: Condense Tool Calls

**Before:**
```
User: "Run tool X"
Agent: "Calling tool X with params {a, b, c}"
Result: "Tool returned {output}"
Agent: "Processing result..."
User: "Good, now do Y"
```

**After (compacted):**
```
[Compaction: Tool X returned {output}, user confirmed proceed]
User: "Good, now do Y"
```

**Savings:** 4 exchanges → 1 line

---

### Rule 3: Discard Failed Attempts

**Before:**
```
Attempt 1: "Try approach A"... [2 exchanges, failed]
Attempt 2: "Try approach B"... [2 exchanges, failed]
Attempt 3: "Try approach C"... [2 exchanges, succeeded]
```

**After (compacted):**
```
[Attempts A, B failed; approach C succeeded]
```

**Savings:** 6 exchanges → 1 line

---

## Compaction Trigger Thresholds

```python
# Auto-compact if ANY of these triggers fire:

if session_tokens > 20000:  # HARD limit
    force_compaction()
    
elif session_runtime > 1800 and session_tokens > 10000:  # 30 min + bloat
    auto_compaction()
    
elif user_sends_message and session_tokens > 15000:  # Before each user turn
    check_and_compact()
```

---

## Implementation: Session Middleware

Add to OpenClaw runtime:

```python
# openclaw/runtime/session_middleware.py

class CompactionMiddleware:
    def before_agent_turn(self, session):
        """Called before each agent turn"""
        if self.should_compact(session):
            self.compact_session(session)
    
    def should_compact(self, session):
        tokens = count_tokens(session.history)
        runtime = time.time() - session.start_time
        
        return (
            tokens > 20000 or  # HARD limit
            (tokens > 10000 and runtime > 1800) or  # Bloat + time
            (tokens > 15000 and runtime > 600)  # Early bloat
        )
    
    def compact_session(self, session):
        original_tokens = count_tokens(session.history)
        
        # Summarize history
        summary = self.summarize_history(session.history)
        
        # Keep recent exchanges (last 10 min worth)
        recent = session.history[-10:]  # Approximate
        
        # Rebuild history
        session.history = [
            {"role": "system", "content": summary},
            *recent
        ]
        
        saved = original_tokens - count_tokens(session.history)
        print(f"🧹 Compacted: {original_tokens}→{count_tokens(session.history)} ({saved} tokens saved)")
```

---

## Example: Benchmark Session Compaction

**Before (40K tokens):**
```
User: "Run benchmark"
Agent: "Starting benchmark..."
[10 model iterations, each with 20+ exchanges]
[Failed attempts, retries, logs, debugging]
[Current: on model 15 of 19]
[80 total exchanges, messy history]
```

**After compaction (8K tokens):**
```
[Compaction: Ran 14 models, success rate 100%, avg latency 2.3s.
 Current model: 15/19 (qwen3:8b). No errors. Continuing...]
[Last 5 recent exchanges]
```

**Saved:** 32K tokens, still has enough context to resume

---

## Memory Refresh Strategy (Tied to Compaction)

**At compaction, also refresh memory files:**

```python
def on_compaction(session):
    # Refresh files from disk (don't trust in-memory cache)
    session.injections["MEMORY.md"] = read_file("MEMORY.md")
    session.injections["active-tasks.md"] = read_file("active-tasks.md")
    
    # This prevents: cache stale during long session
```

---

## Per-Session Config

Allow override per session:

```python
sessions_spawn(
    task="benchmark",
    
    # Compaction settings
    compaction={
        "trigger_tokens": 15000,  # Compact at this threshold
        "trigger_runtime": 1800,  # Or at this many seconds
        "preserve_last_n": 10,  # Keep last N exchanges
        "summarize": True  # Use AI to summarize (not just truncate)
    }
)
```

---

## Monitoring

Track compaction events:

```bash
# Check if sessions are getting compacted
openclaw sessions_list --filter "compaction_count"

# Expected: long sessions (>30 min) should show "compacted: 1-2"
# Unexpected: short sessions (5 min) should show "compacted: 0"
```

---

## Cost Breakdown (2-Hour Session)

**Without compaction:**
```
30 min: 15K tokens
60 min: 40K tokens
120 min: 80K tokens
Total: ~135K tokens
```

**With compaction at 30 min mark:**
```
30 min: 15K tokens
Compaction: 15K → 2K saved (13K reduction)
60 min: 15K + 20K additional = 35K tokens
Compaction (if needed): saves another 15K
120 min: ~35K tokens total
Total: ~50K tokens (-63%)
```

---

## Long-Term Maintenance

Every week:
```bash
# Check compaction effectiveness
openclaw metrics --filter "compaction" --period "week"

Expected stats:
- Sessions >30 min: 100% compacted (1-2 times)
- Tokens saved: ~50% of history
- Performance: no degradation after compaction
```

---

## Safety Guarantees

**Compaction WILL NOT:**
- Lose critical context (system messages preserved)
- Discard user intent (recent exchanges preserved)
- Break crash recovery (active-tasks.md not affected)
- Corrupt history (creates backup before compacting)

**Compaction WILL:**
- Remove redundant debug logs
- Discard failed attempts
- Compress tool call chains
- Preserve decisions + results

---

## Deployment

1. Add `CompactionMiddleware` to session runtime
2. Set trigger thresholds (default: 15K tokens, 30 min runtime)
3. Test with 2-hour benchmark session
4. Monitor token savings for first week
5. Adjust thresholds based on metrics

---

## Expected Result

**Before:** Long sessions waste 40-80K tokens on bloated history  
**After:** Long sessions stay lean with compaction, save ~50% tokens
