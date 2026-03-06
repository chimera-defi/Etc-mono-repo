## Architecture Decisions (Spec-to-Ship Workspace)

## Decision 1: CRDT Collaboration Core
- Choice: CRDT-backed real-time editing.
- Why: robust offline/reconnect and concurrent edits.
- Tradeoff: operational complexity and debugging overhead.

## Decision 2: Patch Proposal Model for Agents
- Choice: agent edits must be patch proposals by default.
- Why: preserve trust and control in multi-user environments.
- Tradeoff: extra review step can slow throughput.

## Decision 3: Section IDs as First-Class Primitive
- Choice: stable section IDs for patching/traceability.
- Why: required for provenance and repo linkage.
- Tradeoff: AST/index maintenance complexity.

## Decision 4: Repo Generation in Phase 2
- Choice: keep repo generation after core collaboration fit is proven.
- Why: avoid overloading MVP.
- Tradeoff: delayed full value narrative realization.

## Decision 5: Export Bundle as Contract
- Choice: PRD/SPEC/TASKS/agent_spec JSON are contract outputs.
- Why: deterministic handoff to humans and build agents.
- Tradeoff: schema maintenance overhead as product evolves.
