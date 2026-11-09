# Polymarket Write/Trading Side Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add a safety-first Polymarket trading/write adapter to `ideas/automated-trading-system` so the existing OMS can place/cancel authenticated Polymarket orders, ingest user fills, reconcile token positions, and remain replayable/auditable.

**Architecture:** Keep the existing OMS as the safety-critical boundary. Add a Polymarket-specific venue adapter and stream runner around the official `polymarket-client` SDK, mapping Polymarket outcome token balances into the existing `asset`/`qty` model. LIVE execution must remain behind explicit arming, environment gates, and human confirmation; unit tests use fakes only.

**Tech Stack:** Python 3.9+, asyncio, existing `ats.trading` OMS, official Polymarket Python SDK package `polymarket-client`, Polymarket CLOB/Gamma/Data APIs, JSONL audit logs, unittest/pytest-compatible tests.

---

## Current Context

Repo inspected: `/home/agents/workspace/Etc-mono-repo`

Relevant existing files:

- `ideas/automated-trading-system/SPEC.md`
  - Defines LIVE / DRY_RUN / REPLAY modes.
  - Requires explicit arming + confirmation for LIVE.
  - Requires append-only decision/intent/order/fill logs.
  - Defines OMS safeguards: dirty-position gating, REST reconciliation, WS health gating, order rate limits, flip-flop detection.
- `ideas/automated-trading-system/src/ats/trading/oms.py`
  - Existing async OMS already supports `place_order`, `cancel_order`, `on_fill`, `on_ws_position_update`, `reconcile_position`, SAFE mode, and audit logging.
- `ideas/automated-trading-system/src/ats/trading/venue.py`
  - Existing minimal `VenueAdapter` protocol has `place_order`, `cancel_order`, and `fetch_position`.
- `ideas/automated-trading-system/src/ats/trading/types.py`
  - Existing `OrderRequest`, `OrderAck`, `FillEvent`, `Mode`, `Side`, `OrderType` map cleanly to Polymarket limit orders, with one caveat for market BUY order quantity semantics.
- `ideas/automated-trading-system/tests/test_oms_safeguards.py`
  - Existing tests cover dirty blocking, reconcile SAFE mode, rate limits, stale WS gating, fill sequence gaps, and flip-flop detection.

Polymarket SDK/API context checked:

- Use official beta `polymarket-client` (`pip install --pre polymarket-client`), not archived `py-clob-client` / `@polymarket/clob-client` repos.
- `AsyncSecureClient.create(private_key=..., wallet=..., credentials=...)` supports authenticated account/trading workflows.
- Relevant SDK methods:
  - `place_limit_order(token_id, price, size, side, post_only=False, expiration=None, builder_code=None)`
  - `place_market_order(token_id, side="BUY", amount=..., max_spend=..., order_type="FAK"|"FOK")`
  - `place_market_order(token_id, side="SELL", shares=..., order_type="FAK"|"FOK")`
  - `cancel_order(order_id=...)`, `cancel_orders(order_ids=...)`, `cancel_all()`, `cancel_market_orders(market=..., token_id=...)`
  - `get_balance_allowance(asset_type="CONDITIONAL", token_id=...)`
  - `subscribe(UserSpec(markets=[...]))` for user order/trade events
  - `subscribe(MarketSpec(token_ids=[...]))` for book/price/market health events
- Polymarket order response has accepted statuses `live`, `matched`, `delayed` and rejected error codes like `not_enough_balance`, `post_only_would_cross`, `fok_not_filled`, `fak_not_filled`.

Key modeling decisions:

1. Treat a Polymarket outcome token ID as the OMS `asset` for v1.
2. Treat `qty` as outcome-token shares for limit orders and market SELL orders.
3. Do **not** silently interpret market BUY `qty` as shares. Market BUY uses USDC spend amount, so add explicit `quote_amount` support or block BUY market orders until explicitly supplied.
4. Polymarket is spot outcome-token trading, not futures. A BUY increases shares of a YES/NO outcome token; a SELL decreases shares. Do not model NO as a negative YES position inside v1 OMS state.
5. User stream trade events are the canonical fill source; REST balance snapshots are reconciliation source.
6. Preserve no-secrets-in-logs. Never log private keys, API secrets, HMAC material, or signed payloads.

