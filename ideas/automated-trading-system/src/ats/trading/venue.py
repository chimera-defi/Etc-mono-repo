from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from .types import Mode, OrderAck, OrderRequest


@dataclass(frozen=True)
class PositionSnapshot:
    asset: str
    qty: float
    ts_ms: int


class VenueAdapter(Protocol):
    """
    Venue adapter contract (minimal subset for OMS safeguards + reconciliation).

    Implementations can wrap ccxt/ccxt.pro or an internal simulator.
    """

    @property
    def venue(self) -> str: ...

    @property
    def mode(self) -> Mode: ...

    async def place_order(self, req: OrderRequest) -> OrderAck: ...

    async def cancel_order(self, venue_order_id: str, asset: str) -> None: ...

    async def fetch_position(self, asset: str) -> PositionSnapshot: ...

