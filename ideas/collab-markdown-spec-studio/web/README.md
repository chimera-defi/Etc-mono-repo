# SpecForge Web

Next.js application for the SpecForge MVP.

The current route split is:
- `/` marketing/overview landing page
- `/pricing` pricing page
- `/workspace` the actual working SpecForge product

Current slice:
- guided spec creation that generates the canonical draft from structured inputs
- shared OpenSpec core reuse for guided wizard and readiness logic
- mini agent-assist that can populate guided fields from a rough brief
- demo workspaces now enforce a small included assist quota while pilot workspaces remain effectively unbounded
- workspace member limits and a seat-based monthly billing preview now exist as the first SaaS billing/membership hooks
- local workspace sessions with GitHub OAuth pilot hooks for server-side attribution
- persisted workspace members with add-member controls in the workspace session panel
- workspace plan switcher for local demo vs pilot rehearsal
- local embedded SQL persistence via PGlite with disk-backed snapshot sharing across app workers
- hosted persistence path via Postgres-backed store selection
- guided drafts now include a first-class `Requirements` section so readiness can clear from the guided path
- document create/load API routes
- document update API route
- patch decision API route
- Tiptap-backed document workspace
- Yjs/Hocuspocus live room wiring per active document
- collaborator awareness chips and remote cursors in the shared editor
- signed collab session handshakes between the web app and Hocuspocus server
- versioned room replay with explicit stale-room detection and latest-snapshot reload
- patch proposal ingestion with stale detection
- patch acceptance/rejection/cherry-pick flow with audit trail
- anchored comment threads with resolve flow
- clarification queue with answer writeback into canonical markdown
- canonical `ideas/` showcase import for `server-management-agent`
- showcase walkthrough from imported idea to launch packet in the export stage
- block-level provenance markers in the shared canvas
- richer in-text attribution overlays alongside the shared canvas markers
- readiness scoring and recap panel
- deterministic export bundle preview
- starter handoff output for the minimum TypeScript starter plus constrained docs-only / Next.js templates
- execution brief and combined launch packet JSON
- in-product delivery-loop panel exposing backlog status and next-pass brief
- terminal-native `specforge` CLI now supports `init`, `status`, `context`, `artifacts`, `backlog`, and a lightweight `tui`
- local admin controls for resetting demo workspace data and seeding review activity
- staged UI for the local MVP flow
- web runtime health endpoint at `/api/health`
- web runtime metrics endpoint at `/api/metrics`
- workspace entitlements endpoint at `/api/workspace/entitlements`
- workspace ops summary endpoint at `/api/ops/summary`
- workspace backup index endpoint at `/api/ops/backups`
- pricing anchors benchmarked in `../PRICING_BENCHMARKS.md`

## Commands

```bash
bun install
bun run dev
bun run test
bun run lint
bun run build
bun run test:e2e
bun run screenshot:demo
bun run parity:status
bun run parity:brief
bun run parity:run:dry
bun run parity:run:batch
bun run test:cli

# separately
cd ../collab-server
bun install
bun run dev

# terminal-native guided wizard
cd ..
bun run specforge -- init --json --title "SpecForge CLI Draft" --problem "Keep spec creation reusable"

# or from the workspace root
cd ..
docker compose up --build
bun run state:backup
```

## Notes

- The local runtime persists through a JSON snapshot under `.data/` and is seeded from `../fixtures/`.
- Hosted mode can switch to Postgres with `SPECFORGE_PERSISTENCE_BACKEND=postgres` and `DATABASE_URL=...`.
- The containerized runtime now uses Postgres by default and still seeds from `/fixtures`.
- The collaboration runtime lives in `../collab-server/`.
- `docker compose up --build` brings up web, collab, and postgres with health checks plus a shared collab secret for deployment rehearsal.
- The web client connects to `NEXT_PUBLIC_COLLAB_URL` and defaults to `ws://127.0.0.1:4321`.
- The collab handshake is signed by `POST /api/collab/session`; override `SPECFORGE_COLLAB_SECRET` only if both the web app and collab server share it.
- The final handoff stage exposes `/export`, `/handoff`, `/execution`, and `/launch-packet` routes for downstream build agents.
- The app also exposes `/api/parity/status` and `/api/parity/brief` so the backlog driver is visible inside the product, not only from the CLI.
- The local parity runner lives at `../tools/specforge-parity-runner.mjs` and can drive bounded `codex exec` passes from the remaining backlog.
- The runner is designed to land a runnable minimum extensible product first, then keep advancing toward scoped parity without repeated manual re-prompting.
- `bun run parity:run:batch` runs a bounded multi-pass loop (`--until-clear --max-passes 3 --review-every 2`) so the backlog can advance without an unbounded nested session.
- In local demo mode, the `Local admin` panel can reset workspace documents and seed mock review activity for fast MVP testing.
- In local mode, agent assist can reuse existing `codex` or `claude` CLI logins from the server runtime, and the preferred runtime can be saved from the workspace session panel. Hosted mode should use server-side workspace credentials instead.
- Shared specs use canonical workspace URLs like `/workspace?document=<id>&stage=draft`; the workspace UI exposes a copyable share link, but pilot recipients still need GitHub sign-in and workspace membership.
- Local ops rehearsal now has both `bun run state:backup` and `bun run state:restore`, and the workspace sidebar links to the health and metrics endpoints directly.
- The workspace sidebar now also links to `/api/workspace/entitlements` and `/api/ops/summary` so local SaaS rehearsal can inspect quotas, billing preview, parity state, and persistence in one place.
- The workspace session panel can switch the active workspace plan between `demo` and `pilot` locally, which makes quota and billing-preview testing much faster.
- `bun run verify` is the canonical full local gate, and `specforge verify` exposes the same suite from the agent-native CLI surface.
- `bun run parity:verify` records the latest verification result into the runner state and handoff artifacts, so the orchestration loop has a durable last-known-green checkpoint.
- `bun run test:e2e` only runs the browser demo suite (`tests/demo.spec.ts`); engine-level acceptance coverage lives under `bun run test:acceptance`.
- The runner also schedules periodic multipass review/refactor passes so the loop compacts context, refreshes handoff state, and records meta learnings.
- Delivery loop endpoints:
  - `/api/parity/status`
  - `/api/parity/context`
  - `/api/parity/brief`
- Latest runner handoff artifact:
  - `../../.cursor/artifacts/specforge-runner-latest.md`
- Latest runner meta learnings:
  - `../../.cursor/artifacts/specforge-meta-learnings.md`
- Auth endpoints:
  - `/api/auth/login`
  - `/api/auth/callback`
  - `/api/auth/logout`
- Local recovery and observability notes live in `../LOCAL_RUNBOOK.md`.
- Health endpoints:
  - `/api/health`
  - `/api/metrics`
  - `/api/ops/summary`
  - `/api/ops/backups`
  - `/api/workspace/entitlements`
  - `http://127.0.0.1:4322/health`
  - `http://127.0.0.1:4322/metrics`
