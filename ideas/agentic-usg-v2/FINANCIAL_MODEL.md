# Financial Model

## MVP Economics

This is a demo-oriented model, not an investable protocol forecast.

## Revenue Sources

1. Stability fee on minted `aUSG`
2. Performance fee on yield harvested
3. Spread or fee on tranche participation
4. Bond discount capture via delayed token issuance
5. Lock premium paid for junior or ve-escrow capital that absorbs first losses

## Cost Drivers

1. Agent compute and action coordination
2. Oracle and resolution data
3. Incentive emissions
4. Potential liquidity support during peg stress
5. Senior exit liquidity or queue management during stress windows

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
- The tranche layer becomes more coherent if sticky junior capital is paid from a visible lock premium or fee share instead of vague "higher APY" promises.

## Tranche Economics Lean

- Senior should earn lower but cleaner yield and receive faster or higher-priority exits.
- Junior should earn the highest carry only if it accepts the longest lock and first-loss role.
- A ve-style junior vault is defensible because it functions like committed insurance capital, not because "lockups are DeFi-nice-to-have."
- If lockups are added, they should fund a concrete benefit:
  - better fee share
  - higher emissions only if `$AGNT` returns later
  - earlier access to opportunistic yield rotations

## Adversarial Read

The current headline yield story is directionally interesting but not enough to claim real profitability.

Main problems:
- Near-resolution prediction-market spreads are not persistent, guaranteed, or large enough to assume as a stable yield source.
- The best opportunities may be capacity-constrained, so the demo does not imply scalable TVL.
- If the agent needs human approval for large actions, reaction speed can erase the edge.
- Slippage, fees, and timing risk can easily consume the apparent spread.
- Peg-defense actions can become cost centers rather than profit centers during stress.
- If senior depositors are promised safety without junior capital truly staying locked, the tranche design collapses into marketing rather than finance.

Conservative conclusion:
- The system is realistic as a hackathon control-plane demo for productive stablecoin management.
- It is not yet realistic to pitch as an investable autonomous stablecoin business without stronger data on source quality, capacity, and net return after costs.
