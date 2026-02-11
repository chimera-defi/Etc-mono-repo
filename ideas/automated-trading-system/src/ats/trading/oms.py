from __future__ import annotations

import asyncio
import time
from dataclasses import asdict, dataclass, field
from typing import Callable, Optional

from .audit import AuditLogger
from .flipflop import FlipFlopDetector
from .rate_limit import SlidingWindowRateLimiter
from .types import (
    FillEvent,
    InstrumentSafetyState,
    Mode,
    OrderAck,
    OrderRequest,
    Side,
)
from .venue import VenueAdapter


class SafetyHalt(Exception):
    """Raised when the OMS enters SAFE mode and blocks new orders."""


class OrderBlocked(Exception):
    """Raised when a specific order attempt is blocked by a guardrail."""


@dataclass
class OMSConfig:
    # Reconciliation
    reconcile_interval_s: float = 7.0
    reconcile_idle_after_s: float = 3.0
    reconcile_rel_threshold: float = 0.001  # 0.1%
    reconcile_abs_threshold: float = 0.0  # e.g. 0.001 BTC if desired
    position_latency_grace_s: float = 2.0  # allow venue to update positions after fills

    # Dirty position behavior
    block_orders_while_dirty: bool = True
    dirty_max_age_s: float = 30.0  # if dirty too long => SAFE

    # WS/feed health gating
    ws_stale_after_s: float = 5.0
    require_ws_healthy_for_new_orders: bool = True

    # Order spam controls
    max_orders_per_s: int = 5
    order_rate_window_s: float = 1.0
    rate_limit_breach_enters_safe: bool = True

    # Flip-flop detector
    flipflop_window_s: float = 60.0
    flipflop_pair_max_delay_s: float = 5.0
    flipflop_max_pairs_per_window: int = 15

    # Position limits (per asset, absolute qty).
    # For futures, interpret this as absolute position size in base units/contracts.
    max_abs_position_qty: dict[str, float] = field(default_factory=dict)

    # Arming gate for LIVE
    require_armed_for_live: bool = True


