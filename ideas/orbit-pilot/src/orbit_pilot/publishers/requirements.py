from __future__ import annotations

from typing import Any

from orbit_pilot.credentials import get_secret

REQUIREMENTS = {
    "github": {"secrets": ["GITHUB_TOKEN"], "payload": ["github_repo"]},
    "dev": {"secrets": ["DEVTO_API_KEY"], "payload": []},
    "medium": {"secrets": ["MEDIUM_TOKEN"], "payload": ["medium_author_id"]},
    "linkedin": {"secrets": ["LINKEDIN_ACCESS_TOKEN"], "payload": ["linkedin_author"]},
    "x": {"secrets": ["X_ACCESS_TOKEN"], "payload": []},
}


def validate_platform(platform: str, payload: dict[str, Any]) -> dict[str, Any]:
    requirements = REQUIREMENTS.get(platform, {"secrets": [], "payload": []})
    missing_secrets = [name for name in requirements["secrets"] if not get_secret(name)]
    missing_payload = [name for name in requirements["payload"] if not payload.get(name)]
    ready = not missing_secrets and not missing_payload
    return {
        "platform": platform,
        "ready": ready,
        "missing_secrets": missing_secrets,
        "missing_payload": missing_payload,
    }