---

## Task 1: Add project-local dependency and test configuration

**Objective:** Make the trading-system folder installable/testable without depending on ad-hoc `sys.path` manipulation.

**Files:**

- Create: `ideas/automated-trading-system/pyproject.toml`
- Modify: `ideas/automated-trading-system/tests/README.md`

**Step 1: Create `pyproject.toml`**

Use a minimal package config under the project folder, not repo root:

```toml
[project]
name = "ats-research"
version = "0.1.0"
description = "Safety-first automated trading system research scaffold"
requires-python = ">=3.9"
dependencies = []

[project.optional-dependencies]
polymarket = [
  "polymarket-client",
]
dev = [
  "pytest>=8",
  "pytest-asyncio>=0.23",
]

[tool.pytest.ini_options]
pythonpath = ["src"]
testpaths = ["tests"]
markers = [
  "integration: tests that require external services",
  "metered: tests that can spend funds or mutate live state",
]
```

**Step 2: Update test README**

Add exact commands:

````md
## Local tests

```bash
cd ideas/automated-trading-system
python -m unittest discover -s tests -p 'test_*.py'
```

Optional SDK/dev install:

```bash
cd ideas/automated-trading-system
python -m pip install -e '.[dev,polymarket]' --pre
pytest -q
```

Live/metered Polymarket tests must stay skipped unless both are set:

```bash
POLYMARKET_RUN_METERED_TESTS=1 ATS_ALLOW_LIVE_TRADING=I_UNDERSTAND pytest -m metered
```
````

**Step 3: Verify**

Run:

```bash
cd ideas/automated-trading-system
python -m unittest discover -s tests -p 'test_*.py'
```

Expected: existing OMS tests pass.

---

## Task 2: Make order quantity semantics explicit

**Objective:** Prevent accidental USDC-vs-shares confusion for Polymarket market BUY orders.

**Files:**

- Modify: `ideas/automated-trading-system/src/ats/trading/types.py`
- Modify: `ideas/automated-trading-system/tests/test_oms_safeguards.py` only if constructor call sites need keyword updates; avoid broad rewrites.

**Step 1: Extend `OrderRequest` with optional quote amount**

Add a backwards-compatible optional field at the end of the dataclass:

```python
@dataclass(frozen=True)
class OrderRequest:
    asset: str
    side: Side
    qty: float
    order_type: OrderType
    limit_price: Optional[float] = None
    tif: str = "GTC"
    post_only: bool = False
    reduce_only: bool = False
    intent_id: str = ""
    correlation_id: str = ""
    client_order_id: str = ""
    quote_amount: Optional[float] = None
```

Meaning:

- `qty`: base/outcome-token shares.
- `quote_amount`: quote currency amount, currently used only for Polymarket market BUY spend in USDC.
- Existing OMS position-limit logic still uses `qty`, so market BUY requests must be sized conservatively or disallowed until pre-trade fill estimate converts quote spend into max shares.

**Step 2: Document the invariant in code comments**

Add a short comment near `quote_amount`:

```python
# For venues where market BUY is quote-denominated, e.g. Polymarket BUY by USDC spend.
# Do not use this to bypass OMS position limits; adapters must validate semantics.
quote_amount: Optional[float] = None
```

**Step 3: Verify**

Run:

```bash
cd ideas/automated-trading-system
python -m unittest discover -s tests -p 'test_*.py'
```

Expected: no behavior change for existing tests.

---

## Task 3: Add Polymarket config loader

**Objective:** Centralize all Polymarket environment parsing without logging secrets.

**Files:**

- Create: `ideas/automated-trading-system/src/ats/trading/polymarket_config.py`
- Test: `ideas/automated-trading-system/tests/test_polymarket_config.py`

**Step 1: Add config dataclass**

