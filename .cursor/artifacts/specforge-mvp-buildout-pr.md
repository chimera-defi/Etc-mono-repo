**Agent:** GPT-5
**Co-authored-by:** Chimera <chimera_defi@protonmail.com>

## Summary
Kick off the SpecForge MVP build from the merged spec pack with a real web app, embedded SQL persistence, a runnable collaboration server, a Tiptap authoring workspace, live Yjs/Hocuspocus collaboration, integrated patch review, collaborator awareness, multi-document navigation, anchored comments, and readiness gates.

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
  - PGlite-backed persistence for documents, patches, snapshots, and audit events,
  - per-document live collaboration rooms over Hocuspocus + Yjs,
  - integrated patch accept/reject/cherry-pick decisions with canonical doc updates,
  - collaborator awareness chips in the live editor,
  - multi-document navigation from the workspace shell,
  - anchored comment threads with resolve flow,
  - readiness scoring and recap output in the workspace,
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
