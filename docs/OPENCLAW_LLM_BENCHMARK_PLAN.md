# OpenClaw LLM Benchmark Plan (Local + Online)

**Goal:** find a fast, reliable **local** model for small operational tasks (routing, formatting, tool orchestration) without sacrificing latency consistency; and compare against online models (OpenAI / Claude / Gemini / GLM) across multiple task types.

This spec is written to avoid reruns: we capture **latency distribution + failure modes + quality** in one pass.

---

## 0) Guiding principles

- **Measure end-to-end**: wall-clock from “request submitted” → “final response received”, plus finer-grained latencies when available.
- **Strict correctness** for objective prompts (JSON/one-word/etc.) + **subjective rating** for open-ended prompts.
- **Track tails**: p50/p90/p95/p99 matter more than averages.
- **Keep runs reproducible**: fixed prompt set, fixed concurrency, fixed thinking level.
- **Subagents for throughput**: parallelize across providers/models; keep main session responsive.

---

## 1) Providers / models to include

### Local (Ollama) — baseline set (already present)
- `qwen2.5:3b`
- `qwen3:4b`
- `llama3.2:3b`
- `gemma2:2b`
- `phi3:3.8b`

### Online (API) — baseline set
> You specified: **GLM 4.7** + **Gemini Flash** (flash variant). We’ll pin exact provider model IDs in the harness config.

- **OpenAI Codex**
  - `openai-codex/gpt-5.3-codex` thinking=`low`
  - `openai-codex/gpt-5.3-codex` thinking=`high` (and optional `xhigh`)
- **Claude**
  - (pin exact model after you confirm)
- **Gemini Flash**
  - flash variant (pin exact: e.g. `gemini-*-flash`)
- **GLM 4.7**
  - pin exact: e.g. `glm-4.7` / `glm-4.7-*` depending on provider

### Optional / stretch
- LiteLLM fronted providers (single unified endpoint) if we want to normalize request/response logging.
- Any new Ollama pulls (only after the baseline run so we can compare deltas).

---

## 2) Prompt suite (task mix)

We run **one fixed suite** across all models.

### A) Hard-format / objective (strict parsing)
- JSON-only outputs (nested JSON as string, numeric types)
- single-token outputs (yes/no; high/low)
- extraction tasks (extract integer)
- date normalization (ISO)

### B) Ops / routing
- Router classification: route ∈ {local,premium} + reason
- diagnose intermittent 502 / TLS upstream checks
- restart / rollback decision support (criticality tagging)

### C) Tool / file reasoning
- “Given these logs, what’s the next 3 commands?”
- “Summarize resource snapshot”

### D) Long-context / stress
- Same tasks as A/B but with long prefix context (2k, 8k, 32k tokens) to see slowdown curve

### E) Open-ended quality
- short summary
- rewrite shorter with constraints

**Run shape:**
- 10–20 core prompts (like your existing p1..p10 set)
- + 3 long-context variants of 3 prompts (to isolate prompt-length latency scaling)

### Canonical prompt set (v1)

These are designed to be **objectively gradable** and to expose “format drift”. Each prompt has a validator.

**P0 (sanity):** Reply with exactly `HEARTBEAT_OK`

**P1 (router JSON):**
Return ONLY JSON: `{ "route":"local|premium", "reason":"..." }` for: debug intermittent nginx 502 with TLS upstream checks.

**P2 (one-sentence summary):** Summarize in one sentence: RAM 7.6/62 GiB, disk 16G/2.8T, load avg 1.05.

**P3 (single token):** Output only one word: `high` or `low`. Task criticality: restart failed production gateway.

**P4 (extraction):** Extract only the integer from: `Disk usage is 16G`

**P5 (rewrite constraint):** Rewrite shorter (max 8 words): `Please verify whether the service is currently operational.`

**P6 (exact bullet count):** Give exactly 3 bullet points for heartbeat checks.

**P7 (typed JSON):** Return ONLY JSON: `{ "ram_used_gib":7.6, "disk_used_gb":16 }`

**P8 (binary):** Answer ONLY `yes` or `no`: Is 1% disk usage safe?

**P9 (date normalize):** Convert to ISO date only (YYYY-MM-DD): Friday, February 13th, 2026.

### Long-context stress variants
For 3 chosen prompts above (router JSON, typed JSON, bullet list):
- prepend 2k / 8k / 32k tokens of neutral filler + a small relevant nugget at the end
- measure latency scaling + constraint adherence

---

## 3) Models × metrics matrix (review checklist)

This table is the “don’t rerun” checklist: we aim to fill every cell at least once per model (and ideally N=3 repeats for variance).

| Model | Provider | E2E latency p50/p95/p99 (ms) | TTFT (ms, if streaming) | Success rate | Failure taxonomy breakdown | Objective pass rate | Subjective score (1-5) | Cost (input/output tokens, $) | Notes |
|---|---|---:|---:|---:|---|---:|---:|---:|---|
| qwen2.5:3b | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | baseline local small model |
| qwen3:4b | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | baseline local |
| llama3.2:3b | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | baseline local |
| gemma2:2b | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | baseline local |
| phi3:3.8b | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | baseline local |
| gpt-5.3-codex (low) | OpenAI Codex | ✅ (ms precise) | ✅/null | ✅ | ✅ | ✅ | ✅ | ✅ | low thinking |
| gpt-5.3-codex (high) | OpenAI Codex | ✅ (ms precise) | ✅/null | ✅ | ✅ | ✅ | ✅ | ✅ | high thinking |
| Claude (TBD) | Anthropic | ✅ | ✅/null | ✅ | ✅ | ✅ | ✅ | ✅ | pin model |
| Gemini Flash (flash) | Google | ✅ | ✅/null | ✅ | ✅ | ✅ | ✅ | ✅ | pin model |
| GLM 4.7 | Zhipu/other | ✅ | ✅/null | ✅ | ✅ | ✅ | ✅ | ✅ | pin model |

