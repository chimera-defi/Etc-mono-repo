# Phase 3C: CPU Utilization Profiling Report

**Generated:** 2026-02-14T08:06:18.346535
**System:** 12 cores
**Total samples:** 18 inferences

## Summary by Model

| Model | Mean CPU % | Peak CPU % | Max Cores >90% | Thermal Events |
|-------|-----------|-----------|---|---|
| qwen2.5:3b           |       3.1 |      13.3 |              2 |   5/  5 |
| llama3.2:3b          |       3.9 |      19.0 |              1 |   5/  5 |
| qwen3:4b             |      22.4 |      59.7 |              1 |   4/  4 |
| phi3:3.8b            |       0.6 |       6.6 |              1 |   4/  4 |

## Bottleneck Analysis

**Peak system CPU:** 59.7%
**High-load events (>85%):** 0/18
**Thermal throttling events:** 18/18

### ✗ **Conclusion: CPU NOT the Bottleneck**
- Peak CPU remains below 85%, indicating spare capacity
- Other factors (I/O, memory, model loading) may be limiting

## Scaling Efficiency
  - qwen2.5:3b     : peak  13.3% CPU
  - llama3.2:3b    : peak  19.0% CPU
  - phi3:3.8b      : peak   6.6% CPU
  - qwen3:4b       : peak  59.7% CPU

- **Linear scaling:** CPU usage ∝ model size → CPU-bound workload
- **Sub-linear scaling:** Usage growth slower than size → I/O bottleneck