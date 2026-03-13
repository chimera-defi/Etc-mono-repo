**Agent:** GPT-5
**Co-authored-by:** Chimera <chimera_defi@protonmail.com>

## Summary
Kick off the SpecForge MVP build from the merged spec pack with a real web app, local document/persist/export slice, a runnable collaboration server, a Tiptap authoring workspace, and the first live Yjs/Hocuspocus collaboration path.

## Original Request
> Cool let’s kick it off
>
> Sure and make sure there’s a good PR up

## Changes Made
- Scaffolded a Next.js + TypeScript SpecForge web app under `ideas/collab-markdown-spec-studio/web`.
- Implemented a local first vertical slice for:
  - seeded document loading from SpecForge fixtures,
  - document creation,
  - document updates through a Tiptap-backed workspace,
  - per-document live collaboration rooms over Hocuspocus + Yjs,
  - patch proposal ingestion with stale detection,
  - deterministic export bundle generation,
  - local dashboard UI for the slice.
- Added API routes for documents, patches, and export.
- Added unit tests for store/export behavior and editor serialization with Vitest.
- Added a runnable Hocuspocus-based collaboration server scaffold under `ideas/collab-markdown-spec-studio/collab-server`.
- Added a tracked MVP build loop artifact to keep the next slices explicit.
- Cleaned the generated app metadata/readmes so the branch reads as implementation work, not raw scaffolding.

## Testing
- `npm run test` in `ideas/collab-markdown-spec-studio/web`
- `npm run lint` in `ideas/collab-markdown-spec-studio/web`
- `npm run build` in `ideas/collab-markdown-spec-studio/web`
- `timeout 3s npm start` in `ideas/collab-markdown-spec-studio/collab-server`
