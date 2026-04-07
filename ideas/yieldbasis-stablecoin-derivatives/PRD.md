# PRD

## Problem

YieldBasis positions can be productive, but the raw exposure is messy for stablecoin-oriented users because the stack spans:
- `crvUSD` / `scrvUSD` funding
- leveraged hybrid vault exposure
- TRD-sensitive exits
- YB emissions
- veYB lock mechanics

## Product Vision

Offer cross-protocol stable tranche vaults that isolate which users absorb which YieldBasis and non-YieldBasis fault domains.

## Target User

- DeFi-native users who want stable-denominated yield with clearer risk bands and lock-defined tranche choice
- structured-product builders
- protocol designers exploring stable wrappers over complex yield substrates

## Core User Stories

1. As a user, I can choose a senior or junior tranche and understand how lock duration changes my risk, return, and redemption priority.
2. As a user, I can see whether my yield comes from base carry, emissions, or lock premium.
3. As a user, I can see how TRD, hybrid-vault withdrawal rules, and cross-protocol routing affect my redemption rights.
4. As a user, I can choose a time-locked or ve-style tranche only if the extra risk is explicit.

## MVP Features

### F1. Cross-Protocol Tranche Vaults
- senior tranche vault with shorter lock, broader diversification, and better queue priority
- junior tranche vault with longer lock, higher upside, and first-loss absorption
- protocol allocator that diversifies across YieldBasis and other stable-yield sleeves

### F2. Fault-Domain Dashboard
- TRD state
- cap usage
- stable backing ratio assumptions
- emissions share
- ve-lock exposure
- protocol allocation split

### F3. Redemption Policy
- senior redemption queue with higher priority once lock is satisfied
- junior first-loss / delayed exit with subordinated queue rights
- emergency degraded-mode rules

### F4. Cross-Time Products
- tranche entry terms tied to lock duration and withdrawal ordering
- optional ve-style wrapper only if transfer and merge semantics are modeled honestly

## Non-Goals

- pretending YieldBasis becomes riskless because it is wrapped
- permissionless open issuance on day one
- generalized stablecoin for payments
- hiding governance-linked or lock-linked risk inside “boosted APY”

## Open Product Question

Should the first build be:
- a tranche-vault wrapper
- or just a risk simulator + issuance mock

Current lean:
- simulator + constrained tranche-vault issuance mock first
