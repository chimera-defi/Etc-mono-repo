## SpecForge Technical Spec (MVP)

**Status**: Scoped MVP/spec parity reached on the current build branch.

### Summary
Build a real-time collaborative spec IDE with:
1. CRDT-backed infrastructure for human collaboration (Yjs + Hocuspocus deployed; multiplayer flows are browser-covered locally but not yet design-partner validated in hosted use),
2. governed agent patch workflows (fully functional: propose/review/accept/reject/cherry-pick),
3. guided creation plus agent-assisted field population from rough briefs,
4. a first-class `UX Pack` section that captures primary surfaces, key screens, failure states, and responsive expectations so UI/UX design is not left implicit,
5. readiness and clarification gates before build handoff, with deeper milestone recap still deferred,
6. deterministic export into execution-ready spec bundles (`PRD.md`, `SPEC.md`, `TASKS.md`, `agent_spec.json`, starter handoff, execution brief, launch packet),
7. a delivery loop that keeps driving a minimum extensible product toward parity with the approved spec (implemented for status/context/handoffs, but not yet a trusted unattended finisher),
8. landing and pricing surfaces that route users into the working SaaS workspace,
9. a shared OpenSpec core, now partially extracted, that powers both the web app and a terminal-native `specforge` wizard.

The current branch satisfies the scoped MVP target. The remaining work is broader SaaS/platform parity work like hosted ops, billing, deeper terminal UX, and runner hardening, not missing core MVP behavior.

The current branch also includes a first explicit entitlement layer:
- quota state,
- seat-based billing preview,
- shared plan definitions exposed to both pricing and `/api/workspace/plans`,
- guided drafts now require a `UX Pack` section, and specs should explicitly say `API-only` or `CLI-only` there when no GUI is needed,
- feature-flag entitlements,
- behavior instrumentation for membership and workflow activation signals,
- a design-partner funnel summary across activation, collaboration, review, and launch preparation,
- a workspace billing summary endpoint with upgrade-required reasons,
- and ops-summary alerts for missing backups, missing verification, or upgrade pressure.
- Pilot membership lifecycle is now two-way in the workspace UI: add/remove members with GitHub-linked invite rules and guards against removing the active session or the final member.
- SpecForge currently guides users toward design coverage, but it does not yet ship a direct `gstack` design-skill runtime integration. The supported pattern today is to generate the canonical spec plus UX Pack in SpecForge, then hand that UX Pack to an external design-focused skill or agent for wireframes, visual exploration, or frontend implementation guidelines.

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
- ✓ Presence: shared cursor rendering and collaborator awareness are visible in the workspace.
- ✓ Comment threads: database schema, APIs, and frontend review UI are implemented.
- ⚠️ Multiplayer sync: browser-covered locally, but not yet validated in production/pilot usage.

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
- Supports constrained template packs (`docs-only`, `Next.js + TypeScript`, `Next.js + Python`, plus the minimum extensible TypeScript CLI starter).
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
- Runs Codex in bounded passes until the parity backlog is cleared, a blocker appears, or the current pass budget is exhausted.
- `--until-clear` loops still respect an explicit max-pass budget so local runs stay bounded.
- Requires each pass to update task state, rerun verification, and stop only on real blockers.
- Treats the first successful buildable output as the minimum extensible product, then drives iterative parity passes until the scoped requirements are satisfied.
- Inserts periodic multipass review/refactor passes so the loop also compacts context, captures meta learnings, and refreshes the latest handoff artifact instead of only shipping feature slices.

### 10) Sprint Planning Suite (Act 1) + Section-Level Iteration ✅ COMPLETE

**Status**: Fully implemented - all core functionality working, export enrichment and handoff provenance complete.

SpecForge is a two-act tool. **Act 1** is a structured ideation and planning phase that users go through before the spec editor. **Act 2** is the existing guided spec generation, multiplayer editing, and governed patch workflow. Both acts are multiplayer and agent-assisted.

