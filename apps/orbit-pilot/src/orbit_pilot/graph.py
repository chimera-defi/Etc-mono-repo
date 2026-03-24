from __future__ import annotations

from orbit_pilot.credentials import get_secret
from orbit_pilot.links import append_utm
from orbit_pilot.models import LaunchProfile, PlatformRecord, SubmissionDecision
from orbit_pilot.prompts import build_submission_body, build_x_post_text


def plan_platform(record: PlatformRecord, launch: LaunchProfile) -> SubmissionDecision:
    mode = record.mode.lower().replace("-", "_")

    if mode == "browser_fallback_opt_in":
        return SubmissionDecision(
            record.slug,
            "skipped",
            record.risk,
            "browser automation not available in V0 (opt-in only)",
        )

    if mode in ("manual", "manual_by_default", "manual_unless_approved"):
        return SubmissionDecision(record.slug, "manual", record.risk, f"Registry mode: {record.mode}")

    if record.slug == "medium":
        medium_cfg = launch.publish.get("medium", {})
        token_ok = bool(get_secret("MEDIUM_TOKEN"))
        author_ok = bool(str(medium_cfg.get("author_id", "")).strip())
        if token_ok and author_ok:
            return SubmissionDecision(record.slug, "official_api", record.risk, "Medium token and author_id configured")
        return SubmissionDecision(
            record.slug,
            "manual",
            record.risk,
            "Medium: set MEDIUM_TOKEN and publish.medium.author_id for API publish; otherwise post manually",
        )

    if record.slug == "linkedin":
        linkedin_cfg = launch.publish.get("linkedin", {})
        token_ok = bool(get_secret("LINKEDIN_ACCESS_TOKEN"))
        author_ok = bool(str(linkedin_cfg.get("author", "")).strip())
        if token_ok and author_ok:
            return SubmissionDecision(
                record.slug,
                "official_api",
                record.risk,
                "LinkedIn token and author URN configured",
            )
        return SubmissionDecision(
            record.slug,
            "manual",
            record.risk,
            "LinkedIn: set LINKEDIN_ACCESS_TOKEN and publish.linkedin.author for API publish",
        )

    if record.slug == "x":
        if mode in ("official_api", "official_api_if_access") and bool(get_secret("X_ACCESS_TOKEN")):
            return SubmissionDecision(record.slug, "official_api", record.risk, "X_ACCESS_TOKEN present")
        return SubmissionDecision(
            record.slug,
            "manual",
            record.risk,
            "X: set X_ACCESS_TOKEN for API post; otherwise manual",
        )

    if record.slug in {"github", "dev"} and mode == "official_api":
        return SubmissionDecision(record.slug, "official_api", record.risk, "V0 official publisher")

    if mode == "official_api":
        return SubmissionDecision(
            record.slug,
            "manual",
            record.risk,
            f"No V0 automation for official_api platform `{record.slug}`; use manual pack",
        )

    return SubmissionDecision(
        record.slug,
        "manual",
        record.risk,
        f"Uncertain or unknown registry mode `{record.mode}`; defaulting to manual",
    )


def _tracked_url(launch: LaunchProfile, record: PlatformRecord) -> str:
    return append_utm(
        launch.website_url,
        source=f"orbit_pilot_{record.slug}",
        medium="community",
        campaign="launch",
        content=record.slug,
    )


def build_body_for_platform(launch: LaunchProfile, record: PlatformRecord) -> str:
    url = _tracked_url(launch, record)
    if record.slug == "x":
        return build_x_post_text(launch, url)
    return build_submission_body(launch, record, url)


def build_payload(launch: LaunchProfile, record: PlatformRecord, body_text: str) -> dict[str, str]:
    url = _tracked_url(launch, record)
    title = f"{launch.product_name}: {launch.tagline}"
    payload: dict[str, str] = {
        "title": title,
        "body": body_text,
        "url": url,
        "tags": [str(tag).lower().replace(" ", "-") for tag in launch.company.get("categories", [])][:4],
    }
    if record.slug == "github":
        github_cfg = launch.publish.get("github", {})
        payload["github_repo"] = str(github_cfg.get("repo", ""))
        payload["tag_name"] = str(github_cfg.get("tag_name", "launch-v0"))
    if record.slug == "medium":
        medium_cfg = launch.publish.get("medium", {})
        payload["medium_author_id"] = str(medium_cfg.get("author_id", ""))
    if record.slug == "linkedin":
        linkedin_cfg = launch.publish.get("linkedin", {})
        payload["linkedin_author"] = str(linkedin_cfg.get("author", ""))
    if record.slug == "x":
        payload["x_text"] = body_text
    return payload
