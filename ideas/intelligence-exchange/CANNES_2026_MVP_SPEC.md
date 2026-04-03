## Cannes 2026 MVP Spec

### Objective

Specify the smallest buildable version of Intelligence Exchange for ETHGlobal Cannes 2026 as an agentic idea-build marketplace.

The MVP must be one-shot buildable and judgeable in under 5 minutes.

### Build Output At The End

The intended build artifact is a hybrid full-stack app:
- web frontend for poster and reviewer flows
- broker / planner / scorer backend
- worker runtime for agent execution
- onchain escrow and payout contracts
- local deterministic mode
- public-network demo deploy

It is not a fully onchain autonomous marketplace in v1.

### Core Thesis

Humans post build ideas.
Human-backed agents claim milestones, execute work, optionally spend tiny amounts on paid dependencies, and get paid on accepted output.

### P0 Product Slice

#### Demand side

- submit idea brief
- set budget and output type
- approve milestone release

#### Supply side

- register worker agent
- claim milestone
- submit output + trace

#### Platform

- create build brief from idea
- split into milestone tasks
- score output deterministically
- release or block payment

#### Sponsor-critical modules

- Arc: milestone escrow + payout + nanopayment event
- World: proof-of-human gating for poster and worker operator
- 0G: build dossier storage

### Target Implementation Layout

Recommended package shape:

```text
apps/intelligence-exchange-cannes-web/
apps/intelligence-exchange-cannes-broker/
apps/intelligence-exchange-cannes-worker/
packages/intelligence-exchange-cannes-contracts/
packages/intelligence-exchange-cannes-shared/
packages/intelligence-exchange-cannes-fixtures/
```

`shared/` owns:
- schemas
- state enums
- API types
- acceptance fixtures

### Strict Non-Scope

- open worker marketplace liquidity
- generalized freelance marketplace UX
- provider credit resale
- autonomous deploy to production
- onchain dispute court
- token launch

### Canonical User Flow

1. Poster verifies as human.
2. Poster creates funded idea job.
3. System produces `BuildBrief` and milestone set.
4. Worker operator verifies as human and activates agent.
5. Agent claims one milestone.
6. Agent executes and emits:
   - deliverable
   - trace
   - one nanopayment or paid-tool event
7. Platform scores output.
8. Poster accepts.
9. Arc escrow releases milestone payment.
10. 0G dossier stores the build history.

### Fixed Milestone Types For P0

Only these milestone types are allowed in the first build:
- `brief`
- `tasks`
- `scaffold`
- `review`

Reason:
- fixed types make planning, scoring, and UI states deterministic

### System Components

#### 1. Buyer App

Responsibilities:
- idea submission
- budget selection
- review / accept / reject
- view dossier and payout state

#### 2. Planner Service

Responsibilities:
- convert raw idea into normalized `BuildBrief`
- emit milestone graph
- generate acceptance rubric

#### 3. Broker Service

Responsibilities:
- queue milestone jobs
- enforce claim leases
- route jobs to eligible workers
- persist state transitions

#### 4. Worker Agent Runtime

Responsibilities:
- register capability profile
- claim eligible milestone
- execute task through configured tools
- submit output, trace, and spend log

#### 5. Scoring Service

Responsibilities:
- schema validation
- deterministic checks
- rubric scoring
- accept / rework recommendation

#### 6. Escrow Contracts

Responsibilities:
- hold poster funds
- reserve milestone amounts
- release accepted milestone payout
- refund or pause unclaimed work

#### 7. Identity Layer

Responsibilities:
- verify poster humanness
- verify worker operator humanness
- bind jobs and claims to a unique human-backed operator

#### 8. Build Dossier Storage

Responsibilities:
- store `BuildBrief`
- store submitted artifact metadata
- store scoring summary
- store release evidence

### Canonical Data Objects

#### `IdeaSubmission`

- `ideaId`
- `posterId`
- `title`
- `prompt`
- `targetArtifact`
- `budgetUsd`
- `createdAt`

#### `BuildBrief`

- `briefId`
- `ideaId`
- `summary`
- `milestones[]`
- `acceptanceRubric`
- `dossierUri`

#### `MilestoneJob`

- `jobId`
- `briefId`
- `milestoneType`
- `budgetUsd`
- `requiredCapabilities[]`
- `acceptanceSchemaId`
- `status`
- `leaseExpiry`

#### `WorkerClaim`

- `claimId`
- `jobId`
- `workerId`
- `claimedAt`
- `expiresAt`
- `status`

#### `ExecutionSubmission`

- `submissionId`
- `jobId`
- `artifactUris[]`
- `traceUri`
- `spendEvents[]`
- `scoreBreakdown`
- `scoreStatus`

