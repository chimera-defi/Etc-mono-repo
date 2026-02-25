# Self-Optimizing Harness Report

- Generated: 2026-02-25 16:32:09
- Cycles in this run: 3
- Total historical cycles: 3

## Baseline
- lfm2.5-thinking:1.2b / atomic / atomic / t60 r1 i0

## Candidate Matrix (2 specs)
- lfm2.5-thinking:1.2b / atomic / atomic / t60 r1 i1
- lfm2.5-thinking:1.2b / atomic / atomic / t60 r2 i1

## Aggregated Metrics (median / variance)

| Spec | Samples | Success | MedAcc | VarAcc | MedRestraint | MedElapsed(s) |
|---|---:|---:|---:|---:|---:|---:|
| lfm2.5-thinking:1.2b atomic/atomic t60 r1 i0 | 3 | 0.00 | 0.6666666666666666 | 0.0 | 0.6666666666666666 | 0.03 |
| lfm2.5-thinking:1.2b atomic/atomic t60 r1 i1 | 3 | 0.00 | 0.6666666666666666 | 0.0 | 0.6666666666666666 | 0.03 |
| lfm2.5-thinking:1.2b atomic/atomic t60 r2 i1 | 3 | 0.00 | 0.6666666666666666 | 0.0 | 0.6666666666666666 | 0.03 |

## Policy Decisions

| Candidate | Decision | Reason |
|---|---|---|
| lfm2.5-thinking:1.2b atomic/atomic t60 r1 i1 | hold | no clear improvement over baseline yet |
| lfm2.5-thinking:1.2b atomic/atomic t60 r2 i1 | hold | no clear improvement over baseline yet |

## Closed-Loop Outcome
- No candidate promoted this run.
