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

## Decision 6: Single TypeScript App + Collaboration Service
- Choice: use one TypeScript web app plus a dedicated collaboration service and lightweight worker.
- Why: keeps the product mostly monolithic while isolating websocket sync concerns.
- Tradeoff: collaboration service is still a separate runtime to own.

## Decision 7: Canonical Editor JSON, Derived Block Index
- Choice: treat editor JSON as canonical and derive block/section indexes for governance and export.
- Why: avoids dual-write complexity while preserving stable patch targets.
- Tradeoff: block extraction logic becomes critical infrastructure.

## Decision 8: `block_id` as Primary Patch Target
- Choice: patches target `block_id`; `section_id` is secondary context.
- Why: more precise targeting and safer stale detection than section-only patching.
- Tradeoff: block identity must remain stable through editor transforms.

## Decision 9: No Automatic Rebase in v1
- Choice: stale patches are rejected for regeneration or manual review instead of auto-rebased.
- Why: easier to reason about and safer for an attribution-heavy MVP.
- Tradeoff: more proposals will need regeneration in busy documents.

## Decision 10: GitHub OAuth for Pilots
- Choice: local dev bypass for demos, GitHub OAuth for pilot human users, service identities for agents.
- Why: simplest path for a technical early-user cohort.
- Tradeoff: non-GitHub users are excluded until later auth expansion.

## Decision 11: Simple Anchored Comments in v1
- Choice: ship basic anchored comment threads before richer inline comment UX.
- Why: patch review and depth gates matter more than advanced comment ergonomics.
- Tradeoff: comments will feel less polished than mature editor platforms.

## Decision 12: Curated Example Generation Only
- Choice: restrict first repo generation to docs-only export plus one curated TypeScript app template.
- Why: proves the authoring-to-code loop without exploding support surface area.
- Tradeoff: narrower demo than a framework-agnostic generator.

## Decision 13: Codex Parity Runner
- Choice: ship a local orchestration runner that wraps `codex exec` and advances the highest-priority remaining parity item automatically.
- Why: teams should not have to manually re-prompt the coding agent after every integrated pass.
- Tradeoff: the runner depends on disciplined task tracking and can only automate as far as the backlog and stop conditions are explicit.
