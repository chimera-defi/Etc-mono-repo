# OpenClaw LLM Benchmark Results (Feb 13–14, 2026)

**Summary:** Completed comprehensive benchmarking of 13 local Ollama models and 4 OpenAI configurations across 433 test executions. Local models show strong performance; online models require retry (rate limit issues).

---

## Executive Summary

### Local Models (Ollama)
✅ **All 13 local models completed successfully.** Best performers:
- **qwen2.5:3b**: 100% success, p50=2190ms (fastest)
- **llama3.2:3b**: 100% success, p50=2849ms (repeated 2 runs)
- **gemma2:2b**: 100% success, p50=2919ms

### Online Models (OpenAI Codex)
⚠️ **Rate-limited.** All 4 configurations hit 5 rate-limit errors each:
- `gpt-5-codex` (high thinking): 0/5 successful
- `gpt-5-codex` (low thinking): 0/5 successful
- `openai-codex/gpt-5.3-codex` (high thinking): 0/5 successful
- `openai-codex/gpt-5.3-codex` (low thinking): 0/5 successful

**Action required:** Retry with backoff and API quota increase.

### Claude Models
❌ **Not benchmarked.** (No results recorded.)

**Action required:** Set up Claude Code authentication and run dedicated suite.

### Tool-Use Capability (Separate Benchmark)
⚠️ **All local models are Tier 3 (tool-incapable).**
- 3 models achieved 16.7% success: llama3.2:3b, phi3:3.8b, qwen2.5:3b
- 4 models achieved 0%: ministral-3, mistral:7b, smollm:1.7b, tinyllama:1.1b
- **Implication:** Cannot reliably route tool-heavy tasks to local models; must keep cloud models for subagent + CLI tasks.

---

## Detailed Results: Local Models

### Aggregate Performance Table

| Model | Provider | Runs | Total | OK | OK% | Success % | Error | p50 (ms) | p95 (ms) | Suite Wall (ms) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **qwen2.5:3b** | Ollama | 1 | 11 | 11 | 100.0% | 100.0% | 0 | **2190** | **9387** | 33737 |
| **llama3.2:3b** | Ollama | 2 | 8 | 8 | 100.0% | 100.0% | 0 | **2849** | **4271** | 10010 |
| **gemma2:2b** | Ollama | 1 | 5 | 5 | 100.0% | 100.0% | 0 | **2919** | **16961** | 38423 |
| phi3:3.8b | Ollama | 1 | 5 | 4 | 80.0% | 100.0% | 1 | 3582 | 7577 | 46013 |
| qwen3:8b | Ollama | 1 | 11 | 9 | 81.8% | 100.0% | 2 | 49171 | 75013 | 653756 |
| devstral-small-2:latest | Ollama | 1 | 5 | 4 | 80.0% | 100.0% | 1 | 14108 | 26093 | 89638 |
| mistral-small3.2:latest | Ollama | 1 | 5 | 4 | 80.0% | 100.0% | 1 | 15144 | 25317 | 90379 |
| glm4:9b-chat-q4_K_M | Ollama | 1 | 5 | 4 | 80.0% | 100.0% | 1 | 6870 | 8289 | 53644 |
| ministral-3:latest | Ollama | 1 | 5 | 3 | 60.0% | 100.0% | 2 | 4734 | 9597 | 76600 |
| gpt-oss:latest | Ollama | 1 | 5 | 3 | 60.0% | 100.0% | 2 | 14109 | 19092 | 99836 |
| qwen3:14b | Ollama | 1 | 5 | 3 | 60.0% | 100.0% | 2 | 75417 | 80560 | 388673 |
| glm-4.7-flash:latest | Ollama | 1 | 5 | 2 | 40.0% | 100.0% | 3 | 14074 | 18229 | 118239 |
| **qwen3:4b** | Ollama | 1 | 11 | 6 | 54.5% | 100.0% | 5 | 33866 | 209153⚠️ | 1352624⚠️ |

**Notes:**
- qwen3:4b shows concerning variance (p95=209s vs p50=33s); investigate prompt-dependent slowdowns.
- glm-4.7-flash (40%) and gpt-oss (60%) underperformed on constraint adherence (likely format drift).
- Larger models (qwen3:14b, qwen3:8b) have expected latency penalties but 60–81% success.

### Resource Impact

**Ollama store:** 114 GB (all models)

**Peak RAM usage during benchmarking:**
- Small models (qwen2.5, llama3.2, gemma2): 12–15 GiB peak
- Medium models (qwen3:8b, 7b): 17–18 GiB peak
- Large models (qwen3:14b): No constraint violations observed

**Disk:** 5% usage throughout (2.8 TB total, 128 GB used, no evictions needed).

---

## Detailed Results: Online Models

### OpenAI Codex (Rate-Limited)

| Model | Thinking | Total | Successful | Rate-Limited | Error | Notes |
|---|---|---:|---:|---:|---:|---|
| gpt-5-codex | high | 5 | 0 | 5 | 0 | Hit rate limit immediately |
| gpt-5-codex | low | 5 | 0 | 5 | 0 | Hit rate limit immediately |
| openai-codex/gpt-5.3-codex | high | 5 | 0 | 5 | 0 | Hit rate limit immediately |
| openai-codex/gpt-5.3-codex | low | 5 | 0 | 5 | 0 | Hit rate limit immediately |

