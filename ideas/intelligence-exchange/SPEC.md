## Intelligence Exchange Technical Spec (MVP)

### Summary
Build a policy-aware AI execution exchange with:
1. buyer request gateway,
2. seller capacity registry,
3. metering/settlement ledger,
4. compliance/risk controls,
5. SLA-driven routing.

### System Components

### 1) Buyer Gateway API
- OpenAI-compatible and native APIs.
- Request metadata: latency budget, cost ceiling, policy profile, required model class.
- Returns: result + route + cost + provider trace ID.
- Billing metadata hooks for card/invoice and agentic checkout rails.

### 2) Seller Node / Adapter
- Declares capabilities and prices.
- Publishes health and throughput telemetry.
- Enforces signed usage attestations for settlement.

### 3) Routing Engine
- Multi-objective routing: cost, latency, reliability, policy fit.
- Fallback chain across sellers/providers.
- Hard rejects for policy mismatch.

### 4) Ledger + Settlement
- Immutable usage records per request.
- Netting window (daily/weekly) and payout orchestration.
- Dispute workflow with replayable traces.
- Multi-rail settlement abstraction (fiat first, optional agentic and crypto rails).

### 5) Risk/Compliance Layer
- Account and workload risk scoring.
- Abuse filters and rate controls.
- Policy engine for prohibited resale/account-sharing patterns.
- Payment-risk checks (funding source, velocity spikes, dispute anomaly flags).

### Data Model (MVP)
- `BuyerAccount`
- `SellerAccount`
- `Offer` (model class, price, SLA)
- `ExecutionRecord` (tokens, latency, status, trace)
- `SettlementBatch`
- `DisputeCase`

### APIs (MVP)
1. `POST /v1/chat/completions` (gateway)
2. `POST /v1/offers` (seller)
3. `GET /v1/offers` (market data)
4. `GET /v1/executions/:id`
5. `GET /v1/settlements/:batchId`
6. `POST /v1/disputes`
7. `POST /v1/funding-methods`
8. `POST /v1/funding-guards`

### Security
1. Signed request and response envelopes.
2. Strict tenant isolation.
3. Immutable audit trail for all routing and settlement decisions.
4. Secret handling with short-lived credentials.

### Reliability Targets (Initial)
1. P95 gateway overhead < 120ms.
2. Successful fallback within one retry path for transient failures.
3. Settlement ledger exactly-once write semantics.

### Phase Plan
1. Phase 1: centralized marketplace + managed routing.
2. Phase 2: seller-side attestation agents + automated dispute scoring.
3. Phase 3: advanced SLA tiers and enterprise policy packs.

### Build Cost Categories
1. Core platform engineering (gateway, ledger, routing).
2. Compliance and risk tooling.
3. Observability and billing infrastructure.
4. Marketplace operations (seller onboarding, QA, dispute handling).

### Decision Note
Do not implement credit resale primitives. Keep architecture anchored to compliant execution supply.

### Related Docs
1. `UX_AND_PAYMENTS_FLOW.md`
2. `VALIDATION_PLAN.md`
3. `ALTERNATIVES_AND_VARIANTS.md`
