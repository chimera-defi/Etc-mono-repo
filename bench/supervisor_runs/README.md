# bench/supervisor_runs

Authoritative managed-run artifacts for the benchmark supervisor.

Each run lives under `bench/supervisor_runs/<run_id>/` and typically contains:

- `manifest.json` — authoritative run/job metadata
- `summary.json` — compact run summary
- `partial_results.json` — per-run result payload
- `jobs/` logs (`stdout`, `stderr`, heartbeats, and related job artifacts)
- sometimes `fallback_trace.jsonl` or other trace/debug artifacts

Top-level `index.json` is the current run index.

## Retention policy

This directory is more important than `bench/results/` from an audit/reproducibility perspective. Treat run directories as primary evidence for what actually happened.

### Keep in the active area

Keep these in `bench/supervisor_runs/`:

- the most recent completed runs
- any run still being investigated, cited, or used for repro
- any run whose outputs have not yet been summarized into more durable reports
- `index.json`

### Archive, don’t delete

The existing supervisor already supports aging old runs into:

- `bench/supervisor_runs/.archive/`

Current code path: `bench/selfopt/benchmark_supervisor.py` with default `--retain-days 7`.

That means the intended policy is:

- recent runs stay at the top level
- older completed runs may be moved into `.archive/`
- audit artifacts remain preserved rather than being deleted

## Guardrails

- Do **not** delete run directories casually.
- Do **not** move a run that might still be active or partially written.
- Before any manual archival, confirm the run is completed and no process is still writing into it.
- Keep each run directory intact as a unit; do not strip logs out of a run directory unless there is a very explicit storage policy change.
- If a run is referenced by a report, PR, or repro note, preserve that reference chain when archiving.

## Practical rule of thumb

- **Active/recent window:** keep top-level run dirs as-is.
- **Cold storage:** completed older runs belong in `.archive/`, not in the trash.
- **Manual cleanup:** only do it in batches and document it.

## Read-only status helper

For a quick current snapshot before making any retention decision:

```bash
python3 bench/ops/retention_status.py
```

This does **not** modify run directories; it just reports top-level run ages, archive candidates under the current threshold, and archived entries already present in `.archive/`.

## If you are a future agent

Before changing retention here:

1. check `bench/selfopt/benchmark_supervisor.py` so policy and implementation still match
2. inspect `index.json` and the latest run dirs
3. run `python3 bench/ops/retention_status.py` for a quick current-state snapshot
4. verify completion state before moving anything
5. prefer documentation or scripted archival over ad hoc deletion
6. record any manual archival decision in `bench/HANDOFF.md`
