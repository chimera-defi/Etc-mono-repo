from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from ats.trading.types import Mode, OrderAck, OrderRequest
from ats.trading.venue import PositionSnapshot, VenueAdapter


@dataclass
class FakeClock:
    ms: int = 1_000_000

    def now_ms(self) -> int:
        return self.ms

    def now_s(self) -> float:
        return self.ms / 1000.0

    def advance_ms(self, delta: int) -> None:
        self.ms += delta


class FakeVenue(VenueAdapter):
    """
    Deterministic fake venue for unit tests.
    - "WS" fills can update internal OMS sum without updating REST position (simulate delay).
    - REST position can be set independently to simulate drift/mismatch.
    """

    def __init__(self, *, venue: str = "fake", mode: Mode = Mode.DRY_RUN, clock: Optional[FakeClock] = None) -> None:
        self._venue = venue
        self._mode = mode
        self._clock = clock or FakeClock()
        self._oid = 0
        self._rest_pos: dict[str, float] = {}

    @property
    def venue(self) -> str:
        return self._venue

    @property
    def mode(self) -> Mode:
        return self._mode

    async def place_order(self, req: OrderRequest) -> OrderAck:
        self._oid += 1
        return OrderAck(
            venue_order_id=f"order_{self._oid}",
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
            ts_ms=self._clock.now_ms(),
        )

    async def cancel_order(self, venue_order_id: str, asset: str) -> None:
        return None

    async def fetch_position(self, asset: str) -> PositionSnapshot:
        return PositionSnapshot(asset=asset, qty=self._rest_pos.get(asset, 0.0), ts_ms=self._clock.now_ms())

    def set_rest_position(self, asset: str, qty: float) -> None:
        self._rest_pos[asset] = qty

