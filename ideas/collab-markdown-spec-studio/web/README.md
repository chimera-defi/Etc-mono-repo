# SpecForge Web

Next.js application for the SpecForge MVP.

Current slice:
- embedded SQL persistence via PGlite
- document create/load API routes
- document update API route
- patch decision API route
- Tiptap-backed document workspace
- Yjs/Hocuspocus live room wiring per active document
- collaborator awareness chips in the shared editor
- patch proposal ingestion with stale detection
- patch acceptance/rejection/cherry-pick flow with audit trail
- anchored comment threads with resolve flow
- deterministic export bundle preview
- dashboard UI for the local MVP flow

## Commands

```bash
npm install
npm run dev

# separately
cd ../collab-server
npm install
npm run dev
npm run test
npm run lint
npm run build
```

## Notes

- The local database persists under `.data/specforge-db/` and is seeded from `../fixtures/`.
- The collaboration runtime lives in `../collab-server/`.
- The web client connects to `NEXT_PUBLIC_COLLAB_URL` and defaults to `ws://127.0.0.1:4321`.
