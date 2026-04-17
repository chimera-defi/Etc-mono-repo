# Domain Spec: Tool-Calling Harness Search

## Domain Summary

Goal: improve tool-calling judgment in the benchmark harness while keeping base models fixed.

- Unit of evaluation: one benchmark prompt execution (atomic or extended).
- Fixed components: model identity per run, prompt suite content, and scoring logic in `bench/core/run_benchmark.py`.
- Allowed changes (v1): variant `system` prompt, model timeout, model temperature.
- Base model set: configured models from `bench/harness/phase2_config.json`.
- Optimization budget (initial default):
- 10 candidates per iteration
- 1 iteration per day
- 1-2 target model/phase pairs per iteration

## Harness and Search Plan

Candidate interface:

- `target`: `model`, `phase`, `variant`
- `patch`: optional overrides (`system_prompt`, `timeout_seconds`, `temperature`)
- `hypothesis`: falsifiable expected behavior change

Baselines:

- Existing `phase2_config.json` variants for each model.
- Existing supervisor matrix in `bench/selfopt/benchmark_supervisor.py`.

Reusable pieces:

- Canonical eval runner (`bench/core/run_benchmark.py`)
- Supervisor artifacts and route attribution reporting for downstream validation

## Evaluation Plan

Search-set evaluation:

- Primary search phase: `atomic` (P1-P12)
- One run per candidate in v1 scaffold

Held-out evaluation:

- `extended` phase for candidates that beat baseline on atomic score

Primary metrics:

- Accuracy
- Restraint score

Secondary metrics:

- p50 latency
- timeout incidence
- fallback usage in supervisor-managed follow-up runs

Noise and runtime:

- Single-run atomic is noisy; repeat top candidates before promotion.
- Use `--no-cache` during search.

Leakage risk and mitigation:

- Do not optimize on held-out extended categories when selecting final winner.
- Keep search runs and held-out runs in separate logs directories.

## Experience and Logging

Store per iteration:

- `pending_eval.json` input
- candidate-level eval results
- `frontier_val.json`
- `evolution_summary.jsonl`

Recommended structure:

- `bench/selfopt/meta_harness/logs/<run_name>/...`

## Open Questions and Unknowns

- Should fallback behavior become part of the search objective in v2?
- Should candidate patches include tool schema changes in v2?
- What is the target spend/time budget per week for search iterations?
