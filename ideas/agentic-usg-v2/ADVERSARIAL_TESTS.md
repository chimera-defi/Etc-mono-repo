# Adversarial Tests

## Goal

Treat failure and abuse cases as first-class requirements.

## Contract / Policy Cases

1. Over-mint attempt
   - setup: user deposits collateral
   - action: mint above max LTV
   - expected: revert with `LtvExceeded`

2. Execute sensitive action without proof
   - setup: rotation above threshold is proposed
   - action: call `executeAction` before approval
   - expected: reject with `HumanProofRequired`

3. Expired action execution
   - setup: action TTL elapsed
   - action: execute expired action
   - expected: reject with `ActionExpired`

4. Unknown source rotation
   - setup: agent proposal references invalid source
   - action: approve and execute
   - expected: reject with `UnknownYieldSource`

## Runtime / Economics Cases

5. Prediction spread collapses before execution
   - setup: opportunity exists at proposal time
   - action: reduce spread before execution
   - expected: action is cancelled or flagged as no longer profitable

6. Peg policy fires in wrong regime
   - setup: peg remains inside tolerance band
   - action: agent proposes emissions adjustment anyway
   - expected: policy layer blocks action

7. Tranche rebalance increases junior risk too far
   - setup: drifted tranche state
   - action: agent proposes rebalance beyond policy limit
   - expected: reject with risk warning or `TrancheImbalanceLimit`

8. Decision dossier missing
   - setup: action approved
   - action: execute without persisting dossier
   - expected: execution blocked in MVP

## Demo Honesty Cases

9. Live integration unavailable
   - setup: World, Arc, or 0G sandbox unavailable
   - action: run judge demo
   - expected: app drops to deterministic fixture mode with explicit labeling

10. Profitability claim challenged
   - setup: judge asks whether the system is net profitable
   - action: operator opens economics panel
   - expected: UI and docs state that profitability is scenario-dependent and not guaranteed