```python
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class PolymarketConfig:
    private_key: str
    wallet: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    api_passphrase: Optional[str] = None
    allow_live_trading: bool = False
    share_decimals: int = 6
    builder_code: Optional[str] = None


def load_polymarket_config_from_env() -> PolymarketConfig:
    private_key = os.getenv("POLYMARKET_PRIVATE_KEY", "")
    if not private_key:
        raise RuntimeError("Missing POLYMARKET_PRIVATE_KEY")

    return PolymarketConfig(
        private_key=private_key,
        wallet=os.getenv("POLYMARKET_WALLET") or None,
        api_key=os.getenv("POLYMARKET_API_KEY") or None,
        api_secret=os.getenv("POLYMARKET_API_SECRET") or None,
        api_passphrase=os.getenv("POLYMARKET_API_PASSPHRASE") or None,
        allow_live_trading=os.getenv("ATS_ALLOW_LIVE_TRADING") == "I_UNDERSTAND",
        share_decimals=int(os.getenv("POLYMARKET_SHARE_DECIMALS", "6")),
        builder_code=os.getenv("POLYMARKET_BUILDER_CODE") or None,
    )
```

**Step 2: Add tests**

Test cases:

- Missing private key raises.
- `ATS_ALLOW_LIVE_TRADING=I_UNDERSTAND` maps to `True`.
- Any other value maps to `False`.
- `share_decimals` defaults to `6` and can be overridden.
- `repr(config)` must not be used in logs. If safer, mark secret fields `repr=False`.

**Step 3: Verify**

Run:

```bash
cd ideas/automated-trading-system
PYTHONPATH=src python -m unittest tests/test_polymarket_config.py
```

Expected: config tests pass.

---

## Task 4: Add typed adapter exceptions and response mapping helpers

**Objective:** Keep SDK-specific accepted/rejected responses out of the OMS core.

**Files:**

- Create: `ideas/automated-trading-system/src/ats/trading/polymarket_adapter.py`
- Test: `ideas/automated-trading-system/tests/test_polymarket_adapter_mapping.py`

**Step 1: Add exception classes**

```python
class PolymarketAdapterError(Exception):
    pass


class PolymarketOrderRejected(PolymarketAdapterError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(f"{code}: {message}")
        self.code = code
        self.message = message
```

**Step 2: Add status mapper**

Map SDK statuses to existing OMS-style statuses:

```python
def _map_order_status(status: str) -> str:
    normalized = status.lower()
    if normalized == "live":
        return "NEW"
    if normalized == "matched":
        return "MATCHED"
    if normalized == "delayed":
        return "DELAYED"
    return status.upper()
```

Do not mark `MATCHED` as final `FILLED` unless the user trade stream confirms fill size. This avoids double-counting fills.

**Step 3: Add unit tests**

Test:

- `live -> NEW`
- `matched -> MATCHED`
- `delayed -> DELAYED`
- unknown status uppercases
- rejected response maps to `PolymarketOrderRejected` without logging secrets

---

## Task 5: Implement `PolymarketVenueAdapter`

**Objective:** Implement the existing `VenueAdapter` protocol using the official async Polymarket SDK.

**Files:**

- Modify: `ideas/automated-trading-system/src/ats/trading/polymarket_adapter.py`
- Test: `ideas/automated-trading-system/tests/test_polymarket_adapter.py`

**Step 1: Define SDK protocol for fakes**

Use a small protocol so unit tests do not import or network-call the real SDK:

```python
from typing import Any, Protocol

class AsyncPolymarketClientProtocol(Protocol):
    async def place_limit_order(self, **kwargs: Any) -> Any: ...
    async def place_market_order(self, **kwargs: Any) -> Any: ...
    async def cancel_order(self, *, order_id: str) -> Any: ...
    async def get_balance_allowance(self, *, asset_type: str, token_id: str | None = None) -> Any: ...
```

**Step 2: Adapter constructor**

```python
class PolymarketVenueAdapter(VenueAdapter):
    def __init__(
        self,
        client: AsyncPolymarketClientProtocol,
        *,
        mode: Mode,
        share_decimals: int = 6,
        builder_code: str | None = None,
    ) -> None:
        self._client = client
        self._mode = mode
        self._share_decimals = share_decimals
        self._builder_code = builder_code
```

Properties:

```python
@property
def venue(self) -> str:
    return "polymarket"

@property
def mode(self) -> Mode:
    return self._mode
```

**Step 3: Implement `place_order`**

Rules:

