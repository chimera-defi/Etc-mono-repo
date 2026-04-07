# Adversarial Review

## Main Question

Is this a useful structured product, or just complexity layered on complexity?

## Skeptical Read

### 1. Wrapping YieldBasis does not remove YieldBasis risk

If the wrapper merely renames the position and hides:
- TRD
- cap dependency
- emissions volatility
- ve-lock weirdness

then it is a bad product.

### 2. Stable tranche language is dangerous

The tranches may be stable-denominated, but they are not riskless.
The design must avoid implying hard stability where cross-protocol exits can degrade.

### 3. Cross-protocol diversification can become fake

If the allocator mostly routes into one dominant sleeve, the product is not meaningfully diversified.
It is just concentrational risk with a nicer UI.

### 4. ve locks are especially dangerous to oversell

ve mechanics look like "boost."
In reality they add:
- lock risk
- governance risk
- transfer and merge edge cases

### 5. Liquidity waterfall must align with loss waterfall

If junior capital is meant to absorb more downside, it cannot also have a cleaner exit path than senior capital.
Otherwise the structure invites runs and leaves the senior tranche underprotected exactly when stress arrives.

### Verdict

The idea is good only if it acts like a cross-protocol and cross-time fault-domain isolator.
If it acts like a yield-marketing wrapper, it is no-go.
