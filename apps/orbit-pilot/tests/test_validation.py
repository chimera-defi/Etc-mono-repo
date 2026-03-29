from __future__ import annotations

import unittest
from unittest.mock import patch

from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.services.validation import doctor_payload


class DoctorPayloadTest(unittest.TestCase):
    def test_manual_platform_skips_validation(self) -> None:
        launch = LaunchProfile(
            product_name="P",
            website_url="https://p.example",
            tagline="t",
            summary="s",
        )
        record = PlatformRecord(
            name="Reddit",
            slug="reddit",
            category="c",
            official_url="",
            submit_url="",
            mode="manual_by_default",
            risk="medium",
        )
        out = doctor_payload(launch, [record])
        self.assertEqual(out["results"][0]["ready"], True)
        self.assertEqual(out["results"][0]["missing_secrets"], [])

    def test_github_official_missing_token(self) -> None:
        launch = LaunchProfile(
            product_name="P",
            website_url="https://p.example",
            tagline="t",
            summary="s",
            publish={"github": {"repo": "acme/r"}},
        )
        record = PlatformRecord(
            name="GitHub",
            slug="github",
            category="d",
            official_url="",
            submit_url="",
            mode="official_api",
            risk="low",
        )
        with patch("orbit_pilot.publishers.requirements.get_secret", return_value=None):
            out = doctor_payload(launch, [record])
        row = out["results"][0]
        self.assertEqual(row["mode"], "official_api")
        self.assertFalse(row["ready"])
        self.assertIn("GITHUB_TOKEN", row["missing_secrets"])


if __name__ == "__main__":
    unittest.main()
