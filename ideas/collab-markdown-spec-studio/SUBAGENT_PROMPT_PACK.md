# SpecForge Sub-Agent Prompt Pack

Template basis: `ideas/_templates/SUBAGENT_PROMPT_PACK.template.md`

## Prompt A: Product/UX
Scope: `PRD.md`, `USER_FLOWS.md`, `WIREFRAMES.md`
Task: convert primary flows into measurable acceptance criteria with failure/recovery states.
Output: updated docs + changed-assumptions summary.
Constraints: no speculative integrations; keep MVP strict.

## Prompt B: Core Collaboration/Contracts
Scope: `SPEC.md`, `contracts/v1/*`
Task: define deterministic event/state behavior for concurrent edits.
Output: schemas + examples + invariants.
Constraints: `v1` may break while iterating; enforce backward compatibility from `v2` onward.

## Prompt C: Safety/Risk
Scope: `ADVERSARIAL_TESTS.md`, `RISK_REGISTER.md`
Task: enumerate abuse paths and define blocking controls + rollback logic.
Output: risk/control matrix mapped to tests.
Constraints: every risk must map to an observable signal.

## Prompt D: Validation/Economics
Scope: `VALIDATION_PLAN.md`, `GO_NO_GO_SCORECARD.md`, `ACCEPTANCE_TEST_MATRIX.md`
Task: map each KPI and each key user flow to concrete tests and owners.
Output: test matrix + go/no-go thresholds.
Constraints: no KPI without instrumentation source.
