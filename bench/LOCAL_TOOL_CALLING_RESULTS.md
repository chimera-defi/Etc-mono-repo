# Local Tool-Calling Benchmark (Feb 19, 2026)

**Methodology:** [MikeVeerman's tool-calling-benchmark](https://github.com/MikeVeerman/tool-calling-benchmark)  
**Key Finding:** Native Ollama `tools` API (not JSON parsing) is critical.

## Results

| Model | Score | Details | Status |
|-------|-------|---------|--------|
| **LFM2.5-1.2B** | **95.55%** | 11/12, perfect restraint, 1 edge case | ✅ Production |
| gpt-oss:latest | 3/3 quick | 100% on P1, P5, P12 validation | ⏳ Full run pending |
| mistral:7b | 2/3 quick | Judgment failure on P12 | ⏳ Full run pending |
| qwen2.5:3b | 62.22% | 7/12, poor restraint | ⚠️ Fallback |
| llama3.2:3b | 61.11% | 7/12, no edge case handling | Last resort |

## LFM2.5-1.2B Details (Full 12-Prompt Run)

- **Agent Score:** 0.9555 (safety-weighted)
- **Accuracy:** 11/12 correct
- **Action Score:** 0.8889 (calls tools when needed)
- **Restraint Score:** 1.0 (never false positive) ✅
- **Avg Latency:** 31.9s

**Failed:** P7 only (multi-tool edge case)

## Agent Score Formula

```
Score = (Action × 0.4) + (Restraint × 0.3) + (Wrong-Tool-Avoidance × 0.3)
```

Restraint (safety) weighted equally with action + judgment.

## Extended Benchmark Plan (Multi-Turn + Problem-Solving)

### Phase 1: Run Atomic + Extended (Feb 19-20)
**Atomic (P1-P12):** Current suite (12 isolated prompts)
**Extended (P13-P30):** New tests
- **P13-P18** (Multi-turn): Requires conversation history + state
  - "We're benchmarking tool-calling. What's weather in Antwerp?"
  - "Earlier we found bugs in prompts P5 and P7. Schedule meeting?"
- **P19-P24** (Problem-solving): Handle failures, retry logic
  - "Tool call failed. What should we do?"
  - "Diagnosis: missing context. Try again with extra details?"
- **P25-P30** (State tracking): Recall + judgment across turns
  - "Summarize findings from P1-P12. Schedule review?"

**Early exit rule:** Kill models failing >50% on P1-P12 (don't waste time)

### Phase 2: Harness Adaptation (Feb 20)
Per-model quirks → harness variants
- LFM2.5: Bracket notation preferred? Adapt prompts
- mistral: Different system message needed?
- gpt-oss: Explicit JSON format?

Document + version per-model harness in `bench/harness/`

### Phase 3: Retry Survivors (Feb 20)
Re-benchmark Phase 1 survivors with Phase 2 harness improvements.
Compare atomic + extended scores before/after harness tuning.

## Current Status
1. ⏳ mistral:7b atomic run (debug logging in progress)
2. ⏳ gpt-oss:latest atomic run (queued after mistral)
3. ⏳ Extended prompt suite design (add P13-P30 to harness)
4. 🔄 Harness adaptation (iterate per-model feedback)

## Files

- `bench/local_models_native_api_results.json` — LFM2.5 full results
- `bench/quick_validation_results.json` — mistral/gpt-oss 3-prompt validation
- `bench/local_models_native_api_benchmark.py` — Benchmark harness
