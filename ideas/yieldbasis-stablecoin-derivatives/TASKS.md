# Tasks

## Dependency Order

1. fault-domain model
2. adapter interface
3. protocol allocator
4. tranche accounting
5. redemption queue
6. lock / ve wrapper
7. frontend risk console

## P0

- model senior and junior tranche vaults
- adapter reads TRD, cap, and reward state
- allocator reads cross-protocol sleeve weights
- define tranche-specific lock ladder and queue priority
- redemption queue
- risk dashboard
- constrained issuance simulator

## P1

- ve-style junior wrapper
- fee splitter
- live-read mode

## Workstreams

### WS1: Protocol Model
- define senior / junior economics
- define what each tranche absorbs
- define which tranche gets the longer lock and why
- define how cross-protocol diversification reduces or fails to reduce risk

### WS2: Adapter
- normalize YieldBasis and other sleeve states into tranche-safe metrics

### WS3: Allocator
- define sleeve mix
- define rebalance limits
- define concentration thresholds
- define shared-dependency warnings across sleeves

### WS4: Redemption
- request / queue / claim flow
- enforce senior-priority and junior-subordination rules
- degraded-mode rules

### WS5: UX
- show risk before APY
- show redemption state before mint CTA
