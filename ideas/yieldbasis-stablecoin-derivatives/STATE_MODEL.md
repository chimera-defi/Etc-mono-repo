# State Model

## Tranche Position

Fields:
- `userId`
- `trancheType` (`senior`, `junior`, `ve-junior`)
- `shares`
- `lockEndsAt`
- `redeemRequestId`
- `redemptionPriority`
- `faultExposureFlags`

States:
- `EMPTY`
- `ACTIVE`
- `LOCKED`
- `REDEEM_REQUESTED`
- `REDEEMABLE`
- `CLOSED`

## Protocol Allocator State

Fields:
- `sleeves[]`
- `trdBps`
- `capUsageBps`
- `ybRewardRate`
- `veLockHealth`
- `allocationConcentrationBps`
- `sharedDependencyFlags`

States:
- `HEALTHY`
- `TRD_STRESSED`
- `CAP_STRESSED`
- `LOCK_STRESSED`
- `DEGRADED`

## Invariants

1. senior tranche cannot be the first-loss recipient for junior / ve-junior losses
2. redemption promise must degrade before accounting lies
3. lock premium only applies while lock is active
4. emissions are tracked separately from base carry
5. allocator concentration above threshold must be surfaced as risk, not hidden as diversification
6. junior redemption must never outrank an unlocked senior request