```
ACT 1: Sprint Planning (optional stages, any order)
  Discovery → CEO Review → Eng Review → Design Review → Security Review
        ↓ (outputs pre-fill context for Act 2)
ACT 2: Spec Generation (existing)
  Guided wizard → Multiplayer editing → Governed patches → Export bundle
        ↓
  HANDOFF: handoff.json (export bundle + stage provenance, build-tooling agnostic)
```

**Act 1 — Planning Stages:**

| Stage | Inspiration | Output |
|---|---|---|
| **Discovery** | G-Stack `/office-hours` | Problem statement, user segments, success signals → pre-fills PRD "Problem" |
| **CEO Review** | G-Stack `/plan-ceo-review` | 10-star vision, scope hardening, anti-goals → pre-fills PRD "Vision" + "Non-goals" |
| **Engineering Review** | G-Stack `/plan-eng-review` | Architecture, data flow, tech stack, failure modes, test matrix → pre-fills SPEC |
| **Design Review** | G-Stack `/plan-design-review` | Design system constraints, interaction model, accessibility → emits `DESIGN_SYSTEM.md` |
| **Security Review** | G-Stack `/cso` adapted | OWASP threat model, trust boundaries, security requirements → emits `SECURITY.md` |

Each stage: AI asks structured questions → user answers → AI generates structured output as a governed patch proposal → user reviews/accepts in the normal patch queue. No stage auto-applies changes. All stages are **optional and skippable**; skipped stages are recorded in the handoff JSON.

**Multiplayer planning:** Act 1 stages run in the same Hocuspocus room as the document. All collaborators see the stage conversation, AI questions, and patch previews in real time. Any collaborator can answer or skip a stage. Presence indicators show who is active in each stage.

**Web UI entry:**
- New document entry: "Start with Sprint Planning" or "Jump to Spec Wizard" choice
- Left sidebar: stage progress tracker (Discovery ✓, CEO Review ✓, Eng Review…) + live collaborator presence per stage
- Main panel: current stage conversation (AI questions, collaborator answers)
- Right panel: live spec document updating as patches are accepted
- "Skip this stage" button always visible
- "Done with planning → Go to Spec" CTA once any stage is completed or explicitly skipped

**Section-Level Iteration ("Iterate with AI"):**
Every output box — PRD section, SPEC section, TASKS, planning stage outputs — has an "Iterate with AI" button. Clicking it opens an inline panel that:
1. Injects the current section content + surrounding context (section title, parent heading, document title) as agent context
2. User types a message (e.g. "make the user segments more specific", "add failure modes for network partitions")
3. Agent proposes a governed patch targeting that section's `block_id` — goes into normal patch review queue
4. Diff shown inline before accepting; all iterations attributed and reversible

Multiplayer iteration: if two collaborators iterate on the same section concurrently, each produces a separate patch proposal; existing accept/reject/cherry-pick queue resolves conflicts as normal.

**CLI/TUI commands:**
```bash
specforge plan                              # interactive TUI, walks through stages
specforge plan --stage discovery            # run a specific stage
specforge plan --skip security-review       # skip a stage and proceed
specforge plan --json                       # agent-native machine-readable output
specforge iterate --section <block-id>      # interactive: prompts for message
specforge iterate --section <id> --message "add failure modes for network partitions"
specforge handoff                           # emit final handoff.json with stage provenance
specforge handoff --json
```

**Claude Code skills:** `/specforge-plan` (Act 1 pipeline), `/specforge-handoff` (emit handoff.json). See `skills/specforge/specforge-plan.md` and `skills/specforge/specforge-handoff.md`.

**Export enrichment:** When planning stages are completed, the export bundle gains:
- `DESIGN_SYSTEM.md` — from Design Review stage (omitted if skipped)
- `SECURITY.md` — from Security Review stage (omitted if skipped)

**Handoff JSON provenance:**
```json
{
  "planningSession": {
    "stages": [
      { "name": "discovery",     "status": "completed", "patchId": "...", "outputs": {...} },
      { "name": "ceo-review",    "status": "completed", "patchId": "...", "outputs": {...} },
      { "name": "eng-review",    "status": "skipped",   "patchId": null,  "outputs": null  },
      { "name": "design-review", "status": "completed", "patchId": "...", "outputs": {...} },
      { "name": "security",      "status": "skipped",   "patchId": null,  "outputs": null  }
    ]
  }
}
```

