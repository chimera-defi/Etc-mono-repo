#!/usr/bin/env python3
"""Unit tests for supervisor stdout summary parsing."""

from __future__ import annotations

import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

# Allow importing selfopt package from bench/
HERE = os.path.dirname(__file__)
BENCH_ROOT = os.path.abspath(os.path.join(HERE, ".."))
if BENCH_ROOT not in sys.path:
    sys.path.insert(0, BENCH_ROOT)

from selfopt.benchmark_supervisor import (  # noqa: E402
    JobSpec,
    _parse_summary_from_stdout,
    _run_once,
)


class TestSupervisorSummaryParsing(unittest.TestCase):
    def test_parse_results_and_failed_prompt(self) -> None:
        sample = """
╔════════════════════════════════════════════════════════════════════════════╗
║ Results:            11/12 passed ( 91.7%)       ║
║ Failed:             P10                                                          ║
╚════════════════════════════════════════════════════════════════════════════╝
"""
        passed, total, failed = _parse_summary_from_stdout(sample)
        self.assertEqual(passed, 11)
        self.assertEqual(total, 12)
        self.assertEqual(failed, ["P10"])

    def test_parse_with_multiple_failed_prompts(self) -> None:
        sample = "Results: 8/12 passed\nFailed: P4, P7, P12\n"
        passed, total, failed = _parse_summary_from_stdout(sample)
        self.assertEqual((passed, total), (8, 12))
        self.assertEqual(failed, ["P4", "P7", "P12"])

    def test_run_once_parses_summary_and_sets_attribution_defaults(self) -> None:
        sample_stdout = "Results: 5/6 passed\nFailed: P3\n"

        class _CP:
            returncode = 0
            stdout = sample_stdout
            stderr = ""

        with tempfile.TemporaryDirectory() as td:
            with patch("selfopt.benchmark_supervisor.subprocess.run", return_value=_CP()):
                res = _run_once(
                    run_dir=Path(td),
                    run_id="r-attr",
                    idx=1,
                    spec=JobSpec("lfm2.5-thinking:1.2b", "atomic", "atomic", [""]),
                    timeout_s=5,
                    retries=1,
                    suite=None,
                )

        self.assertEqual(res["summary"]["passed"], 5)
        self.assertEqual(res["summary"]["total"], 6)
        self.assertEqual(res["summary"]["failed_prompts"], ["P3"])
        self.assertIn("used_fallback", res)
        self.assertIn("served_by", res)
        self.assertIn("original_model", res)
        self.assertIn("fallback_model", res)
        self.assertFalse(res["used_fallback"])
        self.assertEqual(res["served_by"], "lfm2.5-thinking:1.2b")
        self.assertEqual(res["original_model"], "lfm2.5-thinking:1.2b")
        self.assertIsNone(res["fallback_model"])
        self.assertEqual(
            sorted(
                key
                for key in res
                if key in {"used_fallback", "served_by", "original_model", "fallback_model"}
            ),
            ["fallback_model", "original_model", "served_by", "used_fallback"],
        )

    def test_attribution_fields_can_represent_fallback_run(self) -> None:
        result = {
            "used_fallback": True,
            "served_by": "qwen2.5:3b",
            "original_model": "lfm2.5-thinking:1.2b",
            "fallback_model": "qwen2.5:3b",
        }

        self.assertTrue(result["used_fallback"])
        self.assertEqual(result["served_by"], "qwen2.5:3b")
        self.assertEqual(result["original_model"], "lfm2.5-thinking:1.2b")
        self.assertEqual(result["fallback_model"], "qwen2.5:3b")

    def test_parse_when_no_summary_present(self) -> None:
        sample = "No benchmark summary in this output"
        passed, total, failed = _parse_summary_from_stdout(sample)
        self.assertEqual((passed, total), (0, 0))
        self.assertEqual(failed, [])


if __name__ == "__main__":
    unittest.main()
