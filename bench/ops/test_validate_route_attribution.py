#!/usr/bin/env python3
"""Unit tests for validate_route_attribution."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = os.path.dirname(__file__)
BENCH_ROOT = os.path.abspath(os.path.join(HERE, ".."))
if BENCH_ROOT not in sys.path:
    sys.path.insert(0, BENCH_ROOT)

from ops.validate_route_attribution import validate_manifest  # noqa: E402


class TestValidateRouteAttribution(unittest.TestCase):
    def test_validate_manifest_accepts_primary_only_job(self) -> None:
        report = validate_manifest(
            {
                "run_id": "run-ok-primary",
                "jobs": [
                    {
                        "job_index": 0,
                        "used_fallback": False,
                        "served_by": "glm-4.7-flash",
                        "original_model": "glm-4.7-flash",
                        "fallback_model": None,
                    }
                ],
            }
        )

        self.assertTrue(report["ok"])
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["job_count"], 1)

    def test_validate_manifest_accepts_fallback_job(self) -> None:
        report = validate_manifest(
            {
                "run_id": "run-ok-fallback",
                "jobs": [
                    {
                        "job_index": 1,
                        "used_fallback": True,
                        "served_by": "qwen3:7b",
                        "original_model": "glm-4.7-flash",
                        "fallback_model": "qwen3:7b",
                    }
                ],
            }
        )

        self.assertTrue(report["ok"])
        self.assertEqual(report["errors"], [])

    def test_validate_manifest_rejects_missing_and_inconsistent_fields(self) -> None:
        report = validate_manifest(
            {
                "run_id": "run-bad",
                "jobs": [
                    {
                        "job_index": 0,
                        "used_fallback": False,
                        "served_by": "glm-4.7-flash",
                        "original_model": "glm-4.7-flash",
                    },
                    {
                        "job_index": 1,
                        "used_fallback": True,
                        "served_by": "glm-4.7-flash",
                        "original_model": "glm-4.7-flash",
                        "fallback_model": None,
                    },
                    {
                        "job_index": 2,
                        "used_fallback": False,
                        "served_by": "qwen3:7b",
                        "original_model": "glm-4.7-flash",
                        "fallback_model": "qwen3:7b",
                    },
                ],
            }
        )

        self.assertFalse(report["ok"])
        self.assertGreaterEqual(len(report["errors"]), 4)
        joined = "\n".join(report["errors"])
        self.assertIn("missing required fields: fallback_model", joined)
        self.assertIn("used_fallback=true requires fallback_model", joined)
        self.assertIn("used_fallback=true requires served_by == fallback_model", joined)
        self.assertIn("used_fallback=false requires fallback_model to be null", joined)
        self.assertIn("used_fallback=false requires served_by == original_model", joined)

    def test_cli_json_reports_failure_and_nonzero_exit(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            manifest = Path(td) / "manifest.json"
            manifest.write_text(
                json.dumps(
                    {
                        "run_id": "run-cli-bad",
                        "jobs": [
                            {
                                "job_index": 0,
                                "used_fallback": True,
                                "served_by": "glm-4.7-flash",
                                "original_model": "glm-4.7-flash",
                                "fallback_model": None,
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            proc = subprocess.run(
                [sys.executable, os.path.join(HERE, "validate_route_attribution.py"), "--json", str(manifest)],
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertNotEqual(proc.returncode, 0)
            payload = json.loads(proc.stdout)
            self.assertFalse(payload["ok"])
            self.assertEqual(payload["manifest"], str(manifest))
            self.assertIn("used_fallback=true requires fallback_model", "\n".join(payload["errors"]))


if __name__ == "__main__":
    unittest.main()