Build tooling is agnostic — handoff JSON contains no reference to a specific build pipeline. Users pick their own.

### Non-Goals (MVP)
The following features and capabilities are explicitly deferred to Phase 2, 3, or 4:
- Repo generation from spec bundles (Phase 2+)
- Enterprise SSO/SCIM integration (Phase 3+)
- Multi-language code generation (Phase 2+)
- Mobile and native app templates (Phase 3+)
- Advanced inline comments and annotations (Phase 2+) — **Note: anchored comment thread UI exists; richer inline annotations remain deferred.**
- AI orchestration beyond the patch workflow (Phase 2+) — **Note: Guided Plan Mode (Component 10) is an exception; it uses governed patch proposals, so it remains within the patch workflow contract.**
- Real-time audio/video collaboration (Phase 4+)
- Custom branding and theming (Phase 2+)
- Depth gates and recap enforcement (Phase 2+) — **Note: Claimed in Decision 18 but not implemented. Clarifications table exists; logic layer deferred.**
- Multi-user cursor presence and awareness (Phase 2) — **Note: basic presence and cursor rendering are implemented; broader multiplayer validation remains pending.**
- Hosted multiplayer validation and design-partner reliability work (post-parity SaaS) — **Local concurrent-user coverage exists; hosted validation remains pending.**
- Auto-rebase for stale patches (Phase 2) — **Spec says reject stale; implementation partially done but not tested.**

### Architecture
- Shared OpenSpec core: guided wizard rules, readiness logic, export bundle builders, execution brief builders, launch-packet assembly, starter template definitions, and the curated TypeScript starter builder are shared today; generated-repo branches and store-bound workflow assembly are the next extraction targets.
- Frontend: web app (editor + collaboration UI + agent panel).
- Collaboration service: websocket + CRDT sync.
- API backend: auth, document metadata, version history, permissions.
- AI orchestration: prompt templates + tool-calling adapters.
- Delivery orchestration: local parity runner that wraps Codex CLI for repeated build passes.
- CLI/TUI surface: terminal-native entrypoint already ships a guided `specforge` wizard and should keep growing on the same OpenSpec core and orchestration contracts.
- Delivery visibility: in-product backlog status + next-pass brief exposed through parity endpoints and the workspace UI.
- Delivery compaction: latest runner handoff artifact plus meta-learning notes stored under `.cursor/artifacts/` for resume without dragging full prior context.
- Delivery model: intents, claims, context packages, and signals for agent-driven build execution after the spec is approved.
- Delivery target: a minimum extensible product that can be verified locally, extended safely, and promoted toward the full scoped spec without restarts.
- Governance service: patch validation, stale detection, review decisions, recap/depth enforcement.
- Collab auth layer: short-lived room tokens minted by the web app and verified by the collaboration service.
- Storage: canonical doc state, snapshots, patch logs, audit trail.
- Repo generation service: template engine + Git provider integration.

### Default Implementation Topology
1. Shared OpenSpec core package for guided creation, readiness, export bundle generation, execution briefs, launch-packet assembly, and the curated TypeScript starter today, with generated-repo branches and store-bound workflow assembly still moving out of `web/`.
2. Web app for UI, auth, HTTP APIs, and export orchestration.
3. Dedicated collaboration service for CRDT websocket sync.
4. Lightweight background worker for recap/export/repo-generation jobs.
5. Local parity runner plus a shared orchestrator package for Codex-driven build passes against the remaining backlog.
6. Shared Postgres database for hosted application state, audit logs, comments, and exports.
7. Local object/blob storage only if snapshots or exports outgrow Postgres storage ergonomics.
8. Structured room telemetry plus a local failure-mode runbook for multiplayer debugging.
9. Version-scoped room names plus explicit snapshot replay/reload controls for stale-room recovery.
10. Inline provenance overlays in the editor surface alongside block-level review markers.
11. Delivery loop state that tracks claimed intents, latest context, and emitted signals as the buildout advances.
12. Delivery context packages that bundle approved exports, launch packet, active blockers, and the next claimed intent for coding agents.
13. Runtime health and metrics endpoints for the web app and collaboration service plus containerized local deployment config.
14. Health and metrics responses expose active persistence configuration so hosted-runtime drift is diagnosable without opening the code.
15. Request IDs are propagated through middleware and returned by runtime endpoints for cross-service debugging.
16. Terminal-native `specforge` CLI now consumes the same guided OpenSpec core instead of duplicating wizard logic.
17. Workspace billing and ops summaries now expose a thin SaaS control plane for local rehearsal, including billing status, backup visibility, and alert signals.

