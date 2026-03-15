## Financial Model (SpecForge)

## Modeling Principle
Model as team SaaS with seat expansion plus usage expansion, with outcome metrics tied to retained teams.

## Core Variables
- `W` = active paid workspaces
- `S` = average paid seats per workspace
- `P_seat` = subscription revenue per seat
- `U` = AI usage add-on revenue per workspace
- `C_host` = infra hosting cost per workspace
- `C_ai` = AI variable cost per workspace
- `C_support` = support/ops cost per workspace
- `C_seat` = incremental per-seat support/collab cost

## Key Formulas
- `MRR = W * ((S * P_seat) + U)`
- `COGS = W * (C_host + C_ai + C_support + (S * C_seat))`
- `GrossProfit = MRR - COGS`
- `GrossMargin = GrossProfit / MRR`

## Scenario Table (Illustrative)

### Base Case
- `W=300`, `S=4`, `P_seat=$12`, `U=$18`
- `C_host=$7`, `C_ai=$12`, `C_support=$4`, `C_seat=$0.75`
- `MRR = $19,800`
- `COGS = $7,800`
- `GrossProfit = $12,000`
- `GrossMargin ≈ 60.6%`

### Upside Case
- `W=700`, `S=5`, `P_seat=$13`, `U=$22`
- `C_host=$6`, `C_ai=$11`, `C_support=$4`, `C_seat=$0.65`
- `MRR = $60,900`
- `COGS = $17,675`
- `GrossProfit = $43,225`
- `GrossMargin ≈ 71.0%`

### Downside Case
- `W=150`, `S=3`, `P_seat=$10`, `U=$8`
- `C_host=$8`, `C_ai=$15`, `C_support=$5`, `C_seat=$1.00`
- `MRR = $5,700`
- `COGS = $4,650`
- `GrossProfit = $1,050`
- `GrossMargin ≈ 18.4%`

## Decision Thresholds
1. Target gross margin >= 60% in base case by end of early MVP period.
2. Weekly retention in active project cohorts must exceed 60%.
3. Measurable throughput and rework improvement required for expansion investment.
4. Seat expansion must materially improve revenue before repo generation becomes a major cost center.