#### `EscrowRelease`

- `releaseId`
- `jobId`
- `payer`
- `payee`
- `amount`
- `status`

### Invariants

1. No milestone becomes `queued` until its budget is reserved.
2. No worker can claim a job without verified human-backed operator status.
3. Only one active claim exists for a `claim`-mode milestone in MVP.
4. No payout releases without:
   - accepted score state
   - explicit human approval
   - successful dossier write or clearly labeled degraded mode
5. All state transitions are append-only and replayable.

### State Machine Delta

Use the base Intelligence Exchange job lifecycle with these additional meanings:

- `created`
  - idea accepted, milestone not yet claimable
- `queued`
  - milestone published for worker claim
- `claimed`
  - worker lease issued
- `running`
  - worker executing task
- `submitted`
  - artifact and trace received
- `accepted`
  - score and human review passed, payment released
- `rework`
  - output returned for another pass
- `expired`
  - claim expired or poster approval timed out
- `disputed`
  - submission or payment contested

### Payment Model

#### Poster funds

- poster deposits stablecoin into escrow at idea creation
- each milestone reserves a portion of escrow

#### Worker payout

- payment releases only on acceptance
- partial release only if milestone is explicitly split

#### Agent spend

- worker may emit one visible spend event for the demo
- spend event is not automatically reimbursed in P0 unless explicitly modeled

### Contract Surface

#### `IdeaEscrow`

- `fundIdea(bytes32 ideaId, address token, uint256 amount)`
- `reserveMilestone(bytes32 ideaId, bytes32 milestoneId, uint256 amount)`
- `releaseMilestone(bytes32 ideaId, bytes32 milestoneId, address worker)`
- `refundMilestone(bytes32 ideaId, bytes32 milestoneId, address poster)`

Required events:
- `IdeaFunded`
- `MilestoneReserved`
- `MilestoneReleased`
- `MilestoneRefunded`

#### `IdentityGate` (adapter or wrapper)

- `isVerifiedPoster(address account) -> bool`
- `isVerifiedWorker(address account) -> bool`

### API Surface

#### Buyer / reviewer APIs

- `POST /v1/cannes/ideas`
- `GET /v1/cannes/ideas/:ideaId`
- `POST /v1/cannes/ideas/:ideaId/accept`
- `POST /v1/cannes/ideas/:ideaId/reject`

#### Planner / broker APIs

- `POST /v1/cannes/ideas/:ideaId/plan`
- `POST /v1/cannes/jobs/:jobId/claim`
- `POST /v1/cannes/jobs/:jobId/submit`

#### Worker APIs

- `POST /v1/cannes/workers/register`
- `POST /v1/cannes/workers/heartbeat`

### Frontend Screens

- `SubmitIdeaPage`
- `IdeaDetailPage`
- `MilestoneBoard`
- `SubmissionReviewPanel`
- `EscrowStatusPanel`
- `DossierPanel`

### Mainnet Deployment Shape

Use a staged deployment model instead of jumping directly from local to mainnet.

#### Stage 1: Local deterministic

- all sponsor integrations mocked or stubbed
- local chain for escrow tests

#### Stage 2: Public testnet rehearsal

- deploy escrow to sponsor-compatible test environment if available
- rehearse funded flow end to end
- validate dossier writes and identity gating

#### Stage 3: Public demo deployment

- deploy minimal escrow surface to public network
- keep the rest offchain
- reuse the exact seeded idea / worker path rehearsed on testnet

#### Onchain

- minimal escrow contract on Arc
- payout release contract or escrow module
- event logs for:
  - `IdeaFunded`
  - `MilestoneReserved`
  - `MilestoneReleased`
  - `MilestoneRefunded`

#### Offchain

- planner
- broker
- scorer
- dossier writer
- web app

#### Demo safety rule

- keep all expensive or irreversible actions human-approved
- maintain a local deterministic fallback if public infra or RPC fails

### Demo-Visible Sponsor Usage

#### Arc

- funded escrow
- milestone release
- one agent spend event

#### World

- poster verification
- worker operator verification

#### 0G

- dossier URI visible in UI

### Edge-Case Policy Rules

1. No claim without verified human-backed worker operator.
2. No payout without accepted score + explicit human approval.
3. Claim expiry must return job to queue.
4. Unfunded jobs never enter claimable state.
5. If dossier write fails, payout must pause or surface degraded mode clearly.
6. If scoring is inconclusive, route to rework rather than auto-accept.

### Build Success Criteria

1. One end-to-end funded idea completes on public demo rails.
2. One worker agent claim and artifact submission succeeds.
3. One visible micropayment or paid dependency event exists.
4. One 0G dossier URI is shown in the UI.
5. One Arc payout release is visible onchain.
