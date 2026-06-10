# Bench Handoff / Current State — Compressed 2026-06-07

This is the durable handoff log for `bench/`. Original: 2026-03-13 cleanup passes.

## Canonical Entrypoints

- `bench/core/run_benchmark.py` — direct benchmark execution
- `bench/selfopt/benchmark_supervisor.py` — managed/resumable multi-job runs
- `bench/ops/reproduce_pr245.sh` — reproducibility packaging/manifests/checksums
- `bench/ops/route_trace_report.py` — route/fallback attribution reporting
- `bench/ops/validate_route_attribution.py` — validation helper

Primary docs: `bench/README.md`, `bench/ARCHITECTURE.md`, `bench/REPRODUCE.md`

## Canonical vs Non-Canonical

**Canonical/active:** `core/`, `selfopt/`, `ops/`, `utils/error_recovery.py`, `supervisor_runs/`, `repro/`

**Preserved/reference:** `openclaw_llm_bench/` (earlier harness, keep for prompt suites/reports); `CONSOLIDATION/` (historical decision support, use `INDEX.md` as entrypoint); `selfopt/run_qwen_glm_multipart.sh` (operator helper, keep); `results/` (mixed canonical + ad hoc)

**Legacy/archived:** `archive/2026-03-cleanup-pass1/`, `archive/supervisor_runs_202602/`

## Safe Validation Commands

```bash
bash -n bench/ops/reproduce_pr245.sh
python3 -m py_compile bench/ops/route_trace_report.py bench/selfopt/benchmark_supervisor.py
make bench-smoke
```

## Output Locations

- Managed runs: `bench/supervisor_runs/<run_id>/`
- Repro artifacts: `bench/repro/`
- Local outputs: `bench/results/`
- Archives: `bench/archive/...`

## Next Benchmark Pass

For a true current-truth refresh: use supervisor with `--no-cache` on: `lfm2.5-thinking:1.2b` (atomic+extended), `qwen3.5:35b` (atomic, on quiet host only — CPU-bound, not RAM-bound), `mistral:7b`, `qwen2.5:3b`, `ministral-3:latest`. Skip `glm-4.7-flash` until hang state is resolved.

After run: inspect `supervisor_runs/<run_id>/manifest.json`, `summary.json`, `jobs/*.stdout.log`, run `route_trace_report.py --one-line`.

## Practical Rules for Future Agents

- Do not remove `openclaw_llm_bench/` or `CONSOLIDATION/` without grep-confirming no live references.
- Prefer archiving loose outputs in batches under `archive/`.
- Run `python3 bench/ops/retention_status.py` before any structural moves.
