from __future__ import annotations

from orbit_pilot.models import LaunchProfile, PlatformRecord


def build_submission_body(launch: LaunchProfile, platform: PlatformRecord, url: str) -> str:
    short = launch.descriptions.get("short", launch.summary)
    medium = launch.descriptions.get("medium", launch.summary)
    if platform.slug in {"github", "dev", "medium"}:
        return (
            f"{launch.product_name}: {launch.tagline}\n\n"
            f"{medium}\n\n"
            f"Features:\n" + "\n".join(f"- {item}" for item in launch.features[:4]) + f"\n\n{url}"
        )
    return f"{short}\n\n{url}"
