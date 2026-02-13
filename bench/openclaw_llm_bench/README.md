# openclaw_llm_bench (minimal harness)

Minimal benchmark harness (Python stdlib only) for running a fixed prompt suite against:

- **Ollama** via its **OpenAI-compatible** endpoint (`/v1/chat/completions`)
- **OpenAI Codex** via **OpenAI Responses API** (thinking `low` / `high`)
- **Claude** via **Claude Code CLI** (best-effort; otherwise marked `skipped_unavailable`)

It records **E2E latency (ms)** per prompt execution and writes:

- `results.jsonl`
- `summary.json`
- `summary.md`

Streaming/TTFT: supported **only** when you run a set of targets that all support streaming (currently: `ollama_openai` + `openai_responses`). If you include any non-streaming target (e.g. Claude CLI), `--stream` will abort. When streaming is enabled, the harness captures `ttft_ms`.

## Files

- `prompts_v1.json` — prompt suite (P0..P10). Extend by appending new prompts.
- `run_bench.py` — runner.
- `runs/<run_id>/` — outputs.

## How to run

From repo root:

```bash
cd bench/openclaw_llm_bench

# Ollama only
python3 run_bench.py --targets ollama --resume

# OpenAI Codex only (requires OPENAI_API_KEY)
export OPENAI_API_KEY=...  # required
python3 run_bench.py --targets openai_low,openai_high --resume

# Claude only (requires Claude Code CLI installed + logged in)
python3 run_bench.py --targets claude_haiku,claude_opus --resume

# Mixed run (default targets)
python3 run_bench.py --resume
```

### Common environment overrides

```bash
# Ollama OpenAI-compatible endpoint base
export OLLAMA_OPENAI_BASE=http://localhost:11434/v1

# OpenAI
export OPENAI_BASE_URL=https://api.openai.com/v1
export OPENAI_CODEX_MODEL=openai-codex/gpt-5.3-codex

# Claude CLI model ids (must match what `claude` expects)
export CLAUDE_HAIKU_MODEL=claude-haiku
export CLAUDE_OPUS_MODEL=claude-opus-4.6

# Local models list
export OLLAMA_MODELS='qwen2.5:3b,qwen3:4b,llama3.2:3b,gemma2:2b,phi3:3.8b,glm-4.7-flash:latest'
```

## Notes / design choices

- Sequential execution (one model at a time) to avoid contention skew.
- `--resume` skips already-recorded provider×model×thinking×prompt cells in the same run folder.
- Resource snapshots per model suite are saved as `resources_<tag>_{before,after}.txt` inside the run folder.

