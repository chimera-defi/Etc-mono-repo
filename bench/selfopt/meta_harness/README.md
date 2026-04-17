# Meta Harness Scaffold (Bench)

This directory is a first-pass scaffold to run Meta-Harness-style outer-loop experiments on the canonical bench runner.

## Scope

- Search over harness-level changes for a fixed model and benchmark phase.
- Evaluate candidates through `bench/core/run_benchmark.py`.
- Track frontier and iteration history in JSON files under `logs/`.

## Included files

- `domain_spec.md` - benchmark-specific domain spec.
- `candidate.schema.json` - schema for pending candidate files.
- `proposals/example.pending_eval.json` - example input for one iteration.
- `eval_adapter.py` - adapter that evaluates one candidate through the canonical runner.
- `loop.py` - simple iteration runner that evaluates all candidates and updates frontier/history.
- `TAKOPI_OPENCLAW_ORCHESTRATION_PLAN.md` - architecture and rollout plan for Takopi/OpenClaw + orchestrator + meta-harness integration.

## Quick start

From repo root:

```bash
python3 bench/selfopt/meta_harness/loop.py \
  --pending-eval bench/selfopt/meta_harness/proposals/example.pending_eval.json \
  --logs-dir bench/selfopt/meta_harness/logs
```

Dry-run validation only:

```bash
python3 bench/selfopt/meta_harness/loop.py \
  --pending-eval bench/selfopt/meta_harness/proposals/example.pending_eval.json \
  --logs-dir bench/selfopt/meta_harness/logs \
  --dry-run
```

## Notes

- The adapter disables cache and uses an isolated temp config per candidate.
- Candidate patch support is intentionally narrow in this scaffold: `system_prompt`, `timeout_seconds`, and `temperature`.
- This is not yet wired to an automated proposer agent; it consumes pre-written `pending_eval.json` files.