- In `Mode.DRY_RUN` / `Mode.REPLAY`, this adapter should not hit Polymarket. Use a fake/sim adapter in those modes instead.
- In `Mode.LIVE`, only proceed if the runner already passed explicit arming/confirmation through OMS.
- Limit order:
  - `token_id = req.asset`
  - `price = Decimal(str(req.limit_price))`
  - `size = Decimal(str(req.qty))`
  - `side = req.side.value`
  - `post_only = req.post_only`
- Market SELL:
  - `shares = Decimal(str(req.qty))`
- Market BUY:
  - require `req.quote_amount is not None`
  - pass `amount = Decimal(str(req.quote_amount))`
  - reject if `req.qty <= 0` is being used as an implicit spend amount

Pseudocode:

```python
from decimal import Decimal
import time

async def place_order(self, req: OrderRequest) -> OrderAck:
    if self._mode != Mode.LIVE:
        raise PolymarketAdapterError("PolymarketVenueAdapter should only be used for LIVE; use fake/sim for DRY_RUN/REPLAY")

    if req.order_type == OrderType.LIMIT:
        if req.limit_price is None:
            raise PolymarketAdapterError("Polymarket limit orders require limit_price")
        resp = await self._client.place_limit_order(
            token_id=req.asset,
            price=Decimal(str(req.limit_price)),
            size=Decimal(str(req.qty)),
            side=req.side.value,
            post_only=req.post_only,
            builder_code=self._builder_code,
        )
    elif req.order_type == OrderType.MARKET:
        if req.side == Side.BUY:
            if req.quote_amount is None:
                raise PolymarketAdapterError("Polymarket market BUY requires quote_amount USDC")
            resp = await self._client.place_market_order(
                token_id=req.asset,
                side="BUY",
                amount=Decimal(str(req.quote_amount)),
                order_type="FAK",
                builder_code=self._builder_code,
            )
        else:
            resp = await self._client.place_market_order(
                token_id=req.asset,
                side="SELL",
                shares=Decimal(str(req.qty)),
                order_type="FAK",
                builder_code=self._builder_code,
            )
    else:
        raise PolymarketAdapterError(f"Unsupported order type: {req.order_type}")

    # Accepted SDK response has ok=True/order_id/status.
    # Rejected response has ok=False/code/message.
    if getattr(resp, "ok", False) is not True:
        raise PolymarketOrderRejected(
            code=str(getattr(resp, "code", "unknown")),
            message=str(getattr(resp, "message", "Order rejected")),
        )

    return OrderAck(
        venue_order_id=str(resp.order_id),
        asset=req.asset,
        side=req.side,
        qty=req.qty,
        order_type=req.order_type,
        limit_price=req.limit_price,
        tif=req.tif,
        status=_map_order_status(str(resp.status)),
        intent_id=req.intent_id,
        correlation_id=req.correlation_id,
        client_order_id=req.client_order_id,
        ts_ms=int(time.time() * 1000),
    )
```

**Step 4: Implement `cancel_order`**

```python
async def cancel_order(self, venue_order_id: str, asset: str) -> None:
    del asset  # Polymarket cancel is by order id.
    resp = await self._client.cancel_order(order_id=venue_order_id)
    if venue_order_id not in getattr(resp, "canceled", ()):
        not_canceled = getattr(resp, "not_canceled", {}) or {}
        reason = not_canceled.get(venue_order_id, "cancel not acknowledged")
        raise PolymarketAdapterError(f"Cancel failed for {venue_order_id}: {reason}")
```

**Step 5: Implement `fetch_position`**

Use `get_balance_allowance(asset_type="CONDITIONAL", token_id=asset)`. The SDK returns base units; convert to shares using one centralized helper.

```python
def _base_units_to_shares(value: int, decimals: int) -> float:
    return float(Decimal(value) / (Decimal(10) ** decimals))

async def fetch_position(self, asset: str) -> PositionSnapshot:
    bal = await self._client.get_balance_allowance(asset_type="CONDITIONAL", token_id=asset)
    qty = _base_units_to_shares(int(bal.balance), self._share_decimals)
    return PositionSnapshot(asset=asset, qty=qty, ts_ms=int(time.time() * 1000))
```

**Step 6: Unit tests**

Use a fake async client. Test:

