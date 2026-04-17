# Takopi + OpenClaw Orchestration Plan

## Goal

Design a provider-agnostic orchestration layer that:

- complements Takopi runtime defaults,
- fixes "OpenClaw not executing" failure modes through reliability hardening,
- and uses meta-harness optimization to improve policy decisions over time.

This is a control-plane plan, not a model-switch plan.

## Key Answer Up Front

Yes, this complements Takopi.

- Takopi remains a runtime/provider surface (engine selection, project mapping, transport).
- Orchestrator becomes the long-running execution control plane above it.
- Meta-harness optimizes orchestrator and harness policy knobs.

## Layered Architecture

### Layer 0: Provider runtimes

- Takopi/Codex runtime
- Claude Code CLI runtime
- Other agent-kit runtimes

### Layer 1: Worker harness

- prompt/context assembly
- tool policy and retry behavior
- local memory compaction policy

### Layer 2: Orchestrator

- claim lifecycle (`queued -> running -> blocked/failed/completed`)
- checkpointing and resume
- heartbeat/watchdog and stale-claim recovery
- budget controls (time, tokens, max passes)
- human approval gates

### Layer 3: Meta-harness optimizer

- proposes policy variants for Layer 1 + selected Layer 2 knobs
- evaluates on fixed benchmark tasks
- updates frontier and history (`frontier_val.json`, `evolution_summary.jsonl`)

## What "OpenClaw Not Executing" Usually Means

Treat this as four separate failure classes:

1. Launch failure: process never starts or exits immediately.
2. Claim deadlock: claim exists but no progress signal heartbeat.
3. Tool deadlock: process runs but blocks on tool/runtime call.
4. Guardrail stall: max retries/passes/budget reached without explicit blocker output.

The fix is not one patch; it is observability + watchdog + bounded recovery.

## Reliability Hardening for OpenClaw Execution

### 1) Standard run envelope

Every pass emits:

- `run_id`, `intent_id`, `claim_id`
- started/ended timestamps
- provider/runtime identity
- pass budget consumed

### 2) Heartbeat and stale-claim policy

- heartbeat every fixed interval (e.g., 30s)
- if stale > threshold, move claim to `blocked` with machine-readable reason
- requeue only if retry budget remains

### 3) Bounded retries with typed reasons

- network/tool transient
- provider/runtime failure
- deterministic policy failure

Different reason codes route to different fallback/retry policies.

### 4) Explicit blocker artifacts

When run cannot advance, write:

- failing step
- attempted commands/tools
- last stderr/stdout tail
- next required human action

No silent stalls.

## Spec-Parity Contract

Use a requirement ledger for parity:

- every spec requirement has stable ID
- every execution pass links evidence to requirement IDs
- parity score = verified requirements / total scoped requirements

Completion gate requires:

- parity threshold met
- lint/type/tests/build/smoke green
- no unresolved critical blockers

## Meta-Harness Search Space (v1)

Start with safe knobs:

- worker system prompt variants
- retry/backoff profile
- review cadence (`review_every`)
- context compaction thresholds
- timeout settings per runtime path

Keep provider API/model choices fixed per experiment.

## Rollout Phases

### Phase A (1-2 weeks): Execution observability baseline

- unify run/claim/signal schema across Takopi/OpenClaw paths
- add heartbeat/watchdog/stale-claim transitions
- add blocker artifact output

Exit criteria:

- no "silent stuck" runs without blocker artifact

### Phase B (1-2 weeks): Orchestrator hardening

- enforce bounded-pass budgets
- add deterministic resume from checkpoints
- add retry reason taxonomy

Exit criteria:

- rerun from crash restores deterministic next step

### Phase C (1-2 weeks): Meta-harness integration

- register orchestrator policy knobs in candidate schema
- run optimizer on representative task set
- compare against baseline policy

Exit criteria:

- measurable improvement on completion rate and/or intervention minutes

### Phase D (later): Extraction as independent shippable package

- move runtime-agnostic orchestration core behind adapter interfaces
- keep SpecForge as one consumer, not the host boundary

Exit criteria:

- same orchestrator core runs with SpecForge and standalone runner

## Evaluation Scorecard

Track per run:

- completion rate
- parity score
- escaped defects
- manual intervention minutes
- wall-clock duration
- token and infra cost
- rerun stability

## Work Tracking

- PR scaffold: #283
- Architecture issue: #284

This doc is the implementation contract for the next integration pass.
