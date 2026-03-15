## SpecForge Technical Spec (MVP)

### Summary
Build a real-time collaborative spec IDE with:
1. CRDT-backed infrastructure for human collaboration (Yjs + Hocuspocus deployed; multiplayer sync untested in MVP),
2. governed agent patch workflows (fully functional: propose/review/accept/reject/cherry-pick),
3. depth gates and recap requirements (deferred to Phase 2),
4. deterministic export into execution-ready spec bundles (partial: markdown, handoff, launch packet; agent_spec.json pending),
5. a delivery loop that keeps driving a minimum extensible product toward parity with the approved spec (fully implemented).

### Product Principle: Minimum Extensible Product
1. Approved specs should first produce a minimum extensible product, not a pretend-final build.
2. The first generated/buildable output must be runnable, reviewable, and easy for humans or agents to extend without rewrite.
3. SpecForge should prefer narrow, composable starter outputs plus explicit follow-on backlog items over fragile "generate everything" claims.
4. The delivery loop is responsible for advancing that minimum extensible product toward spec parity through bounded passes, not requiring repeated manual nudges.

### Core Components

### 1) Realtime Editor Layer
**MVP Status**: Partial
- ✓ Markdown editor with Tiptap.
- ✓ CRDT infrastructure (Yjs + Hocuspocus server, room tokens, persistence).
- ✗ Presence: infrastructure ready but cursor/selection UI not implemented.
- ✗ Comment threads: database schema complete, API endpoints exist, but no frontend UI component (Phase 2).
- ⚠️ Multiplayer sync: infrastructure deployed but not tested in production tests (infrastructure-ready, not user-validated).

### 2) Agent Patch Engine
- Agents propose structured patches (insert/replace/delete) against stable block or section IDs.
- Patch review queue with accept/reject/cherry-pick.
- Optional auto-apply policy for low-risk edits.

### 3) Document Model
- Canonical document state + markdown export representation.
- Stable block/section IDs for patching and history.
- Metadata per block: author type, timestamp, provenance, confidence.
- Document version + block fingerprints to detect stale proposals.

### 4) Versioning + Merge
- Snapshot versions per save checkpoint.
- Section/block-level review and merge.
- Conflict resolver for overlapping patches.
- Stale-patch detection when base version or target fingerprint no longer matches.

### 5) Spec Export Layer
- Export bundle:
  - `PRD.md`
  - `SPEC.md`
  - `TASKS.md`
  - `agent_spec.json`

### 6) Repo Scaffold Generator (Phase 2)
- Generates a starter GitHub repository from approved spec bundle.
- Supports template packs (frontend, API backend, docs-first starter).
- Embeds trace links from generated files/issues back to spec sections.
- Starts with curated `ideas/` example packs before broad rollout.

### 7) Idea-Depth Orchestrator (Wizard Layer)
- Tracks completion state for required artifacts and section quality thresholds.
- Issues targeted agent prompts when artifacts are missing or weak.
- Maintains "idea drift" view between initial thesis and current docs.
- Enforces end-of-iteration summary payload before milestone close.

### 8) Clarification Orchestrator (Ask-User Engine)
- Detects ambiguity/low-confidence sections in PRD/spec drafts.
- Generates concise clarifying questions with option sets and tradeoffs.
- Blocks irreversible generation steps until required questions are answered.
- Writes accepted answers back into canonical doc sections and decision log.

### 9) Delivery Parity Orchestrator (Build Loop)
- Reads the approved spec plus the remaining parity backlog.
- Generates the next highest-priority Codex pass brief automatically.
- Runs Codex in bounded passes until the parity backlog is cleared or a blocker appears.
- Requires each pass to update task state, rerun verification, and stop only on real blockers.
- Treats the first successful buildable output as the minimum extensible product, then drives iterative parity passes until the scoped requirements are satisfied.
- Inserts periodic multipass review/refactor passes so the loop also compacts context, captures meta learnings, and refreshes the latest handoff artifact instead of only shipping feature slices.

### Non-Goals (MVP)
The following features and capabilities are explicitly deferred to Phase 2, 3, or 4:
- Repo generation from spec bundles (Phase 2+)
- Enterprise SSO/SCIM integration (Phase 3+)
- Multi-language code generation (Phase 2+)
- Mobile and native app templates (Phase 3+)
- Advanced inline comments and annotations (Phase 2+) — **Note: Comment thread UI is not in MVP. Database schema and API exist; frontend missing.**
- AI orchestration beyond the patch workflow (Phase 2+)
- Real-time audio/video collaboration (Phase 4+)
- Custom branding and theming (Phase 2+)
- Depth gates and recap enforcement (Phase 2+) — **Note: Claimed in Decision 18 but not implemented. Clarifications table exists; logic layer deferred.**
- Multi-user cursor presence and awareness (Phase 2) — **Note: Hocuspocus supports awareness; UI not implemented.**
- Multiplayer testing and validation (Phase 1.5) — **Critical: Add tests for 2+ concurrent users before declaring multiplayer feature complete.**
- Auto-rebase for stale patches (Phase 2) — **Spec says reject stale; implementation partially done but not tested.**

