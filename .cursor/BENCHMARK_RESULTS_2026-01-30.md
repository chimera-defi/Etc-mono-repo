# Token Reduction Skill - Benchmark Results (Real Token Counts)

**Date:** January 30, 2026
**Methodology:** Real token counting with `tiktoken` (cl100k_base) via `.cursor/benchmark-real-tokens.sh`.
**Note:** tiktoken is an approximation for Claude tokenization; expect ±10% variance.

## Results

| Strategy | Measured Savings |
|----------|------------------|
| Response conciseness | 89% |
| Tool call overhead (bulk vs 3 reads) | 96% |
| Targeted file reads | 33% |
| Knowledge graph (per query) | 76% |

## Raw output

```
Verbose response: 164 tokens
Concise response: 18 tokens
Savings: 89%

3 separate Read calls: ~1869 tokens
1 MCP CLI bulk read: ~69 tokens
Savings from reduced overhead: 96%

Full file: 5802 tokens
First 50 lines: 3847 tokens
Savings: 33%

Full research: 106 tokens
Knowledge graph query: 25 tokens
Savings per query: 76%
Savings over 10 sessions: 68% (first session stores, 9 retrieve)
```
