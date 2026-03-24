from __future__ import annotations

from orbit_pilot.graph import plan_platform
from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.policy import RiskPolicy, apply_risk_policy, decide_platform, load_risk_policy


def _launch() -> LaunchProfile:
    return LaunchProfile(
        product_name="P",
        website_url="https://p.example",
        tagline="t",
        summary="s",
    )


def test_policy_disables_platform() -> None:
    record = PlatformRecord("G", "github", "d", "", "", "official_api", "low")
    decision = plan_platform(record, _launch())
    policy = RiskPolicy(platform_overrides={"github": {"enabled": False}})
    out = apply_risk_policy(decision, record, policy)
    assert out.mode == "skipped"


def test_policy_downgrades_high_risk_api() -> None:
    record = PlatformRecord("DEV", "dev", "d", "", "", "official_api", "medium")
    decision = plan_platform(record, _launch())
    policy = RiskPolicy(tolerance="low")
    out = apply_risk_policy(decision, record, policy)
    assert out.mode == "manual"


def test_policy_mode_override_forces_manual() -> None:
    record = PlatformRecord("M", "medium", "d", "", "", "official_api_if_token_else_manual", "medium")
    policy = RiskPolicy(platform_overrides={"medium": {"mode": "manual"}})
    d = decide_platform(record, _launch(), policy)
    assert d.mode == "manual"


def test_load_risk_policy_from_yaml(tmp_path) -> None:
    p = tmp_path / "p.yaml"
    p.write_text(
        "risk:\n  tolerance: high\n  allow_browser_fallback: true\n",
        encoding="utf-8",
    )
    pol = load_risk_policy(p)
    assert pol.tolerance == "high"
    assert pol.allow_browser_fallback is True
