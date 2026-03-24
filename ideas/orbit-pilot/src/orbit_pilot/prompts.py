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
    if platform.slug in {"product_hunt", "betalist", "uneed", "futurepedia", "saashub", "alternativeto", "startup_stash"}:
        return (
            f"{launch.product_name} is built for teams that need {launch.tagline.lower()}.\n\n"
            f"{launch.summary}\n\n"
            f"Top features:\n" + "\n".join(f"- {item}" for item in launch.features[:3]) + f"\n\nLaunch link: {url}"
        )
    if platform.slug in {"reddit", "hacker_news", "indie_hackers"}:
        return (
            f"We built {launch.product_name} for teams that need {launch.tagline.lower()}.\n\n"
            f"What it does:\n" + "\n".join(f"- {item}" for item in launch.features[:3]) + f"\n\nLooking for blunt feedback.\n\n{url}"
        )
    if platform.slug in {"crunchbase", "linkedin", "peerlist"}:
        return (
            f"{launch.product_name} is a SaaS platform for {launch.tagline.lower()}. "
            f"It helps teams {launch.summary.lower()} Website: {url}"
        )
    if platform.slug == "x":
        return f"{launch.product_name}: {launch.tagline}. {url}"
    return f"{short}\n\n{url}"
