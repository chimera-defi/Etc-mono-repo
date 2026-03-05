## Collaborative Markdown Spec Studio Technical Spec (MVP)

### Summary
Build a real-time collaborative Markdown editor with agent patch workflows and section-level merge controls.

### Core Components

### 1) Realtime Editor Layer
- Markdown editor with operational collaboration (CRDT/OT).
- Presence: cursors, selections, user states.
- Comment threads anchored to document ranges.

### 2) Agent Patch Engine
- Agents propose structured patches (insert/replace/delete) against section IDs.
- Patch review queue with accept/reject/cherry-pick.
- Optional auto-apply policy for low-risk edits.

### 3) Document Model
- Canonical markdown + section AST index.
- Stable section IDs for patching and history.
- Metadata per block: author type, timestamp, provenance, confidence.

### 4) Versioning + Merge
- Snapshot versions per save checkpoint.
- Section-level branch and merge.
- Conflict resolver for overlapping patches.

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

### Architecture
- Frontend: web app (editor + collaboration UI + agent panel).
- Collaboration service: websocket + CRDT sync.
- API backend: auth, document metadata, version history, permissions.
- AI orchestration: prompt templates + tool-calling adapters.
- Storage: document snapshots + patch logs + audit trail.
- Repo generation service: template engine + Git provider integration.

### Data Model (MVP)
- `Workspace`
- `Document`
- `Section`
- `PatchProposal`
- `CommentThread`
- `VersionSnapshot`
- `AuditEvent`

### APIs (MVP)
1. `POST /documents`
2. `GET /documents/:id`
3. `POST /documents/:id/patches`
4. `POST /patches/:id/decision` (accept/reject/cherry-pick)
5. `GET /documents/:id/versions`
6. `POST /documents/:id/export`

### APIs (Phase 2)
1. `POST /documents/:id/create-repo`
2. `GET /repos/:id/scaffold-status`
3. `POST /repos/:id/sync-tasks`

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

### Initial NFR Targets
1. P95 collaborative update latency < 250ms (same region).
2. No document loss on reconnect.
3. Patch decision auditability for all agent edits.

### Build Cost Categories
1. Realtime collaboration infra and state sync.
2. AI patch generation and evaluation pipeline.
3. Versioning/audit storage.
4. Integrations (GitHub/Linear/Jira exports).

### Phase Plan
1. Phase 1: core realtime markdown + comments + version history.
2. Phase 2: agent patch queue + approvals + provenance tags.
3. Phase 3: section branching/merge + repo scaffolding + integrations + advanced governance.

### Key Technical Choice
Use CRDT-backed editing for robust multiplayer behavior and offline/reconnect tolerance.

### Related Docs
1. `VISION_AND_FLOW.md`
2. `VALIDATION_PLAN.md`
3. `ALTERNATIVES_AND_VARIANTS.md`
4. `NAME_OPTIONS.md`
