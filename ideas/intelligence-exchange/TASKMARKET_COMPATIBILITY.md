## Taskmarket Compatibility (Daydreams Comparison)

## Scope
Compares Intelligence Exchange architecture with Daydreams-style agent commerce patterns and defines upgrade deltas.

## Similarities
1. Both are task-first execution networks.
2. Both rely on worker/agent capability declarations.
3. Both require trust, reputation, and dispute-aware settlement.
4. Both need machine-readable execution packaging.

## Differences
1. Current spec is broker-centric; Daydreams is more protocol-surface-first.
2. Current spec is fiat-first; Daydreams emphasizes crypto-native payment rails.
3. Current spec models generic matching; Daydreams-style systems expose explicit market modes.
4. Current spec treats agent-to-agent messaging as optional; Daydreams-style patterns make it core.

## Agent-First Upgrade Deltas
1. Add task market modes:
   - `bounty`: fixed payout, first valid completion wins
   - `claim`: worker claims and gets exclusive lease window
   - `benchmark`: same task to multiple workers for scoring/calibration
   - `auction`: workers bid by price/SLA/reputation
2. Add protocol adapter layer:
   - payment adapters (fiat, x402-style, optional onchain)
   - agent identity adapters (agent cards / DID-style metadata)
   - agent messaging adapters (A2A request/response)
3. Add deterministic agent state loop:
   - `state -> pending_actions -> action_results -> state`
   - eliminates ad-hoc orchestration assumptions.
4. Split trust into registries:
   - identity registry
   - reputation registry
   - validation registry (objective benchmark outcomes).

## Why This Helps
1. More agent-first interoperability and less platform lock-in.
2. Cleaner support for user-owned black-box agents.
3. Stronger differentiation from generic API routers.
4. Better upgrade path from centralized broker to protocol-compatible network.
