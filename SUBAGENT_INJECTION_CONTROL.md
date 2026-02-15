# Subagent Injection Cost Control

**Purpose:** Prevent subagents from inheriting bloated context  
**Savings:** 700 tokens per spawn (no full system_prompt.md)

---

## The Problem

**Current (Uncontrolled):**
```python
sessions_spawn(task="benchmark 19 models")
# OpenClaw auto-injects:
# - Full IDENTITY.md
# - Full system_prompt.md (900 tokens!)
# - Full MEMORY.md
# - All active-tasks.md
# - agent context (200+ tokens)
# Total: ~1500+ tokens per spawn
```

**Result:** Expensive, wastes tokens on context subagent doesn't need.

---

## The Solution: Explicit Injection Scoping

```python
sessions_spawn(
    task="benchmark 19 models",
    
    # SCOPING (what can the agent access/modify?)
    scope={
        "can_read": ["active-tasks.md", "project-status.md"],
        "can_write": ["/bench/runs/20260214_093023/"],
        "can_call": ["ollama"],  # Ollama only
        "timeout": 14400  # 4 hours max
    },
    
    # INJECTION (what context to load?)
    inject={
        "identity": False,  # Don't inject IDENTITY.md
        "memory": False,  # Don't inject MEMORY.md
        "system_prompt": "summary",  # Only summary, not full
        "active_tasks": True,  # Load this
        "custom": {
            "task_rules": "Sequential only. Unload model between runs."
        }
    },
    
    # MODEL SELECTION
    model="ollama/qwen2.5:3b",  # Cheap for routine work
    
    # DELIVERY
    cleanup="keep",  # Keep session for debugging
    announce=True
)
```

**Token cost:** ~300 tokens (vs 1500+ before)  
**Savings: 78%**

---

## Template: Task-Specific Subagent Spawns

### Template 1: Benchmark (Sequential, Long-Running)

```python
sessions_spawn(
    task="""
    Run benchmark on 19 Ollama models (sequential only):
    - Iterate: for model in [qwen2.5:3b, llama3.2:3b, ...]:
    - Test: 11-prompt suite per model
    - Record: save to /bench/runs/20260214_093023/results.jsonl
    - Cleanup: ollama stop between models
    - Validate: check line count (should be 209 at end)
    """,
    
    scope={
        "can_read": ["active-tasks.md", "/bench/runs/"],
        "can_write": ["/bench/runs/20260214_093023/"],
        "can_call": ["ollama"],
        "timeout": 14400  # 4 hours
    },
    
    inject={
        "identity": False,
        "memory": False,
        "system_prompt": "summary",
        "active_tasks": True,
        "custom": {
            "cpu_constraint": "6-core i7, CPU-bound = SEQUENTIAL ONLY",
            "success_criteria": "209 rows (19 models × 11 prompts)",
            "failure_plan": "Rollback, log error, alert user"
        }
    },
    
    model="ollama/qwen2.5:3b",
    cleanup="keep"
)
```

---

### Template 2: Web Research (Fast, User-Facing)

```python
sessions_spawn(
    task="Research topic: Latest AI benchmarks. Find top 5 papers, summarize findings.",
    
    scope={
        "can_read": ["MEMORY.md"],  # Reference user preferences
        "can_write": ["/research/"],
        "can_call": ["web_search", "web_fetch"],
        "timeout": 600  # 10 min max
    },
    
    inject={
        "identity": True,  # Need personality for research
        "memory": True,  # Need user context
        "system_prompt": "full",  # Full prompt for quality
        "active_tasks": False
    },
    
    model="claude/claude-haiku",  # Quality > speed for analysis
    cleanup="delete"  # Research artifacts, not needed long-term
)
```

---

### Template 3: Code Review (Quality, Medium-Depth)

```python
sessions_spawn(
    task="Review Monad Foundry integration script for bugs, security, best practices.",
    
    scope={
        "can_read": ["/scripts/setup_monad_foundry.sh", "IDENTITY.md"],
        "can_write": ["/scripts/setup_monad_foundry.sh.reviewed"],
        "can_call": ["bash"],  # Can test locally
        "timeout": 1200  # 20 min
    },
    
    inject={
        "identity": True,  # Need personality for critique
        "memory": False,  # Don't need general memory
        "system_prompt": "summary",  # Summary OK for code review
        "active_tasks": False
    },
    
    model="claude/claude-haiku",
    cleanup="keep"  # Keep review for audit
)
```

---

### Template 4: Daily Summary (Cheap, Routine)

```python
sessions_spawn(
    task="Summarize today's work: completed tasks, blockers, tomorrow's plan.",
    
    scope={
        "can_read": ["active-tasks.md", "project-status.md"],
        "can_write": ["project-status.md"],  # Append summary
        "can_call": [],  # No external calls
        "timeout": 300  # 5 min
    },
    
    inject={
        "identity": False,  # Don't need personality
        "memory": False,
        "system_prompt": "summary",  # Minimal prompt
        "active_tasks": True
    },
    
    model="ollama/qwen2.5:3b",  # Super cheap
    cleanup="delete"  # Summary already written to project-status.md
)
```

