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
- Goal: replace the static dashboard-only experience with a real editable document workspace.
- Definition of done:
  - Tiptap-backed editor renders the active document.
  - Users can save canonical content updates through the app API.
  - Patch queue and export preview remain visible beside the editor.
  - Tests cover the new document-update path.

## Deferred Until Next Pass
- Yjs provider wiring from the browser to Hocuspocus.
- Shared cursor presence.
- Persisting collaboration state outside the local JSON-backed store.
