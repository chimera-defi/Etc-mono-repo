# SpecForge Task List

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
- [x] Shared workspace-document access helper reduces repeated route scoping logic.
- [x] Runner emits a latest handoff artifact for compaction and resume.
- [x] Runner supports periodic multipass review prompts and meta-learning handoff artifacts.
- [x] Deterministic export/handoff flow exists for the local bundle preview and curated starter handoff.
- [x] One canonical `ideas/` showcase import exists for `server-management-agent`.
- [x] Playwright-based end-to-end and screenshot coverage for the local integrated demo.
- [x] Local parity runner exists to drive bounded Codex passes from the remaining backlog.
- [x] Runner supports concurrent claim/lease/release lifecycle with automatic stale-claim expiration.
- [x] Runner emits context packages for parallel execution and preserves sequential fallback for local testing.
- [x] Multi-user local demo sessions with auto guest identity and cookie persistence.
- [x] CSS variables and dark mode readiness across all component modules.
- [x] Changeset apply, validate, and review API routes implemented.
- [x] Changeset CRUD routes fully implemented (GET list, GET single, POST create+persist, PATCH update, DELETE) — no remaining stubs in API layer.
- [x] Error boundary components for graceful runtime error handling.
- [x] Database adapter layer for persistence abstraction.
- [x] Integration test coverage for wizard, patch, and export flows (877+ tests).
- [x] Performance optimization with lazy loading for heavy components.
- [x] API route consistency with standardised success/error envelope (`unwrapApiJson`).
- [x] Parity runner uses `claude --print` (prompt-only command) with nested session detection.
- [x] Graceful agent chat disconnected state when server not configured.
- [x] Scoped MVP/spec parity for the build branch is reached.
- [x] Local MVP verification is green: lint, unit, build, acceptance, browser, contracts.
- [x] Hosted-runtime rehearsal exists with `web`, `collab-server`, and `postgres`.
- [x] Landing page at `/`, pricing page at `/pricing`, and product workspace at `/workspace` are live.

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
- [x] Replace the local actor selector with pilot-grade GitHub OAuth and workspace membership.
- [x] Add real workspace records, membership roles, and per-workspace document isolation in the app UI.
- [x] Add clarification queue flows and answer writing back into the canonical doc.
- [x] Expand starter generation from one curated template toward the broader repo-generation scope.
- [x] Add hosted deployment config, production persistence, and real observability plumbing.
- [x] Let the runner advance the SaaS backlog through multiple claimed passes while preserving local-test ergonomics.

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

## Shipped Surface
- [x] Guided spec wizard writes into the canonical document.
- [x] Shared OpenSpec core now owns guided wizard defaults/markdown builders plus shared readiness logic.
- [x] Shared OpenSpec core now also owns export bundle, execution-brief, and launch-packet builders.
- [x] Shared OpenSpec core now also owns starter template definitions and the curated TypeScript starter builder.
- [x] Mini agent-assist can populate guided fields from a rough brief, using local CLI tooling when available and a safe fallback otherwise.
- [x] Terminal-native `specforge` CLI can generate the same guided markdown/metadata as the web flow.
- [x] Terminal-native `specforge` CLI can also surface current backlog status/context for terminal-native operators.
- [x] Terminal-native `specforge` CLI can surface the latest runner handoff and meta-learning artifacts for terminal-native review.
- [x] Terminal-native `specforge` CLI can surface local backup manifests for terminal-native ops review.
- [x] `/specforge` slash-command style invocations now work for both guided creation and status-style commands.
- [x] `specforge tui` now provides a lightweight interactive terminal surface for guided init, status, context, and backlog review.
- [x] A repo-packaged `skills/specforge/` bundle now exists so the same guided flow can be installed as an agent skill later.
- [x] Tiptap + Yjs + Hocuspocus multiplayer canvas with shared presence.
- [x] Governed patch queue with accept/reject/cherry-pick.
- [x] Anchored comments and clarification writeback.
- [x] Inline provenance plus audit trail.
- [x] Deterministic export bundle, starter handoff, execution brief, and launch packet.
- [x] Canonical `ideas/` showcase import for `server-management-agent`.
- [x] Local admin controls for reset/seed testing.
- [x] GitHub OAuth hooks, secure-cookie/secret enforcement, and server-derived collab identity.
- [x] Workspace membership is now persisted and manageable from the workspace UI instead of living only in static seed data.
- [x] Postgres-backed hosted persistence option plus health/metrics endpoints.
- [x] Local backup snapshot script exists for web state, collab state, and runner artifacts.
- [x] Metrics endpoint now exposes simple workspace funnel counts for design-partner instrumentation.
- [x] Workspace usage events now exist for assist, handoff, execution, and launch-packet views as a billing/metering skeleton.
- [x] Demo workspaces now enforce a first assist-usage quota so pricing and plan tiers have one real entitlement path in product code.
- [x] Workspace membership limits and a seat-based monthly billing preview now exist so future SaaS billing/membership flows have real product hooks.
- [x] Workspace entitlements and ops summary endpoints now exist for local rehearsal and future hosted ops surfaces.
- [x] Workspace plans can now be switched in-product for local quota and billing rehearsal, and local backups are inspectable through an ops endpoint.
- [x] Shared workspace plan definitions now drive both the pricing page and `/api/workspace/plans`, so SaaS packaging surfaces use one contract.
- [x] Workspace entitlements now expose feature flags alongside quotas and billing preview, so SaaS packaging has a clearer contract surface.
- [x] Workspace behavior signals now track member adds, plan changes, assist preference saves, document creation, patch decisions, and clarification answers.
- [x] Workspace member creation now blocks duplicate GitHub logins instead of silently creating conflicting pilot memberships.
- [x] Pilot workspaces now require GitHub-linked member invites, while the workspace UI exposes clearer local-vs-pilot invite guidance.
- [x] Workspace membership is no longer add-only: the workspace UI can remove members safely without deleting the current active session or the final remaining member.
- [x] Workspace membership roles can now be updated directly from the workspace UI, and those changes flow into workspace behavior instrumentation.
- [x] Metrics, ops summary, and the workspace UI now expose a simple design-partner funnel: activation, assist usage, collaboration, review, and launch preparation.
- [x] Workspace incident warnings now have a dedicated `/api/ops/incidents` surface instead of living only inside the broader ops summary payload.
- [x] Delivery loop with intents, claims, context, handoff artifact, and meta-learnings.
- [x] Shared orchestrator backlog parsing now feeds both the parity runner and the in-product delivery-loop panel.
- [x] Runner status/brief/context now stay aligned with the live backlog instead of stale historical intents.

