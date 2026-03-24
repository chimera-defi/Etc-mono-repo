from __future__ import annotations

import json
import tempfile
from pathlib import Path

from orbit_pilot.audit import append_audit_event, record_submission


def test_record_submission_appends_jsonl() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        run_dir = Path(tmp)
        record_submission(run_dir, "github", "official_api", "dry_run", "test", {"url": "https://x.com"})
        audit = run_dir / "audit.jsonl"
        assert audit.exists()
        line = audit.read_text(encoding="utf-8").strip().split("\n")[-1]
        row = json.loads(line)
        assert row["type"] == "submission_row"
        assert row["platform"] == "github"


def test_append_audit_event() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        run_dir = Path(tmp)
        append_audit_event(run_dir, {"type": "custom", "detail": "x"})
        data = json.loads((run_dir / "audit.jsonl").read_text(encoding="utf-8").strip())
        assert data["type"] == "custom"