- Limit BUY maps token/price/size/side/post_only correctly.
- Limit SELL maps correctly.
- Market BUY without `quote_amount` raises.
- Market BUY with `quote_amount` passes `amount` not `size`.
- Market SELL passes `shares`.
- Rejected response raises `PolymarketOrderRejected`.
- Cancel success returns `None`.
- Cancel failure raises.
- `fetch_position` converts base units to shares with `share_decimals=6`.

**Step 7: Verify**

Run:

```bash
cd ideas/automated-trading-system
PYTHONPATH=src python -m unittest tests/test_polymarket_adapter.py tests/test_polymarket_adapter_mapping.py
```

Expected: all adapter unit tests pass without network access.

---

## Task 6: Add SDK client factory

**Objective:** Keep real SDK imports and credential bootstrapping isolated from unit-testable adapter logic.

**Files:**

- Create: `ideas/automated-trading-system/src/ats/trading/polymarket_client_factory.py`
- Test: `ideas/automated-trading-system/tests/test_polymarket_client_factory.py` with monkeypatching only; no network.

**Step 1: Factory function**

```python
async def create_polymarket_secure_client(cfg: PolymarketConfig):
    from polymarket import AsyncSecureClient
    from polymarket.models import ApiKeyCreds

    credentials = None
    if cfg.api_key and cfg.api_secret and cfg.api_passphrase:
        credentials = ApiKeyCreds(
            api_key=cfg.api_key,
            api_secret=cfg.api_secret,
            api_passphrase=cfg.api_passphrase,
        )

    return await AsyncSecureClient.create(
        private_key=cfg.private_key,
        wallet=cfg.wallet,
        credentials=credentials,
    )
```

**Step 2: Tests**

Monkeypatch `polymarket.AsyncSecureClient.create` equivalent import path, or pass an injectable class into the factory. Test:

- Existing API creds are passed when all three are present.
- Partial API creds raise a config error instead of silently deriving.
- Private key and wallet are passed.
- No secret values appear in exception messages.

---

## Task 7: Add Polymarket user/market stream normalization

**Objective:** Feed Polymarket order/trade and market events into OMS health and fill processing.

**Files:**

- Create: `ideas/automated-trading-system/src/ats/trading/polymarket_streams.py`
- Test: `ideas/automated-trading-system/tests/test_polymarket_streams.py`

**Step 1: Add trade-event to `FillEvent` mapper**

User trade payload fields from SDK include:

- `id`
- `taker_order_id`
- `market`
- `token_id`
- `side`
- `size`
- `price`
- `fee_rate_bps`
- `timestamp`
- `transaction_hash`
- `outcome`

Map to:

```python
FillEvent(
    id=payload.id,
    ts_ms=_to_epoch_ms(payload.timestamp),
    venue="polymarket",
    mode=mode,
    asset=str(payload.token_id),
    side=Side.BUY if payload.side == "BUY" else Side.SELL,
    qty=float(payload.size),
    price=float(payload.price),
    fees=0.0,  # v1: fee_rate_bps is not an absolute fee. Add fee calc later.
    order_id=str(payload.taker_order_id),
    intent_id=order_to_intent.get(str(payload.taker_order_id), ""),
    seq=None,
)
```

Do not invent a numeric sequence. The existing OMS dedupes by fill ID when `seq=None`.

**Step 2: Add stream runner**

Pseudocode:

```python
async def run_polymarket_streams(client, oms: OMS, *, token_ids: list[str], markets: list[str], mode: Mode) -> None:
    from polymarket.streams import MarketSpec, UserSpec

    handle = await client.subscribe([
        MarketSpec(token_ids=token_ids, custom_feature_enabled=True),
        UserSpec(markets=markets or None),
    ])
    async for event in handle:
        if getattr(event, "topic", None) == "market":
            token_id = _extract_token_id(event)
            if token_id:
                oms.mark_ws_event(str(token_id))
            continue

        if getattr(event, "topic", None) == "user" and getattr(event, "type", None) == "trade":
            fill = user_trade_event_to_fill(event, mode=mode)
            oms.mark_ws_event(fill.asset)
            oms.on_fill(fill)
```

**Step 3: Health behavior**

