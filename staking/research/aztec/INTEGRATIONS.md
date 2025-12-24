# stAZTEC Integrations & Distribution Plan (Aztec)

**Purpose:** Make stAZTEC meaningfully liquid and useful on day 1 by planning integrations, liquidity, incentives, and sequencing.

**Status:** Draft (living doc)  
**Last updated:** Dec 24, 2025

---

## Non-negotiables (definition of “liquid”)

stAZTEC should ship with at least:
- **A credible swap venue** with sufficient depth for typical user flows
- **A canonical pricing reference** (even if it’s just the primary pool)
- **A clear redemption story** (queue + buffer policy, documented)
- **A distribution channel** (Aztec community, wallets, and/or a flagship DeFi partner)

---

## Day-1 integration targets (categories)

Because Aztec’s ecosystem is new and changing quickly, we track targets as categories first, then fill in specific protocol names as they emerge.

### 1) DEX / swap liquidity (required)
- **Goal:** enable stAZTEC↔AZTEC swaps with low slippage.
- **Integration needs:** pool creation, LP incentives (if any), analytics.
- **Success metrics:** depth at 1% price impact, daily volume, spread stability.

### 2) Lending / collateral (high leverage, but optional day 1)
- **Goal:** make stAZTEC usable as collateral (or lendable asset).
- **Integration needs:** risk parameters, oracle/pricing policy, liquidation mechanics.
- **Success metrics:** borrow demand, liquidation safety, utilization.

### 3) Wallets (distribution)
- **Goal:** surface staking + stAZTEC positions inside key wallets used by Aztec users.
- **Integration needs:** token metadata, “stake” CTAs, analytics tags.
- **Success metrics:** conversion to deposit, retention.

### 4) Foundation / ecosystem support (accelerator)
- **Goal:** grants, co-marketing, or official ecosystem listing.
- **Integration needs:** clear security posture + roadmap.
- **Success metrics:** grant approval, amplification, partner intros.

---

## Liquidity bootstrap plan (practical)

### A) Primary pool(s)
- **Pool 1 (canonical):** stAZTEC / AZTEC
- **Pool 2 (optional):** stAZTEC / (bridge asset) (only if Aztec-native demand exists)

### B) Liquidity sources (options)
- **Protocol-owned liquidity (POL):** allocate part of fees (future) to LP
- **Launch partners:** a DEX or market maker provides seed depth
- **Community LP:** incentive program (points / LM / grants)

### C) Incentive design (options)
- **Points (non-transferable, pre-TGE-friendly):** simplest to ship
- **Liquidity mining (token incentives):** only if/when compliant and feasible
- **Partner incentives:** joint campaigns with a DEX/lending protocol

### D) Risk management
- **Thin liquidity risk:** cap deposits early; publish expected slippage ranges
- **Withdrawal pressure risk:** conservative buffer policy until liquidity stabilizes
- **Price discovery risk:** keep messaging consistent: stAZTEC is a claim on pooled stake; value increases via exchange rate

---

## Sequencing (what to do when)

### Pre-launch (testnet period)
- Identify likely DEX venue(s) and confirm pool mechanics
- Confirm token metadata format + indexer compatibility
- Draft joint announcement copy (template)

### Launch week
- Ship canonical pool
- Publish liquidity + redemption docs prominently
- Announce with Aztec community + ecosystem channels

### Post-launch (weeks 2–6)
- Add second integration surface (lending or wallet)
- Iterate incentives if liquidity is insufficient

---

## Open questions (must be validated)

- Which Aztec-native DEX/lending venues are credible by launch?
- Does Aztec support the right primitives for TWAP/oracle-style pricing, and what do integrators expect?
- What is the minimal “trust package” to be listed (audits, bug bounty, timelock, multisig)?

Track measured answers in `VALIDATION-RESULTS.md` and keep assumptions synced in `ASSUMPTIONS.md`.

