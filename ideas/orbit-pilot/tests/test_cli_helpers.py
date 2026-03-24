from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from orbit_pilot.assets import prepare_assets
from orbit_pilot.audit import record_submission
from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.services.campaigns import build_campaign
from orbit_pilot.services.reporting import get_pending_manual
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

    def test_prepare_assets_writes_manifest(self) -> None:
        fixture_root = Path("/root/.openclaw/workspace/dev/etc-walletradar-backlinks/ideas/orbit-pilot/fixtures")
        with tempfile.TemporaryDirectory() as tmp:
            platform_dir = Path(tmp) / "medium"
            launch = LaunchProfile(
                product_name="OrbitPilot",
                website_url="https://example.com",
                tagline="tagline",
                summary="summary",
                assets={
                    "logo": str(fixture_root / "logo.png"),
                    "screenshots": [str(fixture_root / "hero.png")],
                },
            )
            record = PlatformRecord(
                name="Medium",
                slug="medium",
                category="content",
                official_url="https://medium.com",
                submit_url="https://medium.com",
                mode="manual",
                risk="medium",
            )
            outputs = prepare_assets(launch, record, platform_dir)
            self.assertEqual(len(outputs), 2)
            self.assertTrue((platform_dir / "assets.json").exists())

    def test_build_campaign_slugifies_name(self) -> None:
        launch = LaunchProfile(
            product_name="Orbit Pilot",
            website_url="https://example.com",
            tagline="tagline",
            summary="summary",
        )
        campaign = build_campaign(launch, explicit_name="WalletRadar Alpha Launch")
        self.assertEqual(campaign.id, "walletradar-alpha-launch")


if __name__ == "__main__":
    unittest.main()
