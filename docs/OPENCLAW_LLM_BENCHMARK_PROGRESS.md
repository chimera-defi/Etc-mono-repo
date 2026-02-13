# OpenClaw LLM Benchmark Progress (WIP)

This is a living progress report generated from local run folders under:

- `bench/openclaw_llm_bench/runs/*/results.jsonl`

> Note: run folders themselves are ignored by git (`runs/`), so this report is the artifact intended for sharing/review in PRs.

## Aggregate table (all runs so far)

| Provider | Model | Thinking | Runs | n(total) | n(ok) | ok% (total) | n(success) | succ% (ok) | succ% (total) | n(error) | n(rate) | n(skipped) | e2e p50 | e2e p95 | suite wall p50 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ollama_openai | devstral-small-2:latest |  | 1 | 5 | 4 | 80.0% | 4 | 100.0% | 80.0% | 1 | 0 | 0 | 14108 | 26093 | 89638 |
| ollama_openai | gemma2:2b |  | 1 | 5 | 5 | 100.0% | 5 | 100.0% | 100.0% | 0 | 0 | 0 | 2919 | 16961 | 38423 |
| ollama_openai | glm-4.7-flash:latest |  | 1 | 5 | 2 | 40.0% | 2 | 100.0% | 40.0% | 3 | 0 | 0 | 14074 | 18229 | 118239 |
| ollama_openai | glm4:9b-chat-q4_K_M |  | 1 | 5 | 4 | 80.0% | 4 | 100.0% | 80.0% | 1 | 0 | 0 | 6870 | 8289 | 53644 |
| ollama_openai | gpt-oss:latest |  | 1 | 5 | 3 | 60.0% | 3 | 100.0% | 60.0% | 2 | 0 | 0 | 14109 | 19092 | 99836 |
| ollama_openai | llama3.2:3b |  | 2 | 8 | 8 | 100.0% | 8 | 100.0% | 100.0% | 0 | 0 | 0 | 2849 | 4271 | 10010 |
| ollama_openai | ministral-3:latest |  | 1 | 5 | 3 | 60.0% | 3 | 100.0% | 60.0% | 2 | 0 | 0 | 4734 | 9597 | 76600 |
| ollama_openai | mistral-small3.2:latest |  | 1 | 5 | 4 | 80.0% | 4 | 100.0% | 80.0% | 1 | 0 | 0 | 15144 | 25317 | 90379 |
| ollama_openai | phi3:3.8b |  | 1 | 5 | 4 | 80.0% | 4 | 100.0% | 80.0% | 1 | 0 | 0 | 3582 | 7577 | 46013 |
| ollama_openai | qwen2.5:3b |  | 1 | 11 | 11 | 100.0% | 11 | 100.0% | 100.0% | 0 | 0 | 0 | 2190 | 9387 | 33737 |
| ollama_openai | qwen3:14b |  | 1 | 5 | 3 | 60.0% | 3 | 100.0% | 60.0% | 2 | 0 | 0 | 75417 | 80560 | 388673 |
| ollama_openai | qwen3:4b |  | 1 | 11 | 6 | 54.5% | 6 | 100.0% | 54.5% | 5 | 0 | 0 | 33866 | 209153 | 1352624 |
| ollama_openai | qwen3:8b |  | 1 | 11 | 9 | 81.8% | 9 | 100.0% | 81.8% | 2 | 0 | 0 | 49171 | 75013 | 653756 |
| openai_responses | gpt-5-codex | high | 1 | 5 | 0 | 0.0% | 0 |  | 0.0% | 0 | 5 | 0 |  |  | 7210 |
| openai_responses | gpt-5-codex | low | 1 | 5 | 0 | 0.0% | 0 |  | 0.0% | 0 | 5 | 0 |  |  | 2645 |
| openai_responses | openai-codex/gpt-5.3-codex | high | 1 | 5 | 0 | 0.0% | 0 |  | 0.0% | 5 | 0 | 0 |  |  | 2198 |
| openai_responses | openai-codex/gpt-5.3-codex | low | 1 | 5 | 0 | 0.0% | 0 |  | 0.0% | 5 | 0 | 0 |  |  | 2742 |
### Notes
- `ok% (total)` = `n(ok) / n(total)`; this is the most intuitive “did it finish?” rate.
- `succ% (ok)` = `n(success) / n(ok)` (usually 100% because `ok` implies a completed call; kept for completeness).
- `succ% (total)` = `n(success) / n(total)`.
- `n(rate)` includes OpenAI `insufficient_quota` (HTTP 429) outcomes.
- `suite wall` is the wall-clock span for the entire provider×model×thinking suite in that run (min started_at_ms to max ended_at_ms).
