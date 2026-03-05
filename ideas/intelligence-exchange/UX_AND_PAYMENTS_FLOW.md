## Intelligence Exchange UX and Payments Flow

## Buyer UX (Happy Path)
1. Buyer signs in and creates a workspace.
2. Buyer connects routing profile:
   - budget limits
   - latency/SLA targets
   - policy profile
3. Buyer selects payment rails and funding limits.
4. Buyer points SDK/API base URL to the exchange gateway.
5. Buyer gets real-time dashboard:
   - spend
   - route quality
   - failure/fallback events

## Seller UX (Happy Path)
1. Seller creates provider profile and verifies identity/business details.
2. Seller installs lightweight adapter and declares capabilities.
3. Seller configures pricing, quotas, and SLA commitments.
4. Seller passes compliance checks and goes live in marketplace.
5. Seller receives usage + settlement reports and payouts.

## Payment Rails Strategy (MVP -> Phase 2)

### Rail A: Stripe (cards and standard billing)
- Default for broad B2B/B2C checkout compatibility.
- Supports card payments, invoicing, and subscription-like billing patterns.

### Rail B: Agentic commerce rails (ACP)
- Support machine-to-machine purchasing and delegated payment authorization where available.
- Use as optional rail for autonomous agents and enterprise automation workflows.

### Rail C: Crypto/BTC settlement via Strike-style rail (optional)
- Optional settlement/funding rail for users preferring BTC/Lightning style flows.
- Keep this additive; do not make it core for initial GTM.

## Checkout / Funding UX
1. Buyer chooses one or more payment methods.
2. Buyer configures guardrails:
   - daily cap
   - per-request cap
   - approved policy profile
3. Buyer confirms funding and receives route token/credentials.
4. Gateway starts metering and displays running budget burn.

## Risk Controls in UX
1. Explicit warnings when route violates policy profile.
2. Auto-pause toggles on anomalous spend spikes.
3. Required approval gates for higher-risk seller pools.

## Notes
As of 2026-03-05, direct resale of provider credits is frequently restricted by provider terms. This flow is designed around compliant execution and settlement, not credit transfer.
