from __future__ import annotations

import argparse
import json
import sys
from io import StringIO
from pathlib import Path
from unittest.mock import patch

from orbit_pilot.cli import validate_json_command


def test_validate_json_stdin_ok() -> None:
    payload = json.dumps(
        {
            "missing_fields": [],
            "questions": [],
            "platform_count": 0,
            "platforms": [],
            "platform_preview": [],
        }
    )
    args = argparse.Namespace(schema="plan", file=None, json=True)
    with patch.object(sys, "stdin", StringIO(payload)):
        buf = StringIO()
        with patch.object(sys, "stdout", buf):
            code = validate_json_command(args)
    assert code == 0
    out = json.loads(buf.getvalue())
    assert out["valid"] is True
    assert out["schema"] == "plan-output"


def test_validate_json_file_invalid(tmp_path: Path) -> None:
    f = tmp_path / "x.json"
    f.write_text('{"results": []}', encoding="utf-8")
    args = argparse.Namespace(schema="plan", file=str(f), json=True)
    buf = StringIO()
    with patch.object(sys, "stdout", buf):
        code = validate_json_command(args)
    assert code == 1
    out = json.loads(buf.getvalue())
    assert out["valid"] is False


def test_validate_json_unknown_schema() -> None:
    args = argparse.Namespace(schema="nope-schema-xyz", file=None, json=True)
    with patch.object(sys, "stdin", StringIO("{}")):
        buf = StringIO()
        with patch.object(sys, "stdout", buf):
            code = validate_json_command(args)
    assert code == 2
