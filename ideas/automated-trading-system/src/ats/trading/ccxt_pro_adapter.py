from __future__ import annotations

import time
from typing import Any, Optional

from .types import Mode, OrderAck, OrderRequest, OrderType, Side
from .venue import PositionSnapshot, VenueAdapter


class CcxtProVenueAdapter(VenueAdapter):
    """
    Minimal ccxt.pro-based venue adapter skeleton.

    Notes:
    - This is intentionally conservative: normalize fills/positions carefully per venue.
    - For Bybit/Binance futures, position quantity semantics differ (contracts vs base qty).
      You MUST confirm your venue's meaning of position size and map it to `qty` consistently.
    - Do not log API keys / secrets. Supply them via env vars in your runner.
    """

    def __init__(self, exchange: Any, *, mode: Mode) -> None:
        # exchange should be an initialized ccxt.pro exchange instance
        self._exchange = exchange
        self._mode = mode

    @property
    def venue(self) -> str:
        # ccxt exchange id, e.g. "bybit"
        return getattr(self._exchange, "id", "ccxt")

    @property
    def mode(self) -> Mode:
        return self._mode

    async def place_order(self, req: OrderRequest) -> OrderAck:
        symbol = req.asset
        side = "buy" if req.side == Side.BUY else "sell"
        typ = "market" if req.order_type == OrderType.MARKET else "limit"
        params: dict[str, Any] = {}
        if req.post_only:
            params["postOnly"] = True
        if req.reduce_only:
            # some venues use reduceOnly, some use reduce_only; confirm per venue
            params["reduceOnly"] = True
        if req.client_order_id:
            # many venues: "clientOrderId" (binance), "orderLinkId" (bybit)
            params["clientOrderId"] = req.client_order_id

        created = await self._exchange.create_order(symbol, typ, side, req.qty, req.limit_price, params)
        oid = str(created.get("id", ""))
        ts_ms = int(created.get("timestamp") or time.time() * 1000)
        status = str(created.get("status") or "NEW")

        return OrderAck(
            venue_order_id=oid,
            asset=req.asset,
            side=req.side,
            qty=req.qty,
            order_type=req.order_type,
            limit_price=req.limit_price,
            tif=req.tif,
            status=status,
            intent_id=req.intent_id,
            correlation_id=req.correlation_id,
            client_order_id=req.client_order_id,
            ts_ms=ts_ms,
        )

    async def cancel_order(self, venue_order_id: str, asset: str) -> None:
        await self._exchange.cancel_order(venue_order_id, asset)

    async def fetch_position(self, asset: str) -> PositionSnapshot:
        """
        Best-effort position snapshot.

        IMPORTANT: confirm which field is the signed position quantity for your venue/market type.
        """
        ts_ms = int(time.time() * 1000)
        qty = 0.0

        pos: Optional[dict[str, Any]] = None
        try:
            # Many futures exchanges support fetch_positions([symbols])
            positions = await self._exchange.fetch_positions([asset])
            if positions:
                pos = positions[0]
        except Exception:
            pos = None

        if pos is None:
            try:
                pos = await self._exchange.fetch_position(asset)
            except Exception:
                pos = None

        if pos:
            ts_ms = int(pos.get("timestamp") or ts_ms)
            # Common ccxt unified field: 'contracts' or 'size' varies; try several.
            raw = (
                pos.get("contracts")
                if pos.get("contracts") is not None
                else pos.get("contractSize")
                if pos.get("contractSize") is not None
                else pos.get("size")
                if pos.get("size") is not None
                else pos.get("positionAmt")
                if pos.get("positionAmt") is not None
                else pos.get("info", {}).get("size")
            )
            try:
                qty = float(raw or 0.0)
            except Exception:
                qty = 0.0

            # If the unified data includes a side field, apply sign (venue-specific; verify!).
            side = (pos.get("side") or pos.get("info", {}).get("side") or "").lower()
            if side in {"short", "sell"}:
                qty = -abs(qty)

        return PositionSnapshot(asset=asset, qty=qty, ts_ms=ts_ms)

