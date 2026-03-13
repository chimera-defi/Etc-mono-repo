# Bench Handoff / Current State

This is the durable handoff log for `bench/`.

## What `bench/` is for

`bench/` holds the benchmark and reproducibility tooling for evaluating local/hosted model tool-calling judgment, plus supervisor/orchestration code for managed runs and route attribution.

## Canonical entrypoints

Use these unless you have a specific reason not to:

- `bench/core/run_benchmark.py` — direct benchmark execution
- `bench/selfopt/benchmark_supervisor.py` — managed/resumable multi-job runs
- `bench/ops/reproduce_pr245.sh` — reproducibility packaging/manifests/checksums
- `bench/ops/route_trace_report.py` — route/fallback attribution reporting
- `bench/ops/validate_route_attribution.py` — validation helper

Primary docs:

- `bench/README.md`
- `bench/ARCHITECTURE.md`
- `bench/REPRODUCE.md`

## What is canonical vs non-canonical

### Canonical / active

- `core/`
- `selfopt/` (especially supervisor flow)
- `ops/`
- `utils/error_recovery.py`
- `supervisor_runs/` — authoritative managed-run artifacts
- `repro/` — reproducibility outputs/manifests

### Preserved, but non-canonical

- `openclaw_llm_bench/` — earlier/minimal harness with useful prompt suites, reports, and analysis scripts. Keep for reference and possible data mining, but do **not** treat as the active execution path.
- `CONSOLIDATION/` — historical PR-prep/consolidation notes. Valuable for context and decisions, but not part of the current runtime architecture.
- `selfopt/run_qwen_glm_multipart.sh` — local one-shot operator helper for a specific multipart experiment. Safe to keep, but not a canonical workflow entrypoint.
- `utils/weather_check.py` — generic utility/demo script. Harmless, but not benchmark-critical.
- `results/` — local output area for benchmark/operator artifacts. Useful, but mixed in purpose and not an authoritative source of repo structure.
- `archive/` — intentionally non-canonical historical material.

### Legacy / archived

- `archive/2026-03-cleanup-pass1/` — Stage 1+2 archive of root-level legacy scripts/docs/generated files.
- `archive/supervisor_runs_202602/` — small historical archived supervisor artifact snapshot.

## Where outputs go

- Managed supervisor runs: `bench/supervisor_runs/<run_id>/`
- Repro packaging/manifests/checksums: `bench/repro/`
- Local operator/result outputs: `bench/results/`
- Archived historical outputs: `bench/archive/...`

When in doubt, prefer new structured run outputs under `supervisor_runs/` or `repro/` instead of adding new loose root files.

## Safe validation commands

From repo root:

```bash
bash -n bench/ops/reproduce_pr245.sh
python3 -m py_compile \
  bench/ops/route_trace_report.py \
  bench/selfopt/baseline_tracker.py \
  bench/selfopt/benchmark_supervisor.py
make bench-smoke
```

Direct smoke run:

```bash
cd bench
PYTHONPATH=. python3 selfopt/benchmark_supervisor.py \
  --models lfm2.5-thinking:1.2b --phases atomic --timeout 90 --max-retries 1
python3 ops/route_trace_report.py --one-line
```

## Cleanup log / work done

### Stage 1

- Archived legacy root cleanup artifacts into `archive/2026-03-cleanup-pass1/`.
- Reduced root clutter and made current benchmark flow easier to identify.

### Stage 2

- Archived more historical root scripts/docs/generated files.
- Promoted the PR245 supervisor/repro/route-attribution path as the current architecture.
- Added/kept `README.md`, `ARCHITECTURE.md`, and `REPRODUCE.md` as the main operator docs.

### Stage 3 (this pass)

- Inspected ambiguous areas:
  - `openclaw_llm_bench/`
  - `CONSOLIDATION/`
  - `selfopt/run_qwen_glm_multipart.sh`
  - `utils/weather_check.py`
  - `archive/supervisor_runs_202602/`
  - mixed artifacts under `results/`
- Decision: **document and label rather than move** where uncertainty remains.
- Added this durable handoff log.
- Added `bench/archive/README.md` to explain archive intent.

## Current cleanup status

The active path is now reasonably clear:

