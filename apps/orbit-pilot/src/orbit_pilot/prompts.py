from __future__ import annotations

from orbit_pilot.dedupe import digest_text
from orbit_pilot.models import LaunchProfile, PlatformRecord


def include_primary_link(launch: LaunchProfile, platform: PlatformRecord) -> bool:
    """CTA policy: launch.cta_policy + registry cta_in_body (SPEC: optional CTA per platform)."""
    if not platform.cta_in_body:
        return False
    policy = launch.cta_policy or {}
    per = (policy.get("platforms") or {}).get(platform.slug)
    if isinstance(per, dict) and "include_link" in per:
        return bool(per["include_link"])
    return bool(policy.get("default_include_link", True))


def _link_suffix(url: str, include: bool, *, prefix: str = "\n\n") -> str:
    if not include or not url:
        return ""
    return f"{prefix}{url}"


def build_submission_body(launch: LaunchProfile, platform: PlatformRecord, url: str) -> str:
    short = launch.descriptions.get("short", launch.summary)
    medium = launch.descriptions.get("medium", launch.summary)
    inc = include_primary_link(launch, platform)
    if platform.slug in {"github", "dev", "medium"}:
        body = (
            f"{launch.product_name}: {launch.tagline}\n\n"
            f"{medium}\n\n"
            f"Features:\n" + "\n".join(f"- {item}" for item in launch.features[:4])
        )
        return body + _link_suffix(url, inc)
    if platform.slug in {
        "product_hunt",
        "betalist",
        "uneed",
        "futurepedia",
        "saashub",
        "alternativeto",
        "startup_stash",
    }:
        body = (
            f"{launch.product_name} is built for teams that need {launch.tagline.lower()}.\n\n"
            f"{launch.summary}\n\n"
            f"Top features:\n" + "\n".join(f"- {item}" for item in launch.features[:3])
        )
        suffix = f"\n\nLaunch link: {url}" if inc else ""
        return body + suffix
    if platform.slug in {"reddit", "hacker_news", "indie_hackers"}:
        body = (
            f"We built {launch.product_name} for teams that need {launch.tagline.lower()}.\n\n"
            f"What it does:\n" + "\n".join(f"- {item}" for item in launch.features[:3])
            + "\n\nLooking for blunt feedback."
        )
        return body + _link_suffix(url, inc)
    if platform.slug in {"crunchbase", "linkedin", "peerlist"}:
        base = (
            f"{launch.product_name} is a SaaS platform for {launch.tagline.lower()}. "
            f"It helps teams {launch.summary.lower()}"
        )
        if inc:
            return f"{base} Website: {url}"
        return base.rstrip() + "."
    if platform.slug == "x":
        if inc:
            return f"{launch.product_name}: {launch.tagline}. {url}"
        return f"{launch.product_name}: {launch.tagline}."
    body = short
    return body + _link_suffix(url, inc)


def build_x_post_text(
    launch: LaunchProfile,
    platform: PlatformRecord,
    url: str,
    limit: int = 260,
) -> str:
    """Short post text for X; keeps under typical length limits; respects CTA policy."""
    inc = include_primary_link(launch, platform)
    if not inc:
        core = f"{launch.product_name} — {launch.tagline}"
        return core[:limit]
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
