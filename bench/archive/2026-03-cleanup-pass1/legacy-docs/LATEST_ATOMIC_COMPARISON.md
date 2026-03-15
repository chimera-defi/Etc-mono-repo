# LATEST_ATOMIC_COMPARISON.md - Canonical Status

**Generated:** 2026-02-27T00:00:59+00:00
**Supervisor Run:** c6de3fa7
**Status:** PASS ✓

## Canonical Status: READY

### Policy Gate Status

| Gate | Status | Notes |
|------|--------|-------|
| No regression vs baseline | ✓ PASS | Avg accuracy 0.80 >= baseline 0.75 (+0.05 margin) |
| Restraint floor | ✓ PASS | all >= 0.3 |
| Variance threshold | ✓ PASS | All < 20% |

### Canonical Results Summary

| Model | Accuracy | Restraint | Latency (ms) | Status |
|-------|----------|-----------|--------------|--------|
| lfm2.5-thinking:1.2b | 0.82 | 0.75 | 1450-1520 | canonical |
| mistral:7b | 0.78 | 0.68 | 3100-3400 | canonical |

### Supervisor Run Details

- **Run ID:** c6de3fa7
- **Timestamp:** 2026-02-27T00:00:59
- **Status:** PASS
- **Canonical models:** 2
- **Issues:** None

### Blockers

None - all policy gates passed.

## Meta Harness Decision

- **Baseline:** lfm2.5-thinking:1.2b / atomic / atomic
- **Candidates evaluated:** 2
- **Promoted:** 0 (stable state maintained)
- **Rejected:** 0
- **Decision:** CONTINUE - No regressions detected

## Alert Summary

No critical regressions detected. All policy gates passed.
