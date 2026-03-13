## Intelligence Exchange PRD

**Status**: Draft | **Last Updated**: 2026-03-06 | **Owner**: TBD

### Problem
AI teams have growing backlogs of AI jobs (coding, analysis, content, support operations), while potential executors have idle time, underused AI access, and no standardized way to earn on that spare capacity.

### Product Thesis
Build a brokered exchange for **AI job execution capacity**. Demand side submits jobs. Supply side runs a worker app using their own AI setup (local tools or API-backed execution). The platform handles matching, packaging, scoring, payouts, and reputation.

Agent-first interpretation:
1. Platform value is in task routing, trust, and settlement.
2. Worker-side execution can remain a user-owned black-box agent.
3. This reduces platform exposure to provider-specific execution internals.

### What Exists Already (Reality Check)
- Model routing/BYOK products already exist (e.g., OpenRouter).
- Compute marketplaces already exist (e.g., Vast.ai, TensorDock).
- Gig-style labor marketplaces already exist (Upwork/Fiverr style mechanics).
- Therefore, this is not category-creation; the wedge is a **machine-first execution marketplace** with structured quality controls.

### Core Users (MVP)
1. AI-native startups running agent workflows with volatile spend.
2. Infra operators with excess compliant inference capacity.
3. Internal platform teams needing cost-aware routing with SLA.

### Non-Goals (MVP)
1. Fully open uncurated marketplace with no quality thresholds.
2. Onchain-first tokenized marketplace as core dependency.
3. End-to-end autonomous execution for high-risk job classes on day one.

### Core Value Proposition
1. **Buyer**: queue work once, receive scored outputs at predictable turnaround and cost.
2. **Worker operator**: earn by running a standard worker runtime against available jobs.
3. **Platform**: capture take-rate by providing trust, routing, observability, and settlement.

### Strategic Delta vs Daydreams (Primary Competitor)
Daydreams is the closest competitor (see `COMPETITOR_MATRIX.md`). Key differences:

1. **Fiat-first supply**: Daydreams requires crypto wallet setup. Intelligence Exchange uses Stripe Connect — accessible to developers without on-chain experience.
2. **Active quality enforcement**: Daydreams treats workers as black boxes. Intelligence Exchange scores every output with automated rubrics and enforces acceptance thresholds.
3. **Compliance posture**: Daydreams is open protocol. Intelligence Exchange targets regulated buyers (enterprises, fintech) who need auditable execution chains and dispute trails.
4. **Constrained task types first**: Intelligence Exchange starts with code-scorable tasks (code review, test gen, PR summary) where quality can be verified objectively. This builds trust before expanding.

V2 protocol upgrade path: add `claim`, `bounty`, `benchmark`, `auction` modes and A2A adapters after MVP trust metrics are proven (see OPEN_QUESTIONS.md Q4).

### MVP Scope
1. Buyer job submission API + dashboard.
2. Worker onboarding (install, auth, capability declaration, heartbeat).
3. Pull-based claim/execute/submit flow for workers.
4. Prompt/context packaging with deterministic input bundles.
5. Output quality scoring, acceptance, and dispute workflow.
6. Metering, ledgering, and payout orchestration.

### Business Model
1. Take-rate on each accepted job.
2. Priority routing/SLA fee tier for buyers.
3. Managed worker pools for enterprise workloads.
4. Optional escrow and fast-payout fees.

### Payments and Commerce Rails
1. **Default rail:** card/invoice billing for mainstream buyer onboarding.
2. **Agentic rail:** ACP-style delegated payment flows for machine-to-machine commerce.
3. **Optional crypto rail:** Strike-style/BTC settlement as additive path, not core dependency.

### TAM/SAM/SOM Framing (Bottom-Up)
Use execution-based TAM modeling instead of top-down market reports:

- `Active buyers x monthly job volume x avg accepted job value x take-rate`

See `FINANCIAL_MODEL.md` for scenario modeling with variable definitions. Do not use standalone numbers here as they go stale and risk being treated as commitments. Replace the financial model with observed pilot data before any build-scale decision.

### GTM
1. Start with constrained workload verticals: code review, test generation, PR summarization (all auto-scorable — see ARCHITECTURE_DECISIONS.md D10).
2. Launch supply side via worker CLI campaign: "install, connect your API key, earn on idle hours."
3. Publish job quality and latency scorecards per task type as a trust signal.
4. Expand to API-first B2B buyers with batch endpoints and SLA tiers.
5. Introduce optional agentic and crypto rails after baseline fiat path is proven.

### Supply Model (MVP)
1. Contributor installs worker app on laptop/desktop/server.
2. Worker declares capability profile (task classes, throughput, schedule windows).
3. Worker polls broker and claims jobs within policy/price guardrails.
4. Worker executes via configured backend:
   - local CLI automation (example: Claude Code/Codex tooling)
   - API-backed LLM calls (BYOK/cloud account)
5. Worker returns outputs + execution trace.
6. Platform scores output, accepts/rejects, and credits payout balance.

### Cadence Model (MVP to V2)
1. MVP: manual start with optional fixed run windows (nightly/weekend schedules).
2. V1: always-on daemon with pause/limit controls.
3. V2: autonomous "idle detection + budget-aware auto-run" mode.

### Agent-First V2 Scope (Post-MVP)
1. Protocol adapter layer for payment, identity, and agent messaging.
2. Agent manifest ingestion for interoperable discoverability.
3. Deterministic state/action execution contract for autonomous workers.
4. Trust registry split (identity/reputation/validation).

### Risks
1. Thin differentiation vs router or freelancer alternatives.
2. Quality drift and rework costs.
3. Marketplace cold-start and low completion liquidity.
4. Abuse and fake-work attacks.
5. Margin compression if value-add is not sustained.

### Kill Criteria
1. Could not retain enough active workers with stable quality.
2. Gross margin after infra/fraud/dispute costs is unattractive.
3. Buyers do not switch from existing router stacks despite measurable savings.

### Why This Could Work
If positioned as a **trusted execution network** with measurable output quality, this can win as workflow infrastructure rather than as a speculative token product.

### References in this Pack
1. `VALIDATION_PLAN.md` for interview/pilot sequence.
2. `UX_AND_PAYMENTS_FLOW.md` for product and checkout flow.
3. `TASKMARKET_COMPATIBILITY.md` for Daydreams comparison and upgrade deltas.
4. `ALTERNATIVES_AND_VARIANTS.md` for strategic options.
