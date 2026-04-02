# Financial Model

## MVP Economics

This is a demo-oriented model, not an investable protocol forecast.

## Revenue Sources

1. Stability fee on minted `aUSG`
2. Performance fee on yield harvested
3. Spread or fee on tranche participation
4. Bond discount capture via delayed token issuance

## Cost Drivers

1. Agent compute and action coordination
2. Oracle and resolution data
3. Incentive emissions
4. Potential liquidity support during peg stress

## Simple Demo Assumptions

- TVL: $1,000,000 equivalent demo notional
- Minted supply: $700,000 `aUSG`
- Net productive yield: 12% annualized blended
- Stability fee: 2%
- Protocol take on gross yield: 15%

## Resulting Rough Annualized Numbers

- Gross collateral yield: $120,000
- Protocol share of yield: $18,000
- Stability fees: $14,000
- Total top-line: about $32,000 before incentives and ops

## Interpretation

- The protocol can be framed as economically coherent at small scale.
- The real weakness is not raw yield math; it is trust, volatility, and adverse selection around source quality and peg behavior.

## Adversarial Read

The current headline yield story is directionally interesting but not enough to claim real profitability.

Main problems:
- Near-resolution prediction-market spreads are not persistent, guaranteed, or large enough to assume as a stable yield source.
- The best opportunities may be capacity-constrained, so the demo does not imply scalable TVL.
- If the agent needs human approval for large actions, reaction speed can erase the edge.
- Slippage, fees, and timing risk can easily consume the apparent spread.
- Peg-defense actions can become cost centers rather than profit centers during stress.

Conservative conclusion:
- The system is realistic as a hackathon control-plane demo for productive stablecoin management.
- It is not yet realistic to pitch as an investable autonomous stablecoin business without stronger data on source quality, capacity, and net return after costs.
