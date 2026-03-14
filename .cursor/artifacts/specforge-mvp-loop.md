# SpecForge Parity Loop

## Operating Mode
Drive toward parity with the original SpecForge MVP spec without asking for more feedback unless:
- a real blocker appears,
- the branch reaches parity,
- or a product decision becomes ambiguous enough to risk thrash.

Each loop pass must:
1. Take the highest-value unchecked parity item.
2. Implement the smallest integrated change that closes it.
3. Sync docs and task tracking if the shipped surface changes.
4. Re-run `npm run lint`, `npm run test`, `npm run build`, and `npm run test:e2e`.
5. Commit and push only when the branch is green.

## Current Parity Status

### Already at Parity
- Guided spec creation with canonical structured sections.
- Shared multiplayer authoring canvas.
- Governed agent patch review with auditability.
- Comments, readiness, export, starter handoff, execution brief, and launch packet.
- Shared cursors and basic on-canvas provenance markers.
- Canonical `ideas/` showcase import from `server-management-agent`.
- End-to-end local demo coverage with screenshots.

### Remaining Gaps To Close
1. Collaboration recovery:
   reconnect, replay, stale-room recovery, and clearer sync/offline/error states.
2. Provenance depth:
   richer inline attribution overlays instead of marker-only visibility.
3. Showcase walkthrough:
   make the imported `ideas/` example flow explicit from import -> review -> launch packet -> starter output.
4. Ops and recovery:
   lightweight observability and a local failure-mode runbook.
5. Auth and permission hooks:
   define and wire the first real boundary between human users, agents, and the collab runtime.

## Active Next Pass
- Goal: close the collaboration recovery gap first.
- Definition of done:
  - the shared canvas exposes explicit connecting/live/saving/offline/error states,
  - reconnect events recover the room cleanly,
  - stale-room cases are detectable and surfaced to the user,
  - the path is covered by tests where practical,
  - docs and task list reflect the new behavior.

## Stop Condition
Only stop the loop to ask for feedback if:
- an unresolved product tradeoff blocks implementation,
- a new bug invalidates the current architecture,
- or all remaining parity gaps above are closed.
