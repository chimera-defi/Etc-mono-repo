# Self-Optimizing Harness Report

- Generated: 2026-02-24 06:04:16
- Cycles in this run: 3
- Total historical cycles: 3

## Baseline
- lfm2.5-thinking:1.2b / atomic / native_api / t60 r1 i0

## Candidate Matrix (4 specs)
- lfm2.5-thinking:1.2b / atomic / native_api / t60 r1 i1
- lfm2.5-thinking:1.2b / atomic / native_api / t60 r2 i1
- lfm2.5-thinking:1.2b / atomic / atomic / t60 r1 i1
- lfm2.5-thinking:1.2b / atomic / atomic / t60 r2 i1

## Aggregated Metrics (median / variance)

| Spec | Samples | Success | MedAcc | VarAcc | MedRestraint | MedElapsed(s) |
|---|---:|---:|---:|---:|---:|---:|
| lfm2.5-thinking:1.2b atomic/atomic t60 r1 i1 | 3 | 1.00 | 0.9166666666666666 | 0.0 | 1.0 | 0.31 |
| lfm2.5-thinking:1.2b atomic/atomic t60 r2 i1 | 3 | 1.00 | 0.9166666666666666 | 0.0 | 1.0 | 0.31 |
| lfm2.5-thinking:1.2b atomic/native_api t60 r1 i0 | 3 | 0.00 | n/a | n/a | n/a | 0.31 |
| lfm2.5-thinking:1.2b atomic/native_api t60 r1 i1 | 3 | 0.00 | n/a | n/a | n/a | 0.31 |
| lfm2.5-thinking:1.2b atomic/native_api t60 r2 i1 | 3 | 0.00 | n/a | n/a | n/a | 0.31 |

## Policy Decisions

| Candidate | Decision | Reason |
|---|---|---|
| lfm2.5-thinking:1.2b atomic/atomic t60 r1 i1 | hold | no clear improvement over baseline yet |
| lfm2.5-thinking:1.2b atomic/atomic t60 r2 i1 | hold | no clear improvement over baseline yet |
| lfm2.5-thinking:1.2b atomic/native_api t60 r1 i1 | reject | no accuracy signal available |
| lfm2.5-thinking:1.2b atomic/native_api t60 r2 i1 | reject | no accuracy signal available |

## Closed-Loop Outcome
- No candidate promoted this run.