### Architecture
- Frontend: web app (editor + collaboration UI + agent panel).
- Collaboration service: websocket + CRDT sync.
- API backend: auth, document metadata, version history, permissions.
- AI orchestration: prompt templates + tool-calling adapters.
- Delivery orchestration: local parity runner that wraps Codex CLI for repeated build passes.
- Delivery visibility: in-product backlog status + next-pass brief exposed through parity endpoints and the workspace UI.
- Delivery compaction: latest runner handoff artifact plus meta-learning notes stored under `.cursor/artifacts/` for resume without dragging full prior context.
- Delivery model: intents, claims, context packages, and signals for agent-driven build execution after the spec is approved.
- Delivery target: a minimum extensible product that can be verified locally, extended safely, and promoted toward the full scoped spec without restarts.
- Governance service: patch validation, stale detection, review decisions, recap/depth enforcement.
- Collab auth layer: short-lived room tokens minted by the web app and verified by the collaboration service.
- Storage: canonical doc state, snapshots, patch logs, audit trail.
- Repo generation service: template engine + Git provider integration.

### Default Implementation Topology
1. Single TypeScript web app for UI, auth, HTTP APIs, and export orchestration.
2. Dedicated collaboration service for CRDT websocket sync.
3. Lightweight background worker for recap/export/repo-generation jobs.
4. Local parity runner for Codex-driven build passes against the remaining backlog.
5. Shared Postgres database for application state, audit logs, comments, and exports.
6. Local object/blob storage only if snapshots or exports outgrow Postgres storage ergonomics.
7. Structured room telemetry plus a local failure-mode runbook for multiplayer debugging.
8. Version-scoped room names plus explicit snapshot replay/reload controls for stale-room recovery.
9. Inline provenance overlays in the editor surface alongside block-level review markers.
10. Delivery loop state that tracks claimed intents, latest context, and emitted signals as the buildout advances.
11. Delivery context packages that bundle approved exports, launch packet, active blockers, and the next claimed intent for coding agents.

### Default Stack
1. Next.js + React + TypeScript for the application shell.
2. Tiptap for the editor UI.
3. Yjs for CRDT sync.
4. Hocuspocus for the collaboration server.
5. Postgres for primary persistence.
6. Node.js orchestration script around `codex exec` for parity-driving loops.
7. Vitest for contract/unit tests and Playwright for end-to-end tests.

### Data Model (MVP)
- `Workspace`
- `Document`
- `Block`
- `Section`
- `PatchProposal`
- `CommentThread`
- `VersionSnapshot`
- `AuditEvent`
- `MilestoneGate`
- `Recap`

### Canonical Data Model Default
1. Canonical editing state is Tiptap/ProseMirror JSON stored per document version.
2. A derived block index is extracted from canonical editor JSON for:
   - patch targeting
   - export shaping
   - comment anchoring
   - traceability
3. Markdown is a deterministic export artifact, not the source of truth.
4. Avoid dual-write canonical models in v1.

### APIs (MVP)
1. `POST /documents`
2. `GET /documents/:id`
3. `POST /documents/:id/patches`
4. `POST /patches/:id/decision` (accept/reject/cherry-pick)
5. `GET /documents/:id/versions`
6. `POST /documents/:id/depth-check`
7. `GET /documents/:id/recap`
8. `POST /documents/:id/export`
9. local `specforge-parity-runner` tooling for Codex execution passes
10. delivery loop endpoints for backlog status, next brief, and claimed work visibility

### Patch Contract Default
1. Primary target key is `block_id`.
2. `section_id` is optional context for UI grouping and analytics, not the primary integrity key.
3. A patch proposal must include:
   - `document_id`
   - `block_id`
   - `base_version`
   - `target_fingerprint`
   - `patch_type`
   - operation payload
   - rationale
   - actor identity
4. If `base_version` or `target_fingerprint` is stale, v1 does not auto-rebase:
   - mark proposal `stale`
   - require regeneration or manual review
5. Cherry-pick behavior in v1 should operate on patch hunks or block-level fragments, not arbitrary raw character ranges.
6. Delivery parity passes must close backlog items against the same patch/export contract instead of introducing side channels.

### APIs (Phase 2)
1. `POST /documents/:id/create-repo`
2. `GET /repos/:id/scaffold-status`
3. `POST /repos/:id/sync-tasks`
4. `POST /documents/:id/clarifications`
5. `POST /clarifications/:id/answer`

### Permissions (MVP)
1. Owner: full control.
2. Editor: direct edits + patch review.
3. Agent: patch proposal only (default).
4. Viewer: read/comment.

