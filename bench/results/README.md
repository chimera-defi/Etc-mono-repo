# bench/results

Local benchmark/result output area.

This directory is intentionally **kept stable as the current canonical path** for loose benchmark outputs, operator notes, and summary artifacts. It is useful, but it mixes a few different classes of files, so treat it carefully.

## What belongs here

### Durable summaries to keep in-place

These are the closest thing to "current published outputs" in this directory and should stay easy to find:

- `canonical.json`
- `baseline.json`
- `baseline_history.json`
- `SUMMARY.md`
- stable benchmark writeups that are still cited from docs or PRs (for example `LATENCY_BENCHMARK.md`)

### Ad hoc / experiment outputs that may be archived later

These are fine to keep here while they are recent or still under discussion:

- one-off comparison JSON files
- timestamped logs
- temporary state files
- experiment-specific outputs tied to a PR, investigation, or local operator run

Current examples include files like:

- `openclaw_e2e_results.json`
- `qwen35_backend_comparison.json`
- `ollama_glm_vs_lfm_benchmark.json`
- `qwen_glm_multipart_*.log`
- `qwen_glm_multipart_state.json`

## Retention policy

Be conservative. Preserve reproducibility and audit value.

- Keep durable summary files in-place unless there is a deliberate repo-wide structure change.
- Keep recent experiment outputs in-place while they are still being referenced by active work, recent PRs, or current investigations.
- Prefer **batch archival** over one-off cleanup. When experiments are clearly cold, move them together into `bench/archive/results/<YYYY-MM>/` (or a similarly date-bucketed archive location) rather than scattering piecemeal moves.
- Archive logs/state files **as a set** so an experiment can still be understood later.
- Do not overwrite or remove a result file that is still referenced from docs, scripts, issue comments, or PR notes without updating those references.

## Practical rule of thumb

- **Active:** canonical summaries and anything from the current/recent benchmark cycle.
- **Archive later:** older ad hoc experiment outputs once they are superseded, summarized elsewhere, and no longer part of active debugging.
- **Avoid deleting:** if unsure, archive manually later instead of removing.

## If you are a future agent

Before moving anything out of here:

1. grep for references in `bench/`, PR notes, and reproducibility docs
2. check whether the result has been summarized into `canonical.json`, a report, or a handoff note
3. move related files together
4. record the move in `bench/HANDOFF.md`