- The existing OMS requires a fresh WS event before new orders.
- For Polymarket, market stream events should mark feed health even when the user has not traded recently.
- If no market stream events arrive for `ws_stale_after_s`, OMS blocks new orders and enters SAFE mode as designed.

**Step 4: Tests**

Use fake event objects and fake OMS object. Test:

- Market event calls `mark_ws_event(token_id)`.
- User trade event calls `mark_ws_event(token_id)` and `on_fill(fill)`.
- Duplicate user trade IDs are still safe because OMS dedupes fill IDs.
- Missing/unknown event shapes are ignored and audited by runner, not fatal.

---

## Task 8: Add Polymarket runner example with hard LIVE gates

**Objective:** Provide a runnable reference that wires config, SDK client, adapter, OMS, audit, market stream, and explicit arming.

**Files:**

- Create: `ideas/automated-trading-system/src/examples/polymarket_trader.py`
- Modify: `ideas/automated-trading-system/src/README.md`

**Step 1: Runner structure**

Pseudocode:

```python
async def main() -> None:
    mode = Mode(os.getenv("ATS_MODE", "DRY_RUN"))
    token_ids = [x for x in os.getenv("POLYMARKET_TOKEN_IDS", "").split(",") if x]
    market_ids = [x for x in os.getenv("POLYMARKET_MARKET_IDS", "").split(",") if x]

    audit = AuditLogger(path=os.getenv("ATS_AUDIT_PATH", "ideas/automated-trading-system/.audit/polymarket.jsonl"))
    oms_cfg = load_oms_config_from_env()

    if mode != Mode.LIVE:
        raise RuntimeError("Use fake/simulated adapter for DRY_RUN/REPLAY; this runner is LIVE-only")

    cfg = load_polymarket_config_from_env()
    if not cfg.allow_live_trading:
        raise RuntimeError("Set ATS_ALLOW_LIVE_TRADING=I_UNDERSTAND to enable LIVE Polymarket runner")

    client = await create_polymarket_secure_client(cfg)
    adapter = PolymarketVenueAdapter(
        client,
        mode=mode,
        share_decimals=cfg.share_decimals,
        builder_code=cfg.builder_code,
    )
    oms = OMS(venue=adapter, audit=audit, config=oms_cfg)
    await oms.start()

    # Start market/user streams before allowing arming.
    stream_task = asyncio.create_task(run_polymarket_streams(client, oms, token_ids=token_ids, markets=market_ids, mode=mode))

    # Human confirmation must match a one-shot arm token.
    arm_token = os.getenv("ATS_ARM_TOKEN", "")
    confirm = os.getenv("ATS_CONFIRM_ARM_TOKEN", "")
    if not arm_token or confirm != arm_token:
        raise RuntimeError("LIVE requires matching ATS_ARM_TOKEN and ATS_CONFIRM_ARM_TOKEN")
    oms.arm()

    await stream_task
```

**Step 2: README warning**

Add a bold warning:

- This runner is LIVE-only and can place real orders.
- Do not run without reading the code.
- It requires a funded Polymarket wallet, approvals, and legal/regulatory eligibility.
- It will refuse to run unless `ATS_ALLOW_LIVE_TRADING=I_UNDERSTAND` and a matching arm token are provided.

**Step 3: Verify**

Run without secrets:

```bash
cd ideas/automated-trading-system
PYTHONPATH=src ATS_MODE=LIVE python src/examples/polymarket_trader.py
```

Expected: fails safely with missing `POLYMARKET_PRIVATE_KEY` or live gate error, without creating orders.

---

## Task 9: Add Polymarket-specific OMS integration tests

**Objective:** Prove Polymarket event flow preserves existing safety semantics.

**Files:**

- Create: `ideas/automated-trading-system/tests/test_polymarket_oms_integration.py`

**Test cases:**

1. **Limit order ack is audited**
   - Fake accepted response `ok=True, order_id="pm_1", status="live"`.
   - `oms.place_order(...)` returns `OrderAck(status="NEW")`.
   - Audit JSONL contains `ORDER` with venue `polymarket`.

2. **User trade marks position dirty**
   - Send fake user trade event through mapper/runner.
   - OMS internal position changes by fill size.
   - New order is blocked while dirty.

