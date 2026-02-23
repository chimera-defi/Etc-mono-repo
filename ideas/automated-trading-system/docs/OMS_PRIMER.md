## OMS Primer (Order Management System) for Crypto/Futures Bots

### What is an OMS?
An **Order Management System (OMS)** is the component that **owns the truth of order + execution state** and provides a safe API for placing/canceling/modifying orders. In trading firms, “OMS” often overlaps with (or is paired with) an **Execution Management System (EMS)**; the exact naming varies, but the core idea is consistent:

- **Strategy decides** *what it wants* (intents).
- **Risk decides** *what is allowed* (limits).
- **OMS decides** *what is safe to do right now* given asynchronous reality (order lifecycle, fills, feed health, reconciliation).

For volatile futures venues, the OMS is where you put safeguards that prevent “flip-flop” incidents: **dirty position gating**, **fill-sum vs snapshot reconciliation**, **sequence-gap detection**, and **order spam suppression**.

### OMS vs EMS vs “OEMS” (terminology)
You’ll see a few names in the wild:
- **OMS**: order lifecycle + order state (accepted/rejected/working/canceled/filled).
- **EMS**: execution-focused layer (routing/slicing/algos), often tightly coupled to OMS in practice.
- **OEMS**: “order + execution management system” (common vendor phrasing), basically OMS+EMS together.

### Why didn’t we have an OMS “before”?
Early-stage trading bots typically start with:
- strategy code calling the venue API directly (e.g., `ccxt.create_order`)
- a small amount of local state (open orders list, last position snapshot)

That works until you hit any of these:
- multiple async streams (fills, orders, positions) that can arrive out of order
- intermittent WS drops + delayed REST snapshots
- partial fills + cancel/replace loops
- rate-limit or transient API errors with retries
- multiple strategies/instruments/venues sharing one account

At that point, “order placement” stops being a trivial RPC call and becomes a **state machine problem**. If you don’t isolate that problem into an OMS, flip-flop bugs tend to appear as order spam and risk-limit violations.

### How are OMS systems generally constructed?
Common production pattern is **event-driven, single-writer state**:

- **Event sources**
  - WS streams: market data, fills, order updates, position updates
  - REST snapshots: positions/open orders (used for reconciliation and recovery)
  - Optional order-entry session/protocol (FIX on some venues/brokers)
- **State ownership**
  - OMS maintains an internal **Order State Machine** and **Position/Inventory SSOT**
  - Reconciliation worker corrects drift and triggers SAFE mode on mismatch
- **Control plane**
  - arming/confirmation gates for LIVE
  - kill switch / SAFE mode (stop new orders, allow cancels/hedges)
- **Observability**
  - audit log (append-only), metrics, alerts

### Common “real OMS” features you should expect
Beyond place/cancel, many practical OEMS tools include:
- **Order tracking via multiple channels** (e.g., an order-entry channel plus separate REST/WS for tracking and market data).
- **Order preview / cost estimation**: estimate slippage/fees/commission before sending.
- **Fat-finger protection**: notional caps, and blocking “overly marketable” limit orders.
- **Local order book view** for strategies that depend on microstructure (best bid/ask and depth).

### Typical high-level components (what firms usually have)
- **Market Data Ingestion**: normalize, dedupe, timestamps/sequence.
- **Strategy Engine**: emits intents only.
- **Risk Engine**: pre-trade risk checks and limits.
- **Execution Router**: converts intents into order plans (e.g., ladder, slice, venue choice).
- **OMS (safety-critical boundary)**:
  - order API (place/cancel/replace)
  - order state machine + idempotency keys
  - per-instrument throttles / rate limiting
  - feed health gating (WS staleness)
  - position/inventory SSOT:
    - running fill-sum
    - dirty flags
    - open-order exposure projection (common next step)
  - reconciliation (REST snapshots vs internal SSOT)
  - SAFE mode + alerts
  - audit event emission
- **Venue Adapters**: venue-specific mapping, WS + REST.
- **Audit + Replay Store**: append-only logs, deterministic replay runner.
- **Observability/Alerting**: dashboards + paging.

### Mapping to this repo (current)
- **OMS implementation scaffold**: `src/ats/trading/oms.py`
- **Audit log**: `src/ats/trading/audit.py` (JSONL append-only)
- **Adapter contract**: `src/ats/trading/venue.py`
- **ccxt.pro adapter skeleton**: `src/ats/trading/ccxt_pro_adapter.py` (requires venue-specific position semantics verification)
- **Safeguard tests**: `tests/test_oms_safeguards.py`

### References (public)
- Mark Best (Quantitative Trading), “Hidden Dangers of Writing an OMS” (flip-flop bugs, positions vs orders): `https://markrbest.github.io/positions-and-orders/`
- FIX Trading Community standards (protocol ecosystem used broadly for order routing): `https://www.fixtrading.org/standards/`
- Coinbase samples `trader-shell-go` README (example OEMS features: FIX trading, REST order tracking, WS order book, fat-finger protection): `https://github.com/coinbase-samples/trader-shell-go`

