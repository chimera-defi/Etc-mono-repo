**Agent:** GPT-5
**Co-authored-by:** Chimera <chimera_defi@protonmail.com>

## Summary
Kick off the SpecForge MVP build from the merged spec pack with a real web app, local document/persist/export slice, and a runnable collaboration server scaffold.

## Original Request
> Cool let’s kick it off
>
> Sure and make sure there’s a good PR up

## Changes Made
- Scaffolded a Next.js + TypeScript SpecForge web app under `ideas/collab-markdown-spec-studio/web`.
- Implemented a local first vertical slice for:
  - seeded document loading from SpecForge fixtures,
  - document creation,
  - patch proposal ingestion with stale detection,
  - deterministic export bundle generation,
  - local dashboard UI for the slice.
- Added API routes for documents, patches, and export.
- Added unit tests for store/export behavior with Vitest.
- Added a runnable Hocuspocus-based collaboration server scaffold under `ideas/collab-markdown-spec-studio/collab-server`.
- Cleaned the generated app metadata/readmes so the branch reads as implementation work, not raw scaffolding.

## Testing
- `npm run test` in `ideas/collab-markdown-spec-studio/web`
- `npm run lint` in `ideas/collab-markdown-spec-studio/web`
- `npm run build` in `ideas/collab-markdown-spec-studio/web`
- `timeout 3s npm start` in `ideas/collab-markdown-spec-studio/collab-server`
