# LATEST_ATOMIC_COMPARISON.md

**Generated:** 2026-02-24 06:05 UTC  
**Cycle:** Self-optimizing benchmark guardrail cycle

## Canonical Results Summary

| Model | Phase | Variant | Accuracy | Status |
|-------|-------|---------|----------|--------|
| lfm2.5-thinking:1.2b | atomic | atomic | 91.67% | ✅ STABLE |
| lfm2.5-thinking:1.2b | atomic | native_api | 0.0% | ❌ BROKEN |

## Policy Gates Status

| Gate | Threshold | Observed | Status |
|------|-----------|----------|--------|
| min_runs | >= 3 | 3 | ✅ PASS |
| no_regression_vs_baseline | >= baseline | N/A (baseline=0) | ⚠️ INVALID BASELINE |
| max_regression_threshold | <= 10% | N/A | ⚠️ SKIP |
| restraint_floor | >= 0.80 | 1.0 | ✅ PASS |
| max_accuracy_variance | <= 0.0025 | 0.0 | ✅ PASS |

## Blockers

### 🔴 CRITICAL: Invalid Baseline (native_api)
- **Issue:** The baseline variant `native_api` is returning 0% accuracy (0/0 prompts)
- **Impact:** Cannot evaluate candidate improvement vs baseline
- **Root Cause:** `lfm2.5-thinking:1.2b` model failing with native_api variant (rc=2)
- **Recommendation:** Fix native_api execution or update baseline to atomic variant

### 🟡 HOLD: Candidate Not Promoted
- **Candidate:** lfm2.5-thinking:1.2b atomic/atomic t60 r1 i1
- **Reason:** Policy shows "no clear improvement over baseline yet"
- **Actual:** 91.67% accuracy vs 0% baseline - this IS improvement
- **Issue:** Policy logic treats 0% baseline as invalid comparison point

## Recommendations

1. **Fix baseline variant:** Switch baseline from native_api to atomic for valid comparison
2. **Update policy:** Handle zero-baseline case explicitly (skip regression check)
3. **Investigate native_api:** Model execution failing with rc=2 - check Ollama API compatibility

## Last Run Artifacts

- Supervisor: `7ea0e1b333` - COMPLETED (but jobs failed)
- Meta harness: 3 cycles completed
- Decision: All candidates HOLD/REJECT (no promotion this cycle)
