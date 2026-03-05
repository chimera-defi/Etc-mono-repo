## Intelligence Exchange Architecture Diagrams

## 1) High-Level Value Flow

```text
Buyer Workload
   -> Gateway Router
      -> Best-Fit Seller/Provider
         -> Result Returned
            -> Metering + Settlement Ledger
               -> Buyer Billing + Seller Payout
```

## 2) Control Planes

```text
Policy Plane: compliance rules, risk scoring, usage guardrails
Routing Plane: cost/latency/SLA-aware route selection and fallback
Settlement Plane: immutable usage records, netting, payouts, disputes
```

## 3) MVP Component Map

```text
[Buyer SDK/API]
     |
[Gateway API] -- [Routing Engine] -- [Seller Adapter Pool]
     |                  |                    |
     |                  v                    v
     |            [Risk/Policy]         [Telemetry]
     v
[Usage Ledger] -- [Settlement Service] -- [Billing/Payout Rails]
```

## 4) Failure and Recovery Path

```text
Primary route fails
   -> fallback route
      -> success => mark degraded path in telemetry
      -> fail => return controlled error + audit event
```

## 5) Payment Rails (Phased)

```text
Phase 1: Stripe/Card/Invoice
Phase 2: Agentic rail (ACP-style delegated payments)
Phase 3: Optional crypto/BTC settlement rail
```
