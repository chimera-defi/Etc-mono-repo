## State Model (Canonical) — SpecForge

This document defines canonical lifecycle states used across spec, flows, and wireframes.

## Document Lifecycle

1. `draft`: document created, not yet shared with collaborators.
2. `active`: at least one collaborator has joined; Yjs session running.
3. `reviewing`: a batch of agent patches is pending review.
4. `exporting`: export job in progress (generating PRD/SPEC/TASKS/agent_spec.json bundle).
5. `exported`: export bundle generated and available for download or repo scaffold.
6. `archived`: document closed to editing; read-only access only.

## Patch Proposal Lifecycle

1. `proposed`: agent submitted a patch; not yet actioned by a human.
2. `accepted`: human accepted the patch; applied to canonical doc.
3. `rejected`: human rejected the patch; not applied.
4. `cherry-picked`: human accepted part of a multi-section patch; partial apply recorded.
5. `auto-accepted`: patch applied automatically by policy (trusted agent + low-risk edit class).
6. `superseded`: a later patch overwrote this one before review; effectively rejected.
7. `conflicted`: patch target section was concurrently modified; requires manual resolution.

## Version Snapshot Lifecycle

1. `checkpoint`: snapshot created at a save event or milestone.
2. `export-anchor`: snapshot tied to a completed export bundle.
3. `rollback-target`: snapshot marked by a user as a named restore point.

## Session Lifecycle (Yjs Collaboration Session)

1. `connecting`: client establishing WebSocket connection.
2. `syncing`: client receiving initial document state from sync server.
3. `live`: client fully synced; real-time edits flowing.
4. `reconnecting`: client lost connection and is retrying.
5. `disconnected`: client offline; local edits buffered.

## Comment Thread Lifecycle

1. `open`: thread created and unresolved.
2. `resolved`: thread explicitly resolved by a user.
3. `deleted`: thread removed (soft delete; audit event retained).

## Severity Chips (Patch Risk)

1. `R:low` — formatting, whitespace, minor wording.
2. `R:med` — structural change within a section.
3. `R:high` — section delete, merge, or major rewrite.

## Trust Tier (Agent Access)

1. `A:T0` — new agent, patch-only access, all patches require human review.
2. `A:T1` — verified agent, low-risk patches may auto-accept.
3. `A:T2` — trusted agent, configurable auto-accept policy.

## Invariants

1. `accepted`, `rejected`, `cherry-picked`, and `auto-accepted` are terminal patch states.
2. `archived` documents do not accept new patches or sessions.
3. Patch decisions must be appended to the audit log (immutable).
4. A `conflicted` patch must be manually resolved or rejected — it cannot auto-accept.
5. Version snapshots are immutable once created.
