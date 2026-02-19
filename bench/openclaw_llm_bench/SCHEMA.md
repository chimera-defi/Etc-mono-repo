# OpenClaw LLM Benchmark Schema

This document describes the output schema for the benchmark harness.

## Outputs

All outputs are written to `runs/<run_id>/`:

- `config.json` - Benchmark configuration (models, providers, prompts, etc.)
- `inventory.json` - System inventory (ollama list, Python version, host info, etc.)
- `results.jsonl` - Line-delimited JSON results for each model × prompt × provider combination
- `summary.json` - Aggregated metrics per model/provider
- `summary.md` - Human-readable summary table
- `resources_*_before.txt` - System resource snapshots (before running model suite)
- `resources_*_after.txt` - System resource snapshots (after running model suite)

## results.jsonl Schema

Each line is a JSON object with the following fields:

### Identifiers

| Field | Type | Description |
|-------|------|-------------|
| `record_type` | string | Always `"result"` |
| `run_id` | string | Benchmark run ID (e.g., `20260213_235930`) |
| `provider` | string | Provider name: `ollama_openai`, `openai_responses`, `claude_code_cli` |
| `model` | string | Model identifier (e.g., `llama3.2:3b`, `gpt-4`, `claude-opus`) |
| `thinking_level` | string | Thinking level for models that support it (`low`, `medium`, `high`, `xhigh`, or `null`) |
| `prompt_id` | string | Prompt ID (e.g., `P0`, `P1`) |
| `prompt_name` | string | Descriptive prompt name (e.g., `sanity_heartbeat`) |

### Execution Status

| Field | Type | Description |
|-------|------|-------------|
| `availability_status` | string | `ok`, `skipped_unavailable`, `auth_error`, `rate_limited`, `error` |
| `started_at_ms` | integer | Wall-clock start time (ms since epoch) |
| `ended_at_ms` | integer | Wall-clock end time (ms since epoch) |
| `e2e_ms` | integer | End-to-end latency (ms), measured with `perf_counter` |
| `ttft_ms` | integer or null | Time-to-first-token (ms), or null if not captured |

### Response & Validation

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | True if the model responded without errors |
| `failure_type` | string or null | If not successful, reason code (e.g., `empty_response`, `http_429`, `exception`) |
| `objective_pass` | boolean or null | Whether the response passed the prompt's validator logic |
| `violation` | string or null | If `objective_pass` is false, the reason |
| `input_tokens` | integer or null | Number of input tokens (if available from provider) |
| `output_tokens` | integer or null | Number of output tokens (if available from provider) |
| `raw_output` | string | Raw model output (up to ~64KB) |
| `parsed_output` | object or null | Parsed/extracted result from validator (e.g., JSON object, token count) |

### Tool Use Tracking (NEW)

| Field | Type | Description |
|-------|------|-------------|
| `tool_calls` | array of strings | List of tool names detected in the response (e.g., `["free", "du"]`) |
| `tool_call_count` | integer | Number of tool invocations detected (length of `tool_calls`) |
| `tool_use_success` | boolean | True if at least one expected tool was successfully invoked |

Tool detection looks for patterns:
- Backticks: `` `command` ``
- Quoted commands: `"command ..."` or `'command ...'`
- Shell prompts: `$ command` or `# command`
- XML markers: `<tool>name</tool>`
- Bracket markers: `[tool: name]` or `[TOOL: name]`

## Validator Types

The `validator` field in prompts determines how responses are evaluated:

| Type | Required Keys | Description |
|------|---|---|
| `noop` | — | No validation (objective_pass = null) |
| `exact` | `value` | Response must exactly match `value` |
| `one_of` | `values` | Response must match one of the values in array |
| `regex_fullmatch` | `pattern` | Response must fully match regex pattern |
| `max_words` | `value` | Response must have ≤ `value` words |
| `max_sentences` | `value` | Response must have ≤ `value` sentences |
| `exact_bullets` | `value` | Response must have exactly `value` bullet points (lines starting with `-`) |
| `json_keys` | `required_keys`, `key_rules` | Response must be valid JSON with required keys and matching type rules |
| `tool_invocation` | `expected_tools` | Response must invoke at least one tool in `expected_tools` list |

## summary.json Schema

Aggregated metrics per `(provider, model, thinking_level)` group:

| Field | Type | Description |
|-------|------|-------------|
| `provider` | string | Provider name |
| `model` | string | Model name |
| `thinking_level` | string or null | Thinking level (null if not applicable) |
| `n_total` | integer | Total number of test cases |
| `n_ok` | integer | Test cases with availability_status = `ok` |
| `n_success` | integer | Test cases that succeeded (availability_status = `ok` AND success = true) |
| `n_skipped_unavailable` | integer | Test cases skipped due to unavailability |
| `n_rate_limited` | integer | Test cases rate-limited |
| `n_error` | integer | Test cases with errors |
| `success_rate_ok` | float (0.0-1.0) or null | Success rate among available tests |
| `objective_pass_rate` | float (0.0-1.0) or null | Validator pass rate among successful tests |
| `wall_clock_ms` | integer or null | Wall-clock time for this model's test suite |
| `latency_ms` | object | Latency statistics (p50, p95, p99, mean) |
| `resources_before` | object or null | System resources snapshot before tests |
| `resources_after` | object or null | System resources snapshot after tests |

## Tool-Use Tier Classification

Models are classified for routing based on tool-use success:

- **Tier 1 (Tool-Capable)**: Tool use success rate ≥ 80%
- **Tier 2 (Tool-Capable but Inconsistent)**: Tool use success rate 50-79%
- **Tier 3 (Tool-Incapable)**: Tool use success rate < 50%

Only Tier 1 models are recommended for subagent routing with full tool access.
