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

### 3. Basis Vault Source

Role:
- more realistic "steady productive source" candidate than prediction-arb
- likely better as a secondary source than the hero source

Why it is interesting:
- BasisOS positions itself as a managed basis-trading yield system with ERC-4626 vault rails and an off-chain operator layer
- Basis docs also describe additional BIOS liquidity-mining rewards on top of baseline strategy yield

Source note:
- official whitepaper: https://whitepaper.basisos.org/

What this means for AgenticUSG:
- the strategy could provide a more plausible baseline productive source
- BIOS rewards could be modeled as an incentive overlay rather than the sole reason to rotate
- this is stronger for realism than using prediction-arb as the entire base yield thesis

Why it should not replace the hero demo source:
- it is less instantly legible to judges than "buy a 90c outcome resolving to $1"
- it introduces off-chain operator and withdrawal-path complexity
- emissions may help returns, but they are not the same thing as sustainable base yield

Implementation skeleton:
- `BasisVaultAdapter`
- implements `IYieldSource`
- two accounting layers:
  - base strategy value / APY
  - BIOS reward accrual estimate
- adapter should expose:
  - `apyBps`
  - `rewardApyBps`
  - `isAsyncExit`
  - `withdrawDelayRisk`
  - `rewardLockSeconds`

Suggested MVP behavior:
- demo mode:
  - fully mocked adapter with seeded basis yield, reward APY, and optional async withdrawal delay
- hybrid mode:
  - live-read vault metadata and reward schedule
  - keep write-path mocked unless the integration becomes stable enough to trust

Key trust / product risks:
- strategy depends on an off-chain operator and managed execution
- withdrawals may be asynchronous rather than instant
- BIOS incentives are emissions and should be treated as decaying bonus yield, not permanent carry
- if AgenticUSG wraps Basis inside tranches, senior exits need policy limits when underlying liquidity is delayed

## Architecture Recommendation

Use a three-layer yield-source strategy:

1. default deterministic source
   - mock productive LP / PT
2. memorable opportunistic source
   - prediction-market arb
3. more realistic productive source candidate
   - Basis vault adapter

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
- `category` (`baseline`, `opportunistic`, `managed-vault`)
- `rewardToken`
- `rewardLockSeconds`
- `isAsyncExit`
- `liqPreference` (`senior-ok`, `junior-only`, `all`)

## Policy Recommendation

- Senior capital should only rotate into a yield source if exit liquidity is consistent with senior promises.
- Junior capital can absorb sources with longer withdrawal or higher execution variance.
- Basis is more plausible for senior or mezz capital than prediction-arb, but only if async withdrawal risk stays inside configured limits.
- Prediction-arb remains best for junior or opportunistic sleeves.

## Demo Recommendation

For Cannes MVP:
- keep prediction-arb as the hero source in the judge script
- add Basis as the "credible next source" or optional second adapter in the architecture explanation
- if time allows, show the agent comparing:
  - Basis = steadier base yield + BIOS incentives
  - Prediction-arb = higher but episodic yield

## Bottom Line

Adding Basis is a good idea if framed correctly:
- yes as a realistic productive source candidate
- yes as a secondary adapter with BIOS incentives modeled explicitly
- no as a replacement for the prediction-market hero moment
- no if the pitch quietly treats BIOS emissions as permanent organic yield
