from __future__ import annotations

from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.prompts import build_submission_body, build_x_post_text, include_primary_link


def _launch(**kwargs) -> LaunchProfile:
    base = dict(
        product_name="P",
        website_url="https://p.example",
        tagline="Tag",
        summary="Sum",
    )
    base.update(kwargs)
    return LaunchProfile(**base)


def _plat(slug: str = "reddit", cta: bool = True) -> PlatformRecord:
    return PlatformRecord("R", slug, "c", "", "", "manual", "low", cta_in_body=cta)


def test_include_primary_link_registry_off() -> None:
    assert include_primary_link(_launch(), _plat(cta=False)) is False


def test_include_primary_link_launch_policy_off() -> None:
    launch = _launch(cta_policy={"default_include_link": False})
    assert include_primary_link(launch, _plat()) is False


def test_include_primary_link_per_platform_override() -> None:
    launch = _launch(cta_policy={"default_include_link": False, "platforms": {"reddit": {"include_link": True}}})
    assert include_primary_link(launch, _plat("reddit")) is True


def test_body_omits_url_when_cta_off() -> None:
    launch = _launch(cta_policy={"default_include_link": False})
    body = build_submission_body(launch, _plat("github"), "https://track.example/x")
    assert "track.example" not in body


def test_x_post_omits_url() -> None:
    launch = _launch(cta_policy={"default_include_link": False})
    text = build_x_post_text(launch, _plat("x"), "https://x.example", limit=280)
    assert "x.example" not in text
    assert "P" in text
