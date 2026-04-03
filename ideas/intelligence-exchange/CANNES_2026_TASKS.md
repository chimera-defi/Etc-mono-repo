## Cannes 2026 Tasks

### Dependency Order

1. Escrow contract and local fixtures
2. Idea -> brief planner
3. Broker claim loop
4. Worker submission path
5. Scoring and acceptance
6. Dossier storage
7. Web demo
8. Mainnet demo wiring

### P0 Ship List

- funded idea submission
- milestone generation
- one worker claim flow
- one output submission + score
- one acceptance action
- one Arc release
- one 0G dossier link
- one World-gated poster and worker flow

### Workstream 1: Contracts

- implement escrow contract
- add milestone reservation and release events
- add refund path for expired or rejected milestones

Done criteria:
- local tests cover fund, reserve, release, refund

### Workstream 2: Planner

- transform raw idea into `BuildBrief`
- emit fixed milestone types
- attach acceptance rubric per milestone

Done criteria:
- deterministic brief generation from fixture input

### Workstream 3: Broker

- create claimable milestone queue
- lease and expiry handling
- state transitions persisted append-only

Done criteria:
- claim expiry and requeue work deterministically

### Workstream 4: Worker Runtime

- register worker capability
- claim milestone
- submit artifact and trace
- emit one paid dependency event

Done criteria:
- one worker submission path passes end-to-end locally

### Workstream 5: Scoring

- schema validation
- deterministic acceptance checks
- rework path for failed output

Done criteria:
- valid fixture accepted, invalid fixture routed to rework

### Workstream 6: Integrations

- Arc escrow deployment
- World proof stubs or real verification wrapper
- 0G dossier write path

Done criteria:
- each sponsor integration visibly changes behavior

### Workstream 7: Frontend

- idea submission screen
- milestone board
- worker activity trace
- accept / reject view
- payout and dossier status panel

Done criteria:
- judge flow completes without terminal usage

### Workstream 8: Demo Ops

- local fallback mode
- public demo environment
- seeded funded demo job
- recorded recovery path if one integration fails

Done criteria:
- one-command local demo plus live demo checklist