3. **REST balance reconcile clears dirty**
   - Fake `get_balance_allowance` returns balance matching internal shares.
   - `await oms.reconcile_position(token_id)` clears dirty.
   - New order can be placed after fresh market stream health event.

4. **REST balance mismatch enters SAFE mode**
   - Fake user fill says +10 shares.
   - Fake REST balance says 0.
   - `await oms.reconcile_position(token_id)` enters SAFE mode.

5. **Market stream stale blocks new orders**
   - Advance fake clock beyond `ws_stale_after_s`.
   - New order is blocked and OMS enters SAFE mode.

6. **Rejected order is audited/propagated**
   - Fake SDK rejected response `not_enough_balance`.
   - Adapter raises `PolymarketOrderRejected`.
   - Ensure no private key/secrets in logs.

**Verification:**

```bash
cd ideas/automated-trading-system
PYTHONPATH=src python -m unittest tests/test_polymarket_oms_integration.py
```

Expected: all tests pass without network access.

---

## Task 10: Add optional live-readiness checks, skipped by default

**Objective:** Validate account setup without placing orders unless explicitly enabled.

**Files:**

- Create: `ideas/automated-trading-system/tests/test_polymarket_live_readiness.py`

**Non-metered integration checks:**

- Skip unless `POLYMARKET_PRIVATE_KEY` exists.
- Create `AsyncSecureClient`.
- Fetch `get_balance_allowance(asset_type="COLLATERAL")`.
- Fetch one configured token position if `POLYMARKET_TEST_TOKEN_ID` is set.
- Do **not** place orders.

**Metered checks:**

- Mark with `@pytest.mark.metered` and skip unless `POLYMARKET_RUN_METERED_TESTS=1` and `ATS_ALLOW_LIVE_TRADING=I_UNDERSTAND`.
- Prefer post-only tiny limit order away from touch, then immediate cancel.
- Pull tick size/min order size from orderbook before constructing order.
- If order is accepted, cancel it and assert cancel response includes order ID.

**Safety rules:**

- No market orders in live tests.
- No orders if region/account is not eligible.
- No order larger than configured `POLYMARKET_TEST_MAX_USDC`, default `$1`.
- Always call `cancel_order` in `finally` if an order ID exists.

---

## Task 11: Update docs/spec for Polymarket venue semantics

**Objective:** Make Polymarket-specific constraints visible to future implementers.

**Files:**

- Modify: `ideas/automated-trading-system/SPEC.md`
- Modify: `ideas/automated-trading-system/docs/README.md`
- Create: `ideas/automated-trading-system/docs/POLYMARKET_ADAPTER.md`

**Add to `SPEC.md`:**

- Polymarket v1 venue model:
  - `asset = clob token id`.
  - `qty = outcome shares`.
  - `quote_amount = USDC spend for market BUY only`.
  - No short/futures semantics.
  - User stream trades are fill source; balance allowance snapshots are reconciliation source.
- Prohibit implicit market BUY quantity conversions.
- Require human confirmation + arm token for LIVE.

**Add `docs/POLYMARKET_ADAPTER.md`:**

Include:

- Environment variables.
- How to find token IDs using Gamma/CLOB read APIs.
- How order mapping works.
- How fills/reconcile work.
- How to run non-metered readiness checks.
- How to run metered tests only when intentionally approved.
- Incident response: cancel all, disarm, inspect audit log, reconcile balances.

---

## Task 12: Final verification and acceptance

**Objective:** Prove the write side is implemented without weakening existing safeguards.

**Commands:**

```bash
cd ideas/automated-trading-system
python -m unittest discover -s tests -p 'test_*.py'
```

If pytest/dev extras are installed:

```bash
cd ideas/automated-trading-system
pytest -q
```

Safe runner failure check:

```bash
cd ideas/automated-trading-system
PYTHONPATH=src ATS_MODE=LIVE python src/examples/polymarket_trader.py
```

Expected: fails before any order because required live gates/secrets are missing.

Optional non-metered live readiness:

```bash
cd ideas/automated-trading-system
POLYMARKET_PRIVATE_KEY=... pytest -m 'integration and not metered' -q
```

Expected: reads account/balances only; no orders.

Metered test command, only with explicit human approval:

