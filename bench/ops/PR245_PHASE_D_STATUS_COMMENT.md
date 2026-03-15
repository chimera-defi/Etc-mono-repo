Phase D status update for PR #245 on branch `bench-qwen35-final-setup`.

## Verification (Phase A/B/C + branch)
Commands run:
```bash
git rev-parse --abbrev-ref HEAD
git branch -vv | sed -n '1,40p'
ls -l --time-style=iso bench/results | sed -n '1,120p'
for f in bench/results/qwen35_backend_comparison.json bench/atomic_result_qwen3.5_atomic.json bench/extended_phase1_mistral.json bench/extended_benchmark_suite.json; do
  echo "### $f"; [ -f "$f" ] && { wc -c "$f"; python3 -m json.tool "$f" >/dev/null && echo "json:ok" || echo "json:bad"; } || echo "missing";
done
```
Evidence snippets:
- Branch: `bench-qwen35-final-setup` tracking `origin/bench-qwen35-final-setup`.
- `bench/results/qwen35_backend_comparison.json` present, `22703` bytes, `json:ok`.
- `bench/atomic_result_qwen3.5_atomic.json` present, `4132` bytes, `json:ok`.
- `bench/extended_phase1_mistral.json` present, `18435` bytes, `json:ok`.
- `bench/extended_benchmark_suite.json` present, `3765` bytes, `json:ok`.

## CPU contention / access checks
Commands run:
```bash
date -Is
uptime
cat /proc/loadavg
ps -eo pid,ppid,pcpu,pmem,comm,args --sort=-pcpu | head -n 20
ollama ps
curl -sS -m 5 http://127.0.0.1:11434/v1/models
curl -sS -m 5 http://127.0.0.1:8081/v1/models
```
Evidence snippets:
- Load avg: `11.07 11.10 11.23` on `12` CPUs (high contention at check time).
- Heavy local workload present (`ollama serve` using high CPU) and `openclaw-gateway` process already running.
- Endpoint checks from this environment failed:
  - `curl ...11434/v1/models` -> `Failed to connect`.
  - `curl ...8081/v1/models` -> `Failed to connect`.
- `ollama ps` produced: `socket: operation not permitted` to local port.

## Gate results (D1..D5)

| Gate | Status | Notes |
|---|---|---|
| D1 | PASS | Added managed startup artifacts: `bench/ops/start-llama-server.sh` and `bench/ops/llama-server.service.example`; documented in `bench/ops/PHASE_D_PR245.md`. |
| D2 | DEFERRED (BLOCKED) | `/v1/models` health verification could not be completed from this sandbox due to local socket/network restrictions (`curl` connection failures and `ollama ps` socket permission error). |
| D3 | PASS | Added schema-safe provider mapping in template config: `ai_memory/bootstrap/openclaw_clawdbot_seed/openclaw.json.template` under `models.providers.llama-server` with OpenAI-compatible API; JSON validated with `python3 -m json.tool`. |
| D4 | DEFERRED (BLOCKED) | `openclaw gateway` subcommands fail in this environment (`uv_interface_addresses` system error), so restart + routing smoke test could not be executed reliably here. |
| D5 | PASS | Rollback steps documented in `bench/ops/PHASE_D_PR245.md` (disable service, restore config backup, restart gateway, re-check health). |

## File changes
- `ai_memory/bootstrap/openclaw_clawdbot_seed/openclaw.json.template`
- `bench/ops/start-llama-server.sh`
- `bench/ops/llama-server.service.example`
- `bench/ops/PHASE_D_PR245.md`

## Safe next actions on host (outside this sandbox)
1. Install/start `llama-server` systemd unit from `bench/ops/llama-server.service.example`.
2. Run:
   - `curl -sS http://127.0.0.1:8081/v1/models`
   - `openclaw gateway restart`
   - `openclaw health`
3. Execute one smoke request to `/v1/chat/completions` and paste output into this PR.
