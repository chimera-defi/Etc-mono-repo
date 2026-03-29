from __future__ import annotations

from orbit_pilot.schedule_timezone import due_to_utc_iso


def test_due_naive_with_timezone() -> None:
    # June → EDT; 10:00 America/New_York == 14:00 UTC
    out = due_to_utc_iso("2026-06-15T10:00:00", "America/New_York")
    assert out == "2026-06-15T14:00:00Z"


def test_due_explicit_z() -> None:
    assert due_to_utc_iso("2026-01-01T12:00:00Z", None) == "2026-01-01T12:00:00Z"
