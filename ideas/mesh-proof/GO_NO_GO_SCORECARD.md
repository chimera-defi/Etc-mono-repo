# Go / No-Go Scorecard

| Dimension | Weight | Score (1-10) | Weighted | Evidence |
|-----------|--------|--------------|----------|----------|
| Technical feasibility | 20% | 7 | 1.40 | libp2p proven; slashing proof is hard (Q2) |
| Market demand | 20% | 6 | 1.20 | AntSeed validates demand; TAM unclear (Q16) |
| Tokenomics sustainability | 15% | 5 | 0.75 | Emissions curve unmodeled (Q6) |
| Legal / compliance risk | 15% | 4 | 0.60 | Securities risk (R8) + model liability (R6) |
| Competitive moat | 15% | 7 | 1.05 | Quality oracle + ve governance are novel |
| Team bandwidth | 15% | 6 | 0.90 | Requires Solidity + libp2p + ML infra skills |
| **Total** | **100%** | | **5.90** | |

## Thresholds

- **≥ 7.0:** Go — proceed to build with full resource allocation
- **5.0–6.9:** Conditional Go — proceed only after resolving red flags
- **< 5.0:** No-Go — park or pivot

## Current Verdict: Conditional Go

### Required before green light:
1. Model tokenomics in spreadsheet and confirm year-1 provider APY is competitive (weight impact: +1.0)
2. Get preliminary legal opinion on R6 (model liability) and R8 (securities) (weight impact: +1.0)
3. Run benchmark determinism test for 5 models (weight impact: +0.5)

### If unresolved:
- If legal opinion is negative on either R6 or R8 → No-Go
- If benchmark determinism < 50% → restrict MVP to code/math models only; reassess market dimension
