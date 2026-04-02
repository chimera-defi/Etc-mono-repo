# Sub-Agent Prompts

Use these prompts to split bounded implementation work without widening scope.

## Contracts Agent

Task:
- Scaffold `CollateralVault`, `StablecoinEngine`, `TrancheVault`, and `AgentController`.
- Implement only the happy-path flows required by `ACCEPTANCE_TEST_MATRIX.md`.
- Respect the invariants in `STATE_MODEL.md`.

Constraints:
- no liquidation logic
- no live oracle dependency
- no tokenomics module in P0

Output:
- contracts scaffold
- tests for deposit, mint, approve, execute, repay
- short note on unresolved contract risks

## Agent Runtime Agent

Task:
- Implement deterministic proposal / approval / execution flow.
- Persist one decision dossier before execution completes.

Constraints:
- `0G` is storage-only
- only one action in flight
- no autonomous large action without proof

Output:
- runtime scaffold
- fixture-backed action loop
- list of policy assumptions

## Frontend Agent

Task:
- Build the judge-facing happy path from deposit to dossier view.
- Make mocked and live components visibly labeled.

Constraints:
- no dark-pattern DeFi jargon
- no hidden terminal dependency in the core demo
- show proof, action state, and dossier URI

Output:
- simple flow pages
- audit drawer
- fallback-mode indicator

## Integration Agent

Task:
- Add thin World, Arc, and 0G wrappers around the core flow.

Constraints:
- no detached side demos
- World must gate something real
- Arc must stay tied to mint / policy / prediction flow
- 0G must stay storage-only

Output:
- adapter interfaces
- stub implementations
- demo notes explaining what is real vs mocked
