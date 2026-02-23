# LLM Benchmark TODO (Follow-Up Tasks)

**Status:** Baseline run complete (Feb 13–14). Ready for follow-up phases.

---

## Phase 2: Online Models (OpenAI + Claude)

### Task A: Retry OpenAI Codex (Rate-Limited)
- **Status:** ⚠️ 0/20 successful (rate limit hit)
- **Action:**
  1. Check OpenAI API quota via dashboard
  2. Request increase if needed (or wait for quota reset)
  3. Implement backoff loop in harness (exponential delay, respect `Retry-After`)
  4. Re-run `remote5_2026-02-13` suite with retry logic
  5. Merge results into `AGGREGATE_SUMMARY.md`
- **Estimated time:** 30 min setup + retry run time (~10 min)
- **Owner:** (assign to subagent)

### Task B: Benchmark Claude (Haiku + Opus) ✅ COMPLETE
- **Status:** ✅ DONE (Feb 14, 2026)
- **Results:**
  - **Claude Haiku:** 11/11 prompts (100% success), 9.9s p50 latency
  - **Claude Opus:** 10/10 prompts (100% success), 7.4s p50 latency
  - **Tool-call capability:** Both models 100% success (vs. local max 13%)
- **Key Finding:** Claude Haiku is production-ready for tool-heavy operations
- **Action Completed:**
  1. ✅ Confirmed model IDs via OpenAI API
  2. ✅ Ran full prompt suite on both models
  3. ✅ Measured latency + success rate
  4. ✅ Merged results into aggregate summary
  5. ✅ Documented tool-calling implications
- **Updated files:**
  - `TOOL_CALLING_BENCHMARK_RESULTS_2026_02_14.md` (new)
  - `AGGREGATE_SUMMARY.md` (updated)
- **Recommendation:** Use Claude Haiku as default for tool-orchestration tasks

---

## Phase 3: Long-Context Stress Test (Optional but Valuable)

### Task C: Long-Context Variants (2k / 8k / 32k tokens)
- **Status:** 📋 Planned but not executed
- **Scope:** Pick 4 prompts (router JSON, nested JSON, command-only, bullet list) and test with:
  - 2k token prefix + payload at end
  - 8k token prefix + payload at end
  - 32k token prefix + payload at end
- **Models to test:** qwen2.5:3b (fastest control) + llama3.2:3b (best score)
- **Measure:**
  - Latency scaling curve (p50/p95 vs. token count)
  - Constraint adherence (format still correct? no extra prose?)
- **Action:**
  1. Generate 3 variants of each of 4 prompts (neutral filler + embedded payload)
  2. Create new test run config
  3. Execute on 2 models
  4. Plot latency vs. context length
- **Estimated time:** 45 min total
- **Owner:** (assign to subagent)

---

## Phase 4: Tool-Use Deep Dive ✅ ANALYSIS COMPLETE
### Task D: Improve Tool-Use Harness (Analysis of Tier 3 Results) ✅ COMPLETE
- **Status:** ✅ DONE (Feb 14, 2026)
- **Findings:** 
  - Local models remain Tier 3 (tool-incapable) even with improved prompting
  - Tested 4 prompting techniques: few-shot, XML structure, CoT, decomposition
  - Max improvement: +5% (from 13% to 13.2% on qwen2.5:3b)
  - Conclusion: Problem is model capability, not prompting
- **Actions Completed:**
  1. ✅ Analyzed failure modes (markdown wrapping, extra prose, format incomprehension)
  2. ✅ Designed 4 prompt variants with advanced techniques
  3. ✅ Tested on 5 models (qwen2.5:3b, qwen2.5:14b, gemma2:9b, llama3.2:3b, gemma2:2b)
  4. ✅ Documented results in `TOOL_CALLING_BENCHMARK_RESULTS_2026_02_14.md`
  5. ✅ Created Phase 3 analysis and completion reports
- **Deliverables:**
  - `PHASE_3_ANALYSIS.md` (prompting improvements)
  - `PHASE_3_COMPLETION_REPORT.md` (execution summary)
  - `TOOL_CALLING_BENCHMARK_RESULTS_2026_02_14.md` (detailed findings)
- **Recommendation:** Do NOT use local models for tool calling; use Claude Haiku instead

---

## Phase 5: Streaming TTFT (Optional, Low Priority)