### Auth Default
1. Local demo mode supports a simple dev bypass identity.
2. Pilot mode uses GitHub OAuth for human users.
3. Agent actors use workspace-scoped service identities, not human sessions.
4. Defer SSO, SCIM, and complex enterprise role models until post-pilot.
5. The same `active actor` shape should survive across local and pilot modes so product flows do not fork by auth provider.

### Comments Default
1. v1 ships simple anchored comment threads.
2. Comments attach to `block_id` plus optional text range metadata.
3. UI favors a side-panel review experience over deep inline multiplayer comment UX.
4. Do not overbuild comment features ahead of patch review and depth gates.

### Reliability and Safety
1. Durable patch log before apply.
2. Idempotent patch processing.
3. Role-based guardrails for agent actions.
4. Rollback to any prior snapshot.
5. Required recap/audit events for major idea-state transitions.
6. No direct agent writes to canonical state without an accepted patch or explicit auto-apply policy.
7. Pending proposals become stale when target block fingerprint changes.
8. Presence state is ephemeral; canonical content, comments, decisions, and snapshots are durable.
9. Export from canonical state must be deterministic for a given document version.

### Document Integrity Invariants
1. Canonical document version is monotonic.
2. Every patch proposal references:
   - `document_id`
   - target block/section ID
   - `base_version`
   - target fingerprint/hash
3. Accept/reject/cherry-pick decisions produce an audit event and a restorable snapshot.
4. Event replay cannot duplicate a patch application.
5. Stale proposals cannot be silently applied after conflicting edits.

### Collaboration Model Choice
Use CRDT for live human collaboration, but keep agent governance above the CRDT layer:
1. Humans edit the shared canvas directly.
2. Agents submit governed patch proposals against canonical blocks.
3. Accepted proposals are applied into canonical state and synced back to the canvas.
4. This preserves realtime collaboration without sacrificing reviewability or attribution.

### Initial NFR Targets
1. P95 collaborative update latency < 250ms (same region).
2. No document loss on reconnect.
3. Patch decision auditability for all agent edits.
4. Snapshot restore succeeds for any accepted patch decision in pilot environments.
5. Export is byte-stable for identical document version + template version.
6. Local auth/reconnect failures are diagnosable through room telemetry and the runbook.

### Build Cost Categories
1. Realtime collaboration infra and state sync.
2. AI patch generation and evaluation pipeline.
3. Versioning/audit storage.
4. Integrations (GitHub/Linear/Jira exports).

### Phase Plan
1. Phase 1: core realtime markdown + comments + version history.
2. Phase 2: agent patch queue + approvals + provenance tags + depth gates.
3. Phase 3: curated example exports + repo scaffolding + integrations.
4. Phase 4: broader repo generation and advanced governance policies.

### Benchmark Corpus Default
Use three packs from `ideas/` as the initial end-to-end benchmark set:
1. Rough: `ideas/server-management-agent/README.md`
2. Mid-fidelity: `ideas/birthday-bot/`
3. Mature: `ideas/idea-validation-bot/`

### Repo Generation Default Boundary
1. Always support docs/export-only output.
2. Limit example repo generation to one curated TypeScript template family in the first implementation.
3. Default generated app shape:
   - Next.js application shell
   - Postgres-ready data layer
   - Auth scaffold
   - docs and task artifacts
4. Do not support arbitrary frameworks, multi-service monorepos, mobile apps, or chain-specific starters in the first repo-generation phase.

### Delivery Loop Success Criteria
1. The first handoff/run must create a runnable minimum extensible product, not only files.
2. The delivery loop must be able to read remaining backlog items and continue issuing bounded implementation passes without manual re-prompting.
3. Each pass must leave the product in a green, demoable state with tests/build checks rerun.
4. If parity cannot advance safely, the loop must surface a concrete blocker instead of inventing more work.
5. Blocked passes must capture retry metadata and failure summaries that are visible in-product.

### Key Technical Choice
Use CRDT-backed editing for robust multiplayer behavior and offline/reconnect tolerance.

### Depth Enforcement Choice
Treat idea depth as first-class product state (not optional guidance) via required gates and recap checkpoints.

### Implementation Bias
Use off-the-shelf collaboration libraries where possible:
1. CRDT/editor stack for the shared canvas.
2. Custom code only for governance, depth-gating, attribution, and export semantics.

### Related Docs
1. `VISION_AND_FLOW.md`
2. `IDEA_DEVELOPMENT_FRAMEWORK.md`
3. `COMPETITOR_MATRIX.md`
4. `UX_PRINCIPLES.md`
5. `USER_FLOWS.md`
6. `FRONTEND_VISION.md`
7. `WIREFRAMES.md`
8. `TECH_STACK.md`
9. `VALIDATION_PLAN.md`
10. `ALTERNATIVES_AND_VARIANTS.md`
11. `archive/NAME_OPTIONS.md`
12. `EVENT_MODEL.md`
13. `contracts/README.md`
14. `ACCEPTANCE_TEST_MATRIX.md`
15. `FIRST_60_MINUTES.md`
