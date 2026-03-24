from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from orbit_pilot.audit import record_submission
from orbit_pilot.cli import get_pending_manual
from orbit_pilot.state import cooldown_remaining, record_publish_attempt


class CliHelpersTest(unittest.TestCase):
    def test_pending_manual_sorted_by_priority(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            run_dir = Path(tmp) / "run"
            run_dir.mkdir()
            for slug, priority in (("low_site", 10), ("high_site", 90)):
                platform_dir = run_dir / slug
                platform_dir.mkdir()
                (platform_dir / "meta.json").write_text(json.dumps({"priority": priority, "risk": "medium"}), encoding="utf-8")
                record_submission(run_dir, slug, "manual", "generated", "test", {"url": "https://example.com"})
            rows = [
                {"platform": "low_site", "mode": "manual", "status": "generated", "live_url": None, "reason": "test", "result": {}},
                {"platform": "high_site", "mode": "manual", "status": "generated", "live_url": None, "reason": "test", "result": {}},
            ]
            ordered = get_pending_manual(run_dir, rows)
            self.assertEqual(ordered[0]["platform"], "high_site")

    def test_cooldown_remaining_after_attempt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            run_dir = Path(tmp) / "run"
            run_dir.mkdir()
            record_publish_attempt(run_dir, "github")
            self.assertGreater(cooldown_remaining(run_dir, "github", 3600), 0)


if __name__ == "__main__":
    unittest.main()
