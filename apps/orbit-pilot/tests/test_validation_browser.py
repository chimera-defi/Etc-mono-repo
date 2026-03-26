from __future__ import annotations

from unittest.mock import patch

from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.policy import RiskPolicy
from orbit_pilot.services.validation import doctor_payload


def test_doctor_browser_auto_submit_warns_without_submit_selector() -> None:
    launch = LaunchProfile(
        product_name="P",
        website_url="https://p.example",
        tagline="t",
        summary="s",
    )
    record = PlatformRecord(
        name="X",
        slug="x",
        category="c",
        official_url="",
        submit_url="https://ex/submit",
        mode="browser_fallback_opt_in",
        risk="high",
        browser_form_selectors={"title": "#t"},
    )
    pol = RiskPolicy(
        allow_browser_fallback=True,
        allow_browser_automation=True,
        allow_browser_auto_submit=True,
    )
    with patch("orbit_pilot.services.validation.playwright_available", return_value=True):
        with patch("orbit_pilot.services.validation.chromium_launchable", return_value=(True, "")):
            out = doctor_payload(launch, [record], policy=pol)
    row = out["results"][0]
    assert "browser_auto_submit_note" in row
    assert "submit" in row["browser_auto_submit_note"].lower()


def test_doctor_browser_assisted_playwright_missing() -> None:
    launch = LaunchProfile(
        product_name="P",
        website_url="https://p.example",
        tagline="t",
        summary="s",
    )
    record = PlatformRecord(
        name="X",
        slug="x",
        category="c",
        official_url="",
        submit_url="https://ex/submit",
        mode="browser_fallback_opt_in",
        risk="high",
    )
    pol = RiskPolicy(allow_browser_fallback=True, allow_browser_automation=True)
    with patch("orbit_pilot.services.validation.playwright_available", return_value=False):
        out = doctor_payload(launch, [record], policy=pol)
    row = out["results"][0]
    assert row["ready"] is False
    assert "browser" in " ".join(row["missing_secrets"]).lower()
