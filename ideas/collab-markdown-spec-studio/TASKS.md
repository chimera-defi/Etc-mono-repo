# SpecForge Task List (Build-Ready)

## Milestones
1. Spec package approved.
2. Design-partner validation complete.
3. MVP collaboration core scope frozen.
4. Repo-generation phase gate decision completed.

## Phase 0 (Spec Lock)
- [ ] Finalize product naming and positioning.
- [ ] Finalize MVP boundaries vs phase-2 scope.
- [ ] Finalize pilot success/kill thresholds.
- [ ] Finalize core integrations priority.
- [ ] Define ChatPRD-parity baseline for handoff UX (Cursor/Replit/v0-style launch points) and where SpecForge intentionally differs.

## Parallel Workstreams (AgentCon Kickoff)

### WS-1 Product and UX
- [ ] Lock JTBD, top-3 personas, and first-session success metric.
- [ ] Convert wireframes into screen-level acceptance criteria.
- [ ] Produce empty-state, failure-state, and recovery-state UX copy.
- Deliverables: updated `PRD.md`, `USER_FLOWS.md`, `WIREFRAMES.md`.
- Done when: each critical flow has measurable start/end conditions.

### WS-2 Realtime Collaboration Core
- [ ] Define CRDT/OT choice and conflict-resolution invariants.
- [ ] Define session lifecycle, presence model, and permission model.
- [ ] Define document event schema and replay semantics.
- Deliverables: `SPEC.md` architecture section + event contract appendix.
- Done when: two clients can produce deterministic merged state in adversarial test scenarios.

### WS-3 Agent Patch Governance
- [ ] Define patch proposal schema and approval policy.
- [ ] Define trust scoring and rollback semantics.
- [ ] Define audit log format for human and agent actions.
- Deliverables: updated `SPEC.md`, `ADVERSARIAL_TESTS.md`.
- Done when: unauthorized and malformed patch paths are explicitly blocked.

### WS-4 Repo Generation and Handoff
- [ ] Define export bundle contract (spec artifacts -> scaffold input).
- [ ] Define generation templates, guardrails, and confidence reporting.
- [ ] Define "handoff complete" checklist for engineering teams.
- [ ] Define one-click handoff actions to external coding tools with context compression.
- Deliverables: updated `VISION_AND_FLOW.md`, `AGENT_HANDOFF.md`.
- Done when: export contract can be consumed without manual interpretation.

### WS-5 Platform and Operations
- [ ] Define tenancy model and isolation boundaries.
- [ ] Define observability pack (metrics, logs, traces) and SLOs.
- [ ] Define backup/restore and incident runbook scope.
- Deliverables: ops section in `SPEC.md` + runbook notes.
- Done when: top-5 failure modes each have owner, detector, and first response.

### WS-6 Validation and Economics
- [ ] Run 15 workflow interviews.
- [ ] Run 5 design-partner collaborative sessions.
- [ ] Measure patch acceptance and trust signals.
- [ ] Measure spec-to-first-commit delta vs baseline.
- Deliverables: validation report + go/no-go recommendation.
- Done when: thresholds in `GO_NO_GO_SCORECARD.md` are objectively evaluated.

## Dependency Order
1. WS-1 and WS-6 start immediately.
2. WS-2 and WS-3 start after WS-1 flow lock.
3. WS-4 starts after WS-2 event contract draft.
4. WS-5 runs in parallel with WS-2/WS-3 and finalizes before pilot.

## One-Shot Build Readiness Gates
- [ ] API/event contracts are versioned and example payloads are included.
- [ ] Explicit non-goals and out-of-scope cases are listed.
- [ ] Acceptance tests are mapped one-to-one to user flows.
- [ ] Seed data and fixture examples are included for local boot.
- [ ] "First 60 minutes" local runbook is present and validated by a fresh agent.

## Phase 1 (Validation)
- [ ] Execute WS-6 and publish synthesis.
- [ ] Compare spec-to-first-commit against baseline workflows.
- [ ] Identify the minimal MVP scope that still preserves core value.

## Phase 2 (Decision)
- [ ] Publish validation report.
- [ ] Decide continue/pivot/stop.
- [ ] If continue: freeze MVP backlog and integration sequence.
