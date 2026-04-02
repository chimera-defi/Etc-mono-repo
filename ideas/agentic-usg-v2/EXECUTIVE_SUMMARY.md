# Executive Summary

## Thesis

AgenticUSG is a productive stablecoin system for ETHGlobal Cannes 2026: users deposit yield-bearing collateral, mint `aUSG`, and opt into risk tranches while a human-backed AI agent rotates collateral into the best available yield source, including near-resolution prediction-market arbitrage.

## Why This Could Win

- It maps directly onto the user-provided World, 0G, and Arc prize tracks.
- It combines three hackathon-friendly narratives into one demo:
  - autonomous AI agents
  - stablecoin logic and peg defense
  - real-world-signal prediction market utility
- It is demoable in a constrained environment with mocked or sandboxed sources where live integrations are risky.

## Product Shape

- `aUSG`: stablecoin minted against productive collateral
- `sAUSG`: staked stablecoin for fee share and emissions
- `$AGNT`: optional post-MVP incentive token, not required for the main demo
- uAgent: human-backed operator agent for reallocation, tranche balancing, and peg actions

## MVP For 36 Hours

1. Deposit mock productive collateral and mint `aUSG`.
2. Show swappable yield source abstraction.
3. Showcase one prediction-market yield opportunity.
4. Show tranche split across senior, mezz, junior.
5. Let the agent rebalance and explain the action trail.
6. Use World-backed gating on sensitive agent actions.
7. Persist one storage-only `0G` decision dossier for a completed action.

## Recommended Demo Story

1. User proves humanness.
2. User deposits collateral and mints `aUSG`.
3. The agent detects a better prediction-market yield source.
4. The agent reallocates collateral and updates projected yield.
5. A mild peg stress event triggers tranche rebalancing and incentive changes.
6. World, Arc, and 0G overlays are surfaced as explicit, auditable modules if they can all stay tied to the same core demo path.
7. The pitch stays honest: this is an agent control-plane demo, not a proven autonomous profit engine.

## Current Posture

- Hackathon fit: strong
- DeFi realism: medium
- Post-hackathon investability: unclear without narrowing risk and narrative
- Recommendation: proceed as a hackathon-first build with strict demo honesty

## Mandatory Scope Cuts

1. Only one hero yield-source rotation in the judge flow.
2. Only one peg-defense action in the judge flow.
3. World integration must gate something real.
4. `$AGNT` stays out of the main demo unless it clearly improves judge comprehension.
5. `0G` stays storage-only in MVP.
