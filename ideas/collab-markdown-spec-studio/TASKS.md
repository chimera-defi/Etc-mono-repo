# SpecForge Task List

## Current Status
- [x] Scoped MVP/spec parity for the build branch is reached.
- [x] Guided spec creation, shared authoring, governed patch review, comments, clarifications, readiness, export, starter handoff, execution brief, and launch packet are working.
- [x] Local MVP verification is green: lint, unit, build, acceptance, browser, contracts.
- [x] Hosted-runtime rehearsal exists with `web`, `collab-server`, and `postgres`.
- [x] Parity runner backlog is clear for `scoped_saas_parity`.
- [x] Landing page at `/`, pricing page at `/pricing`, and product workspace at `/workspace` are live.

## Shipped Surface
- [x] Guided spec wizard writes into the canonical document.
- [x] Tiptap + Yjs + Hocuspocus multiplayer canvas with shared presence.
- [x] Governed patch queue with accept/reject/cherry-pick.
- [x] Anchored comments and clarification writeback.
- [x] Inline provenance plus audit trail.
- [x] Deterministic export bundle, starter handoff, execution brief, and launch packet.
- [x] Canonical `ideas/` showcase import for `server-management-agent`.
- [x] Local admin controls for reset/seed testing.
- [x] GitHub OAuth hooks, secure-cookie/secret enforcement, and server-derived collab identity.
- [x] Postgres-backed hosted persistence option plus health/metrics endpoints.
- [x] Delivery loop with intents, claims, context, handoff artifact, and meta-learnings.

## Remaining Post-Parity SaaS Work
- [ ] Run design-partner sessions and instrument activation/retention/trust metrics.
- [ ] Add managed backup/restore, hosted incident runbooks, and stronger operational dashboards.
- [ ] Add billing, usage metering, and plan enforcement for SaaS packaging.
- [ ] Replace local actor fallback with full pilot-grade workspace membership UX in the main product path.
- [ ] Expand starter generation only after design-partner validation proves which templates matter.
- [ ] Decide whether the first commercial motion is hosted SaaS only, self-hosted OSS plus hosted SaaS, or OSS-first.

## Open Product Questions
- [ ] Which second template is worth supporting after the current constrained starter set?
- [ ] How much unattended runner autonomy is acceptable before a human checkpoint is mandatory?

## Verification Commands
- [x] `npm run lint`
- [x] `npm run test`
- [x] `npm run build`
- [x] `npm run test:e2e`
- [x] `npm run test:acceptance`
- [x] `npm run contracts:validate`
- [x] `npm run parity:status`
- [x] `npm audit --omit=dev`
