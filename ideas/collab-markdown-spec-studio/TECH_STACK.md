## SpecForge Tech Stack

### Default Stack
1. Application shell: `Next.js` + `React` + `TypeScript`
2. Editor: `Tiptap`
3. Realtime sync: `Yjs`
4. Collaboration server: `Hocuspocus`
5. Primary database: `Postgres`
6. Background jobs: lightweight TypeScript worker
7. Delivery orchestration: Node.js parity runner around `codex exec`
8. Runner artifacts: latest handoff + meta learnings under `.cursor/artifacts/`
9. Current runner posture: useful for status/brief/context and bounded prep, but still not a trusted unattended backlog closer
10. Testing:
   - `Vitest` for unit and contract tests
   - `Playwright` for end-to-end and screenshot flows

### Runtime Topology
1. Web app:
   - UI
   - auth
   - document APIs
   - patch review APIs
   - export orchestration
2. Collaboration service:
   - websocket sync
   - signed room authentication
   - structured room telemetry
   - health endpoint for runtime checks
   - Yjs document room lifecycle
3. Worker:
   - recap generation
   - export jobs
   - curated repo-generation jobs
4. Parity runner:
   - reads `TASKS.md` backlog state
   - treats backlog items as intents
   - records active claims and emitted signals
   - targets a runnable minimum extensible product first, then drives parity passes
   - generates the next Codex pass brief
   - emits a delivery context package for the app and external agent consumers
   - can run bounded parity loops until the backlog is clear, blocked, or the current pass budget is exhausted
   - exposes backlog status/brief into the app via parity endpoints
   - records retry counts and failure summaries so blocked passes are diagnosable
   - schedules periodic multipass review/refactor passes
   - refreshes handoff/meta-learning artifacts for context compaction and resume
5. Terminal CLI:
   - `specforge` guided wizard over the shared OpenSpec core
   - local slash-command style `/specforge` alias support
   - local smoke coverage for non-browser spec creation
6. Shared persistence:
   - PGlite snapshot sharing for local demo/test flows
   - Postgres for hosted application state
   - optional blob storage only if snapshots/exports outgrow database ergonomics
7. Deployment rehearsal:
   - Dockerfiles for `web` and `collab-server`
   - `docker-compose.yml` with health checks for `web`, `collab-server`, and `postgres`
8. Observability baseline:
   - structured JSON logs in `web` and `collab-server`
   - request IDs via middleware/response headers
   - `/api/health`, `/api/metrics`, and collab `/health` + `/metrics`

### Target Package Topology
1. `specforge-core`
   - shared guided wizard logic
   - shared readiness rules
   - shared export bundle, execution-brief, launch-packet, starter template catalogue, and curated TypeScript starter builder
   - continuing extraction target for broader OpenSpec schema, generated-repo starter branches, and store-bound workflow assembly
   - export / handoff / launch-packet builders
2. `specforge-web`
   - landing, pricing, workspace UI
   - auth/session and HTTP APIs
3. `specforge-collab`
   - Yjs/Hocuspocus runtime
4. `specforge-orchestrator`
   - shared backlog parsing and delivery target mapping today
   - intents, claims, context, signals and bounded delivery loop as the broader boundary
5. `specforge-cli`
   - first `/specforge` style CLI wizard now shipped
   - fuller TUI/assistant flow remains post-parity work
   - local agent-runtime reuse for Codex/Claude when present

### Why This Stack
1. Maintains a mostly TypeScript codebase.
2. Uses mature off-the-shelf collaboration primitives instead of custom CRDT/editor infrastructure.
3. Keeps the product close to a monolith while isolating websocket concerns.
4. Supports a fast path to a live demo and later refactors.
5. Makes the coding-agent delivery loop executable instead of manual.
6. Preserves a safe path from "first runnable output" to "spec-parity product" without restarting from scratch.

### Canonical Data Shape
1. Canonical editing state is Tiptap/ProseMirror JSON.
2. Derived block index powers:
   - `block_id` patch targeting
   - comment anchoring
   - export shaping
   - traceability
3. Markdown is exported deterministically from canonical state.

### Auth Defaults
1. Local demo mode: simple dev identity bypass.
2. Pilot mode: GitHub OAuth for human users.
3. Agents: workspace-scoped service identities.
4. Local collab runtime: short-lived signed room tokens minted by the web app and verified by the collab server.
5. Product code should consume one auth/session abstraction so local mode and pilot mode share the same actor contract.
6. Hosted mode must set explicit session/collab secrets and secure cookies; insecure local defaults are only allowed in demo mode.

### v1 Feature Boundaries
1. Comments:
   - simple anchored threads
   - side-panel first
2. Repo generation:
   - docs/export-only always supported
   - minimum extensible TypeScript starter
   - constrained scaffold templates for docs-only, Next.js + TypeScript, and Next.js + Python
3. Rebase behavior:
   - no automatic rebase for stale patches in v1
   - regenerate or send to manual review

### Non-Goals for Initial Build
1. Framework-agnostic generation across many stacks.
2. Enterprise SSO/SCIM.
3. Advanced inline comment systems before patch review is solid.
4. Multi-service monorepo generation.
5. Native/mobile starter generation.

### Delivery Defaults
1. First delivery target: minimum extensible product that runs locally and can be extended incrementally.
2. Runner target: clear the scoped backlog through bounded green passes, not one opaque mega-run.
3. Human escalation target: only ask for input on true blockers, clarifications, or scope conflicts.
