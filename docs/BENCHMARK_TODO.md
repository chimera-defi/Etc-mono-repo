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

### Task B: Benchmark Claude (Haiku + Opus)
- **Status:** ❌ Not started (no data)
- **Prerequisite:**
  - Verify Claude Code auth: `claude auth status`
  - If needed: `claude auth login`
- **Action:**
  1. Confirm exact Claude model IDs (Haiku vs. latest Haiku variant; Opus 4.6 vs. latest)
  2. Add Claude provider config to harness (use Claude Code SDK)
  3. Run full prompt suite on both models
  4. Record latency (TTFT + E2E) and success rate
  5. Merge into aggregate summary
- **Estimated time:** 45 min setup + run time (~5–10 min per model = 15 min total)
- **Owner:** (assign to subagent)
- **Success criteria:** ≥90% successful calls (no rate limits)

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

## Phase 4: Tool-Use Deep Dive (Optional but Important)

### Task D: Improve Tool-Use Harness (Analysis of Tier 3 Results)
- **Status:** ⚠️ All local models Tier 3 (tool-incapable); 16.7% success at best
- **Question:** Can we improve prompting? (e.g., few-shot examples, structured XML tags)
- **Action (if desired):**
  1. Analyze failed tool-use responses (check `results.jsonl` in `tool_use_benchmark_2026-02-13`)
  2. Identify common failure modes (format drift, hallucinated commands, refused to call tools)
  3. Design improved prompt variants with:
     - Few-shot examples of correct tool invocation
     - XML-structured tool definitions
     - Step-by-step reasoning requirement
  4. Re-run on subset of models (qwen2.5:3b, llama3.2:3b, qwen3:4b)
  5. Measure improvement
- **Estimated time:** 60–90 min
- **Owner:** (optional, depends on priority)
- **Note:** If all improvements fail, conclude that local models are unsuitable for tool orchestration (recommendation stands).

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

| Task | Models | Prompts | Status | Next |
|---|---|---|---|---|
| Local baseline (13 Ollama models) | qwen2.5:3b, llama3.2:3b, gemma2:2b, phi3:3.8b, qwen3:8b, qwen3:4b, qwen3:14b, glm4:9b, glm-4.7-flash, gpt-oss, devstral-small-2, mistral-small3.2, ministral-3 | ~11 varied | ✅ DONE | Check results |
| Tool-use (7 Ollama models) | llama3.2:3b, phi3:3.8b, qwen2.5:3b, ministral-3, mistral:7b, smollm:1.7b, tinyllama:1.1b | 6 tool-focused | ✅ DONE | Document Tier 3 implication |
| OpenAI Codex (retry) | gpt-5-codex (high/low), openai-codex/gpt-5.3-codex (high/low) | ~5 | ⏳ TODO (rate limit blocker) | Resolve quota, retry |
| Claude (2 models) | claude-haiku, claude-opus-4.6 | ~5 | ❌ NOT STARTED | Set up auth, run |
| Long-context (2 models, 3 variants) | qwen2.5:3b, llama3.2:3b | 4 prompts × 3 context lengths | 📋 PLANNED | Low priority; do after Phase 2 |
| Tool-use deep dive (if needed) | qwen2.5:3b, llama3.2:3b, qwen3:4b | 6 tool-focused (improved prompts) | 📋 OPTIONAL | Only if Phase 2 shows need |
| Streaming TTFT (if needed) | All local + cloud | All prompts | 📋 OPTIONAL | Lowest priority |

---

## Execution Order (Recommended)

1. **Phase 2A** (OpenAI retry): Highest priority, unblocks cost analysis
2. **Phase 2B** (Claude): Highest priority, fills premium model gap
3. **Phase 3C** (Long-context): Medium priority, validates latency scaling assumptions
4. **Phase 4D** (Tool-use deep dive): Low priority, only if surprising
5. **Phase 5E** (Streaming): Lowest priority, polish

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
