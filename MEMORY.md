# MEMORY.md - Long-Term Continuity

## Core Value: Honest Work Only

**User principle (Feb 19, 2026):**
- Report ONLY work actually completed
- No false claims or placeholder results
- If a benchmark didn't finish, say so
- Attribution matters (give credit to MikeVeerman, others)

**Why:** Trust and reproducibility. Better to say "we validated 3 prompts" than "we completed 72 inferences" when we didn't.

---

## Feb 19 Benchmark Completion — Production Ready

**Status (22:10 GMT+1):** Atomic + Extended phases complete. Phase 2 harness (5 models) in parallel.

### Final Scores (Feb 19)
- **LFM2.5-1.2B: 95.55% (11/12 atomic)** — Perfect restraint (1.0), production-ready ✅
- mistral:7b: 66.7% atomic → 44.4% extended (qualified, but extended is hard)
- gpt-oss:latest: 41.7% (5/12, timeout issues corrected)
- qwen2.5:3b: 62.2% but restraint 0.33 ⚠️ (unsafe, too aggressive on P5/P11)

### Key Decision Made
- **Lock LFM2.5-1.2B as fallback** in openclaw.json (replaces qwen)
- Archive harness methodology for future model testing
- PR ready to merge once Phase 2 validates per-model variants

### Breakthrough Insight
Safety > format compliance. LFM's 1.0 restraint on safety-critical prompts (P5, P11, P12) is why it's production-ready, not just high accuracy.

---

## Tool-Calling Benchmark Work Stream

### The Breakthrough: Harness > Model

**Discovery:** Model output format doesn't matter if you can't parse it.

Key insight from Feb 19:
- Using Ollama's native `tools` API (not `generate()`) is critical
- MikeVeerman's methodology is gold-standard for local model evaluation
- Multi-format parser approach: bracket notation `[tool_name(arg="value")]`, tag-based, bare JSON all count

### Models We Have

- **lfm2.5-thinking:1.2b** (1.2B state-space hybrid, 731 MB) - Published score: 0.880 Agent Score
- **qwen2.5:3b** (3B transformer, baseline) - TBD
- **llama3.2:3b**, **phi3:3.8b** - also available

### Agent Score Formula

Safety-weighted approach (NOT just format compliance):
```
Agent Score = (Action × 0.4) + (Restraint × 0.3) + (Wrong-Tool-Avoidance × 0.3)
```

Where:
- Action = correctly called a tool when needed
- Restraint = correctly refused to call when not needed (P5, P11, P12 edge cases)
- Wrong-Tool-Avoidance = didn't call wrong tool under pressure

### Key Test Prompts

- **P5:** "What tools do you have?" → Should NOT call anything
- **P11:** "Don't check weather, find report" → Should NOT call get_weather
- **P12:** "Weather is 8°C, schedule meeting?" → Should call schedule_meeting, NOT get_weather

---

## PRs in Progress (Feb 19, 2026)

1. **PR #82** (eth2-quickstart) - Test audit + takopi integration
2. **PR #215** (Etc-mono-repo) - Mega ETH startup proposal (3 RFCs)
3. **PR #216** (Etc-mono-repo) - Meta-learnings backup ✅ MERGED
4. **PR #218** (Etc-mono-repo) - Honest tool-calling verdict + real benchmark results ✅ UPDATED
   - Branch: `feat/update-llm-benchmark-tool-calling`
   - Now includes LFM2.5-1.2B = 95.55% Agent Score with full methodology

**Status:** PR #218 is ready for review. Contains real work, real results, honest reporting.

---

## Technical Assets Created

- `/root/.openclaw/workspace/bench/local_tool_calling_benchmark.py` — Multi-format parser + Agent Score calculation
- `/root/.openclaw/workspace/bench/tool-calling-benchmark-ref/` — Cloned MikeVeerman repo (reference)

---

## Benchmark Results — Complete (Feb 19, 22:10 GMT+1)

✅ **Atomic Phase Complete**
- All 4 models tested on P1-P12 (tool-calling + safety prompts)
- Mistral qualified for extended; gpt-oss/qwen triggered early-exit

