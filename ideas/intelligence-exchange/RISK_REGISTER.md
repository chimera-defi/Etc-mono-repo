## Risk Register (Intelligence Exchange)

| Risk | Likelihood | Impact | Owner | Mitigation | Trigger |
|---|---|---|---|---|---|
| Non-compliant seller behavior | Medium | Critical | Compliance Lead | curated onboarding, policy checks, periodic audits | policy violation incident |
| Buyer distrust of exchange reliability | Medium | High | Product + SRE | fallback routing, transparent reliability reporting | churn after incidents |
| Marketplace cold start | High | High | GTM Lead | design-partner seeding, curated supply launch | low route fill rate |
| Margin compression | Medium | High | Finance + Product | premium SLA tiers, segment pricing, cost controls | declining GM% trend |
| Fraud/chargeback escalation | Medium | High | Risk Ops | velocity limits, trust tiers, manual review gates | chargeback spike |
| Settlement disputes overhead | Medium | Medium | Ops Lead | immutable trace logs, dispute SLAs, replay tools | dispute backlog growth |
| Payment rail complexity bloat | Medium | Medium | Product | stripe-first phased rollout | delayed MVP milestones |
| Regulatory interpretation drift | Low | High | Legal/Compliance | periodic legal review cadence | policy/legal update |

## Top 3 Active Risks (Now)
1. Compliance drift in seller pool.
2. Liquidity imbalance during early marketplace stage.
3. Economics erosion from risk/dispute overhead.

## Review Cadence
- Weekly in pilot phase.
- Bi-weekly post-MVP.
