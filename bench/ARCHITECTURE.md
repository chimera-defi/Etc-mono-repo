# Bench Architecture (PR245)

This document describes the current benchmark orchestration architecture after the PR245 refactor/consolidation.

> Note: some root-level historical scripts and docs were archived under `bench/archive/2026-03-cleanup-pass1/` to make the canonical workflow clearer. The large `openclaw_llm_bench/` and `CONSOLIDATION/` trees remain in place as non-canonical historical material and are not part of the active architecture described below.

## Goals

1. Reproducible benchmark runs
2. Explicit routing/fallback observability
3. Resumable supervisor execution
4. Clear operator audit path (`served_by`, `fallback_used`)

## Component Map

### 1) Core runner
- `bench/core/run_benchmark.py`
- Responsibility: execute benchmark modes (standard / compare / model-compare) and produce benchmark summaries.

### 2) Supervisor orchestration
- `bench/selfopt/benchmark_supervisor.py`
- Responsibility:
  - run configured jobs
  - health check Ollama before execution
  - retry + optional fallback model mapping
  - persist run `manifest.json` and `summary.json`
  - emit fallback trace events when fallback path is used

Supporting modules:
- `bench/selfopt/baseline_tracker.py` — regression signal tracking across model/phase/variant keys
- `bench/utils/error_recovery.py` — retry/backoff, checkpoints, health checks, fallback mapping helpers

### 3) Reproducibility packaging
- `bench/ops/reproduce_pr245.sh`
- Responsibility: capture environment/git/model manifests + checksums for reproducible reporting.

### 4) Route/fallback observability
- `bench/ops/route_trace_report.py`
- Responsibility:
  - summarize `fallback_trace.jsonl`
  - provide one-line operational output (`served_by`, `fallback_used`)
  - fall back to latest `manifest.json` when no fallback trace exists (no-fallback run)

## Runtime Artifacts

Generated under `bench/supervisor_runs/<run_id>/`:
- `manifest.json` — authoritative run/job metadata
- `summary.json` — compact run summary
- `jobs/*.stdout.log` / `jobs/*.stderr.log`
- `fallback_trace.jsonl` (only when fallback events occur)

## Attribution Fields (manifest job-level)

Each supervisor job now stamps:
- `used_fallback` (bool)
- `served_by` (actual model that produced output)
- `original_model`
- `fallback_model` (nullable)

This guarantees route attribution even when no fallback trace file is emitted.

## Data Flow

1. Supervisor starts → health check
2. Job executed via core runner
3. If primary fails, fallback mapping path is attempted and traced
4. Job summary persisted to manifest (always includes attribution fields)
5. `route_trace_report.py --one-line` / `--json` provides auditable route status:
   - trace-first when `fallback_trace.jsonl` exists
   - manifest attribution when trace is absent (typical no-fallback run)

**Attribution capture points:**
- `fallback_trace.jsonl`: Event-level trace of primary→fallback transitions (only when fallback occurs)
- `manifest.json`: Job-level attribution (`used_fallback`, `served_by`, `original_model`, `fallback_model`) persisted after each job
- `route_trace_report.py`: Merges trace+manifest (or manifest-only) into operator-facing attribution output

## Validation Surface

Recommended smoke checks:

```bash
bash -n bench/ops/reproduce_pr245.sh
python3 -m py_compile \
  bench/ops/route_trace_report.py \
  bench/selfopt/baseline_tracker.py \
  bench/selfopt/benchmark_supervisor.py

cd bench
PYTHONPATH=. python3 selfopt/benchmark_supervisor.py \
  --models lfm2.5-thinking:1.2b --phases atomic --timeout 90 --max-retries 1
python3 ops/route_trace_report.py --one-line
```