### Default Stack
1. Shared ESM OpenSpec core package for runtime-safe reuse across web and CLI surfaces.
2. Next.js + React + TypeScript for the application shell.
3. Tiptap for the editor UI.
4. Yjs for CRDT sync.
5. Hocuspocus for the collaboration server.
6. Postgres for primary persistence.
7. Node.js orchestration script around `codex exec` for parity-driving loops.
8. CLI/TUI entrypoint for terminal-native authoring and orchestration.
9. Vitest for contract/unit tests and Playwright for end-to-end tests.

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

### Data Model (Sprint Planning + Iteration additions)
- `PlanSession` — tracks an Act 1 planning pipeline: `id`, `documentId`, `workspaceId`, `mode`, `stages[]`, `currentStageIndex`, `status` (`active|completed|abandoned`), `createdAt`, `completedAt`
- `PlanStage` — one stage within a session: `id`, `sessionId`, `stageName` (`discovery|ceo-review|eng-review|design-review|security-review`), `status` (`pending|running|patch-proposed|accepted|skipped`), `patchProposalId`, `questionsAsked[]`, `outputs` (structured JSON per stage), `completedAt`
- `IterationRequest` — a section-level iteration: `id`, `documentId`, `blockId`, `sectionTitle`, `message`, `actorId`, `patchProposalId`, `createdAt`
- `HandoffRecord` — the final build-ready artifact: `id`, `documentId`, `sessionId`, `exportBundle` (JSON), `planningProvenance` (stage statuses + outputs), `executionBrief`, `launchPacket`, `createdAt`

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
7. Current reality: the delivery loop is useful for status, briefs, and bounded preparation, but unattended multi-item execution is still an explicit hardening target rather than a trusted product primitive.

### APIs (Sprint Planning + Iteration — Phase 2)

**Planning Session APIs (Act 1):**

1. `POST /documents/:id/plan-sessions`
   - Creates a plan session. Request: `stages` (optional subset to run), `mode` (`guided`|`autonomous`)
   - Response: `sessionId`, ordered stage list, first stage prompt

2. `GET /documents/:id/plan-sessions/:sid`
   - Returns session state: current stage, completed/skipped stages, pending patch proposals

3. `POST /documents/:id/plan-sessions/:sid/advance`
   - Triggers the next stage's AI analysis, produces a governed patch proposal
   - Response: `stageName`, `patchProposalId`, `questionsAsked[]`

4. `POST /documents/:id/plan-sessions/:sid/skip-stage`
   - Marks a stage as intentionally skipped; recorded in audit trail

5. `GET /documents/:id/plan-sessions/:sid/export`
   - Returns enriched export bundle including `DESIGN_SYSTEM.md` (if design stage done) and `SECURITY.md` (if security stage done)

**Section Iteration API:**

6. `POST /documents/:id/sections/:blockId/iterate`
   - Body: `{ message, actorId }`
   - Injects section content + doc context as agent context, generates a governed patch proposal
   - Response: `{ patchProposalId, diff, sectionTitle }`
   - The patch goes into the normal review queue; `actorId` is attributed in the audit trail

**Handoff API:**

7. `POST /documents/:id/handoff`
   - Emits the final `handoff.json` including export bundle + planning stage provenance
   - Marks document as "build-ready" in workspace
   - Response: full handoff JSON (see Component 10 for schema)
   - Build tooling is not specified — handoff is agnostic

