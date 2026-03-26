from __future__ import annotations

from typing import Any

from orbit_pilot.credentials import get_secret
from orbit_pilot.publishers.http import json_post


def publish(payload: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    if dry_run:
        return {"status": "dry_run", "url": payload["url"], "publisher": "dev"}
    token = get_secret("DEVTO_API_KEY")
    if not token:
        return {"status": "error", "error": "DEVTO_API_KEY is not set", "publisher": "dev"}
    body = {
        "article": {
            "title": payload.get("title", ""),
            "body_markdown": payload.get("body", ""),
            "published": True,
            "canonical_url": payload.get("url"),
            "tags": payload.get("tags", []),
        }
    }
    response = json_post(
        "https://dev.to/api/articles",
        headers={"api-key": token, "User-Agent": "orbit-pilot"},
        body=body,
    )
    if not response["ok"]:
        return {"status": "error", "error": response["error"], "publisher": "dev"}
    data = response["data"]
    return {"status": "published", "url": data.get("url", payload["url"]), "publisher": "dev"}
