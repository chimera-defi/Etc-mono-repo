## Architecture Decisions (Intelligence Exchange)

## Decision 1: Event-Sourced Usage Ledger — Postgres append-only
- Choice: Postgres with append-only event records for the execution ledger.
- Why: Replayability for disputes and financial reconciliation; no additional infrastructure.
- Tradeoff: Application code must enforce append-only discipline; no database-level guarantee.

## Decision 2: Broker API — Hono + Bun
- Choice: Hono (TypeScript) on Bun for the broker API.
- Why: Consistent with project defaults; lightweight for a queue-and-route style service.
- Tradeoff: Bun ecosystem is younger. Fall back to Fastify/Node if production issues arise.

## Decision 3: Job Queue — BullMQ + Redis
- Choice: BullMQ (Redis-backed) for job queueing, claim leasing, and retry logic.
- Why: BullMQ has robust claim-with-timeout semantics needed for the lease/expire lifecycle. Proven at scale.
- Tradeoff: Redis is an additional infrastructure dependency.

## Decision 4: Worker Daemon — TypeScript CLI (Bun)
- Choice: Worker ships as a TypeScript CLI (`bunx iex-worker start`) for MVP; Electron app is Phase 2.
- Why: Fastest path for developer-first supply onboarding; CLI is already familiar to the target audience.
- Tradeoff: Workers must manage their own process uptime (`pm2`, `systemd`); always-on mode requires external process management.

## Decision 5: Worker Connectors — BYOK (Bring Your Own Key)
- Choice: Workers supply their own API keys. MVP ships two connectors:
  1. **Anthropic connector** (Claude API via BYOK).
  2. **OpenAI-compatible connector** (OpenAI, Together, Groq, etc.).
- Why: Platform avoids holding provider credentials. Worker economics: payout must exceed worker compute cost or adoption fails.
- Tradeoff: Worker job economics depend on their negotiated model pricing vs. the job payout floor. Platform must set minimum payout rates high enough to ensure margin after compute.
- Open: see OPEN_QUESTIONS.md Q2.

## Decision 6: Payments — Stripe Connect (marketplace payouts)
- Choice: Stripe Connect for buyer charging and worker payouts.
- Why: Handles marketplace KYC/KYB, pay-out rails, and dispute tooling out of the box.
- Tradeoff: Workers must complete Stripe KYC before receiving payouts; non-trivial onboarding step for international workers.
- Open: see OPEN_QUESTIONS.md Q5.

## Decision 7: Curated Seller Pool for MVP
- Choice: Curated worker onboarding (application + review) instead of open marketplace.
- Why: Controls quality and compliance at launch; open pools risk Sybil spam.
- Tradeoff: Slower supply growth; requires manual review pipeline.

## Decision 8: Policy Engine as First-Class Service
- Choice: Explicit policy checks (task class, worker trust tier, budget cap, provider compliance) before any claim is issued.
- Why: Compliance is core differentiation; must be server-side enforced.
- Tradeoff: Additional latency per claim; policy rules eventually need an admin UI.

## Decision 9: Fallback Routing Mandatory
- Choice: Every job must have a fallback path (requeue or managed escalation) if the primary worker fails.
- Why: Reliability SLO (≥95% completion) requires resilience against single-worker failure.
- Tradeoff: More complex routing logic and higher test coverage burden.

## Decision 10: MVP Task Types — Constrained to Scorable Code Tasks
- Choice: MVP supports only task classes with automated quality scoring:
  1. **Code review** (score: lint pass/fail, test coverage delta, static analysis findings).
  2. **Test generation** (score: test count added, pass rate, coverage delta).
  3. **PR summary** (score: key facts retained vs. diff, structured output validation).
- Why: Quality scoring is the platform's trust mechanism. Tasks that cannot be auto-scored require expensive human review at scale and delay marketplace trust.
- Tradeoff: Limits initial TAM to developer workflows. Open-ended tasks (writing, analysis) are Phase 2 after human review lanes are built.
- Open: see OPEN_QUESTIONS.md Q1.

## Decision 11: Protocol Adapter Layer (V2)
- Choice: Adapter interfaces for payments, identity, and A2A messaging in V2.
- Why: Enables agent-first interoperability without hard-coupling to one rail.
- Tradeoff: More integration and conformance testing complexity.

## Decision 12: Task Market Modes (V2 — MVP is `claim` only)
- Choice: MVP supports `claim` mode exclusively. V2 adds `bounty`, `benchmark`, and `auction`.
- Why: `claim` (exclusive lease to one worker) is the simplest correct model for MVP.
- Tradeoff: `claim` semantics are harder to migrate off of if bounty/auction modes require protocol changes.

## Decision 13: Deterministic State/Action Contract (V2)
- Choice: Machine-readable state transitions for autonomous workers in V2.
- Why: Improves reliability, replayability, and auditability for fully automated agent execution.
- Tradeoff: Tighter contract constraints and migration overhead from V1 manual/scheduled modes.
