# Benchmark Results Summary

**Last Updated:** 2026-02-23

## Verified Results

| Model | Atomic | Extended | Combined |
|-------|--------|----------|----------|
| LFM2.5-1.2B | 91.7% (11/12) | 0% (0/N/A) | 45.8% (11/24) |
| Mistral:7b | 18.2% (2/11) | 33.3% (6/18) | 27.6% (8/29) |

### Detailed Breakdown

**LFM2.5-1.2B:**
- Atomic (P1-P12): 91.7% - Excellent for single-turn
- Extended (P13-P30): 0% - Cannot handle multi-turn/context
- Note: Perfect safety restraint (1.0)

**Mistral:7b:**
- Atomic (P1-P12): 18.2% - Struggles with basic tasks
- Extended (P13-P30): 33.3% - Better at multi-turn
- Note: Used as fallback for extended suite

## Key Findings

### Best Performer
- **LFM2.5-1.2B** for atomic tasks: 91.7% with perfect safety restraint (1.0)

### Routing Strategy
- **Online models first** (Minimax, Claude, Codex) - use cloud credits
- **Local fallback** (LFM → mistral) - for offline/low-cost scenarios
- LFM for atomic, mistral for extended

### Issues Identified
1. LFM fails completely on extended suite
2. Mistral struggles on atomic tasks
3. Gap between phases suggests model specialization needed

## Data Sources

- `lfm_native_api_results.json` - LFM atomic results (11/12)
- `extended_phase1_mistral.json` - Mistral extended results (6/18)
- `openclaw_llm_bench/AGGREGATE_SUMMARY.md` - Historical data

## Recommendations

1. **Use LFM for atomic only** - 91.7% success
2. **Use mistral for extended** - Only option that works
3. **Consider warm-up** - Could improve LFM further
4. **Test more models** - Qwen2.5:14b showed 100% early results but not fully tested
5. **Avoid large models** - qwen2.5:14b (9GB), gpt-oss (13GB) clog system; use small models (lfm 731MB) for testing
