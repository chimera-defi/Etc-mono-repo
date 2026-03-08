## Financial Model (Intelligence Exchange)

## Modeling Principle
Use bottom-up execution economics, not top-down market-size narratives.

## Core Variables
- `B` = active buyer accounts
- `S` = average monthly routed spend per buyer
- `R` = routed share of each buyer's total AI spend
- `T` = platform take-rate
- `C_infra` = platform infra cost percentage of GMV
- `C_risk` = fraud/dispute/compliance ops percentage of GMV
- `C_support` = support/operations percentage of GMV

## Key Formulas
- `GMV = B * S * R`
- `Revenue = GMV * T`
- `VariableCost = GMV * (C_infra + C_risk + C_support)`
- `GrossProfit = Revenue - VariableCost`
- `GrossMargin = GrossProfit / Revenue`

## Scenario Table (Illustrative)

### Base Case
- `B=150`, `S=$5,000`, `R=0.30`, `T=0.08`
- `C_infra=0.010`, `C_risk=0.015`, `C_support=0.010`
- `GMV = $225,000/mo`
- `Revenue = $18,000/mo`
- `VariableCost = $7,875/mo`
- `GrossProfit = $10,125/mo`
- `GrossMargin ≈ 56.25%`

### Upside Case
- `B=300`, `S=$7,500`, `R=0.35`, `T=0.09`
- `C_infra=0.009`, `C_risk=0.012`, `C_support=0.009`
- `GMV = $787,500/mo`
- `Revenue = $70,875/mo`
- `VariableCost = $23,625/mo`
- `GrossProfit = $47,250/mo`
- `GrossMargin ≈ 66.67%`

### Downside Case
- `B=80`, `S=$3,000`, `R=0.20`, `T=0.06`
- `C_infra=0.012`, `C_risk=0.025`, `C_support=0.012`
- `GMV = $48,000/mo`
- `Revenue = $2,880/mo`
- `VariableCost = $2,352/mo`
- `GrossProfit = $528/mo`
- `GrossMargin ≈ 18.33%`

## Decision Thresholds
1. Target gross margin >= 50% in base case by end of pilot-to-MVP transition.
2. Risk/ops burden must not exceed 35% of revenue for two consecutive months.
3. CAC payback target <= 6 months for self-serve segment.

## Notes
- Values are planning assumptions only.
- Replace with observed pilot data before any build-scale decision.
