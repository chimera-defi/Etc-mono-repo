from __future__ import annotations

from orbit_pilot.dedupe import digest_text
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
    if platform.slug in {
        "product_hunt",
        "betalist",
        "uneed",
        "futurepedia",
        "saashub",
        "alternativeto",
        "startup_stash",
    }:
        return (
            f"{launch.product_name} is built for teams that need {launch.tagline.lower()}.\n\n"
            f"{launch.summary}\n\n"
            f"Top features:\n" + "\n".join(f"- {item}" for item in launch.features[:3]) + f"\n\nLaunch link: {url}"
        )
    if platform.slug in {"reddit", "hacker_news", "indie_hackers"}:
        return (
            f"We built {launch.product_name} for teams that need {launch.tagline.lower()}.\n\n"
            f"What it does:\n" + "\n".join(f"- {item}" for item in launch.features[:3])
            + f"\n\nLooking for blunt feedback.\n\n{url}"
        )
    if platform.slug in {"crunchbase", "linkedin", "peerlist"}:
        return (
            f"{launch.product_name} is a SaaS platform for {launch.tagline.lower()}. "
            f"It helps teams {launch.summary.lower()} Website: {url}"
        )
    if platform.slug == "x":
        return f"{launch.product_name}: {launch.tagline}. {url}"
    return f"{short}\n\n{url}"


def build_x_post_text(launch: LaunchProfile, url: str, limit: int = 260) -> str:
    """Short post text for X; keeps under typical length limits."""
    core = f"{launch.product_name} — {launch.tagline}\n{url}"
    if len(core) <= limit:
        return core
    head = f"{launch.product_name}: {launch.tagline[:80]}"
    tail = f"\n{url}"
    budget = limit - len(tail) - 1
    if budget < 20:
        return url[:limit]
    return (head[:budget] + tail)[:limit]


def uniquify_body_if_duplicate(base_body: str, record: PlatformRecord, seen_digests: dict[str, str]) -> str:
    """Avoid identical cross-platform bodies when platforms share the same template."""
    key = digest_text(base_body)
    if key not in seen_digests:
        seen_digests[key] = record.slug
        return base_body
    return (
        base_body
        + f"\n\n---\n_Submission note for {record.name}:_ tweak wording so this is not a verbatim duplicate elsewhere._"
    )
