# OpenClaw LLM Benchmark Progress (WIP)

This is a living progress report generated from local run folders under:

- `bench/openclaw_llm_bench/runs/*/results.jsonl`

> Note: run folders themselves are ignored by git (`runs/`), so this report is the artifact intended for sharing/review in PRs.

## Aggregate table (all runs so far)

| Provider | Model | Thinking | Runs | n(total) | n(ok) | n(success) | n(error) | n(rate) | n(skipped) | succ% (ok) | e2e p50 (ms) | e2e p95 (ms) | suite wall p50 (ms) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ollama_openai | llama3.2:3b |  | 2 | 8 | 8 | 8 | 0 | 0 | 0 | 100.0% | 2849 | 4271 | 10010 |
| ollama_openai | qwen2.5:3b |  | 1 | 11 | 11 | 11 | 0 | 0 | 0 | 100.0% | 2190 | 9387 | 33737 |
| ollama_openai | qwen3:14b |  | 1 | 5 | 3 | 3 | 2 | 0 | 0 | 100.0% | 75417 | 80560 | 388673 |
| ollama_openai | qwen3:4b |  | 1 | 11 | 6 | 6 | 5 | 0 | 0 | 100.0% | 33866 | 209153 | 1352624 |
| ollama_openai | qwen3:8b |  | 1 | 11 | 9 | 9 | 2 | 0 | 0 | 100.0% | 49171 | 75013 | 653756 |
| openai_responses | gpt-5-codex | high | 1 | 5 | 0 | 0 | 0 | 5 | 0 |  |  |  | 7210 |
| openai_responses | gpt-5-codex | low | 1 | 5 | 0 | 0 | 0 | 5 | 0 |  |  |  | 2645 |
| openai_responses | openai-codex/gpt-5.3-codex | high | 1 | 5 | 0 | 0 | 5 | 0 | 0 |  |  |  | 2198 |
| openai_responses | openai-codex/gpt-5.3-codex | low | 1 | 5 | 0 | 0 | 5 | 0 | 0 |  |  |  | 2742 |

### Notes
- `n(rate)` includes OpenAI `insufficient_quota` (HTTP 429) outcomes.
- `suite wall` is the wall-clock span for the entire provider×model×thinking suite in that run (min started_at_ms to max ended_at_ms).
