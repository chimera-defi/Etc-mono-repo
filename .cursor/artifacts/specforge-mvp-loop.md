# SpecForge MVP Build Loop

## Current Loop
1. Review implementation gaps in parallel against the source-of-truth pack.
2. Build the highest-value vertical slice that reduces product risk.
3. Update the pack if implementation forces a narrower or clearer default.
4. Re-run verification and refresh the PR context.

## Active Tracks
- Track A: Shared authoring canvas in the web app.
- Track B: Collaboration runtime and persistence hardening.
- Track C: Patch review, attribution, and export parity.

## Current Pass
- Goal: replace the local-only editor with the first live collaboration path.
- Definition of done:
  - Tiptap editor connects to a per-document Hocuspocus room.
  - The active document seeds the room when it is empty.
  - Users can still save canonical content updates through the app API.
  - Local bring-up docs mention the collaboration runtime.

## Deferred Until Next Pass
- Shared cursor presence.
- Persisting collaboration state outside the local JSON-backed store.
- Multi-user comments and patch review inline overlays.
