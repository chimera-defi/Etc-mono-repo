from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal
from urllib.parse import urlencode, urlparse, urlunparse, parse_qsl

Mode = Literal["official_api", "manual", "browser_fallback_opt_in", "skipped"]


@dataclass
class LaunchProfile:
    product_name: str
    website_url: str
    tagline: str
    summary: str
    features: list[str] = field(default_factory=list)
    assets: list[str] = field(default_factory=list)


@dataclass
class SubmissionDecision:
    platform: str
    mode: Mode
    risk_level: str
    reason: str
    payload: dict[str, Any] | None = None
    result: dict[str, Any] | None = None


def append_utm(url: str, source: str, medium: str, campaign: str, content: str) -> str:
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query.update(
        {
            "utm_source": source,
            "utm_medium": medium,
            "utm_campaign": campaign,
            "utm_content": content,
        }
    )
    return urlunparse(parsed._replace(query=urlencode(query)))


def build_medium_payload(launch: LaunchProfile) -> dict[str, Any]:
    url = append_utm(
        launch.website_url,
        source="orbit_pilot_medium",
        medium="community",
        campaign="launch",
        content="medium",
    )
    return {
        "title": f"{launch.product_name}: {launch.tagline}",
        "content_format": "markdown",
        "content": (
            f"# {launch.product_name}\n\n"
            f"{launch.summary}\n\n"
            f"Features:\n" + "\n".join(f"- {feature}" for feature in launch.features) + f"\n\n{url}"
        ),
        "canonical_url": url,
    }


def plan_platform(platform: str, credentials: dict[str, str]) -> SubmissionDecision:
    if platform == "medium":
        if credentials.get("medium_token"):
            return SubmissionDecision(platform, "official_api", "medium", "Existing Medium token available")
        return SubmissionDecision(platform, "manual", "medium", "No working Medium token")
    if platform == "github":
        if credentials.get("github_token"):
            return SubmissionDecision(platform, "official_api", "low", "GitHub token available")
        return SubmissionDecision(platform, "manual", "low", "No GitHub token")
    if platform in {"crunchbase", "product_hunt", "tiny_startups", "trustmrr"}:
        return SubmissionDecision(platform, "manual", "medium", "Manual by default")
    return SubmissionDecision(platform, "manual", "medium", "Conservative default")


def run_launch(launch: LaunchProfile, platforms: list[str], credentials: dict[str, str]) -> list[SubmissionDecision]:
    decisions: list[SubmissionDecision] = []
    for platform in platforms:
        decision = plan_platform(platform, credentials)
        if platform == "medium":
            decision.payload = build_medium_payload(launch)
        decisions.append(decision)
    return decisions


if __name__ == "__main__":
    launch = LaunchProfile(
        product_name="OrbitPilot",
        website_url="https://orbitpilot.ai",
        tagline="AI launch research and distribution ops for SaaS teams",
        summary="OrbitPilot turns one launch brief into tracked, platform-specific submission drafts.",
        features=["UTM appending", "platform registry", "manual queue", "duplicate checks"],
    )
    results = run_launch(
        launch,
        platforms=["medium", "github", "crunchbase", "product_hunt"],
        credentials={"github_token": "env://github"},
    )
    for result in results:
        print(result)