class OMS:
    """
    OMS with flip-flop safeguards:
    - Internal running sum of fills (WS-driven) as "fast truth".
    - Dirty position flag after fills; block new orders until confirmed.
    - Periodic REST reconciliation; fail-fast into SAFE mode on drift.
    - Sequence gap detection when venue provides fill seq numbers.
    - Rate limiting and flip-flop (place/cancel) pattern detection.
    - WebSocket staleness gate (pause if feed unhealthy).
    """

    def __init__(
        self,
        venue: VenueAdapter,
        audit: AuditLogger,
        config: Optional[OMSConfig] = None,
        *,
        now_ms: Optional[Callable[[], int]] = None,
        now_s: Optional[Callable[[], float]] = None,
    ) -> None:
        self._venue = venue
        self._audit = audit
        self._cfg = config or OMSConfig()

        self._now_ms = now_ms or (lambda: int(time.time() * 1000))
        self._now_s = now_s or time.time

        self._states: dict[str, InstrumentSafetyState] = {}
        self._safe_mode = False
        self._halt_reason: str = ""
        self._armed = False

        self._rate = SlidingWindowRateLimiter(
            max_events=self._cfg.max_orders_per_s,
            window_s=self._cfg.order_rate_window_s,
        )
        self._flipflop = FlipFlopDetector(
            window_s=self._cfg.flipflop_window_s,
            pair_max_delay_s=self._cfg.flipflop_pair_max_delay_s,
            max_pairs_per_window=self._cfg.flipflop_max_pairs_per_window,
        )

        self._reconcile_task: Optional[asyncio.Task[None]] = None
        self._stop = asyncio.Event()

    @property
    def venue(self) -> VenueAdapter:
        return self._venue

    @property
    def safe_mode(self) -> bool:
        return self._safe_mode

    @property
    def halt_reason(self) -> str:
        return self._halt_reason

    def arm(self) -> None:
        self._armed = True
        self._audit.log("ARMED", {"venue": self._venue.venue, "mode": self._venue.mode.value})

    def disarm(self) -> None:
        self._armed = False
        self._audit.log("DISARMED", {"venue": self._venue.venue, "mode": self._venue.mode.value})

    def ensure_instrument(self, asset: str) -> None:
        if asset not in self._states:
            self._states[asset] = InstrumentSafetyState()

    def mark_ws_event(self, asset: str) -> None:
        self.ensure_instrument(asset)
        self._states[asset].last_ws_event_ts_ms = self._now_ms()

    def _ws_healthy(self, asset: str) -> bool:
        st = self._states.get(asset)
        if not st or st.last_ws_event_ts_ms is None:
            return False
        age_s = (self._now_ms() - st.last_ws_event_ts_ms) / 1000.0
        return age_s <= self._cfg.ws_stale_after_s

    async def start(self) -> None:
        if self._reconcile_task is not None:
            return
        self._stop.clear()
        self._reconcile_task = asyncio.create_task(self._reconcile_loop(), name="oms_reconcile_loop")
        self._audit.log("OMS_START", {"venue": self._venue.venue, "mode": self._venue.mode.value})

    async def stop(self) -> None:
        self._stop.set()
        if self._reconcile_task is not None:
            self._reconcile_task.cancel()
            try:
                await self._reconcile_task
            except asyncio.CancelledError:
                pass
            self._reconcile_task = None
        self._audit.log("OMS_STOP", {"venue": self._venue.venue, "mode": self._venue.mode.value})

    def _enter_safe_mode(self, reason: str, *, asset: str = "", extra: Optional[dict] = None) -> None:
        if self._safe_mode:
            return
        self._safe_mode = True
        self._halt_reason = reason
        payload = {"reason": reason, "venue": self._venue.venue, "mode": self._venue.mode.value}
        if asset:
            payload["asset"] = asset
        if extra:
            payload.update(extra)
        self._audit.log("SAFE_MODE", payload)

    def _check_can_place(self, req: OrderRequest) -> None:
        self.ensure_instrument(req.asset)
        st = self._states[req.asset]

        if self._safe_mode:
            raise SafetyHalt(f"SAFE_MODE: {self._halt_reason}")

        if self._venue.mode == Mode.LIVE and self._cfg.require_armed_for_live and not self._armed:
            raise OrderBlocked("LIVE requires arming; order blocked")

        if self._cfg.require_ws_healthy_for_new_orders and not self._ws_healthy(req.asset):
            self._enter_safe_mode("WS_STALE_BLOCK_NEW_ORDERS", asset=req.asset)
            raise OrderBlocked("WebSocket feed stale; blocking new orders")

        if self._cfg.block_orders_while_dirty and st.dirty:
            # If dirty too long, fail-fast.
            if st.dirty_since_ms is not None:
                dirty_age_s = (self._now_ms() - st.dirty_since_ms) / 1000.0
                if dirty_age_s >= self._cfg.dirty_max_age_s:
                    self._enter_safe_mode(
                        "DIRTY_POSITION_TOO_LONG",
                        asset=req.asset,
                        extra={"dirty_age_s": dirty_age_s},
                    )
            raise OrderBlocked("Position is dirty (awaiting confirmation); order blocked")

        if not self._rate.allow(req.asset, now_s=self._now_s()):
            self._audit.log(
                "ORDER_RATE_LIMIT",
                {"asset": req.asset, "limit": self._cfg.max_orders_per_s, "window_s": self._cfg.order_rate_window_s},
            )
            if self._cfg.rate_limit_breach_enters_safe:
                self._enter_safe_mode("ORDER_RATE_LIMIT_BREACH", asset=req.asset)
            raise OrderBlocked("Order rate limit exceeded")

        # Position limit sanity check using internal running sum (fast).
        lim = self._cfg.max_abs_position_qty.get(req.asset)
        if lim is not None and lim > 0:
            projected = st.internal_pos_qty + (req.qty if req.side == Side.BUY else -req.qty)
            if abs(projected) > lim:
                self._audit.log(
                    "RISK_BLOCK_MAX_POSITION",
                    {"asset": req.asset, "projected": projected, "limit": lim, "internal_pos": st.internal_pos_qty},
                )
                raise OrderBlocked("Max position limit would be exceeded")

        # Flip-flop check happens after recording events; here we only pre-check window status.
        if self._flipflop.should_halt(req.asset, now_s=self._now_s()):
            self._enter_safe_mode("FLIPFLOP_DETECTED", asset=req.asset)
            raise SafetyHalt("Flip-flop detected; strategy halted")

    async def place_order(self, req: OrderRequest) -> OrderAck:
        self._check_can_place(req)
        self._flipflop.record(req.asset, "PLACE", now_s=self._now_s())

        ack = await self._venue.place_order(req)
        # Audit in the spec-compatible "Order" shape (plus a few extras).
        self._audit.log(
            "ORDER",
            {
                "id": ack.venue_order_id,
                "ts": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime((ack.ts_ms or self._now_ms()) / 1000))
                + f".{(ack.ts_ms or self._now_ms()) % 1000:03d}Z",
                "mode": self._venue.mode.value,
                "venue": self._venue.venue,
                "asset": ack.asset,
                "side": ack.side.value,
                "qty": ack.qty,
                "order_type": ack.order_type.value,
                "limit_price": ack.limit_price,
                "tif": ack.tif,
                "status": ack.status,
                "intent_id": ack.intent_id,
                "correlation_id": ack.correlation_id,
                "client_order_id": ack.client_order_id,
            },
        )
        return ack

    async def cancel_order(self, venue_order_id: str, asset: str) -> None:
        self.ensure_instrument(asset)
        if self._safe_mode:
            # Cancels are still allowed in SAFE mode.
            pass
        await self._venue.cancel_order(venue_order_id, asset=asset)
        self._flipflop.record(asset, "CANCEL", now_s=self._now_s())
        self._audit.log("CANCEL", {"venue": self._venue.venue, "asset": asset, "order_id": venue_order_id})

        if self._flipflop.should_halt(asset, now_s=self._now_s()):
            self._enter_safe_mode("FLIPFLOP_DETECTED", asset=asset)

    def on_fill(self, fill: FillEvent) -> None:
        """
        Process a fill/trade event.

        This should be called from your WS consumer task (or DRY_RUN simulator).
        """
        self.ensure_instrument(fill.asset)
        st = self._states[fill.asset]
        st.last_ws_event_ts_ms = self._now_ms()

        if fill.id in st.seen_fill_ids:
            return
        st.seen_fill_ids.add(fill.id)

        # Sequence gap detection if provided.
        if fill.seq is not None:
            if st.last_fill_seq is not None and fill.seq > st.last_fill_seq + 1:
                self._enter_safe_mode(
                    "FILL_SEQ_GAP",
                    asset=fill.asset,
                    extra={"last_seq": st.last_fill_seq, "seq": fill.seq},
                )
            st.last_fill_seq = fill.seq

        # Running sum of fills.
        signed_qty = fill.qty if fill.side == Side.BUY else -fill.qty
        st.internal_pos_qty += signed_qty
        st.last_fill_ts_ms = fill.ts_ms

        # Mark dirty until confirmed via ws position update OR REST reconciliation.
        st.dirty = True
        st.dirty_since_ms = self._now_ms()

        # Audit in the spec-compatible "Fill" shape.
        self._audit.log(
            "FILL",
            {
                "id": fill.id,
                "ts": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(fill.ts_ms / 1000)) + f".{fill.ts_ms % 1000:03d}Z",
                "mode": fill.mode.value,
                "venue": fill.venue,
                "asset": fill.asset,
                "side": fill.side.value,
                "qty": fill.qty,
                "price": fill.price,
                "fees": fill.fees,
                "order_id": fill.order_id,
                "intent_id": fill.intent_id,
                "seq": fill.seq,
                "internal_pos_after": st.internal_pos_qty,
            },
        )

    def on_ws_position_update(self, asset: str, qty: float, *, ts_ms: Optional[int] = None) -> None:
        """
        Process a WS position update (if available).
        Clears dirty if it matches internal running sum within threshold.
        """
        self.ensure_instrument(asset)
        st = self._states[asset]
        st.last_ws_event_ts_ms = self._now_ms()
        st.last_ws_pos_qty = qty

        now_ms = ts_ms or self._now_ms()
        # If we just got a fill, allow a grace window for positions to catch up.
        if st.last_fill_ts_ms is not None:
            age_s = (now_ms - st.last_fill_ts_ms) / 1000.0
            if age_s < self._cfg.position_latency_grace_s:
                self._audit.log(
                    "WS_POS_GRACE",
                    {"asset": asset, "age_s": age_s, "grace_s": self._cfg.position_latency_grace_s},
                )
                return

        ok = self._within_threshold(internal=st.internal_pos_qty, exchange=qty)
        self._audit.log(
            "WS_POSITION",
            {"asset": asset, "qty": qty, "internal": st.internal_pos_qty, "ok": ok},
        )
        if ok:
            st.dirty = False
            st.dirty_since_ms = None
        else:
            # WS position disagrees with internal after grace; fail-fast.
            self._enter_safe_mode(
                "WS_POSITION_MISMATCH",
                asset=asset,
                extra={"ws_qty": qty, "internal_qty": st.internal_pos_qty},
            )

    async def reconcile_position(self, asset: str) -> None:
        """
        Fetch exchange position via REST snapshot and compare to internal running sum.
        On mismatch (beyond threshold after grace), enter SAFE mode and block new orders.
        """
        self.ensure_instrument(asset)
        st = self._states[asset]

        snap = await self._venue.fetch_position(asset)
        st.last_rest_pos_qty = snap.qty

        # If we just had a fill, allow grace to avoid false positives.
        if st.last_fill_ts_ms is not None:
            age_s = (snap.ts_ms - st.last_fill_ts_ms) / 1000.0
            if age_s < self._cfg.position_latency_grace_s:
                self._audit.log(
                    "REST_POS_GRACE",
                    {"asset": asset, "age_s": age_s, "grace_s": self._cfg.position_latency_grace_s},
                )
                return

        ok = self._within_threshold(internal=st.internal_pos_qty, exchange=snap.qty)
        self._audit.log(
            "RECONCILE",
            {
                "asset": asset,
                "internal_qty": st.internal_pos_qty,
                "rest_qty": snap.qty,
                "ok": ok,
                "rel_threshold": self._cfg.reconcile_rel_threshold,
                "abs_threshold": self._cfg.reconcile_abs_threshold,
            },
        )

        if ok:
            st.dirty = False
            st.dirty_since_ms = None
            return

        self._enter_safe_mode(
            "REST_POSITION_MISMATCH",
            asset=asset,
            extra={"rest_qty": snap.qty, "internal_qty": st.internal_pos_qty},
        )

    def snapshot_state(self) -> dict:
        return {
            "venue": self._venue.venue,
            "mode": self._venue.mode.value,
            "safe_mode": self._safe_mode,
            "halt_reason": self._halt_reason,
            "armed": self._armed,
            "instruments": {k: asdict(v) for k, v in self._states.items()},
        }

    def _within_threshold(self, *, internal: float, exchange: float) -> bool:
        diff = abs(internal - exchange)
        rel_ok = diff <= self._cfg.reconcile_rel_threshold * max(1.0, abs(exchange))
        abs_ok = diff <= self._cfg.reconcile_abs_threshold
        return rel_ok or abs_ok

    async def _reconcile_loop(self) -> None:
        last_reconcile_s = 0.0
        while not self._stop.is_set():
            await asyncio.sleep(0.2)
            now = self._now_s()

            # If we have no instruments yet, keep waiting.
            if not self._states:
                continue

            # Prefer WS; use REST as reconciliation only.
            should = False
            if now - last_reconcile_s >= self._cfg.reconcile_interval_s:
                should = True
            else:
                # If no fills for N seconds, reconcile sooner.
                last_fill_ms = max((st.last_fill_ts_ms or 0) for st in self._states.values())
                if last_fill_ms > 0:
                    idle_s = (self._now_ms() - last_fill_ms) / 1000.0
                    if idle_s >= self._cfg.reconcile_idle_after_s:
                        should = True

            if not should:
                continue

            last_reconcile_s = now
            # Reconcile all known instruments.
            for asset in list(self._states.keys()):
                try:
                    await self.reconcile_position(asset)
                except Exception as e:
                    # If the venue is unavailable, fail-safe.
                    self._enter_safe_mode("RECONCILE_ERROR", asset=asset, extra={"err": repr(e)})