- Canonical execution and validation are documented.
- The main remaining ambiguity is historical/reference material that still has research value.
- No risky tree moves were made in Stage 3.
- `bench/openclaw_llm_bench/README.md` now explicitly labels that subtree as non-canonical historical/reference material so future agents do not mistake snapshot phase reports for current benchmark truth.
- Retention guidance now lives next to the artifact directories:
  - `bench/results/README.md`
  - `bench/supervisor_runs/README.md`
- Added a read-only snapshot helper: `bench/ops/retention_status.py`
  - Purpose: quickly show current `results/` classes, top-level supervisor run ages, archive candidates under a chosen threshold, and existing `.archive/` entries without moving anything.

## Retention policy snapshot

### `results/`

- Keep durable summaries and canonical pointers in place (`canonical.json`, baseline files, summary docs).
- Keep recent experiment outputs in place while they still support active work.
- Prefer batch archival of older ad hoc outputs into `bench/archive/results/<date-bucket>/` later, rather than piecemeal moves.
- Avoid deleting unless the artifact is clearly redundant and already captured elsewhere.

### `supervisor_runs/`

- Treat run directories as authoritative audit artifacts.
- Keep recent runs at top level; archive older completed runs into `supervisor_runs/.archive/` rather than deleting.
- The current supervisor implementation already has an old-run archival path and defaults to `--retain-days 7`.
- Do not move runs that may still be active or that are still referenced for repro/debugging.

## Remaining open questions / deferred decisions

1. **`openclaw_llm_bench/`**
   - Keep for now.
   - Future option: move under `archive/legacy-harness/` only after confirming no one still uses its prompt suites/scripts.
   - Before any move, grep for live references and decide whether any prompts/reports should be promoted into canonical docs.
   - Review outcome from this pass: the safest retained assets are the prompt suites (`prompts_v1.json`, `prompts_tool_use_*.json`), schema/reference docs (`SCHEMA.md`, `RETRY_LOGIC.md`), and reusable analysis scripts. The many phase/deliverable markdown files are valuable history, but should be treated as dated snapshots unless rerun and revalidated in the current architecture.

2. **`CONSOLIDATION/`**
   - Keep for now as historical decision support.
   - Review outcome (2026-03-13): keep the directory directly accessible because it still contains useful methodology review, model-selection rationale, and a compact record of what the benchmark branch believed it was shipping.
   - Treat `INDEX.md` as the preferred entrypoint there; it now explicitly frames the tree as historical context and points readers back to canonical docs.
   - Treat `FINAL_BRANCH_CHECKLIST.md` and `FINAL_PR_DESCRIPTION.md` as dated snapshot artifacts unless their claims are revalidated against the current tree.
   - If repo wants a stricter separation later, move under `archive/` and leave a small pointer file.

3. **`results/` contents**
   - Directory currently mixes durable summaries (`canonical.json`, `SUMMARY.md`) with ad hoc experiment outputs (`openclaw_e2e_results.json`, multipart logs, backend comparisons).
   - Future cleanup could split this into `results/canonical/` and `results/experiments/`, but that is a structural change and was deferred.

4. **Small utility scripts**
   - `weather_check.py` and `run_qwen_glm_multipart.sh` are fine to keep, but future cleanup may move them into an `experiments/` or `ops/local/` area if more scripts like these accumulate.
   - Review outcome (2026-03-13, odd-files pass):
     - `selfopt/run_qwen_glm_multipart.sh` is worth keeping as a tiny operator wrapper because it is explicit and low-risk.
     - Its paired runner (`selfopt/qwen_glm_multipart_resume_runner.py`) still writes benchmark JSON outputs to legacy top-level `bench/*.json` paths while log/state artifacts live under `bench/results/`; treat that pair as preserved experiment plumbing, not as a model for new output placement.
     - `utils/weather_check.py` appears to be an isolated convenience/demo script with no live in-repo imports; keep it only as a harmless utility unless bench-specific helpers start getting curated more formally.

## Practical recommendations for future agents

- Do not remove `openclaw_llm_bench/` or `CONSOLIDATION/` casually; both still encode useful history.
- Prefer adding new operator docs next to the canonical path, not inside historical trees.
- Prefer archiving loose root/result artifacts in batches rather than piecemeal moves.
- Before deciding whether to archive, run `python3 bench/ops/retention_status.py` for a read-only snapshot.
- If you need to make structural moves later, update `README.md`, `ARCHITECTURE.md`, and this file in the same change.
