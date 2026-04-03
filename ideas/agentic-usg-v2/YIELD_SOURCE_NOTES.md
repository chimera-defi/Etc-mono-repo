# Yield Source Notes

## Purpose

Track which yield sources AgenticUSG should support, why they matter, and how to integrate or demo them honestly.

## Current Yield Sources Considered

### 1. Mock Productive LP / PT Source

Role:
- baseline source for deterministic demos

Why it exists:
- gives the system a boring default source before any agent action
- keeps the product legible if live integrations fail

How to demo it:
- fixed APY fixture
- instant deposits and withdrawals
- no exotic trust assumptions

Implementation skeleton:
- `MockYieldSourceAdapter`
- implements `IYieldSource`
- returns seeded `apyBps`, `totalValue`, and low-risk flags

### 2. Prediction-Market Arb Source

Role:
- hero showcase source in the judge path

Why it exists:
- most memorable proof that the agent is doing something non-trivial
- supports Arc’s prediction / real-world-signal framing

How to demo it:
- fixture-driven near-resolution outcome spread
- clearly labeled as delayed-live or simulated unless real execution is wired

Implementation skeleton:
- `PredictionArbAdapter`
- implements `IYieldSource`
- exposes:
  - expected spread
  - resolution ETA
  - confidence / risk flags
- agent proposes rotation only when spread clears a configured threshold

Main risks:
- episodic opportunities
- thin capacity
- timing risk
- hard to present as durable base yield

### 3. YieldBasis Source

Role:
- realistic secondary source candidate
- better treated as a specific structured adapter than a generic base-yield vault

Why it is interesting:
- YieldBasis is built around leveraged liquidity positions and yb-assets such as `ybBTC`
- Hybrid Vaults let users deposit `crvUSD`, auto-route it into a backing vault such as `scrvUSD`, and then use that backing to access YieldBasis pool capacity
- YieldBasis pools can also be gauge-staked for `YB` emissions
- `veYB` exists as a separate vote-escrow system for emissions direction and fee share

Source note:
- Hybrid Vaults docs: https://docs.yieldbasis.com/user/hybrid-vaults
- veYB docs: https://docs.yieldbasis.com/user/veyb
- protocol audit summary hosted by YieldBasis docs: https://docs.yieldbasis.com/pdf/audit/quantstamp.pdf

What this means for AgenticUSG:
- this is not just "deposit into a vault and earn basis yield"
- the integration likely needs one of two explicit modes:
  - direct yb-asset exposure such as `ybBTC`
  - Hybrid Vault-backed access using `crvUSD` / `scrvUSD`
- `YB` emissions can boost yield, but they are separate from the base trading-fee and vault-yield story
- `veYB` is not a lock on the productive position itself; it is a separate protocol-token lock for governance and fee share

Why it should not replace the hero demo source:
- it is less instantly legible to judges than "buy a 90c outcome resolving to $1"
- it introduces asset-shape complexity around `crvUSD` backing, yb-assets, and gauge staking
- emissions may help returns, but they are not the same thing as sustainable base yield

Implementation skeleton:
- `YieldBasisAdapter`
- implements `IYieldSource`
- two accounting layers:
  - base source yield
  - `YB` reward accrual estimate
- adapter should expose:
  - `apyBps`
  - `rewardApyBps`
  - `requiresStablecoinBacking`
  - `isGaugeStaked`
  - `usesHybridVault`
  - `rewardLockSeconds`

Suggested MVP behavior:
- demo mode:
  - fully mocked adapter with seeded yb-source yield, `YB` reward APY, and stablecoin-backing requirements
- hybrid mode:
  - live-read pool metadata, gauge rewards, and hybrid-vault ratios
  - keep write-path mocked unless the integration becomes stable enough to trust

Key trust / product risks:
- the productive position depends on YieldBasis market mechanics and Curve-linked assumptions
- Hybrid Vault capacity is tied to `crvUSD` backing rules, currently documented as a stablecoin fraction requirement
- `YB` incentives are emissions and should be treated as bonus yield, not permanent carry
- `veYB` lockups are protocol-token locks, not proof that the productive source itself is liquid or senior-safe
- if AgenticUSG wraps YieldBasis inside tranches, senior exits need policy limits whenever underlying exits or backing constraints become binding

## Architecture Recommendation

Use a three-layer yield-source strategy:

1. default deterministic source
   - mock productive LP / PT
2. memorable opportunistic source
   - prediction-market arb
3. more realistic productive source candidate
   - YieldBasis adapter

That gives the system:
- a safe fallback
- a memorable demo
- a more credible post-hackathon path

## Integration Contract Sketch

All sources should normalize to the same adapter interface:

```solidity
interface IYieldSource {
  function sourceId() external view returns (bytes32);
  function deposit(uint256 amount) external returns (uint256 receiptAmount);
  function withdraw(uint256 receiptAmount) external returns (uint256 amountOut);
  function totalValue() external view returns (uint256);
  function apyBps() external view returns (uint256);
  function riskFlags() external view returns (uint256);
}
```

For richer UX, AgenticUSG should also maintain adapter metadata offchain or in a registry:
- `displayName`
- `category` (`baseline`, `opportunistic`, `structured-lp`, `hybrid-vault`)
- `rewardToken`
- `rewardLockSeconds`
- `requiresStablecoinBacking`
- `isGaugeStaked`
- `usesHybridVault`
- `liqPreference` (`senior-ok`, `junior-only`, `all`)

## Policy Recommendation

- Senior capital should only rotate into a yield source if exit liquidity is consistent with senior promises.
- Junior capital can absorb sources with longer withdrawal or higher execution variance.
- YieldBasis is more plausible as a mezz or junior sleeve than as the default senior source unless the backing and exit path are modeled very conservatively.
- Prediction-arb remains best for junior or opportunistic sleeves.

## Demo Recommendation

For Cannes MVP:
- keep prediction-arb as the hero source in the judge script
- add YieldBasis as the "credible next structured source" or optional second adapter in the architecture explanation
- if time allows, show the agent comparing:
  - YieldBasis = structured pool yield + `YB` incentives + optional `crvUSD` backing carry
  - Prediction-arb = higher but episodic yield

## Bottom Line

Adding YieldBasis is a good idea if framed correctly:
- yes as a realistic structured-source candidate
- yes as a secondary adapter with `YB` incentives modeled explicitly
- no as a replacement for the prediction-market hero moment
- no if the pitch quietly treats `YB` emissions as permanent organic yield