Legend: ✅ = must capture; (opt) = only if we run streaming for that model.

## 4) Metrics to capture (so we don’t rerun)

### Latency (critical)
- **E2E latency** per prompt (ms, not seconds)
- **TTFT** (time-to-first-token) when streaming is available; otherwise mark `null`
- **Throughput**: output tokens / second (if token counts available)
- **Queue delay** (if we can observe it): time spent waiting before model starts

### Reliability
- **Success rate** per prompt + per model
- **Failure type** taxonomy:
  - timeout
  - tool error
  - malformed JSON / schema violation
  - wrong constraint (extra words, markdown, etc.)
  - refusal / safety block
  - empty response
- **Retry count** (if harness retries)

### Correctness (objective)
For each strict prompt:
- `passes`: boolean
- `violation`: enum + short message

### Subjective quality (human-scored)
- 1–5 rating for:
  - helpfulness
  - concision
  - adherence to instruction
  - confidence calibration

### Cost / efficiency (online)
- input tokens, output tokens
- estimated $ cost per prompt + per suite

### Consistency / variance
- per-model latency **stddev**
- p50/p90/p95/p99 latency
- error-rate confidence intervals (if we do enough trials)

### System context
- host load avg / free mem at run start and end
- **Disk usage before/after** each model suite (`df -h /`)
- **RAM usage before/after** each model suite (`free -h`)
- **Ollama model size / quantization** (from `ollama list`)
- (optional) Ollama server RSS during run (`ps -o pid,rss,cmd -C ollama`)

### Current local model inventory (captured from this box)

| Local model | Size (GB) |
|---|---:|
| phi3:3.8b | 2.2 |
| gemma2:2b | 1.6 |
| llama3.2:3b | 2.0 |
| qwen2.5:3b | 1.9 |
| qwen3:4b | 2.5 |
| glm4:9b-chat-q4_K_M | (pending pull) |

---

## 4) Harness design (implementation outline)

### Auth prerequisites (do before running)

- **Claude (Claude Code):** ensure Claude Code is logged in (we’ll use it for the Claude provider run). For example:
  - `claude auth login`
  - verify: `claude auth status`

- **Ollama GLM:** pull the target GLM model first and verify it runs:
  - `ollama pull glm4:9b-chat-q4_K_M`
  - quick sanity: `ollama run glm4:9b-chat-q4_K_M "Say only: OK"`


### Data model
Each **run** produces:
- `runs/<run_id>/config.json`
- `runs/<run_id>/results.jsonl` (one line per prompt execution)
- `runs/<run_id>/summary.json` (aggregates)
- `runs/<run_id>/summary.md` (human-friendly)

`results.jsonl` record fields (minimum):
- provider, model, thinking_level
- prompt_id
- started_at_ms, ended_at_ms, e2e_ms
- ttft_ms (nullable)
- input_tokens, output_tokens (nullable)
- success (bool)
- failure_type (nullable)
- raw_output (string; optionally truncated with separate artifact file)
- parsed_output (nullable)
- objective_pass (nullable)

### Execution strategy
- **One model = one subagent** (keeps main session responsive)
- Subagent runs the full suite sequentially for that model (to avoid cross-model interference)
- Main session merges results + computes aggregates

### Concurrency
- Default concurrency: 2–3 online providers in parallel; local models sequential (to avoid GPU/CPU contention skew)
- Repeat each suite **N times** (recommend N=3) to measure variance

### Timing
- Use `date +%s%3N` or Python `time.perf_counter_ns()` for ms resolution
- For OpenAI/Codex: record ms precisely (requirement)

---

## 5) Local search / memory without paid embeddings

### QMD (BM25) for repo + memory search
- Use **BM25 only** (`qmd search`) for fast, local ranking
- Do **not** run `qmd embed/query` by default (slow + large downloads)

Planned collections:
- `openclaw-workspace`: OpenClaw workspace docs + memory files
- `etc-mono`: mono repo docs

Workflow:
1) `qmd search "topic" -n 10 --files -c openclaw-workspace`
2) `qmd get <file> -l 80 --from <line>`

---

## 6) Web search without API keys

- Use `curl`/`wget` to fetch pages directly when URLs are known.
- For “search engine” behavior: use HTML endpoints (e.g. DuckDuckGo HTML) and parse links locally.
- Store fetched sources in artifacts for traceability.

---

## 7) Deliverables

- A single comparison table with:
  - latency p50/p95/p99
  - success rate
  - objective correctness rate
  - subjective rating average
  - cost (online)
- Recommendation: best local model for “small ops” + rules when to escalate to premium.

---

## 8) Open questions (need your answers once)

1) Which **Claude** model(s) exactly?
2) Which provider endpoint for **GLM 4.7** and **Gemini Flash** (direct vs via LiteLLM)?
3) Should we include streaming TTFT measurement, or keep it non-streaming only?
4) Target prompt suite size: 10 (fast iteration) vs 25+ (more coverage)?
