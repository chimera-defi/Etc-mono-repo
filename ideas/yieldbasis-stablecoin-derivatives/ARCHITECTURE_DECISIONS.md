# Architecture Decisions

## D1. Do not hide YieldBasis fault domains
- choice: make TRD, cap, emissions, and lock state visible
- why: otherwise the derivative is misleading

## D2. Senior and junior tranche vaults first
- choice: start with a two-tranche structure
- why: more legible than many slices

## D3. ve-style wrapper is optional
- choice: keep ve-lock wrapper out of the core path unless transfer / merge semantics are modeled
- why: YieldBasis lock mechanics are non-trivial and historically bug-prone

## D4. Redemption queue before instant liquidity
- choice: explicit queue and degraded-mode redemption rules
- why: honest stable wrappers cannot promise instant exits over TRD-sensitive substrates

## D5. Junior should be the stickier loss-absorbing sleeve
- choice: junior takes the longer lock and subordinated queue position
- why: the liquidity waterfall should align with the loss waterfall
