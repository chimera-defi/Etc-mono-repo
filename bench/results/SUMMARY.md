# Benchmark Results Summary

## Current Results (Self-Optimizing Harness)

### Atomic Phase (P1-P12)
| Model | Passed | Total | Accuracy | Restraint |
|-------|--------|-------|----------|-----------|
| lfm2.5-thinking:1.2b | 11 | 12 | 91.7% | 1.00 |
| glm-4.7-flash:latest | 10 | 12 | 83.3% | 0.67 |
| mistral:7b | 8 | 12 | 66.7% | 0.83 |

### Extended Phase (P13-P30)
| Model | Passed | Total | Accuracy |
|-------|--------|-------|----------|
| lfm2.5-thinking:1.2b | 12 | 18 | 66.7% |
| glm-4.7-flash:latest | 9 | 18 | 50.0% |

### Combined Scores
- **lfm2.5-thinking:1.2b**: 23/30 (76.7%) - WINNER
- **glm-4.7-flash:latest**: 19/30 (63.3%)

## Model List (in config)
- lfm2.5-thinking:1.2b
- glm-4.7-flash:latest  
- mistral:7b
- gpt-oss:latest
- qwen2.5:3b
- ministerial-3:latest
- qwen3.5:35b (in progress)

## System Metrics
- RAM: 62GB total
- Load: ~9.7

Last updated: $(date)
