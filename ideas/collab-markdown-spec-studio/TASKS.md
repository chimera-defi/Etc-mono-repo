# SpecForge Task List

## Current Status
- [x] Scoped MVP/spec parity for the build branch is reached.
- [x] Guided spec creation, shared authoring, governed patch review, comments, clarifications, readiness, export, starter handoff, execution brief, and launch packet are working.
- [x] Local MVP verification is green: lint, unit, build, acceptance, browser, contracts.
- [x] Hosted-runtime rehearsal exists with `web`, `collab-server`, and `postgres`.
- [x] The original scoped MVP backlog is clear; the remaining list below is broader post-parity SaaS/platform work.
- [x] Landing page at `/`, pricing page at `/pricing`, and product workspace at `/workspace` are live.

## Shipped Surface
- [x] Guided spec wizard writes into the canonical document.
- [x] Shared OpenSpec core now owns guided wizard defaults/markdown builders plus shared readiness logic.
- [x] Shared OpenSpec core now also owns export bundle, execution-brief, and launch-packet builders.
- [x] Shared OpenSpec core now also owns starter template definitions and the curated TypeScript starter builder.
- [x] Mini agent-assist can populate guided fields from a rough brief, using local CLI tooling when available and a safe fallback otherwise.
- [x] Terminal-native `specforge` CLI can generate the same guided markdown/metadata as the web flow.
- [x] Terminal-native `specforge` CLI can also surface current backlog status/context for terminal-native operators.
- [x] Terminal-native `specforge` CLI can surface the latest runner handoff and meta-learning artifacts for terminal-native review.
- [x] `/specforge` slash-command style invocations now work for both guided creation and status-style commands.
- [x] `specforge tui` now provides a lightweight interactive terminal surface for guided init, status, context, and backlog review.
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

## Verification Commands
- [x] `npm run lint`
- [x] `npm run test`
- [x] `npm run build`
- [x] `npm run test:e2e`
- [x] `npm run test:cli`
- [x] `npm run test:acceptance`
- [x] `npm run contracts:validate`
- [x] `npm run parity:status`
- [x] `npm audit --omit=dev`
