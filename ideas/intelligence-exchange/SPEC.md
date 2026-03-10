## Intelligence Exchange Technical Spec (MVP)

### Summary
Build a brokered AI job execution exchange with:
1. buyer job ingress,
2. contributor worker runtime (local or hosted),
3. matching and claim protocol,
4. quality scoring and acceptance,
5. metering, settlement, and reputation.

Agent-first v2 direction:
1. protocol-compatible task-market modes,
2. adapter-based payment/identity/messaging layer,
3. deterministic state/action loop for autonomous agents.

### System Components

### 1) Buyer API + Job Ingress
- API endpoints for sync and batch job submission.
- Job metadata: task type, budget cap, turnaround target, quality threshold, policy profile.
- Creates immutable `JobEnvelope` with deterministic inputs.
- Returns: `job_id`, expected SLA tier, and tracking URL.

### 2) Broker + Matching Engine
- Maintains queue, worker capability registry, and price policy.
- Pull-based claim flow: workers request claim tokens for eligible jobs.
- Multi-objective matching: quality history, latency, task fit, and effective cost.
- Broker can replicate jobs to shadow workers for quality calibration.

Task market modes:
- `claim`: exclusive lease for one worker.
- `bounty`: first valid completion wins.
- `benchmark`: replicate to multiple workers for scoring.
- `auction`: workers submit price/SLA bids under policy constraints.

### 3) Worker Runtime (Contributor Node)
- Runs as local daemon (desktop/server) with optional hosted runner mode.
- Connectors:
  - CLI automation connector (example: local coding agent CLI workflows)
  - API connector (LLM API execution against user-supplied keys)
- Pulls job bundle, executes task plan, submits artifacts and trace.
- Enforces local controls: spend caps, active windows, pause switch, allowed task classes.

### 4) Prompt Packaging + Execution Sandbox
- Converts job payload into standardized execution package:
  - system directives
  - task prompt
  - context attachments
  - expected output schema
- Optional sandbox runner for deterministic pre/post checks.
- Captures execution telemetry (duration, retries, tool calls, token estimates).

### 5) Quality, Trust, and Abuse Layer
- Automated output scoring pipeline:
  - schema validation
  - lint/test checks (task dependent)
  - semantic grader model
- Reputation engine for workers and buyers.
- Abuse controls: Sybil heuristics, anomaly detection, staged trust limits.

Trust registries (v2):
- `IdentityRegistry`: worker identity and attestation history.
- `ReputationRegistry`: quality, reliability, dispute-adjusted score.
- `ValidationRegistry`: benchmark performance on canonical tasks.

### 6) Ledger + Settlement
- Immutable records for claims, execution, acceptance, and payout state.
- Daily/weekly netting windows.
- Payment rails abstraction (fiat first, optional agentic and crypto rails).
- Dispute workflow with replayable artifacts.

Protocol adapters (v2):
- Payment adapter interface (`fiat`, `x402-style`, optional `onchain`).
- Agent manifest adapter (agent card metadata ingestion).
- A2A messaging adapter for agent-to-agent negotiation and delegation.

### Data Model (MVP Core)
- `BuyerAccount`
- `WorkerAccount`
- `WorkerCapability` (task classes, runtime mode, schedule windows)
- `JobEnvelope` (inputs, budget, target SLA, policy tags)
- `JobClaim` (worker claim token, lease timeout, retries)
- `ExecutionRecord` (status, trace, artifacts, metrics)
- `QualityScore` (auto score, reviewer override, final acceptance)
- `SettlementBatch`
- `DisputeCase`

### APIs (MVP)
1. `POST /v1/jobs` (buyer submits job)
2. `GET /v1/jobs/:id` (buyer status)
3. `POST /v1/workers/register` (worker onboarding)
4. `POST /v1/workers/heartbeat` (health + capacity)
5. `POST /v1/jobs/claim` (worker claims eligible job)
6. `POST /v1/jobs/:id/results` (worker submits outputs)
7. `POST /v1/jobs/:id/review` (accept/reject/dispute)
8. `GET /v1/settlements/:batchId`
9. `POST /v1/disputes`

### APIs (Agent-First V2)
1. `POST /v1/taskmarkets/:mode/jobs`
2. `POST /v1/jobs/:id/bids`
3. `POST /v1/agents/manifests`
4. `POST /v1/a2a/messages`
5. `POST /v1/jobs/:id/state-transition`

### Security
1. Signed request and response envelopes.
2. Strict tenant isolation.
3. Immutable audit trail for all routing and settlement decisions.
4. Secret handling with short-lived credentials.
5. Worker attestation token rotation and revocation.

### Reliability Targets (Initial)
1. Claim-to-start latency P95 < 10s for queued jobs in liquid pools.
2. Job completion SLO >= 95% for supported task classes.
3. Exactly-once settlement write semantics.
4. Worker reconnect recovery < 60s after transient disconnect.

### Worker Execution Modes
1. `manual`: worker started by user; only executes explicit accepted claims.
2. `scheduled`: worker runs on fixed windows (example: nights/weekends).
3. `autonomous`: worker runs continuously with local guardrails and idle detection.

MVP defaults to `manual` and `scheduled`; `autonomous` is phase-gated.

### Deterministic Orchestration Contract (V2)
All autonomous workers follow:
1. `state` (job + context + policy)
2. `pending_actions` (machine-readable next steps)
3. worker executes one action
4. `action_result` appended to state
5. repeat until terminal state (`accepted`, `rejected`, `expired`)

Canonical lifecycle states are defined in `STATE_MODEL.md`.

### Phase Plan
1. Phase 1: centralized broker + local worker beta + constrained task set.
2. Phase 2: always-on worker daemon + stronger quality scoring + explicit task market modes.
3. Phase 3: protocol adapters (payment/identity/A2A) + advanced SLA tiers + managed pools.

### Build Cost Categories
1. Core broker engineering (queue, matching, claims, ledger).
2. Worker runtime engineering (local daemon, connectors, updates).
3. Quality/risk tooling (scorers, moderation, fraud controls).
4. Marketplace operations (worker onboarding, disputes, QA, support).

### Decision Note
Do not model tradable credits in core architecture. Keep the platform anchored to fulfilled execution jobs and measured outcomes.

### Related Docs
1. `UX_AND_PAYMENTS_FLOW.md`
2. `UX_PRINCIPLES.md`
3. `USER_FLOWS.md`
4. `FRONTEND_VISION.md`
5. `WIREFRAMES.md`
6. `STATE_MODEL.md`
7. `TASKMARKET_COMPATIBILITY.md`
8. `VALIDATION_PLAN.md`
9. `ALTERNATIVES_AND_VARIANTS.md`
10. `contracts/README.md`
11. `ACCEPTANCE_TEST_MATRIX.md`
12. `FIRST_60_MINUTES.md`
