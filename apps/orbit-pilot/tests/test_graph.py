from __future__ import annotations

import pytest

from orbit_pilot.graph import plan_platform
from orbit_pilot.models import LaunchProfile, PlatformRecord


def _launch(publish: dict | None = None) -> LaunchProfile:
    return LaunchProfile(
        product_name="P",
        website_url="https://p.example",
        tagline="t",
        summary="s",
        descriptions={},
        features=[],
        assets={},
        company={},
        publish=publish or {},
    )


def _record(slug: str, mode: str = "manual", risk: str = "low") -> PlatformRecord:
    return PlatformRecord(
        name=slug,
        slug=slug,
        category="x",
        official_url="",
        submit_url="",
        mode=mode,
        risk=risk,
        priority=50,
    )


def test_github_official_api() -> None:
    d = plan_platform(_record("github", "official_api"), _launch())
    assert d.mode == "official_api"


def test_unknown_official_api_defaults_manual() -> None:
    d = plan_platform(_record("product_hunt", "official_api"), _launch())
    assert d.mode == "manual"


def test_medium_without_token_manual() -> None:
    d = plan_platform(_record("medium", "official_api_if_token_else_manual"), _launch())
    assert d.mode == "manual"


def test_medium_with_token_and_author_api(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("MEDIUM_TOKEN", "t")
    launch = _launch(publish={"medium": {"author_id": "abc"}})
    d = plan_platform(_record("medium", "official_api_if_token_else_manual"), launch)
    assert d.mode == "official_api"


def test_x_without_token_manual(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("X_ACCESS_TOKEN", raising=False)
    d = plan_platform(_record("x", "official_api_if_access"), _launch())
    assert d.mode == "manual"


def test_x_with_token_api(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("X_ACCESS_TOKEN", "tok")
    d = plan_platform(_record("x", "official_api_if_access"), _launch())
    assert d.mode == "official_api"


def test_browser_fallback_registry_defaults_to_manual() -> None:
    d = plan_platform(_record("foo", "browser_fallback_opt_in"), _launch())
    assert d.mode == "manual"
