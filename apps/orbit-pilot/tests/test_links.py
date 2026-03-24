from __future__ import annotations

import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from orbit_pilot.links import append_utm


def test_append_utm() -> None:
    u = append_utm("https://x.com/a", "s", "m", "c", "co")
    assert "utm_source=s" in u
    assert "utm_medium=m" in u
