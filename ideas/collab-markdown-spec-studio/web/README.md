# SpecForge Web

Next.js application for the SpecForge MVP.

Current slice:
- local seeded document store
- document create/load API routes
- document update API route
- Tiptap-backed document workspace
- patch proposal ingestion with stale detection
- deterministic export bundle preview
- dashboard UI for the local MVP flow

## Commands

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```

## Notes

- The local store persists under `.data/` and is seeded from `../fixtures/`.
- The collaboration runtime lives in `../collab-server/`.
