from __future__ import annotations

import os
from typing import Any

from orbit_pilot.publishers.http import json_post


def publish(payload: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    if dry_run:
        return {"status": "dry_run", "url": payload["url"], "publisher": "x"}
    token = os.environ.get("X_ACCESS_TOKEN")
    base_url = os.environ.get("X_API_BASE_URL", "https://api.x.com/2")
    if not token:
        return {"status": "error", "error": "X_ACCESS_TOKEN is not set", "publisher": "x"}
    response = json_post(
        f"{base_url}/tweets",
        headers={"Authorization": f"Bearer {token}", "User-Agent": "orbit-pilot"},
        body={"text": payload.get("body", "")},
    )
    if not response["ok"]:
        return {"status": "error", "error": response["error"], "publisher": "x"}
    data = response["data"].get("data", response["data"])
    tweet_id = data.get("id")
    url = payload["url"]
    if tweet_id:
        url = f"https://x.com/i/web/status/{tweet_id}"
    return {"status": "published", "url": url, "publisher": "x"}
