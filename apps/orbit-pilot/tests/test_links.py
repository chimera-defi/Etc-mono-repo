from __future__ import annotations

from orbit_pilot.links import append_utm


def test_append_utm() -> None:
    u = append_utm("https://x.com/a", "s", "m", "c", "co")
    assert "utm_source=s" in u
    assert "utm_medium=m" in u
