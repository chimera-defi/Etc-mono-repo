from __future__ import annotations

import os
from typing import Any

from orbit_pilot.publishers.http import json_post


def publish(payload: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    if dry_run:
        return {"status": "dry_run", "url": payload["url"], "publisher": "medium"}
    token = os.environ.get("MEDIUM_TOKEN")
    author_id = payload.get("medium_author_id")
    if not token:
        return {"status": "error", "error": "MEDIUM_TOKEN is not set", "publisher": "medium"}
    if not author_id:
        return {"status": "error", "error": "medium_author_id missing from payload", "publisher": "medium"}
    body = {
        "title": payload.get("title", ""),
        "contentFormat": "markdown",
        "content": payload.get("body", ""),
        "publishStatus": "public",
        "tags": payload.get("tags", []),
        "canonicalUrl": payload.get("url"),
    }
    response = json_post(
        f"https://api.medium.com/v1/users/{author_id}/posts",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json", "User-Agent": "orbit-pilot"},
        body=body,
    )
    if not response["ok"]:
        return {"status": "error", "error": response["error"], "publisher": "medium"}
    data = response["data"].get("data", response["data"])
    return {"status": "published", "url": data.get("url", payload["url"]), "publisher": "medium"}
