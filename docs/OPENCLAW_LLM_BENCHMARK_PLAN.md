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

### Local (Ollama) — baseline set
- `qwen2.5:3b`
- `qwen3:4b`
- `qwen3:8b`
- `qwen3:14b`
- `llama3.2:3b`
- `gemma2:2b`
- `phi3:3.8b`
- `glm-4.7-flash:latest`
- `gpt-oss:latest`
- `devstral-small-2` (tag TBD)
- `ministral-3` (tag TBD)
- `mistral-small3.2` (tag TBD)

### Online (API) — baseline set
> You specified: **GLM 4.7** + **Gemini Flash** (flash variant). We’ll pin exact provider model IDs in the harness config.

- **OpenAI Codex**
  - `openai-codex/gpt-5.3-codex` thinking=`low`
  - `openai-codex/gpt-5.3-codex` thinking=`high` (and optional `xhigh`)
- **Claude (Claude Code)**
  - `claude-haiku` (exact ID TBD)
  - `claude-opus-4.6` (exact ID TBD)
  - Note: availability/credits may be transient; we allow partial runs and fill missing cells on later reruns.
- **GLM 4.7 (local via Ollama)**
  - `glm-4.7-flash:latest`

(We are *not* benchmarking Gemini Flash.)

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
- **25+ core prompts** (objective + ops + long prompt + tool-usage)
- + long-context variants (2k / 8k / 32k) for a subset to isolate prompt-length latency scaling

### Canonical prompt set (v1)

> TODO: expand from the 11 prompts below to **25+ prompts** before first full run. Keep a balanced mix:
> - strict objective format checks (JSON/single-token/extraction)
> - ops/routing triage
> - long operator handoff prompt
> - tool-like reasoning (commands, log triage)
> - 2–3 “gotcha” prompts (ambiguous token vs crypto token; nested JSON escaping)

These are designed to be **objectively gradable** and to expose “format drift”. Each prompt has a validator.

We also include **one long prompt** comparable to real operator instructions (multi-paragraph, constraints, and multiple asks) to measure latency scaling and degradation under longer inputs.

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

**P10 (long operator prompt, mixed objective+subjective):**
You are assisting with a production incident. We just migrated to a new server and are seeing intermittent 502s on nginx with TLS upstream checks. I need you to do *three* things:
1) Propose a step-by-step debug plan with exactly 7 steps, each step must be one sentence.
2) Provide a command-only block with exactly 5 commands (no explanations) to gather evidence on Ubuntu.
3) End with a short risk assessment (max 40 words) that explicitly mentions whether to escalate to a premium model.
Constraints: do not use markdown headers, do not include code fences, and keep the total response under 220 words.

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
| qwen3:8b | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | added |
| qwen3:14b | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | added |
| llama3.2:3b | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | baseline local |
| gemma2:2b | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | baseline local |
| phi3:3.8b | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | baseline local |
| GLM 4.7 flash | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | glm-4.7-flash:latest |
| gpt-oss | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | gpt-oss:latest |
| devstral-small-2 | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | tag TBD |
| ministral-3 | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | tag TBD |
| mistral-small3.2 | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | tag TBD |
| gpt-5.3-codex (low) | OpenAI Codex | ✅ (ms precise) | ✅/null | ✅ | ✅ | ✅ | ✅ | ✅ | low thinking |
| gpt-5.3-codex (high) | OpenAI Codex | ✅ (ms precise) | ✅/null | ✅ | ✅ | ✅ | ✅ | ✅ | high thinking |
| Claude (TBD) | Anthropic | ✅ | ✅/null | ✅ | ✅ | ✅ | ✅ | ✅ | pin model |
| Gemini Flash | — | — | — | — | — | — | — | — | not benchmarking |
| GLM 4.7 flash | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | glm-4.7-flash:latest |

Legend: ✅ = must capture; (opt) = only if we run streaming for that model.

## 4) Metrics to capture (so we don’t rerun)

### Latency (critical)
- **E2E latency** per prompt (ms, not seconds)
- **TTFT** (time-to-first-token):
  - If **all models in the run support streaming**, run streaming and capture TTFT.
  - Otherwise, run **non-streaming only** and set TTFT=`null` for everything.
- **Throughput**: output tokens / second (if token counts available)
- **Queue delay** (if we can observe it): time spent waiting before model starts

### Reliability
- **Success rate** per prompt + per model
- **Availability state** per provider at run time (e.g., Claude credits exhausted → mark prompts as `skipped_unavailable` rather than failing the whole run)
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
| qwen3:8b | 5.2 |
| qwen3:14b | (pulling) |
| glm-4.7-flash:latest | (pulling) |
| gpt-oss:latest | (pulling) |
| devstral-small-2 | (pulling) |
| ministral-3 | (pulling) |
| mistral-small3.2 | (pulling) |
| glm4:9b-chat-q4_K_M | 6.3 |

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
- availability_status: `ok|skipped_unavailable|rate_limited|auth_error`
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

1) Confirm exact Claude model IDs for **Haiku** and **Opus 4.6** as they appear in Claude Code.
2) Streaming TTFT is **conditional** (stream only if all models in the run can stream). Confirm that’s acceptable.
3) Confirm prompt suite target stays at **25+**.

## 9) Resource hygiene during benchmarking (big local models)

Some local Ollama models are large; to keep benchmarks reliable we need to avoid memory/disk pressure and avoid accidental concurrent inference.

### Before each model suite
- Confirm nothing is currently running in Ollama:
  - `ollama ps` should be empty
- Capture baseline resources:
  - `free -h`
  - `df -h /`

### After each model suite
- Re-check:
  - `ollama ps`
  - `free -h`
  - `df -h /`
- If anything is still running, stop it (best-effort):
  - `ollama stop <model>` (if supported)

### Disk eviction policy (if needed)
If disk usage becomes a concern mid-run, we may delete models we’ve already benchmarked.

Rules:
- Only delete **after** the model’s results are safely written to `results.jsonl`.
- Record deletions in the run artifacts:
  - which model tag was removed
  - `df -h /` before/after
  - reason (disk pressure / no longer needed)

Commands:
- List installed: `ollama list`
- Remove a model: `ollama rm <model>`

(If we ever need to re-run a removed model, we can `ollama pull <model>` again, but we should avoid doing that unless necessary.)

## 10) Rerun strategy (don’t waste runs)

We will run the suite multiple times. Each run appends to the same results corpus; missing provider/model cells remain empty until that provider becomes available again.

- If a provider is unavailable (e.g. **Claude credits**), record `availability_status=skipped_unavailable` for those prompts.
- Do **not** rerun unaffected providers just to fill the missing cells.
- Summary generation should be able to aggregate across runs and show “coverage”: which model×prompt pairs have results.
