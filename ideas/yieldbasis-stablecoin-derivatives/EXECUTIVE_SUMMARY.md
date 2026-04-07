# Executive Summary

## Thesis

Build cross-protocol stable tranche vaults on top of YieldBasis rather than a naive wrapped stablecoin.

The product should split YieldBasis exposure into explicit risk surfaces:
- stable carry
- TRD exit timing risk
- gauge / emissions volatility
- ve-lock governance and transfer complexity
- cross-protocol backing and cap risk

## Product Shape

- senior tranche vault
  - shorter lock
  - broader cross-protocol diversification
  - lower first-loss exposure
  - higher redemption priority
- junior tranche vault
  - longer lock
  - higher-yield sleeves
  - lower redemption priority
  - absorbs more TRD, emissions, and governance-linked volatility
- optional ve-style tranche overlay
  - only for capital that explicitly opts into governance and long-lock complexity

## Why This Is Interesting

- YieldBasis already mixes stablecoin backing, leveraged pool exposure, and ve-style incentives
- raw positions are hard to reason about for stablecoin users
- structured tranches can make the fault domains legible instead of hidden

## Core Warning

This only makes sense if the protocol is honest about fault domains.

If it markets "stable yield" while hiding:
- TRD losses
- cap constraints
- exit ordering
- YB / veYB governance and transfer quirks

then the product is bad.

## Recommendation

Proceed as a cross-protocol tranche-vault idea pack, not as a “magic stablecoin on top of YieldBasis” pitch.
Keep the junior side as the sticky first-loss sleeve so the loss waterfall and liquidity waterfall point in the same direction.
