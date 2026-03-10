## Financial Model (SpecForge)

## Modeling Principle
Model as team SaaS + usage expansion, with outcome metrics tied to retained teams.

## Core Variables
- `W` = active paid workspaces
- `ARPA` = average monthly subscription revenue per workspace
- `U` = AI usage add-on revenue per workspace
- `C_host` = infra hosting cost per workspace
- `C_ai` = AI variable cost per workspace
- `C_support` = support/ops cost per workspace

## Key Formulas
- `MRR = W * (ARPA + U)`
- `COGS = W * (C_host + C_ai + C_support)`
- `GrossProfit = MRR - COGS`
- `GrossMargin = GrossProfit / MRR`

## Scenario Table (Illustrative)

### Base Case
- `W=300`, `ARPA=$45`, `U=$20`
- `C_host=$7`, `C_ai=$12`, `C_support=$4`
- `MRR = $19,500`
- `COGS = $6,900`
- `GrossProfit = $12,600`
- `GrossMargin ≈ 64.6%`

### Upside Case
- `W=700`, `ARPA=$55`, `U=$30`
- `C_host=$6`, `C_ai=$11`, `C_support=$4`
- `MRR = $59,500`
- `COGS = $14,700`
- `GrossProfit = $44,800`
- `GrossMargin ≈ 75.3%`

### Downside Case
- `W=150`, `ARPA=$35`, `U=$10`
- `C_host=$8`, `C_ai=$15`, `C_support=$5`
- `MRR = $6,750`
- `COGS = $4,200`
- `GrossProfit = $2,550`
- `GrossMargin ≈ 37.8%`

## Decision Thresholds
1. Target gross margin >= 60% in base case by end of early MVP period.
2. Weekly retention in active project cohorts must exceed 60%.
3. Measurable throughput gain required for expansion investment.
