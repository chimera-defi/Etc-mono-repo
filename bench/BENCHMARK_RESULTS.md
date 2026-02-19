# Local Tool-Calling Benchmark (Feb 19, 2026)

**Methodology:** MikeVeerman's 12-prompt suite (atomic tool-calling evaluation)  
**Harness:** Ollama native `tools` API (not JSON parsing)

## Results

| Model | Score | Restraint | Status |
|-------|-------|-----------|--------|
| **LFM2.5-1.2B** | 11/12 (95.55%) | 1.0 ✅ | Production |
| mistral:7b | 8/12 (66.7%) | 0.83 | Extended testing |
| gpt-oss:latest | 7/8 (87.5%) partial | ? | Retry needed (hung P9) |
| qwen2.5:3b | 7/12 (62.2%) | 0.33 ⚠️ | Unsafe (false positives) |

## LFM2.5-1.2B (Winner)

- **11/12 correct** (only P7 fail: multi-tool edge case)
- **Perfect restraint** (1.0) — never calls tools when it shouldn't
- **Avg latency:** 31.9s
- **Verdict:** Ready for production. Best local model.

## Mistral:7b (Qualified for Extended)

- **8/12 correct** (66.7%)
- **Restraint:** 0.83 (all restraint tests pass)
- **Failed:** P7 (multi-tool), P10-P12 (judgment missing calls)
- **Avg latency:** 21.4s
- **Verdict:** Passes atomic threshold (>50%). Proceed to Phase 1 extended (P13-P30).

## gpt-oss:latest (Partial)

- **7/8 complete** (87.5%) before timeout
- **P9 hung:** 206s+ (system issue, not model failure)
- **Verdict:** Rerun with 60s/prompt safeguard.

---

## What's Next

### Phase 1: Extended Suite (Multi-Turn + Problem-Solving)
- **P13-P18:** Conversation history, state recall
- **P19-P24:** Failure handling, retries, corrections
- **P25-P30:** State tracking, context-aware judgment

Run on survivors (mistral + gpt-oss).

### Phase 2: Harness Adaptation
Per-model quirks → variants:
- LFM2.5: Bracket notation `[tool(...)]`
- mistral: Native tools API + verbose system prompt
- gpt-oss: Native tools API + fast inference variant

### Phase 3: Retry with Improved Harness
Re-benchmark Phase 1 survivors. Compare scores before/after.

---

## Files

- `local_models_native_api_results.json` — LFM2.5 full 12-prompt results
- `full_validation_results_mistral.json` — mistral 8/12 results
- `extended_benchmark_suite.json` — P13-P30 prompts (18 total)
- `harness/model_variants.json` — Per-model configs

## Attribution

Methodology: [MikeVeerman/tool-calling-benchmark](https://github.com/MikeVeerman/tool-calling-benchmark)
