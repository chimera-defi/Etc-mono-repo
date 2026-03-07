## Architecture Decisions (Intelligence Exchange)

## Decision 1: Event-Sourced Usage Ledger
- Choice: event-sourced immutable ledger for execution records.
- Why: replayability for disputes and financial reconciliation.
- Tradeoff: increased implementation complexity.

## Decision 2: Curated Seller Pool for MVP
- Choice: curated onboarding instead of open marketplace.
- Why: control quality/compliance at launch.
- Tradeoff: slower supply growth.

## Decision 3: Stripe-First Billing
- Choice: mainstream billing first, optional rails later.
- Why: fastest path to real pilots and predictable ops.
- Tradeoff: less immediate flexibility for crypto-native flows.

## Decision 4: Policy Engine as First-Class Service
- Choice: explicit policy checks before route execution.
- Why: compliance is core differentiation.
- Tradeoff: additional latency and rule maintenance.

## Decision 5: Fallback Routing Mandatory
- Choice: enforce fallback path for eligible workloads.
- Why: reliability objective requires resilience.
- Tradeoff: more complex routing and higher testing burden.

## Decision 6: Protocol Adapter Layer (V2)
- Choice: introduce adapter interfaces for payments, identity, and A2A messaging.
- Why: enables agent-first interoperability without hard-coupling to one rail/protocol.
- Tradeoff: more integration and conformance testing complexity.

## Decision 7: Explicit Task Market Modes (V2)
- Choice: support `claim`, `bounty`, `benchmark`, and `auction` modes.
- Why: improves liquidity and fit for different workload classes.
- Tradeoff: additional market policy and abuse-surface complexity.

## Decision 8: Deterministic State/Action Contract (V2)
- Choice: require machine-readable state transitions for autonomous workers.
- Why: improves reliability, replayability, and auditability for agent execution.
- Tradeoff: tighter contract design constraints and migration overhead.
