# Automated Trading System Spec (Excerpt)

- regime-based performance breakdowns
- slippage and spread sensitivity analysis

---

## 1. Goals

- Run the same strategy code across LIVE, DRY_RUN, and REPLAY.
- Make all actions auditable and replayable.
- Ensure crypto is a first-class asset class alongside others.
- Prevent accidental execution (explicit arming + confirmation).

## 2. Non-Goals

- No HFT/colocation scope in v1.
- No fully autonomous execution without human confirmation.

## 3. Modes

- LIVE: real orders to venue.
- DRY_RUN: simulate execution with market data.
- REPLAY: deterministic run over recorded data + decisions.

## 4. Core Components

1. Strategy Engine
2. Decision/Intent Log
3. Execution Router
4. Market Data Adapter
5. Risk + Guardrails
6. Audit + Replay Store

## 4.1 High-Level Architecture

```
Market Data -> Strategy Engine -> Intent Log -> Risk Engine -> Execution Router
                                              |                 |
                                              v                 v
                                         Audit Store        Venue Adapters
                                              |
                                              v
                                           Replay
```

### Responsibilities

- Strategy Engine: generates intents only.
- Risk Engine: enforces limits and safety gates.
- Execution Router: stages orders, handles confirmation, routes to venues.
- Audit Store: append-only decision/intent/order/fill log.
- Replay: deterministic re-run using stored logs + market data.

## 4.2 Deployment Topology (Draft)

### Single-Box MVP

- All services on one host.
- Local append-only log store.
- One config file + env secrets.

### Split Services (Phase 2)

- Strategy Engine + Risk + Router as separate services.
- Shared append-only log store (object storage or DB).
- Dedicated market data ingestion service.

## 4.3 Data Retention

- Raw market data: 30–90 days (configurable).
- Decision/intent/order/fill logs: indefinite (append-only).
- Snapshots for REPLAY: keep for each production run.

## 4.4 Architecture Diagrams

### Mode Flow (LIVE/DRY_RUN/REPLAY)

```
          +-------------------+
          |   Market Data     |
          +---------+---------+
                    |
                    v
          +-------------------+
          |  Strategy Engine  |
          +---------+---------+
                    |
                    v
          +-------------------+
          |   Intent Log      |
          +---------+---------+
                    |
                    v
          +-------------------+      +------------------+
          |   Risk Engine     +----->|   Kill Switch    |
          +---------+---------+      +------------------+
                    |
          +---------+---------+
          | Execution Router  |
          +----+---------+----+
               |         |
      LIVE ----+         +---- DRY_RUN/REPLAY
               |                      |
               v                      v
        +-------------+        +---------------+
        |  Venues     |        |  Sim Engine   |
        +-------------+        +---------------+
```

### Data Lineage (Audit + Replay)

```
Decision -> Intent -> Order -> Fill
    |         |         |        |
    +---------+---------+--------+
              |
              v
        Audit Store
              |
              v
            Replay
```

## 4.5 Architecture Refinements (Research-Driven)

- Introduce a Market Data Ingestion service (normalize, timestamp, dedupe).
- Add a Position/Portfolio service as a single source of truth.
- Add a Reconciliation worker (orders/positions vs venue state).
- Separate Execution Orchestrator from Venue Adapters (clean boundary).
- Make Audit Store append-only with schema versioning.
- Add an Order State Machine with idempotency keys.
- Establish a Time Sync/Clock source (monotonic + venue timestamps).
- Add Circuit Breakers (global and per-strategy) with cooldowns.
- Add a Slippage/Impact Modeler to feed risk checks.
- Ship metrics to an Observability pipeline (latency, rejects, drift).

## 4.6 Arbitrage Loop (Cross-Venue)

```
Price Gap Detector -> Inventory Check -> Risk Gate -> Execute Leg A
                                         |                 |
                                         v                 v
                                  Execute Leg B      Rebalance/Transfer
```

Key constraints:
- Fees + latency determine viable spread.
- Inventory/transfer friction limits throughput.
- Partial fills must trigger immediate hedge or cancel.

## 10. Venue Adapter Contract (Draft)

Adapters must implement:

```
connect()
subscribe_market_data(assets)
place_order(order)
cancel_order(order_id)
get_open_orders()
get_positions()
get_balances()
```

Adapter outputs must include:
- venue order id
- standardized error codes
- latency metrics (request/ack/fill)

## 11. Error Taxonomy (Draft)

- `MARKET_DATA_STALE`
- `INSUFFICIENT_BALANCE`
- `ORDER_REJECTED`
- `RATE_LIMITED`
- `VENUE_UNAVAILABLE`
- `INVALID_ORDER`
- `RISK_BLOCKED`

