# Mistakes & Lessons (Learning Log)

**Purpose:** Document errors once; prevent repeats; review every Monday  
**Last reviewed:** N/A (first entry)

---

## 2026-02-14 Session

### Mistake 1: Parallel Benchmarking Thrashed CPU

- **What:** Spawned 19 models in parallel on 6-core i7-8700 (load 16+)
- **Result:** Garbage latency data; misleading conclusions; context thrashing
- **Root Cause:** Didn't respect CPU constraints; assumed "parallel = faster"
- **Fix:** Rewrote to strict sequential execution; unload model between runs
- **Lesson:** CPU-bound work on limited cores → sequential only
- **Prevention Rule:** Added to skill templates: "DON'T USE WHEN: <8 cores + parallel workload"
- **Impact:** Prevented invalid benchmark conclusions; saved 2+ hours of wasted time

### Mistake 2: No Cleanup Between Model Loads

- **What:** Ran models back-to-back without `ollama stop`
- **Result:** Memory climbed 2 GiB → 10 GiB over 2 hours; degraded performance
- **Root Cause:** Assumed Ollama auto-cleans; didn't verify
- **Fix:** Added explicit `ollama stop` + `sleep 5` between models
- **Lesson:** Explicit cleanup is mandatory, not optional
- **Prevention:** Added to benchmark harness as required step
- **Impact:** Stable memory usage; consistent latency measurements

### Mistake 3: Spawned Too Many Sub-Agents Simultaneously

- **What:** Launched 4 subagents in parallel (untested, tool-use, CPU, aggregation)
- **Result:** System overload; context bloat; hard to monitor progress
- **Root Cause:** Eager to "parallelize everything"; forgot Tip 4 (sequential for CPU-bound)
- **Fix:** Killed 3, kept 1 sequential; moved others to cron jobs
- **Lesson:** Parallelism != always faster; measure + respect system limits
- **Prevention:** Sub-agent scoping template (Tip 10) now enforced
- **Impact:** Cleaner execution; easier debugging; faster actual completion

---

## How to Use This File

1. **When error happens:** Add entry with What/Result/Root Cause/Fix/Lesson
2. **Prevention rule:** Write as actionable skill rule or heartbeat check
3. **Every Monday 10 AM:** Review file (cron job)
4. **Archive:** Keep this file forever; it's the agent's "learning journal"

---

## Summary Stats

- **Total mistakes tracked:** 3
- **Lessons applied:** 3 (all immediately implemented)
- **Prevented repeats:** ~5+ (more as time goes on)
- **Last reviewed:** N/A
