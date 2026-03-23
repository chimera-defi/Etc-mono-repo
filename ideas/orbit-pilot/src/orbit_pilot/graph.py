from __future__ import annotations

from orbit_pilot.links import append_utm
from orbit_pilot.models import LaunchProfile, PlatformRecord, SubmissionDecision
from orbit_pilot.prompts import build_submission_body


def plan_platform(record: PlatformRecord, has_medium_token: bool = False) -> SubmissionDecision:
    if record.slug == "medium":
        if has_medium_token:
            return SubmissionDecision(record.slug, "official_api", record.risk, "Existing Medium token available")
        return SubmissionDecision(record.slug, "manual", record.risk, "No working Medium token")
    if record.slug in {"github", "dev"}:
        return SubmissionDecision(record.slug, "official_api", record.risk, "V0 official publisher")
    return SubmissionDecision(record.slug, "manual", record.risk, "Manual by default")


def build_payload(launch: LaunchProfile, record: PlatformRecord) -> dict[str, str]:
    url = append_utm(
        launch.website_url,
        source=f"orbit_pilot_{record.slug}",
        medium="community",
        campaign="launch",
        content=record.slug,
    )
    payload = {
        "title": f"{launch.product_name}: {launch.tagline}",
        "body": build_submission_body(launch, record, url),
        "url": url,
        "tags": [str(tag).lower().replace(" ", "-") for tag in launch.company.get("categories", [])][:4],
    }
    if record.slug == "github":
        github_cfg = launch.publish.get("github", {})
        payload["github_repo"] = github_cfg.get("repo", "")
        payload["tag_name"] = github_cfg.get("tag_name", "launch-v0")
    if record.slug == "medium":
        medium_cfg = launch.publish.get("medium", {})
        payload["medium_author_id"] = medium_cfg.get("author_id", "")
    if record.slug == "linkedin":
        linkedin_cfg = launch.publish.get("linkedin", {})
        payload["linkedin_author"] = linkedin_cfg.get("author", "")
    return payload
