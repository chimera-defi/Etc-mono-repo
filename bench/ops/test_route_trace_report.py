#!/usr/bin/env python3
"""Unit tests for route_trace_report one-line behavior."""

from __future__ import annotations

import io
import json
import os
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

HERE = os.path.dirname(__file__)
BENCH_ROOT = os.path.abspath(os.path.join(HERE, ".."))
if BENCH_ROOT not in sys.path:
    sys.path.insert(0, BENCH_ROOT)

from ops.route_trace_report import _print_one_line_from_manifest, latest_manifest  # noqa: E402


class TestRouteTraceReport(unittest.TestCase):
    def test_manifest_fallback_one_line(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            runs = Path(td)
            run_dir = runs / "run123"
            run_dir.mkdir(parents=True)
            manifest = run_dir / "manifest.json"
            manifest.write_text(
                json.dumps(
                    {
                        "run_id": "run123",
                        "jobs": [
                            {
                                "job_index": 1,
                                "model": "lfm2.5-thinking:1.2b",
                                "used_fallback": False,
                                "served_by": "lfm2.5-thinking:1.2b",
                                "original_model": "lfm2.5-thinking:1.2b",
                                "fallback_model": None,
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            self.assertEqual(latest_manifest(runs), manifest)

            buf = io.StringIO()
            with redirect_stdout(buf):
                ok = _print_one_line_from_manifest(manifest)
            self.assertTrue(ok)

            line = buf.getvalue().strip()
            self.assertIn("served_by=lfm2.5-thinking:1.2b", line)
            self.assertIn("fallback_used=false", line)


if __name__ == "__main__":
    unittest.main()
