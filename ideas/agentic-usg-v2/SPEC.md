# Spec

## Scope

Hackathon MVP for a productive stablecoin demo with agent-driven collateral rotation.

## Explicit Non-Scope

- liquidation auctions
- trustless live cross-venue routing
- multi-agent swarm behavior in v1
- production-grade monetary policy
- required token launch

## Modules

1. `CollateralVault`
2. `TrancheVault`
3. `StablecoinEngine`
4. `BondingAndEmissions` (optional P1)
5. `AgentController`
6. `IdentityGate`
7. `YieldSourceAdapters`
8. `OracleAndResolutionAdapters`
9. `AgentDecisionMemory`
10. `LiquidityCommitmentPolicy`

## Core Contracts

### `CollateralVault`

- `deposit(address asset, uint256 amount) -> uint256 shares`
- `withdraw(address asset, uint256 shares) -> uint256 amountOut`
- `allocateToYieldSource(bytes32 sourceId, uint256 amount)`
- `currentSource() -> bytes32`

### `StablecoinEngine`

- `mint(uint256 collateralValue, uint256 ausgAmount)`
- `repay(uint256 ausgAmount)`
- `redeem(uint256 shareAmount)`
- `healthFactor(address user) -> uint256`
- `maxMintable(address user) -> uint256`

Rules:
- target initial max LTV: 85%
- health factor below threshold blocks new minting
- no liquidation execution path is required in MVP

### `TrancheVault`

- `depositToTranche(uint8 trancheId, uint256 amount, uint64 lockSeconds)`
- `requestExit(uint8 trancheId, uint256 shareAmount) -> uint256 exitRequestId`
- `claimExit(uint256 exitRequestId) -> uint256 amountOut`
- `rebalanceTranches()`
- `trancheNav(uint8 trancheId) -> uint256`
- `trancheConfig(uint8 trancheId) -> (uint256 targetBps, uint256 minLockSeconds, uint256 firstLossBps, uint8 redemptionPriority)`

Tranche defaults:
- Senior 70%
- Mezz 20%
- Junior 10%

Liquidity defaults:
- Senior: short cooldown or low minimum lock, lowest loss participation, highest redemption priority
- Mezz: medium lock and medium redemption priority
- Junior: longest lock or ve-style escrow, first-loss buffer, lowest redemption priority

MVP rule:
- implement fixed lock terms and queued exits first; full ve-escrow curves are out of scope

### `BondingAndEmissions`

This module is optional for the initial hackathon MVP.

- `stakeAUSG(uint256 amount) -> uint256 saUSG`
- `claimRewards()`
- `bond(uint256 amount, uint256 vestingDays)`
- `currentEmissionRate() -> uint256`

### `AgentController`

- `proposeAction(bytes actionData) -> bytes32 actionId`
- `approveAction(bytes32 actionId)`
- `executeAction(bytes32 actionId)`
- `cancelAction(bytes32 actionId)`
- `decisionBundleUri(bytes32 actionId) -> string`

Agent action types:
- `ROTATE_YIELD_SOURCE`
- `REBALANCE_TRANCHES`
- `ADJUST_EMISSIONS`
- `DEFENSIVE_BUYBACK`

Policy defaults:
- actions above 10% of total managed value require human-backed approval
- actions expire after a short demo-safe TTL
- only one action can be in-flight per demo environment

### `AgentDecisionMemory`

- `persistDecisionBundle(bytes32 actionId, string bundleUri)`
- `getDecisionBundle(bytes32 actionId) -> string`

MVP rule:
- this module is storage-only; it does not score routes or choose actions

Decision bundle fields:
- candidate yield sources
- chosen source
- expected APY delta
- risk flags
- pre-action peg state
- tranche exposure snapshot
- human approval requirement
- affected tranches
- exit queue impact

### `LiquidityCommitmentPolicy`

- `isExitAllowed(address user, uint8 trancheId) -> bool`
- `lockMultiplierBps(uint8 trancheId, uint64 lockSeconds) -> uint256`
- `redemptionPriority(uint8 trancheId) -> uint8`

Policy defaults:
- junior capital receives higher upside only when it accepts the longest capital commitment
- senior capital cannot be both safest and highest-yielding
- any early-exit exception in MVP must be visibly penalized or disabled

### `IdentityGate`

- `verifyHuman(bytes proof) -> bool`
- `canExecuteSensitiveAction(address operator, bytes32 actionType) -> bool`

## Interface Contracts

### `IYieldSource`

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

### `IAgentActionPolicy`

```solidity
interface IAgentActionPolicy {
  function requiresHumanProof(bytes32 actionType) external view returns (bool);
  function maxActionSizeBps(bytes32 actionType) external view returns (uint256);
}
```

## Example Events

```json
{
  "event": "YieldSourceRotated",
  "fromSource": "CURVE_MOCK",
  "toSource": "PREDICTION_ARB",
  "valueMovedUsd": "250000",
  "expectedApyBps": 1840,
  "executor": "uAgent"
}
```

```json
{
  "event": "PegDefenseTriggered",
  "pegPrice": "0.984",
  "action": "ADJUST_EMISSIONS",
  "newEmissionRate": "125000000000000000"
}
```

```json
{
  "event": "DecisionBundlePersisted",
  "actionId": "0xabc123",
  "bundleUri": "0g://agenticusg/action/0xabc123",
  "kind": "ROTATE_YIELD_SOURCE"
}
```

## Error Surface

- `LtvExceeded`
- `HealthFactorTooLow`
- `HumanProofRequired`
- `UnknownYieldSource`
- `ActionExpired`
- `TrancheImbalanceLimit`
- `TrancheStillLocked`
- `ExitQueueBlocked`
- `OracleStale`

## Data And Trust Model

- MVP may use mocked or semi-mocked yield source state for demo reliability.
- Prediction resolution must be clearly labeled as live, delayed, or simulated.
- Any autonomous reallocation above configured thresholds must require human-backed proof.
- Agent decision bundles may be stored offchain, but the URI and key decision fields should be surfaced in-app.
- Profitability claims must be framed as scenario-dependent and not guaranteed by the protocol design alone.
- The loss waterfall and the liquidity waterfall must remain aligned; junior cannot be the first-loss buffer and also the first-out tranche.

## Demo Modes

### Local Deterministic Mode

- fixture APYs
- fixture prediction outcome drift
- no external chain dependency beyond local test chain

### Hybrid Demo Mode

- some live reads allowed
- write paths remain constrained
- fallback fixture mode required if external data becomes unstable