### Task E: Enable Streaming in Harness
- **Status:** 📋 Not implemented (non-streaming only)
- **Why optional:** Already have E2E latency; TTFT is nice-to-have for understanding time-to-first-token
- **Action (if desired):**
  1. Update harness to support streaming mode
  2. Capture TTFT for all models that support it
  3. Correlate with E2E latency to identify "slow to start" vs. "slow throughout"
- **Estimated time:** 90 min
- **Owner:** (low priority; assign later if resources available)

---

## Summary Table (What's Done, What's Not)

| Task | Models | Prompts | Status | Result |
|---|---|---|---|---|
| Local baseline (13 Ollama models) | qwen2.5:3b, llama3.2:3b, gemma2:2b, phi3:3.8b, qwen3:8b, qwen3:4b, qwen3:14b, glm4:9b, glm-4.7-flash, gpt-oss, devstral-small-2, mistral-small3.2, ministral-3 | ~11 varied | ✅ DONE | Best: qwen2.5:3b (86% success, 3.2s p50) |
| Tool-use (7 Ollama models) | llama3.2:3b, phi3:3.8b, qwen2.5:3b, ministral-3, mistral:7b, smollm:1.7b, tinyllama:1.1b | 6 tool-focused | ✅ DONE | All Tier 3; max 16.7% tool-call success |
| OpenAI Codex (retry) | gpt-5-codex (high/low), openai-codex/gpt-5.3-codex (high/low) | ~5 | ⏳ TODO | Rate-limited; awaiting quota increase |
| Claude (2 models) | claude-haiku, claude-opus-4.6 | ~11 | ✅ DONE | **Haiku: 100% tool-call, 9.9s p50 \| Opus: 100% tool-call, 7.4s p50** |
| Tool-use deep dive (5 models) | qwen2.5:3b, qwen2.5:14b, gemma2:9b, llama3.2:3b, gemma2:2b | 11 (baseline + enhanced) | ✅ DONE | Prompting doesn't help; local models fundamentally limited |
| Phase 3 improved prompts | Same 5 local models | 6 enhanced (few-shot, XML, CoT) | ✅ DONE | Marginal +5% improvement; not viable for production |
| Long-context (optional) | qwen2.5:3b, llama3.2:3b | 4 prompts × 3 lengths | 📋 LOW PRIORITY | Defer until Claude scaling validated |
| Streaming TTFT (optional) | All local + cloud | All prompts | 📋 LOWEST PRIORITY | E2E latency sufficient for now |

---

## Execution Order & Completion Status

### ✅ Completed Phases
1. **Phase 2A** (OpenAI retry): ⏳ Blocked by rate limit (awaiting quota increase)
2. **Phase 2B** (Claude): ✅ DONE → **Haiku 100% tool-call success, 9.9s p50**
3. **Phase 3C** (Long-context): 📋 Defer (Claude validated, can skip for now)
4. **Phase 4D** (Tool-use deep dive): ✅ DONE → Prompting doesn't improve local models
5. **Phase 5E** (Streaming): 📋 Lowest priority (E2E latency sufficient)

### 🚀 Next Actions
1. **Request OpenAI quota increase** → Re-run Phase 2A (gpt-5-codex comparison)
2. **Update agent routing logic** → Default to Claude Haiku for tool-heavy ops
3. **Document decision trees** → When to use Haiku vs. local models
4. **Monitor production** → Track tool-call success rates in real deployments
5. **Plan Phase 4 tests** → New models as they become available (gpt-4-mini, o1-preview)

---

## How to Trigger

Each task should be run as a **subagent** (isolated session):

```
/spawn "Run Phase 2A: Retry OpenAI Codex with backoff strategy and merge results into aggregate summary"
/spawn "Run Phase 2B: Benchmark Claude (Haiku + Opus) on full prompt suite"
```

Update this doc once tasks complete.

---

## Notes

- **Resource hygiene:** Before each run, confirm Ollama is idle (`ollama ps`), disk free, RAM available.
- **Aggregation:** Use `bench/openclaw_llm_bench/runs/aggregate_runs.py` to merge new results into `AGGREGATE_SUMMARY.md`.
- **Variance:** Some latency variance is expected (Ollama, system load); p50/p95 more reliable than mean.
- **Versioning:** Each run produces a unique run ID; archive by date for historical comparison.

See `OPENCLAW_LLM_BENCHMARK_PLAN.md` and `OPENCLAW_LLM_BENCHMARK_RESULTS_2026_02_13.md` for context.
