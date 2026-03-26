from __future__ import annotations

import tempfile
from pathlib import Path

from orbit_pilot.audit import append_audit_event, read_audit_events


def test_read_audit_events_tail() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        d = Path(tmp)
        append_audit_event(d, {"type": "a"})
        append_audit_event(d, {"type": "b"})
        append_audit_event(d, {"type": "c"})
        all_e = read_audit_events(d)
        assert len(all_e) == 3
        tail = read_audit_events(d, tail=2)
        assert [e["type"] for e in tail] == ["b", "c"]
