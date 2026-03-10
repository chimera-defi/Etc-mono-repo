# Intelligence Exchange Sub-Agent Prompt Pack

Template basis: `ideas/_templates/SUBAGENT_PROMPT_PACK.template.md`

## Prompt A: Marketplace UX
Scope: `PRD.md`, `USER_FLOWS.md`, `WIREFRAMES.md`, `UX_AND_PAYMENTS_FLOW.md`
Task: finalize buyer/supplier/operator first-transaction journeys with trust and failure paths.
Output: updated flows + measurable conversion checkpoints.
Constraints: MVP uses one default payment rail.

## Prompt B: Protocol/Router
Scope: `SPEC.md`, `STATE_MODEL.md`, `contracts/v1/*`
Task: finalize job protocol, transition guards, and fallback routing behavior.
Output: schemas + event sequences + invariants.
Constraints: lifecycle transitions must be deterministic and replayable.

## Prompt C: Runtime
Scope: supplier runtime sections in `SPEC.md`, fixture assumptions in `fixtures/*`
Task: define runtime contract for local/hosted agents, heartbeats, and drain behavior.
Output: runtime API expectations + operator checklist.
Constraints: safe defaults for manual and scheduled modes.

## Prompt D: Risk/Economics
Scope: `ADVERSARIAL_TESTS.md`, `RISK_REGISTER.md`, `FINANCIAL_MODEL.md`, `ACCEPTANCE_TEST_MATRIX.md`
Task: map abuse and unit-economics assumptions to verifiable tests and kill criteria.
Output: control matrix + threshold table + ownership map.
Constraints: every threshold includes a measurement source.
