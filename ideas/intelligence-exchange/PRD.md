## Intelligence Exchange PRD

**Status**: Draft | **Last Updated**: 2026-03-05 | **Owner**: TBD

### Problem
AI teams face fragmented model supply, variable pricing/latency, and idle capacity on private infrastructure. At the same time, direct resale of provider credits is often contractually restricted.

### Product Thesis
Create an exchange that trades **execution capacity and routed inference outcomes**, not transferable credits. The platform enforces provider-policy compliance while lowering buyer cost and improving reliability.

### What Exists Already (Reality Check)
- Model routing/BYOK products already exist (e.g., OpenRouter).
- Compute marketplaces already exist (e.g., Vast.ai, TensorDock).
- Therefore, this is not a category-creation play; it is a **compliance + reliability + agent-native workflow** play.

### Core Users (MVP)
1. AI-native startups running agent workflows with volatile spend.
2. Infra operators with excess compliant inference capacity.
3. Internal platform teams needing cost-aware routing with SLA.

### Non-Goals (MVP)
1. Reselling third-party credits/subscriptions.
2. Consumer-facing token speculation product.
3. Long-tail unsupported models without policy validation.

### Core Value Proposition
1. **Buyer**: lower effective cost + SLA-backed routing + fallback reliability.
2. **Seller**: monetization of idle compliant capacity.
3. **Platform**: trust/compliance layer + settlement + observability.

### MVP Scope
1. Buyer gateway API with policy-aware routing.
2. Seller onboarding with capability/price/SLA declarations.
3. Metering and settlement ledger.
4. Basic reputation score and dispute handling.
5. Audit logs for compliance review.

### Business Model
1. Take-rate on settled workload spend.
2. Premium plan for SLA guarantees and enterprise controls.
3. Optional managed routing fee for BYOK users.

### TAM/SAM/SOM Framing (Bottom-Up)
Use execution-based TAM modeling instead of top-down market reports:

- `Reachable teams x monthly AI spend x addressable share x take-rate`

Example planning math (illustrative, not market claim):
- 8,000 teams x $2,500/mo x 25% routed through exchange x 8% take-rate
- = ~$4.8M ARR equivalent from routed take-rate layer

This model is intentionally conservative and should be replaced with real pipeline data.

### GTM
1. Start with AI-agent-heavy startups (high pain, low procurement friction).
2. Offer migration SDK and drop-in gateway.
3. Publish cost/reliability benchmarks for trust.
4. Expand into enterprise platform teams with compliance/audit features.

### Risks
1. Thin differentiation vs existing routers.
2. Policy/regulatory risk if supply side violates provider terms.
3. Marketplace cold-start and quality variance.
4. Margin compression if routing becomes commodity.

### Kill Criteria
1. Could not secure compliant seller supply with stable quality.
2. Gross margin after infra/fraud/dispute costs is unattractive.
3. Buyers do not switch from existing router stacks despite measurable savings.

### Why This Could Work
If positioned as a **trusted execution exchange** with measurable reliability and compliance, it can win as infrastructure plumbing rather than as a speculative token product.
