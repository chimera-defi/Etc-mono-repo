## Intelligence Exchange UX and Payments Flow

## Buyer UX (Happy Path)
1. Buyer signs in and creates a workspace.
2. Buyer defines job profile:
   - budget limits
   - turnaround/SLA target
   - quality threshold
   - policy/risk profile
3. Buyer selects payment rails and funding limits.
4. Buyer submits jobs via UI or API queue endpoint.
5. Buyer gets real-time dashboard:
   - queue status
   - acceptance/rework rates
   - spend and payout ledger
   - failure/retry events

## Worker Operator UX (Happy Path)
1. Worker operator creates account and verifies identity.
2. Worker operator installs worker app (desktop/server).
3. Worker config setup:
   - execution mode (`manual`, `scheduled`, `autonomous`)
   - backend connector (`local CLI` or `API key`)
   - allowed task classes
   - budget and runtime guardrails
4. Worker starts heartbeat and begins pulling eligible jobs.
5. Worker receives job bundle, executes, and submits outputs automatically.
6. Worker operator tracks:
   - accepted jobs
   - rejection/rework reasons
   - earnings and payout schedule

## MVP Execution Cadence
1. Manual mode first for onboarding and trust calibration.
2. Scheduled mode next (night/weekend windows).
3. Autonomous mode after quality and abuse thresholds stabilize.

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
   - per-job cap
   - approved job categories
   - required minimum quality score
3. Buyer confirms funding and receives route token/credentials.
4. Broker starts metering and displays running budget burn.

## Risk Controls in UX
1. Explicit warnings when job type exceeds worker trust tier.
2. Auto-pause toggles on anomalous spend or rejection spikes.
3. Review gates for high-risk categories and new workers.
4. Kill switch for buyers and workers.

## Notes
This flow is designed around fulfillment of execution jobs and measured output acceptance, not tokenized credit transfers.
