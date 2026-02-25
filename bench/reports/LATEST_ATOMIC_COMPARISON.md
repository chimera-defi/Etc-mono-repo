# LATEST ATOMIC COMPARISON
**Generated:** 2026-02-25T18:01:00Z

## Canonical Results Only

| Model | Accuracy | Restraint | Status | Notes |
|-------|----------|-----------|--------|-------|
| glm-4.7-flash:latest | 83.3% | 66.7% | ✅ PASS | 10/12 passed |

## Diagnostic Results (Excluded from canonical)

| Model | Accuracy | Status | Notes |
|-------|----------|--------|-------|
| qwen3.5:35b | 0% | ❌ FAIL | Model load error (ollama) |
| lfm2.5-thinking:1.2b | N/A | ❌ FAIL | No valid results |

## Policy Gate Status

| Gate | Threshold | Current | Status |
|------|-----------|---------|--------|
| No regression vs baseline median | N/A | N/A | ⏸️ BASELINE_EMPTY |
| Restraint floor | ≥50% | 66.7% | ✅ PASS |
| Variance threshold | <20% | N/A | ⏸️ NO_COMPARISON |

## Blockers

1. **BASELINE_EMPTY**: No established baseline to compare against
2. **STABLE_CANDIDATES_INVALID**: lfm2.5-thinking:1.2b and mistral:7b have no valid benchmark results

## Summary

- **Canonical count:** 1 model (glm-4.7-flash)
- **Diagnostic count:** 2 models (excluded)
- **Promotion eligible:** No - baseline not established
- **Action required:** Establish baseline from glm-4.7-flash results before further optimization
