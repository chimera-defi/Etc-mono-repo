from __future__ import annotations

import unittest

from orbit_pilot.publishers import dev, github, linkedin, medium, x


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


if __name__ == "__main__":
    unittest.main()
