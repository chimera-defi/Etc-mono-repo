"""Parse schedule --due with optional IANA timezone for naive local times."""

from __future__ import annotations

from datetime import UTC, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


def due_to_utc_iso(due_str: str, timezone_name: str | None) -> str:
    """
    Parse ISO-like datetime. If result is timezone-aware, convert to UTC.
    If naive and --timezone NAME given, interpret as wall time in that zone.
    If naive and no timezone, assume UTC (document for operators).
    """
    s = due_str.strip()
    dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    if dt.tzinfo is not None:
        return dt.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    if timezone_name and timezone_name.strip():
        try:
            zi = ZoneInfo(timezone_name.strip())
        except ZoneInfoNotFoundError as exc:
            raise ValueError(f"unknown timezone: {timezone_name!r}") from exc
        local = dt.replace(tzinfo=zi)
        return local.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    return dt.replace(tzinfo=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
