# PR245 Reproducibility Guide

This document reproduces the benchmark/fallback packaging work for PR #245 without fabricating new benchmark claims.

## Canonical flow

Use the current repro/verification path in this order:

1. `bench/core/run_benchmark.py` for direct benchmark execution
2. `bench/selfopt/benchmark_supervisor.py` for managed multi-job runs with retry/fallback handling
3. `bench/ops/reproduce_pr245.sh` for packaging manifests/checksums
4. `bench/ops/route_trace_report.py` and `bench/ops/validate_route_attribution.py` for attribution verification

Older root-level scripts/docs were archived during cleanup so the supervisor/ops flow is the default path.

## Scope

- Captures run-time environment and git state
- Captures local Ollama model inventory (`ollama list` or local API fallback)
- Generates manifests under `bench/repro/manifests/`
- Generates SHA256 checksums under `bench/repro/checksums/`
- Optionally runs a minimal smoke benchmark (`--smoke`)

## Prerequisites

From repository root:

```bash
command -v bash git sha256sum >/dev/null
```

For model inventory (at least one must work):

```bash
command -v ollama >/dev/null
# or local API reachable:
curl -fsS http://127.0.0.1:11434/api/tags >/dev/null
```

Optional smoke benchmark:

- `python3`
- Local Ollama server reachable
- At least one local model available in `ollama list`

## Steps

1. Run packaging only:

```bash
bash bench/ops/reproduce_pr245.sh
```

2. Run packaging + smoke benchmark:

```bash
bash bench/ops/reproduce_pr245.sh --smoke
```

3. Review generated artifacts:

```bash
ls -la bench/repro/manifests
ls -la bench/repro/checksums
cat bench/repro/manifests/run_manifest_pr245.json
cat bench/repro/checksums/sha256sums.txt
```

## Output Files

Generated locally by the script (not intended to be committed):

- `bench/repro/manifests/env_manifest.json`
- `bench/repro/manifests/run_manifest_pr245.json`
- `bench/repro/manifests/model_inventory_pr245.json`
- `bench/repro/manifests/git_status_pr245.txt`
- `bench/repro/manifests/git_diff_stat_pr245.txt`
- `bench/repro/checksums/sha256sums.txt`

If a fallback trace artifact exists in `bench/`, the script records it and includes it in the run manifest/checksums.

## Route/Fallback Verification (Programmatic)

To prove which model path ran (primary vs fallback), inspect the supervisor fallback trace:

```bash
python3 bench/ops/route_trace_report.py
# JSON output (for bots/automation):
python3 bench/ops/route_trace_report.py --json
# one-line ops status (served_by + fallback_used):
python3 bench/ops/route_trace_report.py --one-line
# (if no fallback trace exists, this falls back to latest supervisor manifest)
```

Optional: inspect a specific trace file:

```bash
python3 bench/ops/route_trace_report.py --trace bench/supervisor_runs/<run_id>/fallback_trace.jsonl
```

The report summarizes:
- event counts (`primary_failed`, `fallback_selected`, `fallback_succeeded`, etc.)
- final outcome per job
- primary -> selected fallback transitions

This gives an auditable answer to: "was this actually served by the intended model, or routed via fallback?"
