from __future__ import annotations

import asyncio
import os
import sys
import tempfile
import unittest

# Ensure we can import `ats` from ideas/automated-trading-system/src
THIS_DIR = os.path.dirname(__file__)
if THIS_DIR not in sys.path:
    sys.path.insert(0, THIS_DIR)
SRC_DIR = os.path.abspath(os.path.join(THIS_DIR, "..", "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from ats.trading.audit import AuditLogger
from ats.trading.oms import OMS, OMSConfig, OrderBlocked
from ats.trading.types import FillEvent, Mode, OrderRequest, OrderType, Side

from fake_venue import FakeClock, FakeVenue


class OMSSafeguardsTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.clock = FakeClock()
        self.venue = FakeVenue(clock=self.clock)
        self.tmpdir = tempfile.TemporaryDirectory()
        self.audit = AuditLogger(path=os.path.join(self.tmpdir.name, "audit.jsonl"))

        cfg = OMSConfig(
            reconcile_interval_s=999.0,  # manual reconcile in tests
            reconcile_idle_after_s=999.0,
            reconcile_rel_threshold=0.001,
            reconcile_abs_threshold=0.0,
            position_latency_grace_s=0.0,  # make mismatches immediate for tests
            ws_stale_after_s=5.0,
            max_orders_per_s=5,
            order_rate_window_s=1.0,
            dirty_max_age_s=2.0,
        )
        cfg.max_abs_position_qty = {"BTC/USDT": 10.0}

        self.oms = OMS(
            venue=self.venue,
            audit=self.audit,
            config=cfg,
            now_ms=self.clock.now_ms,
            now_s=self.clock.now_s,
        )
        await self.oms.start()
        self.oms.arm()

        # Seed WS health (otherwise new orders are blocked)
        self.oms.mark_ws_event("BTC/USDT")

    async def asyncTearDown(self) -> None:
        await self.oms.stop()
        self.tmpdir.cleanup()

    async def test_dirty_position_blocks_new_orders(self) -> None:
        # Place once while clean.
        _ = await self.oms.place_order(
            OrderRequest(asset="BTC/USDT", side=Side.BUY, qty=0.1, order_type=OrderType.LIMIT, limit_price=1.0)
        )

        # Receive a fill -> dirty until confirmed.
        fill = FillEvent(
            id="fill_1",
            ts_ms=self.clock.now_ms(),
            venue=self.venue.venue,
            mode=Mode.DRY_RUN,
            asset="BTC/USDT",
            side=Side.BUY,
            qty=0.1,
            price=1.0,
            fees=0.0,
            order_id="order_1",
            intent_id="",
            seq=1,
        )
        self.oms.on_fill(fill)

        with self.assertRaises(OrderBlocked):
            await self.oms.place_order(
                OrderRequest(asset="BTC/USDT", side=Side.BUY, qty=0.1, order_type=OrderType.LIMIT, limit_price=1.0)
            )

        # Now reconcile to clear dirty (exchange agrees).
        self.venue.set_rest_position("BTC/USDT", 0.1)
        await self.oms.reconcile_position("BTC/USDT")
        self.oms.mark_ws_event("BTC/USDT")
        _ = await self.oms.place_order(
            OrderRequest(asset="BTC/USDT", side=Side.SELL, qty=0.1, order_type=OrderType.LIMIT, limit_price=1.0)
        )

    async def test_reconcile_mismatch_enters_safe_mode(self) -> None:
        # Fill says +1.0 internal, but REST says 0.0 -> mismatch -> SAFE.
        self.oms.on_fill(
            FillEvent(
                id="fill_x",
                ts_ms=self.clock.now_ms(),
                venue=self.venue.venue,
                mode=Mode.DRY_RUN,
                asset="BTC/USDT",
                side=Side.BUY,
                qty=1.0,
                price=1.0,
                fees=0.0,
                order_id="order_x",
                intent_id="",
                seq=10,
            )
        )
        self.venue.set_rest_position("BTC/USDT", 0.0)
        await self.oms.reconcile_position("BTC/USDT")
        self.assertTrue(self.oms.safe_mode)
        self.assertIn("REST_POSITION_MISMATCH", self.oms.halt_reason)

    async def test_rate_limit_blocks_and_enters_safe_mode(self) -> None:
        # Keep WS healthy.
        self.oms.mark_ws_event("BTC/USDT")

        req = OrderRequest(asset="BTC/USDT", side=Side.BUY, qty=0.01, order_type=OrderType.LIMIT, limit_price=1.0)
        # 5 orders allowed in 1s window.
        for _ in range(5):
            await self.oms.place_order(req)
        with self.assertRaises(OrderBlocked):
            await self.oms.place_order(req)
        self.assertTrue(self.oms.safe_mode)
        self.assertIn("ORDER_RATE_LIMIT_BREACH", self.oms.halt_reason)

    async def test_ws_stale_blocks_new_orders(self) -> None:
        # Advance time so WS becomes stale.
        self.clock.advance_ms(10_000)
        with self.assertRaises(OrderBlocked):
            await self.oms.place_order(
                OrderRequest(asset="BTC/USDT", side=Side.BUY, qty=0.01, order_type=OrderType.LIMIT, limit_price=1.0)
            )
        self.assertTrue(self.oms.safe_mode)
        self.assertIn("WS_STALE_BLOCK_NEW_ORDERS", self.oms.halt_reason)

    async def test_fill_sequence_gap_enters_safe_mode(self) -> None:
        self.oms.on_fill(
            FillEvent(
                id="fill_1",
                ts_ms=self.clock.now_ms(),
                venue=self.venue.venue,
                mode=Mode.DRY_RUN,
                asset="BTC/USDT",
                side=Side.BUY,
                qty=0.1,
                price=1.0,
                fees=0.0,
                order_id="order_1",
                intent_id="",
                seq=1,
            )
        )
        self.oms.on_fill(
            FillEvent(
                id="fill_3",
                ts_ms=self.clock.now_ms(),
                venue=self.venue.venue,
                mode=Mode.DRY_RUN,
                asset="BTC/USDT",
                side=Side.BUY,
                qty=0.1,
                price=1.0,
                fees=0.0,
                order_id="order_2",
                intent_id="",
                seq=3,
            )
        )
        self.assertTrue(self.oms.safe_mode)
        self.assertIn("FILL_SEQ_GAP", self.oms.halt_reason)

    async def test_flipflop_place_cancel_detected(self) -> None:
        # Create a separate OMS with very high rate limit to isolate flip-flop detector.
        clock = FakeClock()
        venue = FakeVenue(clock=clock)
        tmpdir = tempfile.TemporaryDirectory()
        audit = AuditLogger(path=os.path.join(tmpdir.name, "audit.jsonl"))
        cfg = OMSConfig(
            reconcile_interval_s=999.0,
            reconcile_idle_after_s=999.0,
            position_latency_grace_s=0.0,
            ws_stale_after_s=5.0,
            max_orders_per_s=10_000,
            order_rate_window_s=1.0,
            rate_limit_breach_enters_safe=False,
            flipflop_max_pairs_per_window=5,
            flipflop_pair_max_delay_s=10.0,
        )
        cfg.max_abs_position_qty = {"BTC/USDT": 10.0}
        oms = OMS(venue=venue, audit=audit, config=cfg, now_ms=clock.now_ms, now_s=clock.now_s)
        await oms.start()
        oms.arm()
        oms.mark_ws_event("BTC/USDT")

        try:
            for _ in range(6):
                ack = await oms.place_order(
                    OrderRequest(asset="BTC/USDT", side=Side.BUY, qty=0.001, order_type=OrderType.LIMIT, limit_price=1.0)
                )
                await oms.cancel_order(ack.venue_order_id, asset="BTC/USDT")
            self.assertTrue(oms.safe_mode)
            self.assertIn("FLIPFLOP_DETECTED", oms.halt_reason)
        finally:
            await oms.stop()
            tmpdir.cleanup()


if __name__ == "__main__":
    unittest.main()

