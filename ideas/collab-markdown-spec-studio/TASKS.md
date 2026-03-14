# SpecForge Task List (Build-Ready)

## Current Implementation Status
- [x] Next.js MVP shell exists under `web/`.
- [x] Embedded SQL persistence supports create/load/update/export.
- [x] Guided spec creation turns structured inputs into the canonical draft and metadata.
- [x] Patch proposal ingestion exists with stale detection.
- [x] Tiptap authoring workspace exists.
- [x] Browser editor connects to per-document Hocuspocus rooms over Yjs.
- [x] Hocuspocus collaboration server scaffold is runnable.
- [x] Documents, patches, snapshots, and audit events are stored in the local PGlite database.
- [x] Patch review decisions mutate canonical document state and are shown in the workspace.
- [x] Anchored comment threads exist in the workspace with open/resolved state.
- [x] Readiness scoring and recap output exist in the workspace.
- [x] Starter handoff generates a curated TypeScript output bundle from the approved spec.
- [x] Execution brief generates run-readiness, blockers, commands, and agent instructions.
- [x] Launch packet combines export, starter output, and execution brief into one payload.
- [x] Shared cursor rendering is live alongside collaborator awareness.
- [x] Rich patch diff/review UI exists with review-stage and decision-stage triage.
- [x] Inline block-level provenance markers are visible in the shared canvas.
- [x] Depth gates, recap generation, and implementation-readiness scoring.
- [x] Clarification queue and answer writeback into canonical document sections.
- [x] Deterministic export/handoff flow exists for the local bundle preview and curated starter handoff.
- [x] One canonical `ideas/` showcase import exists for `server-management-agent`.
- [x] Playwright-based end-to-end and screenshot coverage for the local integrated demo.
- [x] Local parity runner exists to drive bounded Codex passes from the remaining backlog.

## Remaining MVP Build Backlog
- [x] Add reconnect, replay, and stale-room recovery handling beyond the current local persistence path.
- [x] Add auth hooks between the web app and collaboration server.
- [x] Add stronger sync/offline/error states in the shared canvas.
- [x] Deepen inline provenance from block markers into richer in-text attribution overlays.
- [x] Extend the canonical showcase path from import -> review -> launch packet into a starter-output walkthrough in the UI/docs.
- [x] Add lightweight observability and a local failure-mode runbook.

## Next SaaS Build Backlog
- [x] Add explicit workspace actor/session selection so server-side attribution is not hardcoded.
- [x] Model the delivery loop as intents, claims, context packages, and signals inside the runner/app surface.
- [x] Document minimum extensible product as the first-class delivery target before full parity.
- [ ] Replace the local actor selector with pilot-grade GitHub OAuth and workspace membership.
- [ ] Add real workspace records, membership roles, and per-workspace document isolation in the app UI.
- [x] Add clarification queue flows and answer writing back into the canonical doc.
- [ ] Expand starter generation from one curated template toward the broader repo-generation scope.
- [ ] Add hosted deployment config, production persistence, and real observability plumbing.
- [ ] Let the runner advance the SaaS backlog through multiple claimed passes while preserving local-test ergonomics.

## Immediate Execution Order
1. Auth and tenancy:
   - replace local actor switching with local-fallback auth sessions plus GitHub OAuth
   - add workspace membership records and enforce workspace-scoped document loading
2. Orchestration hardening:
   - persist retry counts, failure summaries, and richer blocked-state diagnostics
   - prove the runner can clear at least one non-trivial SaaS backlog item
3. Clarification workflow:
   - queue unanswered clarifications
   - write accepted answers back into canonical blocks and audit history
4. Handoff expansion:
   - grow starter output beyond the single curated template
   - add hosted deployment and production observability notes/config

## Recommended Parallel Execution Now
1. Shared canvas hardening: reconnect, replay, and sync/error states.
2. Attribution and provenance: richer in-text overlays and block ownership detail.
3. Example-build proof: tighten the showcase path from imported idea to starter walkthrough.
4. Ops polish: logging, failure-mode runbook, and local recovery notes.

## Dependency Order for the Remaining Build
1. Finish shared-canvas hardening around reconnect and sync states.
2. Deepen provenance from marker overlays into richer inline annotations.
3. Tighten the showcase example into a more explicit end-to-end walkthrough.
4. Add ops notes and local recovery guidance last.

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
- [ ] Delivery loop can continue from minimum extensible product to scoped parity without repeated manual re-prompting.

## Phase 1 (Validation)
- [ ] Execute WS-6 and publish synthesis.
- [ ] Compare spec-to-first-commit against baseline workflows.
- [ ] Identify the minimal MVP scope that still preserves core value.

## Phase 2 (Decision)
- [ ] Publish validation report.
- [ ] Decide continue/pivot/stop.
- [ ] If continue: freeze MVP backlog and integration sequence.
