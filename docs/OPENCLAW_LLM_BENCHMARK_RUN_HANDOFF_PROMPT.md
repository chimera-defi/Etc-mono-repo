# Handoff Prompt: Run the OpenClaw LLM Benchmark (E2E latency + quality)

Use this prompt in a fresh agent session. It assumes you have shell access on the same host.

---

You are responsible for executing the benchmark described in:
`docs/OPENCLAW_LLM_BENCHMARK_PLAN.md`

## Objective
Run the benchmark across all listed models/providers and produce a results corpus that we can extend across reruns **without re-running completed model×prompt pairs**.

## Hard requirements
1) **E2E wall-clock timing in milliseconds** for every prompt execution (`e2e_ms`), measured from immediately before the request/CLI invocation starts until the complete final response is received.
2) Streaming rule:
   - If **all models in the run support streaming**, use streaming and capture **TTFT ms**.
   - Otherwise run **non-streaming only** and set TTFT to null.
3) Prompt suite must be **25+ prompts** (expand the current v1 set, keep backward compatibility with P0..P10).
4) Rerun strategy:
   - If a provider is unavailable (e.g. Claude credits), mark `availability_status=skipped_unavailable` for those prompts.
   - Do **not** rerun other providers just to fill missing cells.
5) Log resource context:
   - `free -h` + `df -h /` at start/end of each model suite.
   - Persist local model inventory from `ollama list`.

## Models/providers to cover
### Local (Ollama)
- qwen2.5:3b
- qwen3:4b
- qwen3:8b
- qwen3:14b
- llama3.2:3b
- gemma2:2b
- phi3:3.8b
- glm-4.7-flash:latest
- gpt-oss:latest
- devstral-small-2
- ministral-3
- mistral-small3.2

### Online
- OpenAI Codex `openai-codex/gpt-5.3-codex` thinking=low
- OpenAI Codex `openai-codex/gpt-5.3-codex` thinking=high
- Claude via Claude Code: Haiku + Opus 4.6 (exact IDs per `claude`)

## Preconditions checklist
- Confirm Ollama is running: `systemctl is-active ollama`
- Confirm required models are present; pull missing ones:
  - `ollama pull <model>`
- Confirm Claude Code login:
  - `claude auth status` must show loggedIn=true

## Deliverables (files)
Create a new folder under `bench/runs/<run_id>/` containing:
- `config.json`
- `inventory.json` (from `ollama list` and any provider metadata)
- `results.jsonl` (one JSON object per prompt execution)
- `summary.json` (aggregates)
- `summary.md` (human table)

Also update `docs/OPENCLAW_LLM_BENCHMARK_PLAN.md` with:
- the final 25+ prompt list (IDs and validators)
- any discovered provider/model ID exact strings

## Execution guidance
- Run local models sequentially to avoid contention skew.
- Run online providers with low concurrency (2-3) and record any rate limits.
- Use deterministic validators for objective prompts:
  - strict JSON parse
  - exact-match string checks
  - regex checks

## Report back
When complete, return:
- the run folder path
- a concise table of p50/p95/p99 latency and success rate by model
- a list of any prompts/models that were skipped due to availability.
