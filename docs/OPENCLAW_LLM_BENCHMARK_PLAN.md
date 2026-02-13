# OpenClaw LLM Benchmark Plan (Local + Online)

**Goal:** find a fast, reliable **local** model for small operational tasks (routing, formatting, tool orchestration) without sacrificing latency consistency; and compare against online models (OpenAI / Claude / Gemini / GLM) across multiple task types.

This spec is written to avoid reruns: we capture **latency distribution + failure modes + quality** in one pass.

---

## 0) Guiding principles

- **Measure end-to-end (E2E)**: *wall-clock* from the moment the client submits the request (right before the HTTP call / CLI invocation) → the moment the full final response is received (after last byte). Record this as `e2e_ms` (milliseconds).
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
- `devstral-small-2:latest`
- `ministral-3:latest`
- `mistral-small3.2:latest`

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

### Canonical prompt set (v2, 29 prompts)

This suite is designed to be **objectively gradable** and to expose common failure modes: format drift, extra prose, wrong types, missing escaping, and “helpful” additions.

**Harness rule (global):** unless explicitly allowed, **no surrounding text**. If a prompt says “Return ONLY JSON”, the full response must parse as a single JSON value and nothing else.

Each prompt below includes a suggested validator.

#### Objective / hard-format prompts

**P0 (sanity / exact):**
Prompt: Reply with exactly `HEARTBEAT_OK`
- Validator: exact match `HEARTBEAT_OK`

**P1 (router JSON / enum):**
Prompt: Return ONLY JSON: `{ "route":"local"|"premium", "reason":"..." }` for: debug intermittent nginx 502 with TLS upstream checks.
- Validator: JSON schema
  - `type=object`, required: `route` (enum: `local|premium`), `reason` (string, minLen 3)

**P2 (one-sentence summary):**
Prompt: Summarize in exactly one sentence: `RAM 7.6/62 GiB, disk 16G/2.8T, load avg 1.05.`
- Validator: regex (single sentence): `^[A-Z].*[.!?]$` AND must not contain `\n`

**P3 (single token / exact set):**
Prompt: Output only one word: `high` or `low`. Task criticality: restart failed production gateway.
- Validator: exact match `high` OR exact match `low`

**P4 (extraction / integer):**
Prompt: Extract only the integer from: `Disk usage is 16G`
- Validator: regex `^\d+$`

**P5 (rewrite constraint / word count):**
Prompt: Rewrite shorter (max 8 words): `Please verify whether the service is currently operational.`
- Validator: word count `<= 8` AND must not include quotes

**P6 (exact bullet count):**
Prompt: Give exactly 3 bullet points for heartbeat checks. Use `- ` bullets.
- Validator: regex/count: exactly 3 lines matching `^- .+` and no extra lines

**P7 (typed JSON / numeric types):**
Prompt: Return ONLY JSON: `{ "ram_used_gib":7.6, "disk_used_gb":16 }`
- Validator: JSON schema
  - `ram_used_gib`: number (must be `7.6` exactly), `disk_used_gb`: integer (must be `16` exactly)

**P8 (binary / exact):**
Prompt: Answer ONLY `yes` or `no`: Is 1% disk usage safe?
- Validator: exact match `yes` OR exact match `no`

**P9 (date normalize / exact format):**
Prompt: Convert to ISO date only (YYYY-MM-DD): `Friday, February 13th, 2026.`
- Validator: exact match `2026-02-13`

**P10 (exact token output / whitespace sensitivity):**
Prompt: Output EXACTLY the following 9 characters (no newline): `aB3_9xZ0!`
- Validator: exact match `aB3_9xZ0!`

**P11 (strict JSON array / ordering):**
Prompt: Return ONLY JSON array of strings, in this exact order: `restart`, `rollback`, `investigate`.
- Validator: exact JSON match `["restart","rollback","investigate"]`

**P12 (JSON with null + booleans):**
Prompt: Return ONLY JSON: `{ "ttft_ms": null, "streaming": false, "ok": true }`
- Validator: exact JSON match (after parsing) with types: null/bool/bool and same keys present

**P13 (nested JSON escaping / JSON-as-string gotcha):**
Prompt: Return ONLY JSON with this shape: `{ "payload_json": "<string>" }`. The `payload_json` string must itself be valid JSON and must equal: `{ "a": 1, "b": "x\n y" }` (note: includes a newline escape).
- Validator: two-stage parse
  1) outer is JSON object with `payload_json` string
  2) parse `payload_json` as JSON; it must equal object `{a:1,b:"x\n y"}`

**P14 (JSON escaping / quotes):**
Prompt: Return ONLY JSON: `{ "text": "She said: \"deploy now\"" }`
- Validator: parse JSON, assert `text` exactly equals `She said: "deploy now"`

**P15 (CSV extraction / exact header + 2 rows):**
Prompt: Output CSV with header `service,latency_ms` and exactly 2 data rows for: gateway=120ms, api=45ms.
- Validator: exact 3 lines; header exact; rows match regex `^(gateway|api),\d+$` and latencies match 120 and 45

**P16 (YAML output / strict keys):**
Prompt: Output ONLY YAML with exactly these keys: `route`, `severity`, `next_step`. Values: route=`local`, severity=`sev2`, next_step=`collect_logs`.
- Validator: YAML parse + exact key set + exact values

**P17 (regex-safe log line extraction):**
Prompt: From the text below, output ONLY the request id (the `rid=` value):
`2026-02-13T19:02:11Z nginx[123]: upstream timeout rid=9f12ab34 user=42`
- Validator: exact match `9f12ab34`

