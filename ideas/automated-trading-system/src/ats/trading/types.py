from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class Side(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"


class Mode(str, Enum):
    LIVE = "LIVE"
    DRY_RUN = "DRY_RUN"
    REPLAY = "REPLAY"


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


@dataclass
class OrderAck:
    venue_order_id: str
    asset: str
    side: Side
    qty: float
    order_type: OrderType
    limit_price: Optional[float]
    tif: str
    status: str
    intent_id: str
    correlation_id: str
    client_order_id: str = ""
    ts_ms: Optional[int] = None


@dataclass(frozen=True)
class FillEvent:
    """
    A normalized fill/trade event from WebSocket (preferred) or simulated sources.

    seq:
      - If the venue provides a strictly increasing sequence number for fills, include it.
      - Used to detect missed fills (gaps) and fail-fast into SAFE mode.
    """

    id: str
    ts_ms: int
    venue: str
    mode: Mode
    asset: str
    side: Side
    qty: float
    price: float
    fees: float
    order_id: str
    intent_id: str = ""
    seq: Optional[int] = None


@dataclass
class InstrumentSafetyState:
    # Running sum based on fills (internal truth while WS is healthy).
    internal_pos_qty: float = 0.0

    # Exchange-reported position snapshots.
    last_rest_pos_qty: Optional[float] = None
    last_ws_pos_qty: Optional[float] = None

    # Dirty flag: set after fill; cleared after confirmed update (ws pos or REST reconcile).
    dirty: bool = False
    dirty_since_ms: Optional[int] = None

    # WebSocket health / sequence tracking.
    last_fill_seq: Optional[int] = None
    last_fill_ts_ms: Optional[int] = None
    last_ws_event_ts_ms: Optional[int] = None

    # Used to dedupe fills.
    seen_fill_ids: set[str] = field(default_factory=set)

