# Intelligence Exchange Sub-Agent Prompt Pack

Copy/paste these prompts for parallel execution.

## Prompt A: Marketplace UX Agent
You own `PRD.md`, `USER_FLOWS.md`, `WIREFRAMES.md`, `UX_AND_PAYMENTS_FLOW.md`.
Task: finalize buyer/supplier/operator first-transaction journeys with trust and failure paths.
Output: updated flows + measurable conversion checkpoints.
Constraints: MVP focuses on one default payment rail.

## Prompt B: Protocol/Router Agent
You own `SPEC.md`, `STATE_MODEL.md`, and `contracts/v1/*`.
Task: finalize job protocol, transition guards, and routing behavior including fallback logic.
Output: versioned schemas + event sequence examples + invariant list.
Constraints: lifecycle transitions must be deterministic and replayable.

## Prompt C: Runtime Agent
You own supplier runtime sections in `SPEC.md` and fixture assumptions in `fixtures/*`.
Task: define runtime contract for local/hosted agents, heartbeat model, and drain behavior.
Output: runtime API expectations + operator checklist.
Constraints: include safe defaults for manual and scheduled modes.

## Prompt D: Risk/Econ Agent
You own `ADVERSARIAL_TESTS.md`, `RISK_REGISTER.md`, `FINANCIAL_MODEL.md`, and `ACCEPTANCE_TEST_MATRIX.md`.
Task: map abuse cases and unit economics assumptions to verifiable tests and kill criteria.
Output: control matrix + threshold table + ownership map.
Constraints: every threshold must include a measurement source.
