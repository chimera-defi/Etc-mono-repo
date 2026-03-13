# SpecForge Task List (Build-Ready)

## Current Implementation Status
- [x] Next.js MVP shell exists under `web/`.
- [x] Embedded SQL persistence supports create/load/update/export.
- [x] Patch proposal ingestion exists with stale detection.
- [x] Tiptap authoring workspace exists.
- [x] Browser editor connects to per-document Hocuspocus rooms over Yjs.
- [x] Hocuspocus collaboration server scaffold is runnable.
- [x] Documents, patches, snapshots, and audit events are stored in the local PGlite database.
- [x] Patch review decisions mutate canonical document state and are shown in the workspace.
- [x] Anchored comment threads exist in the workspace with open/resolved state.
- [ ] Shared cursor rendering is still pending, but collaborator awareness UI is live.
- [ ] Rich patch diff/review UI and attribution overlays.
- [ ] Inline attribution overlays are still pending.
- [ ] Depth gates, recap generation, and implementation-readiness scoring.
- [ ] Deterministic export/handoff flow beyond the current local bundle preview.
- [ ] Playwright-based end-to-end and screenshot coverage.

## Remaining MVP Build Backlog

### Track A: Collaboration Runtime and Persistence
- [x] Replace the local JSON store with a real persistence layer.
- [ ] Finish the first app data model:
  - [ ] workspaces
  - [x] documents
  - [x] document snapshots
  - [x] patch proposals
  - [x] patch decisions
  - [x] audit events
  - [x] comment threads
- [ ] Persist collaboration snapshots or Yjs updates so rooms survive server restarts.
- [ ] Add reconnect, replay, and stale-room recovery handling.
- [ ] Add auth hooks between the web app and collaboration server.
- [x] Add a local dev bootstrap for the persistence layer.

### Track B: Shared Canvas UX
- [ ] Finish shared cursor presence; collaborator identity chips are live.
- [ ] Add document switch/create/open flow without relying on a single active document.
- [ ] Add better save, sync, and offline status states.
- [ ] Add empty, error, reconnect, and conflict-recovery UI states.
- [ ] Tighten the layout into the intended shared-canvas experience instead of a dashboard-first shell.

### Track C: Patch Review and Attribution
- [x] Implement patch decision APIs:
  - [x] accept
  - [x] reject
  - [x] cherry-pick
- [x] Apply accepted patches back to canonical document state.
- [x] Record immutable audit events for proposal and decision actions.
- [ ] Add richer patch diff/review UI with risk/status chips.
- [ ] Show who changed what at block level for both humans and agents.
- [ ] Handle stale, conflicted, superseded, and terminal patch states in the UI.

### Track D: Comments, Depth Gates, and Recap
- [x] Implement anchored comment threads.
- [x] Implement simple resolve state.
- [ ] Add depth-gate rules for required sections and missing detail.
- [ ] Add recap generation and build-readiness summaries.
- [ ] Add implementation-readiness scoring that can be shown in the workspace.

### Track E: Export, Handoff, and Example Builds
- [ ] Harden export bundle generation around canonical editor state.
- [ ] Add `agent_spec.json` validation against the intended handoff contract.
- [ ] Build the first curated TypeScript example template from export output.
- [ ] Run the flow against selected `ideas/` examples.
- [ ] Add “handoff complete” checks and confidence reporting.

### Track F: Demo, Testing, and Ops
- [ ] Add Playwright coverage for:
  - create document
  - live collaboration between two clients
  - patch review path
  - export flow
- [ ] Add screenshot capture flow for demo-ready states.
- [ ] Add observability basics:
  - request logging
  - collaboration room events
  - patch decision events
- [ ] Add a top-5 failure mode runbook for local/demo environments.

## Recommended Parallel Execution Now
1. Track A: Collaboration runtime and persistence.
2. Track C: Patch review and attribution.
3. Track B: Shared canvas UX.
4. Track F: Demo, testing, and ops.

## Dependency Order for the Remaining Build
1. Finish the remaining Track A items around collaboration persistence, auth, and recovery.
2. Run Track C in parallel once the data model for patches, decisions, and audit events is stable.
3. Run Track B in parallel with Track C after the persistence contract is clear.
4. Start Track D after Track C exposes stable patch/comment primitives.
5. Start Track E after canonical persistence and export inputs are stable.
6. Keep Track F running continuously, but full screenshot/demo work should follow Tracks B and C.

## Milestones
1. Spec package approved.
2. Design-partner validation complete.
3. MVP collaboration core scope frozen.
4. Repo-generation phase gate decision completed.

## Phase 0 (Spec Lock)
- [ ] Finalize product naming and positioning.
- [ ] Confirm MVP boundaries vs phase-2 scope using the current defaults.
- [ ] Confirm pilot success/kill thresholds.
- [ ] Confirm core integrations priority.
- [ ] Define ChatPRD-parity baseline for handoff UX (Cursor/Replit/v0-style launch points) and where SpecForge intentionally differs.
- [ ] Confirm implementation defaults:
  - `block_id` as primary patch target
  - canonical editor JSON + derived block index
  - simple anchored comments in v1
  - GitHub OAuth for pilot users
  - curated `ideas/` benchmark corpus
  - one curated TypeScript app template for repo generation

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
- [ ] Define stable `block_id` extraction and fingerprint generation rules.
- Deliverables: `SPEC.md` architecture section + `EVENT_MODEL.md`.
- Done when: two clients can produce deterministic merged state in adversarial test scenarios.

### WS-3 Agent Patch Governance
- [ ] Define patch proposal schema and approval policy.
- [ ] Define trust scoring and rollback semantics.
- [ ] Define audit log format for human and agent actions.
- [ ] Define stale-patch behavior and manual-review path for non-rebasing v1.
- Deliverables: updated `SPEC.md`, `ADVERSARIAL_TESTS.md`.
- Done when: unauthorized and malformed patch paths are explicitly blocked.

### WS-4 Repo Generation and Handoff
- [ ] Define export bundle contract (spec artifacts -> scaffold input).
- [ ] Define the single curated TypeScript template, guardrails, and confidence reporting.
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
