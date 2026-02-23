from __future__ import annotations

import os
from dataclasses import replace
from typing import Optional

from .oms import OMSConfig


def _get_float(name: str, default: float) -> float:
    v = os.getenv(name)
    if v is None or v == "":
        return default
    return float(v)


def _get_int(name: str, default: int) -> int:
    v = os.getenv(name)
    if v is None or v == "":
        return default
    return int(v)


def load_oms_config_from_env(base: Optional[OMSConfig] = None) -> OMSConfig:
    """
    Load OMS safeguard thresholds from environment variables.

    Secrets (API keys) should NOT be read here; keep those in the venue adapter.
    """
    cfg = base or OMSConfig()

    cfg = replace(
        cfg,
        reconcile_interval_s=_get_float("ATS_RECONCILE_INTERVAL_S", cfg.reconcile_interval_s),
        reconcile_idle_after_s=_get_float("ATS_RECONCILE_IDLE_AFTER_S", cfg.reconcile_idle_after_s),
        reconcile_rel_threshold=_get_float("ATS_RECONCILE_REL_THRESHOLD", cfg.reconcile_rel_threshold),
        reconcile_abs_threshold=_get_float("ATS_RECONCILE_ABS_THRESHOLD", cfg.reconcile_abs_threshold),
        position_latency_grace_s=_get_float("ATS_POSITION_LATENCY_GRACE_S", cfg.position_latency_grace_s),
        ws_stale_after_s=_get_float("ATS_WS_STALE_AFTER_S", cfg.ws_stale_after_s),
        max_orders_per_s=_get_int("ATS_MAX_ORDERS_PER_S", cfg.max_orders_per_s),
        order_rate_window_s=_get_float("ATS_ORDER_RATE_WINDOW_S", cfg.order_rate_window_s),
        dirty_max_age_s=_get_float("ATS_DIRTY_MAX_AGE_S", cfg.dirty_max_age_s),
        flipflop_max_pairs_per_window=_get_int(
            "ATS_FLIPFLOP_MAX_PAIRS_PER_WINDOW",
            cfg.flipflop_max_pairs_per_window,
        ),
    )
    return cfg


def require_env(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return v