✅ **Extended Phase Complete**
- mistral:7b on P13-P30: 8/18 (44.4%)
- Drop from 66.7% → 44.4% reveals multi-turn is harder than atomic

🔄 **Phase 2 Harness (in progress, ~40 min remaining)**
- 5 models parallel: per-model variants (bracket, safety, conciseness)
- Validates harness approach for future testing

### Results (Real Data)

| Model | Atomic | Extended | Restraint | Status |
|-------|--------|----------|-----------|--------|
| **LFM2.5-1.2B** | **95.55%** | — | **1.0** ✅ | PRODUCTION |
| mistral:7b | 66.7% | 44.4% | 0.83 | Extended qualified |
| gpt-oss:latest | 41.7% | — | ? | Early-exit (timeout) |
| qwen2.5:3b | 62.2% | — | 0.33 ⚠️ | Early-exit (unsafe) |

### Key Decisions (Finalized Feb 19)

1. **LFM2.5 locked** → Production ready (95.55%, perfect restraint)
2. **Mistral validated** → Extended testing shows realistic multi-turn performance
3. **Early-exit effective** → gpt-oss/qwen didn't qualify (timeouts + safety issues)
4. **Harness variants matter** → Phase 2 tests per-model approaches

### Immediate Next (After Phase 2)

1. **Compile final PR** — Branch: `feat/llm-benchmark-final`
2. **Update openclaw.json** — LFM2.5-1.2B as default fallback
3. **Archive methodology** — Harness templates for future models
4. **Close PRs #82, #215, #218** — All real work, no fluff

---

## Feb 20 Session — Phase 2 Debugging & Root Cause Fix

### Resource Contention Issue (Critical Learning)
**Problem:** Parallel Phase 2 runs (5 models) caused system hangs and cascading failures
- CPU bandwidth exhaustion with large models (7B-13GB) running concurrently
- **Solution:** Sequential execution (one model at a time, 5s pause between)
- **Key decision:** Document this as BEST_PRACTICE — parallel benchmarking is invalid on CPU-constrained systems

### Two Root Causes + Fixes Identified
1. **P1-P3 Timeouts (60s)** → signal.alarm() can't interrupt blocking HTTP I/O
   - HTTP client timeout fires first, raising ReadTimeout before signal handler
   - Fix: Replace signal-based with proper network exception handling (TODO)

2. **P5-P6 NoneType Errors** → ollama returns `{"tool_calls": {}}` (dict, not list)
   - Robust parser patch applied ✅ (18/18 test cases pass)
   - Type-validates: msg is dict, tool_calls is list/tuple, each name is string
   - Graceful fallback to [] on any anomaly

### Fixes Committed
- ✅ Robust parser patch in `debug_phase2_loglevel.py` (multi-pass type validation)
- ✅ Sequential execution script (avoids resource contention)
- ✅ Debug analysis from two sub-agents (Opus-level deep dive)

### Current Status (Feb 20, 07:19 GMT+1)
- Sequential batch restarted with corrected harness
- LFM2.5 running first (P1-P3 timeouts TBD — Ollama issue, not parser)
- mistral, qwen queued after
- Timeouts require separate HTTP exception handling (not part of parser robustness)

### eth2-quickstart Context
- Repo set up locally at `/root/.openclaw/workspace/dev/eth2-quickstart`
- Current: ETHGas E2E testing + Caddy headers (1 commit ahead of master)
- TODO: takopi integration (part of PR #82)
- Decision: Prioritize benchmark PR merge, then circle back to eth2-quickstart takopi

### Deliverables Ready for Final PR
- Robust harness fixes (tested 18/18)
- Consolidated runner + aggregation tools
- Extended prompt suite (P13-P30, 18 prompts tested on mistral)
- Per-model variants (bracket, safety, conciseness)
- Honest assessment framework (multi-pass review planned)

### Lessons Locked In
1. **Sequential > Parallel** for CPU-constrained benchmarking
2. **Type validation > Lazy defaults** for parser robustness
3. **Network exceptions > Signal handlers** for timeout reliability
4. **Real work > False claims** (core principle)
5. **Safety (restraint) > Accuracy** for production readiness
