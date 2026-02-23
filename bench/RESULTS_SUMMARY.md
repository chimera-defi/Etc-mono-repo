# Benchmark Results Summary

**Last Updated:** 2026-02-23

## Verified Results

| Model | Suite | Correct/Total | Success Rate |
|-------|-------|--------------|--------------|
| LFM2.5-1.2B | Atomic (P1-P12) | 11/12 | **91.7%** |
| LFM2.5-1.2B | Extended | 0/N/A | 0% (needs fallback) |
| Mistral:7b | Extended (P13-P30) | 6/18 | **33.3%** |
| Mistral:7b | Canonical (P0-P10) | 2/11 | **18.2%** |
| Qwen3:4b | Canonical | 9/23 | **39.1%** |
| Qwen2.5:14b | Early (P0, P1, P10) | 3/3 | **100%** (partial) |
| Gemma2:9b | Early | 1/1 | **100%** (partial) |

## Key Findings

### Best Performer
- **LFM2.5-1.2B** for atomic tasks: 91.7% with perfect safety restraint (1.0)

### Routing Strategy
- **Online models first** (Minimax, Claude, Codex) - use cloud credits
- **Local fallback** (LFM → mistral) - for offline/low-cost scenarios

### Extended Suite
- LFM doesn't handle extended → routes to mistral:7b as fallback
- Mistral:7b achieves 33.3% on extended (6/18)

## Data Sources

- `lfm_native_api_results.json` - LFM atomic results
- `extended_phase1_mistral.json` - Mistral extended results
- `openclaw_llm_bench/AGGREGATE_SUMMARY.md` - Historical benchmark data

## Next Steps

1. Complete full validation of all models
2. Run extended suite with LFM → mistral fallback
3. Measure improvement from warm-up integration
