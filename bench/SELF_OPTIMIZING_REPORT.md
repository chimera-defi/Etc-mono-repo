# Self-Optimizing Harness Report

- Generated: 2026-02-23 13:26:22
- Cycles in this run: 1
- Total historical cycles: 5

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
| lfm2.5-thinking:1.2b atomic/atomic t60 r1 i1 | 5 | 0.20 | 0.8333333333333334 | 0.0 | 1.0 | 0.61 |
| lfm2.5-thinking:1.2b atomic/atomic t60 r2 i1 | 5 | 0.20 | 0.8333333333333334 | 0.0 | 1.0 | 0.61 |
| lfm2.5-thinking:1.2b atomic/native_api t60 r1 i0 | 5 | 0.20 | 0.6666666666666666 | 0.01 | 0.3333333333333333 | 0.6 |
| lfm2.5-thinking:1.2b atomic/native_api t60 r1 i1 | 5 | 0.20 | 0.6666666666666666 | 0.01 | 0.3333333333333333 | 0.61 |
| lfm2.5-thinking:1.2b atomic/native_api t60 r2 i1 | 5 | 0.20 | 0.6666666666666666 | 0.01 | 0.3333333333333333 | 0.61 |
| ministral-3:latest atomic/atomic t60 r1 i1 | 1 | 1.00 | 0.5833333333333334 | 0.0 | 0.6666666666666666 | 242.65 |
| ministral-3:latest atomic/atomic t60 r2 i1 | 1 | 1.00 | 0.5833333333333334 | 0.0 | 0.6666666666666666 | 230.69 |
| ministral-3:latest atomic/native_api t60 r1 i1 | 1 | 0.00 | n/a | n/a | n/a | 0.31 |
| ministral-3:latest atomic/native_api t60 r2 i1 | 1 | 0.00 | n/a | n/a | n/a | 0.31 |
| qwen2.5:3b atomic/atomic t60 r1 i1 | 1 | 1.00 | 0.5833333333333334 | 0.0 | 0.3333333333333333 | 63.08 |
| qwen2.5:3b atomic/atomic t60 r2 i1 | 1 | 1.00 | 0.5833333333333334 | 0.0 | 0.3333333333333333 | 56.19 |
| qwen2.5:3b atomic/native_api t60 r1 i1 | 1 | 0.00 | n/a | n/a | n/a | 0.32 |
| qwen2.5:3b atomic/native_api t60 r2 i1 | 1 | 0.00 | n/a | n/a | n/a | 0.32 |

## Policy Decisions

| Candidate | Decision | Reason |
|---|---|---|
| lfm2.5-thinking:1.2b atomic/atomic t60 r1 i1 | promote | median accuracy improved by 0.167 with acceptable restraint |
| lfm2.5-thinking:1.2b atomic/atomic t60 r2 i1 | promote | median accuracy improved by 0.167 with acceptable restraint |
| lfm2.5-thinking:1.2b atomic/native_api t60 r1 i1 | hold | no clear improvement over baseline yet |
| lfm2.5-thinking:1.2b atomic/native_api t60 r2 i1 | hold | no clear improvement over baseline yet |

## Closed-Loop Outcome
- Promote: lfm2.5-thinking:1.2b atomic/atomic t60 r1 i1
