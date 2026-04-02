# Validation Plan

## Goal

Prove that the project is coherent as a judge-facing demo and not just a bundle of prize buzzwords.

## Validation Tracks

### Product Validation

1. Can a new user explain `aUSG`, the yield source, and the tranche they picked in under 60 seconds?
2. Can a judge understand why the agent was needed instead of a static vault?

### Technical Validation

1. Deposit, mint, repay, and redeem all work locally.
2. At least one source rotation executes end to end.
3. At least one peg-defense action executes in a controlled scenario.
4. Event logs are visible and human-readable.

### Prize Validation

1. World module clearly gates sensitive actions.
2. 0G module clearly stores or serves the agent decision dossier for at least one real action.
3. Arc module clearly handles programmable stablecoin / prediction / nanopayment angle.

### Realism Validation

1. The team can explain why the prediction-market opportunity exists and why it is not guaranteed free money.
2. The team can explain what breaks if the arb narrows before the agent acts.
3. The team can explain whether the agent improves returns net of fees, slippage, and operational overhead.
4. The team can explain which parts are demo-safe mocks versus credible production directions.

## Demo Test Cases

1. Fresh user onboarding and mint flow
2. Prediction-yield opportunity detected and accepted
3. Mild depeg event triggers emissions change
4. Senior versus junior tranche comparison
5. Judge opens the 0G-backed decision dossier for a completed agent action

## Kill Criteria

- If prediction-market yield cannot be demonstrated honestly, remove it from the main story.
- If World gating is cosmetic, stop presenting it as a core safety primitive.
- If integrations create fragility without improving demo clarity, collapse to one primary prize track.
- If the economics only work under unrealistic spread, zero slippage, or infinite liquidity assumptions, stop calling the system profitable and frame it as a control-plane demo instead.
