# Agent Handoff

## Repo Target

- Implementation target: `packages/agentic-usg-v2/`

## Shared Rules

- Build the MVP around one coherent demo story.
- Prefer deterministic fixtures over fragile live integrations.
- Every agent must end with: what shipped, what is unresolved, what assumptions were made.
- Follow `STATE_MODEL.md`, `DECISIONS.md`, and `ACCEPTANCE_TEST_MATRIX.md` before introducing new behavior.

## Workstream A: Contracts

Objective:
- Scaffold the CDP, tranche vault, yield adapter interface, and agent controller contracts.

File scope:
- `packages/agentic-usg-v2/contracts/**`

Done criteria:
- Local tests cover deposit, mint, tranche deposit, and one simulated source rotation.

## Workstream B: Frontend

Objective:
- Build a demo UI that explains collateral, minting, tranches, and agent actions.

File scope:
- `packages/agentic-usg-v2/web/**`

Done criteria:
- A judge can complete the demo without CLI context.

## Workstream C: Agent Runtime

Objective:
- Implement a deterministic uAgent service with policy checks and action logs.

File scope:
- `packages/agentic-usg-v2/agent/**`

Done criteria:
- Agent can propose and execute one yield rotation and one peg-defense action against fixtures.

## Workstream D: Prize Adapters

Objective:
- Add thin wrappers for World, 0G, and Arc mapping without destabilizing core flow.

File scope:
- `packages/agentic-usg-v2/integrations/**`

Done criteria:
- Demo surfaces where each prize integration appears and what it controls.

See also:
- [STATE_MODEL.md](./STATE_MODEL.md)
- [ACCEPTANCE_TEST_MATRIX.md](./ACCEPTANCE_TEST_MATRIX.md)
- [ADVERSARIAL_TESTS.md](./ADVERSARIAL_TESTS.md)
- [DECISIONS.md](./DECISIONS.md)
- [SUBAGENT_PROMPTS.md](./SUBAGENT_PROMPTS.md)
