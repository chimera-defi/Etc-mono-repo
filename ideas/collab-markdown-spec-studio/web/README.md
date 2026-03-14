# SpecForge Web

Next.js application for the SpecForge MVP.

Current slice:
- guided spec creation that generates the canonical draft from structured inputs
- embedded SQL persistence via PGlite with disk-backed snapshot sharing across app workers
- guided drafts now include a first-class `Requirements` section so readiness can clear from the guided path
- document create/load API routes
- document update API route
- patch decision API route
- Tiptap-backed document workspace
- Yjs/Hocuspocus live room wiring per active document
- collaborator awareness chips and remote cursors in the shared editor
- patch proposal ingestion with stale detection
- patch acceptance/rejection/cherry-pick flow with audit trail
- anchored comment threads with resolve flow
- canonical `ideas/` showcase import for `server-management-agent`
- block-level provenance markers in the shared canvas
- readiness scoring and recap panel
- deterministic export bundle preview
- curated TypeScript starter handoff output
- execution brief and combined launch packet JSON
- staged UI for the local MVP flow

## Commands

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
npm run test:e2e
npm run screenshot:demo

# separately
cd ../collab-server
npm install
npm run dev
```

## Notes

- The local runtime persists through a JSON snapshot under `.data/` and is seeded from `../fixtures/`.
- PGlite still backs the in-process SQL layer; the snapshot is there so Next app workers share the same document state.
- The collaboration runtime lives in `../collab-server/`.
- The web client connects to `NEXT_PUBLIC_COLLAB_URL` and defaults to `ws://127.0.0.1:4321`.
- The final handoff stage exposes `/export`, `/handoff`, `/execution`, and `/launch-packet` routes for downstream build agents.
