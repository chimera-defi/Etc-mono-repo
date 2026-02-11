"""
Example: asyncio-based market-making loop integration.

This is intentionally minimal and focuses on how to wire:
- WS fill events -> OMS.on_fill()
- WS position events -> OMS.on_ws_position_update()
- Periodic REST reconciliation loop -> OMS.start()

In LIVE, ensure you also implement:
- explicit arming + confirmation gates (see SPEC.md)
- strategy-level risk checks and sizing
"""

from __future__ import annotations

import asyncio
import os
import time
from dataclasses import dataclass
from typing import AsyncIterator, Optional

from ats.trading.audit import AuditLogger
from ats.trading.config import load_oms_config_from_env, require_env
from ats.trading.oms import OMS
from ats.trading.types import FillEvent, Mode, OrderAck, OrderRequest, OrderType, Side
from ats.trading.venue import PositionSnapshot, VenueAdapter


@dataclass
class VenueEnvConfig:
    venue: str
    mode: Mode
    api_key_env: str
    api_secret_env: str


def _load_venue_env_config() -> VenueEnvConfig:
    # You can extend this to support multiple venues.
    venue = os.getenv("ATS_VENUE", "bybit")
    mode = Mode(os.getenv("ATS_MODE", "DRY_RUN"))
    return VenueEnvConfig(
        venue=venue,
        mode=mode,
        api_key_env=os.getenv("ATS_API_KEY_ENV", "BYBIT_API_KEY"),
        api_secret_env=os.getenv("ATS_API_SECRET_ENV", "BYBIT_API_SECRET"),
    )


class DummyDryRunVenue(VenueAdapter):
    """
    Minimal DRY_RUN venue adapter for wiring tests/examples.
    Replace with a ccxt/ccxt.pro adapter for LIVE.
    """

    def __init__(self, *, venue: str = "dummy", mode: Mode = Mode.DRY_RUN) -> None:
        self._venue = venue
        self._mode = mode
        self._pos: dict[str, float] = {}
        self._oid = 0

    @property
    def venue(self) -> str:
        return self._venue

    @property
    def mode(self) -> Mode:
        return self._mode

    async def place_order(self, req: OrderRequest) -> OrderAck:
        self._oid += 1
        oid = f"dry_{self._oid}"
        return OrderAck(
            venue_order_id=oid,
            asset=req.asset,
            side=req.side,
            qty=req.qty,
            order_type=req.order_type,
            limit_price=req.limit_price,
            tif=req.tif,
            status="NEW",
            intent_id=req.intent_id,
            correlation_id=req.correlation_id,
            client_order_id=req.client_order_id,
            ts_ms=int(time.time() * 1000),
        )

    async def cancel_order(self, venue_order_id: str, asset: str) -> None:
        return None

    async def fetch_position(self, asset: str) -> PositionSnapshot:
        return PositionSnapshot(asset=asset, qty=self._pos.get(asset, 0.0), ts_ms=int(time.time() * 1000))

    # Helpers for DRY_RUN simulation
    def apply_fill_to_exchange_position(self, fill: FillEvent) -> None:
        signed = fill.qty if fill.side == Side.BUY else -fill.qty
        self._pos[fill.asset] = self._pos.get(fill.asset, 0.0) + signed


async def simulated_ws_fills() -> AsyncIterator[FillEvent]:
    """
    Example WS fill stream. In a real implementation this is:
      - ccxt.pro: `watch_my_trades(symbol)` and normalize into FillEvent
      - or exchange-native WS client with seq numbers
    """
    i = 0
    while True:
        await asyncio.sleep(5.0)
        i += 1
        yield FillEvent(
            id=f"fill_{i}",
            ts_ms=int(time.time() * 1000),
            venue="dummy",
            mode=Mode.DRY_RUN,
            asset="BTC/USDT",
            side=Side.BUY if i % 2 == 1 else Side.SELL,
            qty=0.001,
            price=50_000.0,
            fees=0.0,
            order_id=f"order_{i}",
            intent_id=f"intent_{i}",
            seq=i,
        )


async def main() -> None:
    venue_cfg = _load_venue_env_config()

    # In LIVE, require secrets via env. Don't print them.
    if venue_cfg.mode == Mode.LIVE:
        _ = require_env(venue_cfg.api_key_env)
        _ = require_env(venue_cfg.api_secret_env)

    audit = AuditLogger(path="ideas/automated-trading-system/.audit/oms.jsonl")
    oms_cfg = load_oms_config_from_env()
    oms_cfg.max_abs_position_qty["BTC/USDT"] = float(os.getenv("ATS_MAX_ABS_POSITION_BTC", "0.01"))

    venue = DummyDryRunVenue(venue=venue_cfg.venue, mode=venue_cfg.mode)
    oms = OMS(venue=venue, audit=audit, config=oms_cfg)

    await oms.start()

    # For LIVE, you'd call `oms.arm()` only after human confirmation.
    if venue_cfg.mode != Mode.LIVE:
        oms.arm()

    async def ws_consumer() -> None:
        async for fill in simulated_ws_fills():
            oms.mark_ws_event(fill.asset)
            # Apply to "exchange" position for DRY_RUN.
            venue.apply_fill_to_exchange_position(fill)
            oms.on_fill(fill)
            # If you also have WS position updates, call:
            # oms.on_ws_position_update(fill.asset, qty=<exchange_reported_qty>)

    async def quote_loop() -> None:
        """
        Example "strategy" loop that maintains a tiny ladder.
        OMS guardrails will block if positions are dirty, feed is stale,
        flip-flopping is detected, or reconcile drift occurs.
        """
        while True:
            await asyncio.sleep(1.0)
            if oms.safe_mode:
                # In production: cancel all open orders, alert operator, require re-arming.
                await asyncio.sleep(1.0)
                continue

            try:
                _ = await oms.place_order(
                    OrderRequest(
                        asset="BTC/USDT",
                        side=Side.BUY,
                        qty=0.001,
                        order_type=OrderType.LIMIT,
                        limit_price=49_900.0,
                        tif="GTC",
                        post_only=True,
                        intent_id="mm_intent_buy",
                        correlation_id="tick_1",
                    )
                )
            except Exception:
                # The OMS already audited the block; the strategy should back off.
                pass

    await asyncio.gather(ws_consumer(), quote_loop())


if __name__ == "__main__":
    asyncio.run(main())

