## Architecture Decisions (SpecForge)

## Decision 1: CRDT Collaboration Core
- Choice: CRDT-backed real-time editing.
- Why: robust offline/reconnect and concurrent edits.
- Tradeoff: operational complexity and debugging overhead.

## Decision 2: Patch Proposal Model for Agents
- Choice: agent edits must be patch proposals by default.
- Why: preserve trust and control in multi-user environments.
- Tradeoff: extra review step can slow throughput.

## Decision 3: Stable Block and Section IDs as First-Class Primitive
- Choice: stable block/section IDs plus target fingerprints for patching and traceability.
- Why: required for provenance, stale-patch detection, and repo linkage.
- Tradeoff: index maintenance complexity.

## Decision 4: Repo Generation in Phase 2
- Choice: keep repo generation after core collaboration fit is proven.
- Why: avoid overloading MVP.
- Tradeoff: delayed full value narrative realization.

## Decision 5: Export Bundle as Contract
- Choice: PRD/SPEC/TASKS/agent_spec JSON are contract outputs.
- Why: deterministic handoff to humans and build agents.
- Tradeoff: schema maintenance overhead as product evolves.