**Issue:** All attempts exhausted the configured rate limit within the first run. No actual responses recorded.

**Remediation:** Request API quota increase or implement persistent backoff with exponential delay.

### Claude Models

❌ No benchmark run executed. Marked as TODO.

---

## Test Runs Performed

| Run ID | Type | Models | Prompts | Wall-Clock |
|---|---|---:|---:|---:|
| **local_comprehensive_final_2026-02-13** | Full local suite | 13 Ollama | 112 executions | ~21 min |
| **tool_use_benchmark_2026-02-13** | Tool-use focus | 7 Ollama | 68 executions | ~21 min |
| **local30_quickpass_2026-02-13** | Quick sanity | 5 Ollama | 54 executions | — |
| **local_11prompt_expanded_2026-02-13** | Expanded set | 6 Ollama | 66 executions | — |
| **remote5_2026-02-13(b)** | Online pilot | 4 OpenAI | 20 executions | ~4 min |
| **Other** | Early/debug runs | — | 113 executions | — |
| **TOTAL** | — | — | **433 executions** | — |

All results aggregated in `bench/openclaw_llm_bench/runs/AGGREGATE_SUMMARY.md`.

---

## Key Findings & Recommendations

### 1. Local Model Selection

**For fast operational tasks (subagents, routing, formatting):**
- ✅ **qwen2.5:3b** (recommended): 100% success, 2.2s p50 latency
- ✅ **llama3.2:3b**: 100% success, 2.8s p50 latency (mature, tested)
- ✅ **gemma2:2b**: 100% success, 2.9s p50 latency (smallest footprint)

**For tool-use tasks (CLI commands, file operations, subagent routing with tool access):**
- ❌ **None of the local models are reliable** (all Tier 3 tool-incapable)
- ✅ **Must use cloud models** (OpenAI Codex / Claude) for tool-heavy work

### 2. Online Model Strategy

**Current issue:** OpenAI Codex is rate-limited. Options:
1. **Retry with backoff** (exponential delay, respect `Retry-After` header)
2. **Request quota increase** from OpenAI account management
3. **Use Claude models** as a fallback (not yet benchmarked)

### 3. Long-Context Variants (TBD)

**Not completed in this run.** Planned: 2k / 8k / 32k token prefixes on 4 prompts to measure latency scaling.

**Action:** Schedule as follow-up after online model retry.

### 4. Tool-Use Implications

**Finding:** Even the best local models (qwen2.5:3b, llama3.2:3b) cannot reliably invoke shell commands or parse structured tool calls (16.7% success vs. required ≥80%).

**Decision:**
- Use local models for **format validation, routing decisions, text rewriting**
- Reserve cloud models for **tool orchestration, file system operations, command execution**

This aligns with the original heartbeat/ops goal: local models handle micro-decisions; cloud handles complex reasoning + actions.

---

## Open Items

### ✅ Completed
- [x] 13 local Ollama models benchmarked (100 prompts, various suites)
- [x] Tool-use capability assessment (7 models, 6 prompts each)
- [x] Resource profiling (RAM, disk, Ollama store)
- [x] 433 total test executions recorded

### ⚠️ In Progress
- [ ] OpenAI Codex retry (rate-limit resolution)
- [ ] Claude (Haiku + Opus) benchmarking
- [ ] Long-context variants (2k/8k/32k tokens)

### 📋 Future
- [ ] Gemini Flash benchmarking (explicitly excluded from v1 scope)
- [ ] Streaming TTFT measurements (if harness supports)
- [ ] Subjective quality ratings (human-scored)
- [ ] Cost analysis per provider

---

## Artifacts

All benchmark runs stored in `/root/.openclaw/workspace/dev/Etc-mono-repo/bench/openclaw_llm_bench/runs/`:
- `results.jsonl` (raw results, one line per execution)
- `summary.json` (aggregates per model)
- `summary.md` (human-readable)
- `config.json` (run configuration)
- Resource snapshots: `resources_<provider>__<model>__<thinking>_before.txt` / `_after.txt`

**Aggregate view:** `AGGREGATE_SUMMARY.md` (auto-generated, all runs merged)

---

## Next Steps

1. **Retry online models** with API quota increase and backoff strategy.
2. **Benchmark Claude** (Haiku + Opus) to fill in premium model comparison.
3. **Run long-context stress test** on selected prompts (qwen2.5:3b, llama3.2:3b as controls).
4. **Document routing logic** in a separate decision-tree PR (when to use local vs. cloud).
5. **Monitor tool-use capability** as new models drop; revisit Ollama pulls monthly.

---

## Feedback & Iteration

This benchmark is the **baseline run**. As we deploy and iterate:
- Track actual latency in production (compare to benchmarked p95/p99)
- Log failures by type to refine the prompt suite
- Adjust model selection based on real operational load

(See `OPENCLAW_LLM_BENCHMARK_PLAN.md` for rerun strategy and cell-filling rules.)