#### Ops triage / log parsing / tool planning

**P18 (ops triage classification JSON):**
Prompt: Return ONLY JSON: `{ "severity":"sev1"|"sev2"|"sev3", "action":"rollback"|"restart"|"observe" }` for: 30% 502s for 12 minutes, checkout failures increasing, no data loss confirmed.
- Validator: JSON schema with enums; no extra keys

**P19 (log parsing → structured JSON list):**
Prompt: Return ONLY JSON array of objects `{ "ts":"<iso>", "level":"ERROR"|"WARN", "msg":"..." }` extracted from these lines (ignore INFO):
1) `2026-02-13T20:01:00Z INFO ok`
2) `2026-02-13T20:01:02Z WARN redis slow`
3) `2026-02-13T20:01:05Z ERROR db timeout`
- Validator: JSON schema; array length 2; ts values exactly lines 2+3; levels WARN/ERROR

**P20 (command planning / command-only block):**
Prompt: Provide exactly 6 Ubuntu commands to diagnose intermittent nginx 502s with upstream TLS. Output commands only, one per line, no explanations.
- Validator: exactly 6 non-empty lines; each begins with `[a-z]` and contains no `#` comments

**P21 (tool orchestration plan JSON):**
Prompt: Return ONLY JSON: `{ "steps": [ {"cmd":"...","purpose":"..."} ] }` with exactly 4 steps to verify disk pressure and RAM pressure on Linux.
- Validator: JSON schema; steps length=4; each has `cmd` and `purpose` strings; purposes non-empty

**P22 (routing + budget constraint / escalation rule):**
Prompt: Return ONLY JSON: `{ "route":"local"|"premium", "max_seconds": <int> }` for: “User is waiting on-call; give best effort in under 10 seconds.” Choose `max_seconds` between 1 and 10.
- Validator: JSON schema; `max_seconds` integer 1..10

**P23 (incident status update / word cap + sections without headers):**
Prompt: Write an operator update with exactly 3 paragraphs: (1) What happened, (2) What we did, (3) Next. Total <= 90 words. No markdown headers.
- Validator: exactly 3 paragraphs (split by blank lines); total word count <= 90; must not contain `#`

**P24 (handoff note / long operator handoff):**
Prompt:
You are handing off to the next on-call. Write a handoff note that includes:
- a 5-item checklist (use `- ` bullets)
- one “current hypothesis” sentence
- one “rollback criteria” sentence
Constraints: no code fences; total <= 160 words.
- Validator: bullet count exactly 5; contains substring `hypothesis` (case-insensitive) and `rollback` (case-insensitive); word count <= 160; must not contain ```

**P25 (log-forensics gotcha / time window ambiguity):**
Prompt: We saw errors “around 20:01”. Using ONLY the lines below, output ONLY JSON: `{ "first_error_ts":"<iso>", "last_error_ts":"<iso>" }` where “around 20:01” means timestamps with minute == `20:01`.
Lines:
- `2026-02-13T20:00:59Z ERROR x`
- `2026-02-13T20:01:00Z ERROR y`
- `2026-02-13T20:01:59Z ERROR z`
- `2026-02-13T20:02:00Z ERROR w`
- Validator: exact JSON values: first=`2026-02-13T20:01:00Z`, last=`2026-02-13T20:01:59Z`

#### Ambiguity / gotcha prompts (intended to catch wrong interpretation)

**P26 (token ambiguity: auth token vs crypto token):**
Prompt: In one line, output ONLY `auth` or `crypto`. Sentence: `Rotate the token used by the CI runner to access GitHub.`
- Validator: exact match `auth`

**P27 (unit gotcha / GiB vs GB):**
Prompt: Return ONLY JSON: `{ "ram_used_gib": <number> }` for: `RAM used is 7.6 GiB` (do not convert units).
- Validator: JSON parse + `ram_used_gib` equals 7.6 (number)

**P28 (long operator prompt / mixed constraints):**
Prompt:
You are assisting with a production incident. We just migrated to a new server and are seeing intermittent 502s on nginx with TLS upstream checks. Do three things:
1) Propose a step-by-step debug plan with exactly 7 steps; each step must be one sentence.
2) Provide commands only (no explanations) with exactly 5 Ubuntu commands, one per line.
3) End with a short risk assessment (<= 40 words) that explicitly states whether to escalate to a premium model.
Constraints: no markdown headers, no code fences, total response <= 220 words.
- Validator: composite
  - total word count <= 220
  - contains exactly 7 numbered steps (lines starting with `1)`..`7)`)
  - contains a block of exactly 5 command lines (non-empty, no backticks)
  - final segment <= 40 words and matches regex `(?i)premium`

---

### Long-context stress variants
Pick 4 prompts above (router JSON, nested JSON escaping, command-only, bullet list) and create variants:
- prepend 2k / 8k / 32k tokens of neutral filler
- insert a small relevant nugget near the end (e.g., the enum set or the exact id to extract)
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
| devstral-small-2:latest | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | pulled |
| ministral-3:latest | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | pulled |
| mistral-small3.2:latest | Ollama local | ✅ | (opt) | ✅ | ✅ | ✅ | ✅ | n/a | pulled |
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
| qwen3:14b | 9.3 |
| glm-4.7-flash:latest | 19 |
| gpt-oss:latest | 13 |
| devstral-small-2:latest | 15 |
| ministral-3:latest | 6.0 |
| mistral-small3.2:latest | 15 |
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
- started_at_ms, ended_at_ms, e2e_ms (ended-started; see E2E definition above)
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
