## SpecForge Tech Stack

### Default Stack
1. Application shell: `Next.js` + `React` + `TypeScript`
2. Editor: `Tiptap`
3. Realtime sync: `Yjs`
4. Collaboration server: `Hocuspocus`
5. Primary database: `Postgres`
6. Background jobs: lightweight TypeScript worker
7. Delivery orchestration: Node.js parity runner around `codex exec`
8. Testing:
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
   - Yjs document room lifecycle
3. Worker:
   - recap generation
   - export jobs
   - curated repo-generation jobs
4. Parity runner:
   - reads `TASKS.md` backlog state
   - generates the next Codex pass brief
   - can run bounded parity loops until the backlog is clear or blocked
5. Shared persistence:
   - Postgres for application state
   - optional blob storage only if snapshots/exports outgrow database ergonomics

### Why This Stack
1. Maintains a mostly TypeScript codebase.
2. Uses mature off-the-shelf collaboration primitives instead of custom CRDT/editor infrastructure.
3. Keeps the product close to a monolith while isolating websocket concerns.
4. Supports a fast path to a live demo and later refactors.
5. Makes the coding-agent delivery loop executable instead of manual.

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

### v1 Feature Boundaries
1. Comments:
   - simple anchored threads
   - side-panel first
2. Repo generation:
   - docs/export-only always supported
   - one curated TypeScript app template only
3. Rebase behavior:
   - no automatic rebase for stale patches in v1
   - regenerate or send to manual review

### Non-Goals for Initial Build
1. Framework-agnostic generation across many stacks.
2. Enterprise SSO/SCIM.
3. Advanced inline comment systems before patch review is solid.
4. Multi-service monorepo generation.
5. Native/mobile starter generation.
