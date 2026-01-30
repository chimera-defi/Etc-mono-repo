# Automated Trading System Implementation Plan

## Phase 0: Repo + Interfaces (Week 1)

- Create folder layout: `docs/`, `src/`, `data/`, `tests/`
- Lock spec v0.1 and define schemas for Decision/Intent/Order/Fill
- Draft adapter interface + error taxonomy
- Choose first venue(s) and data source(s)
- Review research sources in `SPEC.md` and capture gaps

## Phase 1: Deterministic Core (Week 2-3)

- Strategy interface scaffolding
- Intent logging (append-only)
- Order state machine + idempotency keys
- Risk engine with basic limits
- DRY_RUN pipeline with simulated fills
- REPLAY runner using stored logs

## Phase 2: Operational Readiness (Week 3-4)

- Data retention + replay dataset management
- Time sync + latency budget definition
- Observability: SLIs/SLOs, alerts, dashboards
- Security ops: key rotation + access reviews
- Runbooks: incident, kill-switch, recovery
- Validation gates for new strategy/venue

## Phase 3: Live Safety Harness (Week 4)

- Arming flow + confirmation gate
- LIVE routing behind feature flag
- Kill switch (global + per-strategy)
- Slippage/spread estimator and guardrail
- Time sync + clock discipline

## Phase 4: Audit + Reporting (Week 5)

- Audit log storage + indexing
- Daily summary + incident template output
- Replay validation report

## Phase 5: Venue Adapter (Week 6)

- Implement first adapter with:
  - order placement
  - cancels
  - fills
  - balances
- Error mapping + rate limiting
- Latency metrics

## Phase 6: Hardening (Week 7-8)

- Chaos tests: timeouts, stale data, partial fills
- Determinism checks across REPLAY runs
- Risk matrix review
- Shadow mode validation against LIVE feeds
- E2E disaster drills (loss halt + recovery)
- AI regression checklist for risk/exec changes

## Phase 7: Iteration Backlog (Post-MVP)

- Portfolio-level netting + exposure caps
- Smart order routing policies
- Adaptive risk limits by regime
- Execution cost model calibration
- Cross-venue latency arbitrage detection
- LLM-assisted signals (offline evaluation only)

## Deliverables Checklist

- [ ] `SPEC.md` v0.1 signed
- [ ] Log schemas + versioning
- [ ] Strategy interface + sample strategy
- [ ] DRY_RUN and REPLAY parity
- [ ] LIVE safety gates
- [ ] Order state machine + idempotency
- [ ] First adapter + tests
- [ ] Audit report outputs
- [ ] Arbitrage checklist (fees, latency, inventory, transfers)