---

## Injection Enum (Use These Values)

```python
system_prompt: "full" | "summary" | False
  # "full" → Entire /system_prompt.md (900 tokens)
  # "summary" → /system_prompt_summary.md (200 tokens)
  # False → No system prompt (risky, only for trivial tasks)

identity: True | False
  # True → Load IDENTITY.md (personality + boundaries)
  # False → Skip (use only for data processing)

memory: True | False
  # True → Load MEMORY.md (user preferences, lessons)
  # False → Skip (use for generic tasks)

active_tasks: True | False
  # True → Load active-tasks.md (crash recovery context)
  # False → Skip (for one-off tasks)
```

---

## Scope Enum (Required for All Subagents)

```python
can_read: List[str]
  # Files/dirs subagent is allowed to read
  # Examples: ["active-tasks.md", "/bench/runs/", "IDENTITY.md"]

can_write: List[str]
  # Paths subagent is allowed to write/modify
  # CRITICAL: Prevent 2 agents writing same file
  # Examples: ["/bench/runs/20260214_093023/", "/research/"]

can_call: List[str]
  # Allowed tools/commands
  # Examples: ["ollama", "bash", "web_search", "web_fetch"]
  # Restrict heavily (prevent exec("rm -rf /"))

timeout: int (seconds)
  # Max runtime before kill
  # Benchmark: 14400 (4 hours)
  # Research: 600 (10 min)
  # Routine: 300 (5 min)
```

---

## Validation Checklist (Before Spawn)

```python
# Before calling sessions_spawn():

1. Scope defined?
   assert scope["can_read"] and scope["can_write"] and scope["timeout"]

2. No write conflicts?
   assert not write_conflict_with_other_agents(scope["can_write"])

3. Injection minimal?
   token_cost = calc_injection_tokens(inject)
   assert token_cost < 500, f"Injection too heavy: {token_cost}"

4. Timeout reasonable?
   assert 300 < scope["timeout"] < 86400  # 5 min to 24 hours

5. Model appropriate?
   if task_type == "routine":
       assert model == "ollama/qwen2.5:3b"
   elif task_type == "analysis":
       assert model in ["claude/claude-haiku", "ollama/qwen3:8b"]
```

---

## Cost Breakdown (Per Spawn)

| Scenario | Old | New | Savings |
|---|---|---|---|
| Benchmark spawn | 1500 tokens | 300 tokens | **80%** |
| Research spawn | 1500 tokens | 800 tokens | **47%** |
| Code review spawn | 1500 tokens | 500 tokens | **67%** |
| Daily summary spawn | 1500 tokens | 150 tokens | **90%** |

---

## Monthly Impact

**Assume:** 20 subagent spawns per month

| Scenario | Old | New | Savings |
|---|---|---|---|
| No control | 20 × 1500 = 30K tokens | — | — |
| With control | — | 20 × 400 (avg) = 8K tokens | **73% reduction** |

---

## Implementation Priority

1. **URGENT:** Add scope + inject params to all sessions_spawn() calls
2. **HIGH:** Create task-specific templates (copy-paste, not invent)
3. **MEDIUM:** Add validation checklist before each spawn
4. **MEDIUM:** Monitor token usage per spawn (target: <500)
5. **LOW:** Audit quarterly for bloat creep

---

## Example: Refactor Existing Spawn

**Before (Expensive):**
```python
sessions_spawn(
    task="Benchmark 19 models",
    agentId="llm-bench"
)
# Uses defaults: full context injection, 30-min timeout
# Token cost: ~1500
```

**After (Optimized):**
```python
sessions_spawn(
    task="Benchmark 19 models on 11-prompt suite (sequential only)",
    
    scope={
        "can_read": ["active-tasks.md"],
        "can_write": ["/bench/runs/20260214_093023/"],
        "can_call": ["ollama"],
        "timeout": 14400
    },
    
    inject={
        "identity": False,
        "memory": False,
        "system_prompt": "summary",
        "active_tasks": True,
        "custom": {
            "cpu_note": "Sequential only, 6-core CPU limit",
            "success": "209 rows (19×11)"
        }
    },
    
    model="ollama/qwen2.5:3b",
    cleanup="keep"
)
# Token cost: ~300 (87% cheaper!)
```

---

## Reference: When to Use Each Model in Subagent

| Task | Model | Why | Cost |
|---|---|---|---|
| Routine data processing | qwen2.5:3b | Fast, local | ~50k/1M tokens |
| Formatting, parsing | qwen2.5:3b | Fast, local | ~50k/1M tokens |
| Summary generation | qwen2.5:3b | Fast, local | ~50k/1M tokens |
| Code review, analysis | claude/haiku | Quality reasoning | ~3/1M tokens |
| Research, writing | claude/haiku | Better language | ~3/1M tokens |
| Critical decisions | claude/opus | Best reasoning | ~15/1M tokens |
| Benchmarking, testing | qwen2.5:3b | Fast iteration | ~50k/1M tokens |

---

**Deploy this globally: ALL sessions_spawn() calls must include scope + inject parameters.**
