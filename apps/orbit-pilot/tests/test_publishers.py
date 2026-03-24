from __future__ import annotations

import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from orbit_pilot.publishers import dev, github, linkedin, medium, x
from orbit_pilot.publishers.requirements import validate_platform


class PublishersTest(unittest.TestCase):
    def test_github_dry_run(self) -> None:
        result = github.publish({"url": "https://example.com"}, dry_run=True)
        self.assertEqual(result["status"], "dry_run")

    def test_missing_tokens_return_errors(self) -> None:
        payload = {"url": "https://example.com"}
        self.assertEqual(dev.publish(payload, dry_run=False)["status"], "error")
        self.assertEqual(medium.publish(payload, dry_run=False)["status"], "error")
        self.assertEqual(linkedin.publish(payload, dry_run=False)["status"], "error")
        self.assertEqual(x.publish(payload, dry_run=False)["status"], "error")

    def test_validate_platform_readiness(self) -> None:
        with patch.dict(os.environ, {"GITHUB_TOKEN": "token"}, clear=False):
            result = validate_platform("github", {"github_repo": "acme/repo"})
        self.assertTrue(result["ready"])
        self.assertEqual(result["missing_secrets"], [])


if __name__ == "__main__":
    unittest.main()
