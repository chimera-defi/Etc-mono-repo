## Agent Handoff: Orbit Pilot

### Objective
Build a launch-distribution operator that can safely prepare and execute submissions across directories, product databases, profiles, and official content APIs.

### Must-Haves
1. Manual-first compliance posture.
2. Structured platform registry.
3. Per-platform content variation.
4. UTM and asset processing.
5. Full logging, duplicate detection, and cooldown logic.
6. Small but real initial publisher set.

### Parallel Workstreams
1. Registry Agent
   - Scope: `PLATFORM_MATRIX.md`, `data/seed_platforms.yaml`
   - Objective: normalize platform metadata and mode/risk assignments.
2. Orchestration Agent
   - Scope: `SPEC.md`, `SYSTEM_PROMPT.md`, `src/orbit_pilot/`
   - Objective: finalize state model, graph nodes, and publish contracts.
3. UX Agent
   - Scope: `USER_FLOWS.md`, `FRONTEND_VISION.md`, `WIREFRAMES.md`
   - Objective: define operator experience for review, publish, and manual queue.
4. Compliance Agent
   - Scope: `RISK_REGISTER.md`, `VALIDATION_PLAN.md`
   - Objective: harden safety boundaries and rollout policy.

### Acceptance Criteria
1. Every platform record has mode, risk, and official URL.
2. The system prompt and code skeleton agree on mode selection.
3. Browser fallback is disabled by default.
4. Build tasks are dependency ordered.
5. First-60-minutes bootstrap is executable by a fresh agent.
