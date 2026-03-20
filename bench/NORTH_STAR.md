# Benchmark North Star

This file defines the **single intended direction** for benchmark/harness work so changes stay coherent.

## Mission

Build a benchmark/harness system that is:

1. **Truthful** — no inflated claims, no cache-as-truth confusion.
2. **Reproducible** — same inputs + same config => comparable outputs.
3. **Auditable** — clear model attribution (`served_by`, fallback usage).
4. **Operationally safe** — local model checks must not leave heavy model runners burning CPU.

## Canonical execution path (do this by default)

- Direct benchmark runner: `bench/core/run_benchmark.py`
- Managed orchestration: `bench/selfopt/benchmark_supervisor.py`
- Route/fallback visibility: `bench/ops/route_trace_report.py`
- Repro packaging: `bench/ops/reproduce_pr245.sh`

Everything else is either helper or historical reference.

## Architectural boundaries

### Layer 1 — Benchmark Engine
- Location: `bench/core/`
- Role: execute prompts/phases, parse tool decisions, compute score/latency, emit result.

### Layer 2 — Harness Config + Variants
- Location: `bench/harness/`
- Role: model-specific prompt variants/config for local and hosted model behavior.

### Layer 3 — Supervisor/Resilience
- Location: `bench/selfopt/`
- Role: retries, checkpoints, run manifests, fallback orchestration.

### Layer 4 — Ops/Verification
- Location: `bench/ops/`
- Role: reproducibility snapshots, route attribution checks, operator helpers.

### Layer 5 — Evidence Storage
- Canonical run evidence: `bench/supervisor_runs/<run_id>/`
- Repro artifacts: `bench/repro/`
- Local scratch/operator output: `bench/results/` (not canonical truth by default)

## Evidence rules (hard rules)

1. **Smoke checks are not benchmark truth.**
   - Quick local LFM/GLM runs are for wiring/readiness.
2. **Benchmark truth requires non-cached canonical runs.**
   - Use `--no-cache` or clear cache.
3. **Always distinguish requested vs served model.**
   - Keep/inspect `manifest.json` attribution fields.
4. **Never rely on legacy trees for current claims.**
   - `openclaw_llm_bench/` and `archive/` are reference/history.

## Local-model quick-check standard

For local model sanity checks (LFM/GLM), use:

```bash
bash bench/ops/local_harness_quickcheck.sh
```

This script:
- runs non-cached no-save atomic checks for LFM and GLM
- prints concise pass/fail summaries
- **always stops model runners on exit** (`ollama stop ...`)

## Refactor acceptance checklist

A benchmark/harness change is acceptable only if:

- it keeps canonical entrypoints intact,
- updates architecture docs when behavior changes,
- preserves auditability (`served_by`, fallback info), and
- passes at least one local sanity check without leaving model runners alive.
