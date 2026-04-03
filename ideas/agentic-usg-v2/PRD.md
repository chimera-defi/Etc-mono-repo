# PRD

## Problem

Stablecoins usually force a tradeoff between simplicity, productive collateral, and adaptive risk management. AI-agent projects often feel detached from real economic utility. Prediction markets produce strong short-duration opportunities, but most users cannot route capital into them quickly or safely.

## Product Vision

AgenticUSG is a productive, agent-managed stablecoin stack where collateral can move between yield sources and risk tranches while a human-backed agent optimizes for yield and peg safety under explicit guardrails. The tranche layer is also a liquidity-commitment layer: safer capital gets faster exits and lower upside, while first-loss capital earns more but must stay locked longer.

## Target User

- Hackathon judges evaluating novel DeFi + AI integration
- Crypto-native users who understand collateralized stablecoins
- Protocol designers interested in agentic treasury management

## User Goals

- Mint a stable asset from productive collateral
- Understand where yield comes from
- Choose a risk level through tranching
- Choose a liquidity commitment that matches risk tolerance
- Trust that autonomous actions are observable and rate-limited

## Core User Stories

1. As a user, I can deposit collateral and mint `aUSG` at a visible max LTV.
2. As a user, I can see which yield source currently backs my position.
3. As a user, I can select a senior, mezz, or junior tranche and understand the tradeoff between risk, yield, and lock duration.
4. As a user, I can see why the agent reallocated collateral.
5. As a user, I can verify that high-impact actions require a human-backed identity gate.
6. As a judge, I can understand exactly which module maps to which prize category.

## MVP Features

### F1. Swappable Yield Sources

- `IYieldSource` abstraction
- default mock productive source
- prediction-market arb source as the hero path

### F2. aUSG CDP

- deposit collateral
- mint `aUSG`
- repay and redeem
- visible collateral ratio and liquidation threshold

### F3. Tranches

- Senior: lowest volatility, lower yield, short cooldown, priority exits
- Mezz: medium risk, medium yield, medium lock
- Junior: first-loss, highest upside, longest lock or ve-style escrow receipt

Liquidity commitment design:
- the junior tranche is the sticky insurance buffer and therefore should not have the shortest exit window
- the senior tranche can offer safer economics only if it is not also the capital absorbing first losses
- MVP can implement this with fixed lock metadata and redemption queue priority instead of a full curve-based escrow system

### F4. Agent Actions

- detect higher-yield source
- rotate collateral
- rebalance tranche allocations
- defend peg with predefined playbooks

### F5. Incentive Layer

- optional `$AGNT` emissions
- optional staking share for `sAUSG`
- optional bond mechanic for discounted future `$AGNT`

## MVP Reality Split

### Must Be Real

- deposit / mint / repay / redeem path
- tranche selection and tranche accounting
- one agent proposal and execution path
- identity-gated approval on sensitive action
- visible event / audit trail

### Can Be Simulated

- prediction-market resolution timing
- peg stress scenario input
- complex emissions tuning logic
- nanopayment internals for prize framing
- full ve-escrow curve math beyond fixed lock durations

## Non-Goals For MVP

- production-grade liquidation engine
- open-ended leverage recursion
- unrestricted live trading across volatile venues
- trustless fully autonomous treasury with no human review
- mandatory tokenomics launch

## Success Metrics

- End-to-end demo succeeds in under 5 minutes
- At least one yield-source swap is triggered and explained
- Prize mappings are explicit in UI and docs
- No agent action looks hidden or magical

## Open Product Decisions

1. Should `$AGNT` appear at all in v1, or move entirely to roadmap?
2. Should prediction-yield positions be fully mocked or partially live?
3. How do we keep Arc and 0G both real without making the product feel like three stitched demos?
4. Should leverage loops be demoed at all in version one?
5. What exact junior lock durations make the tradeoff legible without making the demo feel illiquid or punitive?
