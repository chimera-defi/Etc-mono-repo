## Collaborative Markdown Spec Studio Technical Spec (MVP)

### Summary
Build a real-time collaborative Markdown editor with agent patch workflows and section-level merge controls.

### Core Components (MVP)

### 1) Realtime Editor Layer
- Markdown editor with CRDT collaboration via **Yjs** (see ARCHITECTURE_DECISIONS.md D1).
- Presence: cursors, selections, user states.
- Comment threads anchored to document ranges.

### 2) Agent Patch Engine
- Agents propose structured patches (insert/replace/delete) against stable section IDs (UUID comment markers — see ARCHITECTURE_DECISIONS.md D7).
- Patch review queue with accept/reject/cherry-pick.
- Optional auto-apply policy for low-risk edits from trusted agents.

### 3) Document Model
- Canonical markdown + section AST index.
- Stable section IDs via UUID comment markers (stripped on export).
- Metadata per block: author type, timestamp, provenance, confidence.

### 4) Versioning + Merge
- Snapshot versions per save checkpoint.
- Section-level conflict detection for overlapping patches.
- Conflict resolver routes to manual reviewer when needed.

### 5) Spec Export Layer
- Export bundle:
  - `PRD.md`
  - `SPEC.md`
  - `TASKS.md`
  - `agent_spec.json`

### Phase 2 Extensions (Not MVP)

### 6) Repo Scaffold Generator
- Generates a starter GitHub repository from approved spec bundle.
- Supports template packs (frontend, API backend, docs-first starter).
- Embeds trace links from generated files/issues back to spec sections.

### 7) Idea-Depth Orchestrator (Wizard Layer)
- Tracks completion state for required artifacts and section quality thresholds.
- Issues targeted agent prompts when artifacts are missing or weak.
- Maintains "idea drift" view between initial thesis and current docs.
- Enforces end-of-iteration summary payload before milestone close.
- **Scope:** Phase 2 only. MVP must validate core collaboration + patch review value first. See ARCHITECTURE_DECISIONS.md D11.

### 8) Clarification Orchestrator (Ask-User Engine)
- Detects ambiguity/low-confidence sections in PRD/spec drafts.
- Generates concise clarifying questions with option sets and tradeoffs.
- Blocks irreversible generation steps until required questions are answered.
- Writes accepted answers back into canonical doc sections and decision log.
- **Scope:** Phase 2 only. Bundled with the depth orchestrator.

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
4. `POST /documents/:id/depth-check`
5. `GET /documents/:id/recap`
6. `POST /documents/:id/clarifications`
7. `POST /clarifications/:id/answer`

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

### Key Technical Choices
- **CRDT library:** Yjs (y-websocket or PartyKit as sync server) — see ARCHITECTURE_DECISIONS.md D1.
- **Frontend:** Next.js 15 + CodeMirror 6 — see ARCHITECTURE_DECISIONS.md D2.
- **API:** Hono + Bun — see ARCHITECTURE_DECISIONS.md D3.
- **Database:** Postgres (metadata/events) + R2 (snapshots) — see ARCHITECTURE_DECISIONS.md D4.
- **Auth:** Clerk — see ARCHITECTURE_DECISIONS.md D5.
- **AI:** Claude API (provider-pluggable) — see ARCHITECTURE_DECISIONS.md D6.

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
