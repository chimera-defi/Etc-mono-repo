from __future__ import annotations

import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from orbit_pilot.models import PlatformRecord
from orbit_pilot.prompts import uniquify_body_if_duplicate


def test_uniquify_adds_suffix_on_duplicate() -> None:
    seen: dict[str, str] = {}
    r1 = PlatformRecord("A", "a", "c", "", "", "manual", "low", 50)
    r2 = PlatformRecord("B", "b", "c", "", "", "manual", "low", 50)
    body = "same text"
    first = uniquify_body_if_duplicate(body, r1, seen)
    second = uniquify_body_if_duplicate(body, r2, seen)
    assert first == body
    assert second != body
    assert "A" in second or "B" in second
