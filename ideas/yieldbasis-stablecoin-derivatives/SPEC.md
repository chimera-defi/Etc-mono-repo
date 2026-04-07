# Spec

## Scope

Spec-first cross-protocol tranche-vault layer on top of YieldBasis Hybrid Vault positions.

## Modules

1. `YieldBasisAdapter`
2. `ProtocolAllocator`
3. `TrancheVault`
3. `RedemptionQueue`
4. `LockManager`
5. `RiskOracle`
6. `FeeSplitter`

## Core Contracts

### `YieldBasisAdapter`

- `depositStable(uint256 amount)`
- `depositHybrid(bytes32 marketId, uint256 stableAmount, uint256 assetAmount)`
- `withdrawHybrid(bytes32 marketId, uint256 shares)`
- `currentTrdBps(bytes32 marketId) -> uint256`
- `currentCapUsageBps(bytes32 marketId) -> uint256`
- `ybRewardRate(bytes32 marketId) -> uint256`

### `ProtocolAllocator`

- `allocate(bytes32 trancheId, bytes32 sleeveId, uint256 amount)`
- `rebalance(uint256[] weights)`
- `trancheProtocolWeights(bytes32 trancheId) -> uint256[]`

### `TrancheVault`

- `mintSenior(uint256 amount, uint64 lockSeconds) -> uint256 shares`
- `mintJunior(uint256 amount, uint64 lockSeconds) -> uint256 shares`
- `requestRedeemSenior(uint256 shares) -> uint256 requestId`
- `requestRedeemJunior(uint256 shares) -> uint256 requestId`
- `claimRedeem(uint256 requestId)`

### `LockManager`

- `lockJunior(uint256 shares, uint64 lockSeconds)`
- `veWrapJunior(uint256 shares, uint64 lockSeconds)`
- `unlockStatus(address user) -> uint256`

## Tranche Policy

- senior tranche
  - shorter minimum lock
  - broader target diversification across sleeves
  - higher redemption priority after lock expiry
- junior tranche
  - longer minimum lock
  - higher-yield / higher-volatility sleeve exposure
  - first-loss and subordinated redemption behavior

## Fault Domains To Model Explicitly

1. stable backing dependency on `crvUSD` / `scrvUSD`
2. TRD withdrawal discount
3. hybrid-vault personal-cap rules
4. emissions and gauge-vote changes
5. veYB transfer / merge edge cases
6. liquidity gauge accounting risk
7. diversification failure if the allocator drifts back into one dominant sleeve
8. cross-protocol contagion if multiple sleeves share the same hidden dependency

## Error Surface

- `InsufficientBacking`
- `TrdTooHigh`
- `CapExceeded`
- `LockStillActive`
- `GovernanceExposureDisabled`
- `RedemptionQueuePaused`
- `WithdrawalWaterfallViolation`

## MVP Rule

No derivative may be labeled “stable” in the UI without also showing:
- base collateral state
- TRD state
- lock state
- emissions contribution
- protocol allocation
- redemption queue position
- redemption priority
