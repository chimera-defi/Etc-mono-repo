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

## Next Steps

1. ⏳ Complete gpt-oss:latest full 12-prompt run
2. ⏳ Complete mistral:7b full 12-prompt run
3. Register LFM2.5-1.2B in `openclaw.json` as primary local model
4. Document mistral/gpt-oss results when complete

## Files

- `bench/local_models_native_api_results.json` — LFM2.5 full results
- `bench/quick_validation_results.json` — mistral/gpt-oss 3-prompt validation
- `bench/local_models_native_api_benchmark.py` — Benchmark harness
