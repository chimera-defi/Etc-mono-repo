## Cannes 2026 Variant: Agentic Idea Build Marketplace

### Goal

Turn Intelligence Exchange into a hackathon-ready product variant where people post ideas and human-backed agents build them out into specs, prototypes, code tasks, and artifacts when they have spare execution capacity.

This is not "sell unused credits."
It is:
- buyer posts idea or build brief
- marketplace decomposes work into machine-doable stages
- worker agents claim and execute stages
- platform scores outputs and releases payment on accepted work

### Why This Variant Works

The base Intelligence Exchange concept is broad.
For ETHGlobal Cannes 2026, the strongest narrow wedge is:
- agent marketplaces
- micropayment rails
- trust and anti-sybil identity
- persistent agent memory and build provenance

This variant is therefore:
- more agent-native than the base marketplace
- easier to demo in 5 minutes
- more directly aligned to the current prize set

### Core User Story

1. A human posts an idea or request for implementation help.
2. The system converts it into a structured build brief and task bundle.
3. Human-backed worker agents claim tasks.
4. Agents spend small amounts on tools, APIs, or data as needed.
5. Outputs are scored and either accepted or sent back for retry.
6. Payment is released by milestone.
7. Every action leaves an auditable build trail.

### What Changes From The Base Idea

#### Narrower demand side

Base idea:
- generic AI job execution marketplace

Cannes variant:
- idea-to-build marketplace
- first tasks are:
  - PRD/spec expansion
  - repo scaffold generation
  - issue/task decomposition
  - patch / polish / review passes

#### More explicit agent commerce

Base idea:
- workers get paid for accepted jobs

Cannes variant:
- worker agents also make small machine payments during execution
- examples:
  - pay for inference
  - pay for retrieval or data access
  - pay another agent for a subtask

#### Stronger identity requirement

Base idea:
- worker identity and trust matter

Cannes variant:
- posting, claiming, or approving sensitive jobs should require proof of human
- worker agents should be visibly human-backed rather than anonymous bot swarms

### Cannes MVP

#### P0 demo loop

1. User posts an idea brief.
2. Platform converts it into:
   - structured brief
   - milestone list
   - acceptance rubric
3. Worker agent claims a milestone.
4. Agent executes with one paid dependency in the loop.
5. Output is scored.
6. Human approves or rejects.
7. Escrow releases milestone payment.

#### Demo task types

- idea brief -> PRD/spec
- spec -> implementation task list
- repo scaffold or patch set
- review / polish pass

#### Explicit non-scope

- open unbounded marketplace liquidity
- generalized freelance platform
- tokenized credits as the core rail
- autonomous final deployment without human approval

### Sponsor Stack Recommendation

#### Primary

1. Arc
   - escrow
   - milestone release
   - agent nanopayments

2. World
   - human-only posting / claiming / approval
   - human-backed agents

3. 0G
   - persistent build memory
   - artifact and decision dossier storage

#### Secondary

4. ENS
   - agent identity and discoverability

5. Ledger
   - secure approval for high-value releases or sensitive actions

### Architecture Delta From Base Intelligence Exchange

#### New demand-side ingress

- `IdeaSubmission`
  - raw concept
  - budget
  - desired output type
  - quality bar

- `BuildBrief`
  - normalized project summary
  - milestone graph
  - acceptance criteria

#### New orchestration layer

- `IdeaPlanner`
  - converts raw idea into structured milestones

- `TaskDecomposer`
  - splits milestones into claimable work units

- `AcceptancePackager`
  - creates rubric, schema, and expected artifacts

#### Existing marketplace layers reused

- worker registry
- claim protocol
- execution record
- scoring
- dispute flow
- settlement

### Suggested Agent Roles

1. `planner-agent`
   - turns idea into spec and milestones
2. `builder-agent`
   - produces code or artifact output
3. `review-agent`
   - scores output before final human review
4. `routing-agent`
   - decides whether to reassign, retry, or escalate

### Why Arc Is The Best Core Fit

This concept wants:
- milestone escrow
- conditional release
- many tiny payments
- possible crosschain USDC sourcing later

That is a much better fit for Arc than a generic Stripe-only hackathon build.

### Why World Is Not Decorative Here

World is only worth including if the product breaks without it.

Here it can gate:
- who can post funded jobs
- who can claim work
- who can approve milestone release
- reputation uniqueness and rate limits

### Why 0G Has A Real Role

0G should not be bolted on as "future compute."

It should own:
- build dossier per job
- artifact memory
- prior attempt history
- reproducible reasoning bundle for acceptance/dispute

### MVP Build Story

Frontend:
- submit idea
- view milestone board
- watch worker agent claim / execute
- approve or reject deliverable

Backend:
- broker
- planner
- scorer
- settlement state

Onchain:
- escrow and milestone release
- nanopayment rail

Storage:
- build dossier and artifact memory

### Risks

1. Too much category mixing:
   - marketplace
   - agent platform
   - payments
   - identity

2. Demo can become fake if:
   - agent "build" is only mocked
   - payment rails are not actually used
   - World is only a badge

3. Marketplace liquidity is still unsolved.
   - For hackathon MVP, this is acceptable if one controlled supply-side demo exists.

### Recommended Positioning

Pitch it as:
- a trusted marketplace where human-backed agents turn ideas into build artifacts and get paid by milestone

Do not pitch it as:
- a generic AI gig marketplace
- a speculative spare-credit resale system

### Bottom Line

This is a much stronger Cannes variant than the broad base concept because it makes:
- agent commerce visible
- identity meaningful
- payments native
- build outputs judgeable
