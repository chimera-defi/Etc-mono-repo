# LLM Benchmark Aggregation Summary

**Last Updated:** 2026-02-14 08:53:52 UTC

## Overview

| Metric | Value |
|--------|-------|
| Models Tested | 23 |
| Total Executions | 489 |
| Avg Success Rate | 44.2% |
| Avg Objective Pass | 23.3% |

## Master Results Table

| Model | Provider | Thinking | N Total | N OK | Success % | Obj Pass % | E2E P50 (ms) | E2E P95 (ms) | Wall (ms) |
|-------|----------|----------|---------|------|-----------|------------|-------------|-------------|----------|
| devstral-small-2:latest | ollama_openai | None | 112 | 66 | 58.9 | 50.9 | 41489 | 120101 | 1771025674403 |
| gemma2:2b | ollama_openai | None | 54 | 29 | 53.7 | 40.7 | 14109 | 30031 | 1771017505473 |
| gpt-5-codex | openai_responses | low | 10 | 0 | 0.0 | 0.0 | 488 | 5037 | 9891 |
| haiku | claude_code_cli | None | 21 | 21 | 100.0 | 52.4 | 9190 | 34824 | 334102 |
| llama3.2:3b | ollama_openai | None | 4 | 4 | 100.0 | 75.0 | 2904 | 4753 | 11083 |
| llama3.2:3b | unknown | None | 2 | 0 | 0.0 | 0.0 | 0 | 0 | 0 |
| llama3.2:3b | ollama_openai | None | 66 | 39 | 59.1 | 36.4 | 7421 | 60061 | 1771021338444 |
| llama3.2:3b | unknown | None | 4 | 1 | 25.0 | 0.0 | 27952 | 27952 | 1771051564343 |
| llama3.2:3b | unknown | None | 4 | 1 | 25.0 | 0.0 | 73999 | 73999 | 1771051659575 |
| ministral-3:latest | unknown | None | 18 | 7 | 38.9 | 27.8 | 112976 | 120103 | 1771022848691 |
| mistral-small3.2:latest | unknown | None | 39 | 4 | 10.3 | 17.9 | 30030 | 30080 | 1771021436313 |
| mistral:7b | unknown | None | 2 | 0 | 0.0 | 0.0 | 0 | 0 | 0 |
| mistral:7b | unknown | None | 3 | 0 | 0.0 | 0.0 | 0 | 0 | 0 |
| openai-codex/gpt-5.3-codex | openai_responses | low | 10 | 0 | 0.0 | 20.0 | 596 | 738 | 4978 |
| qwen2.5:14b | unknown | None | 8 | 4 | 50.0 | 0.0 | 13969 | 19133 | 1771057878269 |
| qwen2.5:14b | ollama_openai | None | 2 | 2 | 100.0 | 50.0 | 17431 | 17431 | 27603 |
| qwen2.5:3b | unknown | None | 3 | 0 | 0.0 | 0.0 | 0 | 0 | 0 |
| qwen2.5:3b | unknown | None | 1 | 0 | 0.0 | 0.0 | 0 | 0 | 0 |
| qwen2.5:3b | ollama_openai | None | 44 | 29 | 65.9 | 61.4 | 49171 | 300100 | 1771015391600 |
| qwen2.5:3b | unknown | None | 4 | 1 | 25.0 | 25.0 | 24958 | 24958 | 1771057622247 |
| qwen3:14b | unknown | None | 6 | 4 | 66.7 | 50.0 | 2898 | 3376 | 1771015469002 |
| qwen3:8b | unknown | None | 68 | 3 | 4.4 | 4.4 | 30030 | 30033 | 1771024376787 |
| smollm:1.7b | unknown | None | 4 | 1 | 25.0 | 25.0 | 23407 | 23407 | 1771057993181 |

## Aggregates by Provider

| Provider | # Runs | Avg Success % | Avg Obj Pass % |
|----------|--------|---------------|----------------|
| claude_code_cli | 1 | 100.0% | 52.4% |
| ollama_openai | 6 | 72.9% | 52.4% |
| openai_responses | 2 | 0.0% | 10.0% |
| unknown | 14 | 19.3% | 10.7% |

## Best/Worst Performers

**Best Success Rate:** haiku (100.0%)

**Worst Success Rate:** llama3.2:3b (0.0%)

---
*Aggregation daemon active. Polling every 2 minutes.*