## 12. Risk Policy Matrix (Draft)

| Policy | Scope | Threshold | Action |
|--------|-------|-----------|--------|
| Max position | per-asset | config | block |
| Loss kill-switch | per-strategy | config | halt + alert |
| Portfolio loss limit | global | config | halt all |
| Drawdown throttle | per-strategy | config | reduce size |
| Latency breach | per-venue | config | block new orders |
| Max daily loss | global | config | block + kill |
| Max trade size | per-order | config | block |
| Slippage | per-order | config | block |
| Cooldown | per-strategy | config | delay |

## 13. Audit Report Templates

### Daily Summary

- Mode: LIVE/DRY_RUN/REPLAY
- Total intents/orders/fills
- PnL (gross/net)
- Top slippage outliers
- Risk blocks triggered
- Regime-based performance breakdown (trend/mean-revert/high-vol)

### Incident Report

```
Date:
Duration:
Impact:
Root cause:
Mitigation:
Follow-up actions:
```

## 14. Open Questions

- Target venues for v1 (CEX, DEX, or both)?
- Required latency budget for LIVE?
- Required data depth (L1 vs L2)?
- Compliance constraints (KYC, jurisdiction, audit trail retention)?

## 15. Security + Safety

- No API keys in logs or configs.
- Separate read-only and trade keys.
- Per-venue allowlist for assets.
- Mandatory human confirmation in LIVE.
- Automated kill loops on large losses with cooldown.
- Auto-recovery requires human re-arming in LIVE.

## 16. Testing Strategy

- Unit: strategy logic, risk checks.
- Integration: adapter sandbox + simulated fills.
- Replay: deterministic run comparison.
- Chaos: dropped market data, venue timeouts.
- Shadow mode: mirror LIVE inputs without execution.
- Property tests: state machine transitions + idempotency.
- End-to-end: local harness with replayed feeds + simulated venue.
- E2E invariants: no execution without arming + confirmed intent.
- Disaster drills: trigger loss limits + verify auto-halt + recovery flow.

## 16.1 Recovery + Restart Procedure (Draft)

1. Auto-halt triggers (loss limit, latency breach, venue down).
2. System enters SAFE mode: stop new orders, allow cancels/hedges only.
3. Operators review audit logs + reconciliation report.
4. Required checks before re-arming:
   - Risk limits reset/confirmed.
   - Positions reconciled to venue state.
   - Market data freshness restored.
   - Any incident report drafted.
5. Human re-arming required for LIVE.

## 17. Research Notes (TODO)

## 17.1 Research Sources (Initial)

ArXiv:
- Backtest of Trading Systems on Candle Charts: http://arxiv.org/abs/1412.5558v1
- Correctness of Backtest Engines: http://arxiv.org/abs/1509.08248v1
- Limit Order Book Dynamics in Matching Markets (spread + slippage): http://arxiv.org/abs/2511.20606v2
- Event-Driven LSTM for Forex Price Prediction: http://arxiv.org/abs/2102.01499v1
- Trade the Event (event-driven trading): http://arxiv.org/abs/2105.12825v2
- Building Trust Takes Time: Limits to Arbitrage for Blockchain-Based Assets: http://arxiv.org/abs/1812.00595v4
- Arbitrageurs' profits, LVR, and sandwich attacks: http://arxiv.org/abs/2307.02074v6

Online:
- FIX Trading Community (protocol standards): https://www.fixtrading.org/standards/
- Binance API docs (order lifecycle + status fields): https://binance-docs.github.io/apidocs/spot/en/
- Coinbase Advanced Trade API docs: https://docs.cloud.coinbase.com/advanced-trade-api/docs
- Jane Street Blog (engineering culture/context): https://blog.janestreet.com/
- Jane Street Open Source (Core/Async tooling): https://opensource.janestreet.com/

### Market Microstructure
- Slippage models for L1 vs L2 data.
- Impact of spread regime on fill probability.
- Order book resiliency vs volatility spikes.

### Replay/Determinism
- Event ordering guarantees in multi-venue runs.
- Handling partial fills deterministically.
- Clock source and time sync best practices.

### Execution Risk
- Idempotency keys and retry safety.
- Reconciliation patterns for exchange state drift.
- Key management best practices and rotation cadence.

## 18. Arbitrage System Design Notes (Draft)

