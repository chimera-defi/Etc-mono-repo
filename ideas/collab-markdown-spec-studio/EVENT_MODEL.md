## Event Model (SpecForge)

### Purpose
Define the ordered document events and replay semantics that sit between CRDT collaboration, governed patch review, and durable audit history.

### Event Ordering Rules
1. Events are ordered per document by monotonically increasing `version`.
2. Only accepted state-changing operations advance canonical document version.
3. Presence and awareness signals are realtime-only and do not enter the durable event stream.

### Durable Event Types
1. `document.created`
2. `patch.proposed`
3. `patch.accepted`
4. `patch.rejected`
5. `patch.stale`
6. `snapshot.created`
7. `milestone.checked`
8. `recap.generated`
9. `export.created`

### Replay Rules
1. Replay rebuilds canonical document state from:
   - base document snapshot
   - accepted patch events
   - milestone and export metadata
2. `patch.proposed` and `patch.rejected` are audit-visible but do not mutate canonical content.
3. `patch.accepted` is idempotent by `patch_id`; duplicate replays must not double-apply content.
4. `patch.stale` is terminal for that proposal version unless a new proposal is generated.

### Patch Lifecycle Default
1. Proposal created with:
   - `document_id`
   - `block_id`
   - optional `section_id`
   - `base_version`
   - `target_fingerprint`
2. Review decision path:
   - accept
   - reject
   - stale
3. Accepted proposals create:
   - canonical document update
   - `patch.accepted`
   - `snapshot.created`

### Stale-Patch Semantics
1. A patch becomes stale when:
   - `base_version` is behind current canonical version, or
   - `target_fingerprint` no longer matches the target block
2. v1 behavior:
   - do not auto-rebase
   - mark stale
   - require regeneration or manual review

### Minimum Event Payload Expectations
1. Every durable event includes:
   - `event_id`
   - `document_id`
   - `event_type`
   - `version`
   - `timestamp`
   - `payload`
2. Patch events should include:
   - `patch_id`
   - `block_id`
   - optional `section_id`
   - actor identity
   - decision metadata where relevant

### Notes
1. This document is the human-readable companion to `contracts/v1/document_event.schema.json`.
2. Contract schema and examples should evolve with this file when event types expand.