## Remaining Post-Parity SaaS Work
- [ ] Continue thinning the `web/` launch workflow down to store adapters and workspace-scoped wiring.
- [ ] Grow the terminal-native `specforge` CLI from the current guided wizard into a fuller TUI / slash-command surface.
- [ ] Continue splitting runner state/context handling into the orchestrator package and prove real unattended execution beyond dry runs.
- [ ] Run design-partner sessions and instrument activation/retention/trust metrics.
- [ ] Add managed backup/restore, hosted incident runbooks, and stronger operational dashboards.
- [ ] Add billing, usage metering, and plan enforcement for SaaS packaging.
- [ ] Finish replacing the remaining local actor fallback with a full pilot-grade workspace membership UX in the main product path.
- [ ] Expand starter generation only after design-partner validation proves which templates matter.
- [ ] Decide whether the first commercial motion is hosted SaaS only, self-hosted OSS plus hosted SaaS, or OSS-first.

## Tomorrow Kickoff: Agent Service Workflow Buildout
- [ ] Add `POST /service/spec-jobs` endpoint (rough brief -> guided workflow job).
- [ ] Add job-state machine (`queued|running|blocked|completed|failed`) + persistence.
- [ ] Add artifact retrieval endpoint for launch-packet outputs.
- [ ] Reuse patch/governance pipeline in service mode (no silent direct writes).
- [ ] Add assisted-mode review endpoint for pending decisions.
- [ ] Ship one e2e happy-path test: brief -> completed job -> downloadable artifacts.
- [ ] Add one blocked-path test: missing required clarification -> blocked status + unblock + retry.

## Meta Learnings To Keep Applying
- [x] Treat placeholder fallback content as real product debt and remove it during review passes.
- [x] Keep pricing, plans, and entitlements on one shared contract surface.
- [x] Split large UI routes into panel components before they become unreadable.
- [x] Split persistence by domain before store changes become high-risk.
- [x] Run the final verification gate sequentially to avoid fake Playwright or collab port regressions.

## Open Product Questions
- [ ] Should the first terminal-native product surface be a CLI wizard, a fuller TUI, or a slash-command adapter on top of existing agent CLIs?
- [ ] Which second template is worth supporting after the current constrained starter set?
- [ ] How much unattended runner autonomy is acceptable before a human checkpoint is mandatory?
- [ ] Should hosted workspaces support bring-your-own provider credentials, managed agents, or both as the primary commercial path?

## Parallel Refactor Lanes
- [x] Lane A: extract the first OpenSpec core modules from `web/src/lib/specforge/*`.
- [x] Lane B: define the first `specforge-cli` guided wizard flow on top of the shared core.
- [x] Lane C: package shared backlog parsing into a clearer orchestrator boundary.
- [x] Lane D: keep web and collab surfaces consuming the shared contracts without regressions.

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

## Verification Commands
- [x] `bun run lint`
- [x] `bun run test`
- [x] `bun run build`
- [x] `bun run test:e2e`
- [x] `bun run test:cli`
- [x] `bun run test:acceptance`
- [x] `bun run contracts:validate`
- [x] `bun run parity:status`
- [x] `bun audit`
