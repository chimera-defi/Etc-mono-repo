# MEMORY.md - Long-Term Continuity

## Core Value: Honest Work Only

**User principle (Feb 19, 2026):**
- Report ONLY work actually completed
- No false claims or placeholder results
- If a benchmark didn't finish, say so
- Attribution matters (give credit to MikeVeerman, others)

**Why:** Trust and reproducibility. Better to say "we validated 3 prompts" than "we completed 72 inferences" when we didn't.

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

## Benchmark Results (Feb 19, Final)

✅ **CLEANED PR: Single concise commit, no fluff**
- Branch: `feat/llm-benchmark-final`
- File: `bench/BENCHMARK_RESULTS.md` (67 lines, essential only)

### Results (Real Data)

| Model | Score | Restraint | Next |
|-------|-------|-----------|------|
| **LFM2.5-1.2B** | **11/12 (95.55%)** | **1.0** ✅ | ✅ PRODUCTION |
| mistral:7b | 8/12 (66.7%) | 0.83 | Phase 1 Extended |
| gpt-oss:latest | 7/8 (87.5%) partial | ? | Retry (hung P9) |
| qwen2.5:3b | 7/12 (62.2%) | 0.33 ⚠️ | Unsafe |

### Key Decisions

1. **LFM2.5 locked** → Production ready (perfect restraint, 95.55%)
2. **Mistral qualified** → Run extended tests (P13-P30) 
3. **gpt-oss retry** → 60s/prompt safeguard
4. **No old artifacts** → Cleaned PR to single commit

### Next Steps

1. **Phase 1 Extended:** mistral + gpt-oss on P13-P30 (multi-turn, problem-solving)
2. **Phase 2 Harness:** Per-model variants + early-exit rules
3. **Phase 3 Retry:** Best survivors with improved harness
4. **Register LFM2.5** in `openclaw.json` once PR merges