- Cross-venue price capture requires strict fee + latency modeling.
- Inventory constraints matter: prefund assets and track net exposure.
- Transfer times (on-chain or fiat rails) are critical for sustained arb.
- Spread capture must include adverse selection and partial fills.
- Risk: stale quotes or slow cancels can flip expected profit to loss.

## 19. Jane Street-Inspired Engineering Principles (Public Sources)

- Emphasize correctness and rigorous testing (open-source Core/Async).
- Prefer deterministic systems for replayability and auditability.
- Treat tooling and observability as first-class (engineering culture).
- Keep systems simple and composable; avoid hidden side effects.

## 20. Telegram Control Plane (Optional)

Purpose: allow human-in-the-loop commands without bypassing safety.

### Commands (Draft)

- `/status` -> system health + mode
- `/arm <ttl>` -> arm LIVE for a limited window
- `/disarm` -> revoke arming immediately
- `/intent <strategy> <params>` -> stage intent (no execution)
- `/confirm <intent_id>` -> confirm a staged intent (LIVE only)

### Safety Gates

- Allowlist of chat/user IDs only.
- Require two-step confirmation for LIVE.
- Enforce intent hash confirmation (must match stored intent).
- Rate limit commands + lockout on abuse.

## 5. Strategy Interface (Draft)

Strategies should emit an intent without direct execution:

```
on_tick(ctx) -> [Intent]
on_fill(ctx, fill) -> [Intent]
```

Where `Intent` includes:
- asset, side, size, limit/market
- time-in-force
- risk tags and rationale

## 6. Execution Pipeline

1. Strategy emits intent.
2. Risk engine validates intent.
3. Execution router stages order.
4. Human confirmation required (LIVE only).
5. Order sent to venue.
6. Fill/cancel results recorded.

## 7. Risk + Guardrails (Minimum)

- Max position size per asset.
- Max daily loss (global + per strategy).
- Kill switch (global and per strategy).
- Time-based cooldown after drawdown.
- Prevent order spam (rate limits).

## 8. Data + Logging

- Every decision/intent/order/fill is logged.
- All logs include mode, timestamp, strategy id, version hash.
- REPLAY uses the exact same log format.

## 8.1 Data Schemas (Draft)

```
Decision {
  id, ts, mode, strategy_id, version_hash,
  inputs_ref, rationale, tags[]
}

Intent {
  id, ts, mode, strategy_id, version_hash,
  asset, side, qty, order_type, limit_price,
  tif, urgency, risk_tags[], rationale_ref
}

Order {
  id, ts, mode, venue, asset, side, qty,
  order_type, limit_price, tif, status,
  intent_id, correlation_id
}

Fill {
  id, ts, mode, venue, asset, side, qty,
  price, fees, order_id, intent_id
}
```

## 8.2 Replay Determinism

- Record market data snapshots with sequence numbers.
- Use a fixed clock source in REPLAY (no wall time).
- Deterministic random seeds per run.
- Strategy version hash pinned for every run.

## 8.3 Slippage + Spread Sensitivity

- Pre-trade estimate: expected slippage by size and spread regime.
- Post-trade: compute realized slippage vs estimate.
- Break down by venue, asset, and time bucket.
- Guardrail: block if estimated slippage exceeds threshold.

## 8.4 Market Data Requirements

- Level 1 (best bid/ask, last trade).
- Optional Level 2 depth for slippage modeling.
- Time sync across feeds (NTP requirement).
- Drop/lag detection with fallback.

## 8.5 Strategy Versioning

- Strategy code hash stored with each decision.
- Config hash stored with each run.
- Strategy inputs referenced by content address.

## 8.6 Execution Safety

- Explicit arm token required for LIVE.
- Confirmation step requires matching intent hash.
- One-shot arming with TTL (auto-expire).

## 8.7 Config + Environment

- Single config file per run.
- Mode-specific overrides allowed but logged.
- Secrets via env or vault; never in config files.

## 8.8 Asset Model (Crypto First-Class)

- Unified asset schema with venue-specific adapters.
- Chain/network metadata stored with asset.
- Fee model supports maker/taker + gas.

## 8.9 Backtesting + Replay

- Backtest uses same pipeline as DRY_RUN.
- Replay reads Decision + Intent logs as source.
- Same event ordering in DRY_RUN and REPLAY.

## 9. Acceptance criteria

The system is complete when:
1. The same strategies run unmodified in LIVE, DRY_RUN, and REPLAY modes.
2. No execution can occur without explicit arming and confirmation.
3. Strategies can be added without modifying execution code.
4. Crypto trading functions as a first-class asset class.
5. All decisions, intents, orders, and commands are auditable and replayable.

---

End of SPEC