```bash
cd ideas/automated-trading-system
POLYMARKET_RUN_METERED_TESTS=1 \
ATS_ALLOW_LIVE_TRADING=I_UNDERSTAND \
POLYMARKET_PRIVATE_KEY=... \
POLYMARKET_TEST_TOKEN_ID=... \
pytest -m metered -q
```

Expected: tiny post-only order is placed away from touch and canceled in `finally`.

---

## Files Likely To Change

Create:

- `ideas/automated-trading-system/pyproject.toml`
- `ideas/automated-trading-system/src/ats/trading/polymarket_config.py`
- `ideas/automated-trading-system/src/ats/trading/polymarket_adapter.py`
- `ideas/automated-trading-system/src/ats/trading/polymarket_client_factory.py`
- `ideas/automated-trading-system/src/ats/trading/polymarket_streams.py`
- `ideas/automated-trading-system/src/examples/polymarket_trader.py`
- `ideas/automated-trading-system/docs/POLYMARKET_ADAPTER.md`
- `ideas/automated-trading-system/tests/test_polymarket_config.py`
- `ideas/automated-trading-system/tests/test_polymarket_adapter_mapping.py`
- `ideas/automated-trading-system/tests/test_polymarket_adapter.py`
- `ideas/automated-trading-system/tests/test_polymarket_streams.py`
- `ideas/automated-trading-system/tests/test_polymarket_oms_integration.py`
- `ideas/automated-trading-system/tests/test_polymarket_live_readiness.py`

Modify:

- `ideas/automated-trading-system/src/ats/trading/types.py`
- `ideas/automated-trading-system/src/README.md`
- `ideas/automated-trading-system/tests/README.md`
- `ideas/automated-trading-system/SPEC.md`
- `ideas/automated-trading-system/docs/README.md`

Avoid changing:

- Existing OMS guardrails unless tests prove a Polymarket-specific deadlock needs an explicit extension.
- Repo root package configuration.
- Any secrets/config outside documented env-variable loading.

---

## Risks, Tradeoffs, and Open Questions

1. **SDK beta stability:** `polymarket-client` is official but beta. Keep all SDK calls behind adapter/factory boundaries so churn is localized.
2. **Market BUY semantics:** Existing OMS `qty` is base shares. Polymarket market BUY is USDC spend. Do not support market BUY without explicit `quote_amount` and pre-trade risk checks.
3. **Position units:** `get_balance_allowance` returns base units. Default `share_decimals=6`, but verify against a live read-only account before relying on it for production sizing.
4. **Fill ordering:** Polymarket user trade events may not provide a strict sequence number. Use fill IDs for dedupe; rely on REST reconciliation for drift detection.
5. **WS health gating:** Market stream events should keep feed health fresh. If a quiet market has no updates, the OMS may intentionally block new orders. That is safer than trading blind.
6. **Immediate matches:** A `matched` order response is not a substitute for a fill event. Canonical position updates must come from user trade events plus REST balance reconciliation.
7. **Allowances/approvals:** EOA wallets may need trading approvals. Keep approval setup explicit and separate from normal order placement; do not auto-approve unlimited allowances inside the trading runner without a dedicated human-confirmed flow.
8. **Compliance/geofencing:** Trading eligibility and local regulations are outside the adapter. The runner should fail closed; the operator is responsible for eligibility.
9. **Live tests:** Any test that can place/cancel real orders must be opt-in, marked `metered`, and canceled in `finally`.

---

## Acceptance Criteria

- Existing OMS safeguard tests still pass unchanged or with only harmless constructor updates.
- Polymarket adapter unit tests pass with fake SDK clients and no network access.
- Polymarket stream mapper tests prove user trade events become `FillEvent`s and market events refresh OMS feed health.
- Reconciliation tests prove Polymarket conditional-token balances clear dirty state only when they match internal fill sums.
- LIVE runner refuses to run without explicit `ATS_ALLOW_LIVE_TRADING=I_UNDERSTAND` and matching arm token.
- No secrets are logged in audit JSONL, exceptions, docs, or tests.
- No market BUY order can be created through implicit `qty` spend semantics.
- Optional metered tests cannot run unless explicitly enabled by environment variables.
