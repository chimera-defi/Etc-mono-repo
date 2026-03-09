#!/usr/bin/env python3
"""Unit tests for supervisor stdout summary parsing."""

from __future__ import annotations

import os
import sys
import unittest

# Allow importing selfopt package from bench/
HERE = os.path.dirname(__file__)
BENCH_ROOT = os.path.abspath(os.path.join(HERE, ".."))
if BENCH_ROOT not in sys.path:
    sys.path.insert(0, BENCH_ROOT)

from selfopt.benchmark_supervisor import _parse_summary_from_stdout  # noqa: E402


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

    def test_parse_when_no_summary_present(self) -> None:
        sample = "No benchmark summary in this output"
        passed, total, failed = _parse_summary_from_stdout(sample)
        self.assertEqual((passed, total), (0, 0))
        self.assertEqual(failed, [])


if __name__ == "__main__":
    unittest.main()