Invariants:
1. Each `advance` call produces at most one patch proposal per stage.
2. Advancing without a prior accepted patch for the previous stage emits a warning but does not hard-block (stages are optional).
3. Plan session state persists to the document store; sessions survive reconnects and restarts.
4. Section iteration patches follow the same `block_id` + `base_version` + `target_fingerprint` contract as all other patches.

### APIs (Phase 2)
1. `POST /documents/:id/create-repo`
2. `GET /repos/:id/scaffold-status`
3. `POST /repos/:id/sync-tasks`
4. `POST /documents/:id/clarifications`
5. `POST /clarifications/:id/answer`

### APIs (Agent Service Workflow Track Buildout)
These endpoints expose SpecForge as a request/response agent service while reusing existing OpenSpec, governance, and export logic.

1. `POST /service/spec-jobs`
   - Creates a workflow job from rough brief + constraints.
   - Request: `brief`, `constraints`, `workspaceId`, `mode` (`assisted`|`autonomous`).
   - Response: `jobId`, initial status, artifact placeholders.

2. `GET /service/spec-jobs/:jobId`
   - Returns job status (`queued|running|blocked|completed|failed`), current stage, and blockers.

3. `GET /service/spec-jobs/:jobId/artifacts`
   - Returns generated outputs (`PRD.md`, `SPEC.md`, `TASKS.md`, `agent_spec.json`, recap).

4. `POST /service/spec-jobs/:jobId/review-decision`
   - Applies human governance decisions for pending agent patches/questions in assisted mode.

5. `POST /service/spec-jobs/:jobId/retry`
   - Retries blocked/failed jobs after updated constraints or resolved blockers.

Invariants:
1. Service jobs must emit the same patch/audit/provenance records as editor-driven flows.
2. Artifact generation remains deterministic per accepted document version.
3. Autonomous mode still honors safety gates and can pause into `blocked` when required decisions are missing.

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
6. GitHub OAuth callbacks require state validation, and hosted mode must reject default local secrets.
7. Shared specs use stable workspace-scoped URLs like `/workspace?document=<id>&stage=draft`.
8. Share links are not bearer tokens; recipients still need workspace access.
9. Pilot recipients authenticate with GitHub and must already be workspace members or be added by a workspace editor/owner before the shared URL becomes useful.

### Agent Configuration Default
1. Local mode can reuse existing server-side Codex CLI or Claude Code CLI logins for guided assist and delivery loops.
2. Hosted SaaS mode should store workspace-scoped provider credentials server-side and encrypted at rest.
3. Browsers never receive raw provider secrets.
4. Agents act as workspace-scoped service identities and submit governed patches instead of mutating canonical docs directly.
5. CLI-backed assist should stay disabled by default outside local mode unless an operator explicitly enables it.

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

### Sharing Model
1. Each spec document has a canonical workspace URL that can be copied from the product UI.
2. The share UI should pair the URL with the current access model so users understand that sharing requires workspace membership.
3. Workspace editors can add teammates directly from the session/membership panel by GitHub login, then send the canonical URL.
4. Hosted share flows can evolve into invite links later, but the MVP/pilot baseline is: add member, then share canonical URL.

### Initial NFR Targets
1. P95 collaborative update latency < 250ms (same region).
2. No document loss on reconnect.
3. Patch decision auditability for all agent edits.
4. Snapshot restore succeeds for any accepted patch decision in pilot environments.
5. Export is byte-stable for identical document version + template version.
6. Local auth/reconnect failures are diagnosable through room telemetry, request IDs, and the runbook.

### Build Cost Categories
1. Realtime collaboration infra and state sync.
2. AI patch generation and evaluation pipeline.
3. Versioning/audit storage.
4. Integrations (GitHub/Linear/Jira exports).

### Phase Plan
1. Phase 1: core realtime markdown + comments + version history. ✓ Done.
2. Phase 2: Guided Plan Mode (G-Stack integration), CLI `specforge plan` and `specforge handoff`, Claude Code skill pack (`/specforge-plan`, `/specforge-handoff`), deeper milestone recap/depth enforcement, and stronger hosted SaaS operations.
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
