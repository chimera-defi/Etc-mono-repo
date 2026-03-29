"""Compute next run times for schedule recurrence (no extra deps)."""

from __future__ import annotations

import calendar
from datetime import UTC, datetime, timedelta
from typing import Literal, assert_never

Recurrence = Literal["none", "daily", "weekly", "monthly"]

_VALID: set[str] = {"none", "daily", "weekly", "monthly"}


def normalize_recurrence(raw: str | None) -> Recurrence:
    if not raw or str(raw).strip().lower() in ("", "none", "once"):
        return "none"
    v = str(raw).strip().lower()
    if v not in _VALID:
        raise ValueError(f"invalid recurrence: {raw!r} (use daily, weekly, monthly, or none)")
    return v  # type: ignore[return-value]


def _ensure_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def add_one_month_utc(dt: datetime) -> datetime:
    """Same clock calendar month +1 in UTC (day clamped to month length)."""
    dt = _ensure_utc(dt)
    y, m, d, h, mi, s, us = dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second, dt.microsecond
    if m == 12:
        y, m = y + 1, 1
    else:
        m += 1
    last = calendar.monthrange(y, m)[1]
    d = min(d, last)
    return datetime(y, m, d, h, mi, s, us, tzinfo=UTC)


def next_fire_after(anchor_utc: datetime, recurrence: Recurrence) -> datetime:
    """Next instant strictly after anchor (anchor is the due time that just executed)."""
    a = _ensure_utc(anchor_utc)
    if recurrence == "none":
        raise ValueError("no next fire for recurrence none")
    if recurrence == "daily":
        return a + timedelta(days=1)
    if recurrence == "weekly":
        return a + timedelta(weeks=1)
    if recurrence == "monthly":
        return add_one_month_utc(a)
    assert_never(recurrence)
