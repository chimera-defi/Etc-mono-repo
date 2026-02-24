# Final Benchmark Comparison: LFM vs GLM

## Atomic Phase (P1-P12)

| Metric | LFM2.5-1.2B | GLM-4.7-Flash |
|--------|-------------|---------------|
| Score | 11/12 (91.7%) | 10/12 (83.3%) |
| Restraint | 1.00 | 0.67 |
| Avg Speed | 17227ms | 15888ms |
| Min/Max | 6225/36432ms | 6210/60000ms |
| Total Time | 206.7s | 190.7s |

## Extended Phase (P13-P30)

| Metric | LFM2.5-1.2B | GLM-4.7-Flash |
|--------|-------------|---------------|
| Score | 12/18 (66.7%) | 9/18 (50.0%) |
| Avg Speed | 8652ms | 8468ms |
| Total Time | 155.7s | 152.4s |

## Combined (P1-P30)

| Metric | LFM2.5-1.2B | GLM-4.7-Flash |
|--------|-------------|---------------|
| **Total Score** | **23/30 (76.7%)** | **19/30 (63.3%)** |
| Atomic | 91.7% | 83.3% |
| Extended | 66.7% | 50.0% |
| Restraint | 1.00 | 0.67 |
| Model Size | 731 MB | 19 GB |

## Verdict

**LFM2.5-1.2B wins overall** — higher accuracy at 26x smaller size.

- Atomic: LFM 91.7% vs GLM 83.3% (+8.3%)
- Extended: LFM 66.7% vs GLM 50.0% (+16.7%)
- Combined: LFM 76.7% vs GLM 63.3%
- Restraint: LFM 1.00 vs GLM 0.67
- Speed: Similar (~15-17s avg atomic)
