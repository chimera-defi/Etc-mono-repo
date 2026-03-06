## Intelligence Exchange Architecture Diagrams

## 1) High-Level Value Flow

```text
Buyer Job
   -> Broker Queue
      -> Worker Claim
         -> Worker Executes (local CLI or API backend)
            -> Result + Trace Returned
               -> Quality Scoring + Acceptance
                  -> Ledger + Settlement
                     -> Buyer Charge + Worker Payout
```

## 2) Control Planes

```text
Job Plane: submit, package, queue, claim, execute, complete
Quality Plane: validate outputs, score quality, route to review/dispute
Settlement Plane: immutable records, netting, payouts, chargebacks
Trust Plane: identity, reputation, abuse controls, worker risk limits
```

## 3) MVP Component Map

```text
[Buyer API/SDK]
      |
[Broker API + Queue] -- [Matcher/Claims] -- [Worker Registry]
      |                         |                   |
      v                         v                   v
[Prompt Packager]        [Quality Scorer]    [Worker Daemon]
      |                         |                   |
      v                         v                   v
[Execution Ledger] ------ [Dispute Service] -- [Payments/Payouts]
```

## 4) Worker Runtime (Local + Hosted)

```text
[Worker Daemon]
   -> Auth + Heartbeat
   -> Pull Claim Token
   -> Fetch Job Bundle
   -> Execute via Connector:
        - Local CLI connector (agent toolchain)
        - API connector (cloud key)
   -> Submit Output + Trace
   -> Receive Accept/Retry/Reject
```

## 5) Failure and Recovery Path

```text
Worker claim expires or execution fails
   -> job requeued
      -> alternate worker claim
         -> success => settle accepted output
         -> repeated failure => escalate to managed review lane
```

## 6) Autonomy Cadence

```text
Phase 1: Manual start + fixed schedule windows
Phase 2: Always-on daemon with pause/budget caps
Phase 3: Idle-aware autonomous mode + policy guardrails
```

## 7) Payment Rails (Phased)

```text
Phase 1: Stripe/Card/Invoice (default)
Phase 2: Agent commerce delegated payments (ACP-style)
Phase 3: Optional crypto/BTC settlement
```
