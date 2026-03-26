from __future__ import annotations

import json
import tempfile
from io import StringIO
from pathlib import Path
from unittest.mock import patch

from orbit_pilot.cli_io import require_run_dir


def test_require_run_dir_ok() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        d = Path(tmp)
        assert require_run_dir(d, json_mode=False) is True


def test_require_run_dir_json_error() -> None:
    d = Path("/nonexistent/orbit/run-xyz")
    buf = StringIO()
    with patch("sys.stdout", buf):
        ok = require_run_dir(d, json_mode=True)
    assert ok is False
    data = json.loads(buf.getvalue())
    assert "error" in data
    assert "not found" in data["error"].lower()
