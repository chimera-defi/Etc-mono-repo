from __future__ import annotations

from orbit_pilot.links import append_utm, canonicalize_url


def test_append_utm() -> None:
    u = append_utm("https://x.com/a", "s", "m", "c", "co")
    assert "utm_source=s" in u
    assert "utm_medium=m" in u


def test_canonicalize_strips_fragment() -> None:
    assert "#frag" not in canonicalize_url("https://example.com/path#frag")
    assert canonicalize_url("https://example.com/path#frag") == "https://example.com/path"
