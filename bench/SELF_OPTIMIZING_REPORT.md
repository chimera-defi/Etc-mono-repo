# Self-Optimizing Harness Report

**Generated:** 2026-02-26T12:00:48
**Supervisor Run:** 2155cdc6
**Status:** PASS ✓

## Policy Gate Check

| Gate | Status | Details |
|------|--------|---------|
| No regression vs baseline | ✓ PASS | Current avg accuracy 0.80 >= baseline 0.75 |
| Restraint floor | ✓ PASS | lfm2.5-thinking:1.2b = 0.75, mistral:7b = 0.68 (both >= 0.3) |
| Variance threshold | ✓ PASS | All latency variance < 20% (lfm: 1.9%, mistral: 3.9%) |

## Canonical Results

| Model | Accuracy | Restraint | Latency (ms) | Status |
|-------|----------|-----------|--------------|--------|
| lfm2.5-thinking:1.2b | 0.82 | 0.75 | 1450-1520 | canonical |
| mistral:7b | 0.78 | 0.68 | 3100-3400 | canonical |

## Stable Candidates

- lfm2.5-thinking:1.2b
- mistral:7b

## Recommendations

- Continue monitoring both canonical models
- No regression detected - optimization cycle can proceed

## Decision

**Status:** PASS - No HOLD/REJECT required. All policy gates passed.
