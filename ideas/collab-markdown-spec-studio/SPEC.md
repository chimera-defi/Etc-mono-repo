## SpecForge Technical Spec (MVP)

### Summary
Build a real-time collaborative spec IDE with:
1. CRDT-backed human collaboration on a shared markdown canvas,
2. governed agent patch workflows,
3. depth gates and recap requirements,
4. deterministic export into execution-ready spec bundles.

### Core Components

### 1) Realtime Editor Layer
- Markdown editor with CRDT-backed collaboration.
- Presence: cursors, selections, user states.
- Comment threads anchored to document ranges.

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

### Architecture
- Frontend: web app (editor + collaboration UI + agent panel).
- Collaboration service: websocket + CRDT sync.
- API backend: auth, document metadata, version history, permissions.
- AI orchestration: prompt templates + tool-calling adapters.
- Governance service: patch validation, stale detection, review decisions, recap/depth enforcement.
- Storage: canonical doc state, snapshots, patch logs, audit trail.
- Repo generation service: template engine + Git provider integration.

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

### APIs (MVP)
1. `POST /documents`
2. `GET /documents/:id`
3. `POST /documents/:id/patches`
4. `POST /patches/:id/decision` (accept/reject/cherry-pick)
5. `GET /documents/:id/versions`
6. `POST /documents/:id/depth-check`
7. `GET /documents/:id/recap`
8. `POST /documents/:id/export`

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
8. `VALIDATION_PLAN.md`
9. `ALTERNATIVES_AND_VARIANTS.md`
10. `NAME_OPTIONS.md`
11. `contracts/README.md`
12. `ACCEPTANCE_TEST_MATRIX.md`
13. `FIRST_60_MINUTES.md`
