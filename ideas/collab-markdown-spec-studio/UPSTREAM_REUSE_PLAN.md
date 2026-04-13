# Upstream Reuse Plan (2026-04-08)

## Goal

Avoid re-deriving solved workflows by explicitly reusing MIT-licensed patterns from adjacent open-source projects.

## Source Repositories (Scanned)

1. `jsegov/shipspec-cli` (MIT)
2. `wirelessr/SpecForge-Agent` (MIT)
3. `achuajays/SpecForge` (MIT)

Reference evidence: `GITHUB_NAME_REUSE_SCAN_2026-04-08.md`.

## Reuse Backlog (Concrete)

### Stream A -- Planning Prompts + Traceability

Source: `jsegov/shipspec-cli`

- Extract planning prompt structure and normalize into our shared spec engine.
- Add requirement-to-task traceability IDs to generated outputs (`PRD`, `SPEC`, `TASKS`).
- Add regression fixtures to verify stable prompt output structure.

Done criteria:
- Prompt templates live in one shared module.
- Generated artifacts include stable trace IDs.
- Test fixtures pass for at least 3 representative idea packs.

### Stream B -- Workflow State Machine Hardening

Source: `wirelessr/SpecForge-Agent`

- Review their phase/state transitions and approval gates.
- Port useful state-machine guardrails into our orchestration runtime.
- Add explicit invalid-transition tests and rollback behavior checks.

Done criteria:
- State transitions are schema-defined and validated.
- Invalid transitions fail with deterministic errors.
- Integration tests cover approval/reject/rework loops.

### Stream C -- Wizard + Export Productization

Source: `achuajays/SpecForge`

- Borrow PRD wizard ergonomics that improve guided completion rates.
- Tighten export packaging UX and artifact clarity.
- Keep governance constraints (patch review, provenance) as non-negotiable.

Done criteria:
- Guided wizard completion flow has clear phase progression.
- Export artifacts map 1:1 to documented handoff contracts.
- No governance regressions in acceptance tests.

## Guardrails

- Reuse patterns and architecture ideas, not verbatim brand language.
- Preserve attribution and license notes in internal implementation docs.
- Keep naming decoupled from implementation reuse (external name should not be `SpecForge`).

## Next Checkpoint

After the first pass on all three streams, run a multipass review against `TASKS.md` and `SPEC.md` and promote surviving changes to the default implementation backlog.
