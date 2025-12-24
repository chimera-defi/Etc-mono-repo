# Staking Research Review (Liquid Staking + Aztec)

**Review date:** Dec 24, 2025  
**Scope:** `staking/` (liquid staking landscape + Aztec liquid staking packet)

---

## Executive TL;DR

- **The work is directionally strong**: the opportunity framing, protocol comparisons, and the Aztec “build packet” are unusually actionable.
- **The biggest weakness was internal consistency**: Aztec documents used different definitions for “break-even” and mixed protocol-only costs with fully-loaded burn. This has now been standardized with `aztec/ECONOMICS.md` as the source of truth and cross-doc fixes.
- **What’s missing is validation + calibration**: several assumptions (Aztec unbonding/slashing/gas/validator requirements, competitor timelines, true Aztec DeFi surface area) are still unverified and materially affect both product design and go-to-market.

---

## What’s strong (keep / build on)

### Liquid staking landscape
- **Clear segmentation**: institutional vs retail/degen vs new-chain expansion is a good lens and keeps strategy grounded.
- **Breadth**: covers LST + restaking + multi-chain rather than fixating on Ethereum only.
- **Actionability**: includes “Next steps” lists rather than only descriptive analysis.

### Aztec packet
- **Docs are structured like a real project**: assumptions registry, economics model, implementation plan, fundraising outline, and a long technical reference.
- **Correct architecture constraint**: “100% Noir on Aztec” is emphasized, which prevents a common category error.
- **Good operational thinking**: bots/keepers, monitoring, and security/audit planning are well represented.

---

## Key gaps / what we’re missing (highest leverage)

### 1) “Aztec reality check” (needs testnet validation)
These directly affect UX + economics:
- **Unbonding period**: exact value + mechanics (queue behavior, partial exits).
- **Slashing**: actual penalty schedule + what events trigger it + whether/how delegators are impacted.
- **Validator requirements**: CPU/RAM/disk/bandwidth + operational complexity.
- **Transaction costs**: real costs for deposit/withdraw/claim flows and keeper actions.

**Why it matters:** these determine whether we can offer “fast withdrawal,” how large a liquidity buffer must be, and whether the fully-loaded break-even TVL is realistic.

### 2) “Aztec DeFi surface area” (integration path)
To be a credible LST, stAZTEC needs homes:
- Identify the **top Aztec-native venues** for swaps/lending (or likely early partners).
- Decide **liquidity bootstrap mechanics** (incentives, points, LP seeding, initial pools).
- Map **where stAZTEC is useful on day 1** (collateral, LP, payments, etc.).

**Why it matters:** liquid staking wins through integrations and distribution, not only contract correctness.

### 3) Competition intelligence (names + timelines + architecture)
“Multiple teams are building” is directionally helpful but too vague:
- Identify teams/projects, funding, and likely ship dates.
- Track whether competitors plan **custodial delegation**, **self-run validators**, or **operator marketplace**.
- Track whether competitors will ship **public-only MVP** or include privacy features early.

**Why it matters:** time-to-market, differentiation, and pricing all depend on who else ships and how.

### 4) Product design decisions that need explicit answers
These show up implicitly but aren’t always decided:
- **Token model**: reward-bearing (rETH-style) vs rebasing (stETH-style). (You already lean reward-bearing; lock it in and reflect consistently.)
- **Governance rights**: how voting power maps from stAZTEC to Aztec staking/governance.
- **Emergency controls**: pause/guardian + timelock + upgrade path in an Aztec/Noir context.
- **Withdrawal UX**: buffer policy, queue policy, and whether “express withdrawal” is offered.

### 5) Liquid staking landscape: “primary-source hardening”
Many landscape metrics are sourced from blogs/articles:
- Add **primary sources** where possible (protocol docs, dashboards, Dune, DefiLlama, official reports).
- Keep a small “data freshness” rubric per metric (date, source type, confidence).

**Why it matters:** strategic choices (and any fundraising narrative) get fragile if key stats can’t be defended.

---

## Consolidation & refactor changes made (to reduce contradictions)

### Aztec economics “single source of truth”
- `staking/research/aztec/ECONOMICS.md` now explicitly defines:
  - **Protocol-only costs** (validators + infra) and break-even TVL
  - **Fully-loaded costs** (team + overhead planning) and break-even TVL
- Updated references across:
  - `aztec/README.md`
  - `aztec/EXECUTIVE-SUMMARY.md`
  - `aztec/FUNDRAISING.md`
  - `aztec/IMPLEMENTATION-PLAN.md`
  - `aztec/liquid-staking-analysis.md`

### “200k AZTEC ≈ $6k” fixed
- Standardized to **~$8k at the $0.04 sale-price baseline** (and clarified “baseline ≠ forecast”).

---

## Recommended next improvements (concrete)

- **Add a single “Validation Results” log** in `aztec/` once testnet work starts (date-stamped, with measured numbers).
- **Add an “Integrations & Distribution” mini-plan**: target Aztec DeFi partners, launch liquidity plan, and comms plan.
- **Tighten Aztec technical reference** (`liquid-staking-analysis.md`) further by:
  - removing EVM/Solidity-only security references (keep patterns, but Noir-specific)
  - reducing duplicate architecture sections (keep one canonical diagram + one canonical contract list)
- **Landscape doc hygiene**: add a top-level “Metrics to verify” checklist and a quarterly update cadence.

---

## Suggested document architecture (keeping what exists)

- `staking/research/liquid-staking-landscape-2025.md`: broad market context + strategy framing
- `staking/research/OPPORTUNITIES.md`: prioritized bets + action plan (with links into deeper packets)
- `staking/research/aztec/README.md`: Aztec index
  - `EXECUTIVE-SUMMARY.md`: decision memo
  - `ECONOMICS.md`: numbers + formulas (source of truth)
  - `ASSUMPTIONS.md`: validation tracker
  - `IMPLEMENTATION-PLAN.md` + `TASKS.md`: execution
  - `liquid-staking-analysis.md`: technical reference / appendix

