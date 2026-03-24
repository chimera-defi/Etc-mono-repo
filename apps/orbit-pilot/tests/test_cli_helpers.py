from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from orbit_pilot.assets import prepare_assets
from orbit_pilot.audit import record_submission
from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.services.campaigns import build_campaign, latest_run, list_campaigns
from orbit_pilot.services.generation import select_platforms
from orbit_pilot.services.reporting import get_pending_manual, human_guide
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
        fixture_root = Path(__file__).resolve().parents[1] / "fixtures"
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

    def test_campaign_listing_and_latest_run(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            campaign_dir = root / "wallet-alpha"
            (campaign_dir / "run-20260324T090000Z").mkdir(parents=True)
            (campaign_dir / "run-20260324T100000Z").mkdir(parents=True)
            campaigns = list_campaigns(root)
            self.assertEqual(campaigns[0]["campaign"], "wallet-alpha")
            self.assertTrue(campaigns[0]["latest_run"].endswith("run-20260324T100000Z"))
            self.assertTrue(latest_run(root, "wallet-alpha").endswith("run-20260324T100000Z"))

    def test_select_platforms_filters_subset(self) -> None:
        platforms = [
            PlatformRecord("GitHub", "github", "developer", "", "", "official_api", "low"),
            PlatformRecord("DEV", "dev", "content", "", "", "official_api", "low"),
        ]
        selected = select_platforms(platforms, ["dev"])
        self.assertEqual([record.slug for record in selected], ["dev"])

    def test_human_guide_returns_manual_top(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            run_dir = Path(tmp) / "run"
            platform_dir = run_dir / "product_hunt"
            platform_dir.mkdir(parents=True)
            (platform_dir / "meta.json").write_text(
                json.dumps({"priority": 90, "risk": "medium", "submit_url": "https://example.com"}),
                encoding="utf-8",
            )
            (platform_dir / "payload.json").write_text(json.dumps({"title": "x", "body": "y"}), encoding="utf-8")
            record_submission(run_dir, "product_hunt", "manual", "generated", "test", {"url": "https://example.com"})
            guide = human_guide(run_dir)
            self.assertEqual(guide["next_manual"], "product_hunt")


if __name__ == "__main__":
    unittest.main()
