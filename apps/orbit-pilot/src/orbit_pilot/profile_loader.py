"""Build LaunchProfile from parsed launch.yaml dict (single source for CLI + graphs + hooks)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from orbit_pilot.models import LaunchProfile


def profile_from_parsed_yaml(raw: dict[str, Any], source_path: Path) -> LaunchProfile:
    """Resolve relative asset paths against the launch file's directory."""
    path = Path(source_path)
    assets = dict(raw.get("assets") or {})
    logo = assets.get("logo")
    if logo:
        assets["logo"] = str((path.parent / logo).resolve())
    screenshots = [str((path.parent / item).resolve()) for item in assets.get("screenshots", [])]
    if screenshots:
        assets["screenshots"] = screenshots
    return LaunchProfile(
        product_name=raw.get("product_name", ""),
        website_url=raw.get("website_url", ""),
        tagline=raw.get("tagline", ""),
        summary=raw.get("summary", ""),
        descriptions=raw.get("descriptions", {}),
        features=raw.get("features", []),
        assets=assets,
        company=raw.get("company", {}),
        publish=raw.get("publish", {}),
        cta_policy=raw.get("cta_policy", {}),
    )
