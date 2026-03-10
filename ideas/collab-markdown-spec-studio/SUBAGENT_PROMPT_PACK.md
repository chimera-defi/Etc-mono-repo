# SpecForge Sub-Agent Prompt Pack

Copy/paste these prompts for parallel execution.

## Prompt A: Product/UX Agent
You own `PRD.md`, `USER_FLOWS.md`, and `WIREFRAMES.md`.
Task: convert all primary flows into measurable acceptance criteria and include failure/recovery states.
Output: updated docs + a 10-line summary of changed assumptions.
Constraints: no speculative integrations; keep MVP strict.

## Prompt B: Collaboration/Core Agent
You own `SPEC.md` and `contracts/v1/*`.
Task: define event/state contracts and ensure concurrent edit behavior is deterministic.
Output: versioned schemas + payload examples + invariants list.
Constraints: `v1` may break while iterating; enforce backward compatibility from `v2` onward.

## Prompt C: Governance/Safety Agent
You own `ADVERSARIAL_TESTS.md` and `RISK_REGISTER.md`.
Task: enumerate abuse paths and produce blocking controls + rollback logic.
Output: threat table mapped to controls and tests.
Constraints: every risk must map to an observable signal.

## Prompt D: Validation Agent
You own `VALIDATION_PLAN.md`, `GO_NO_GO_SCORECARD.md`, `ACCEPTANCE_TEST_MATRIX.md`.
Task: map each KPI and each user flow to a concrete test and owner.
Output: test matrix + go/no-go thresholds with data sources.
Constraints: no KPI without instrumentation source.
