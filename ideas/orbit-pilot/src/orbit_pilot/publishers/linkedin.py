from __future__ import annotations

import os
from typing import Any

from orbit_pilot.publishers.http import json_post


def publish(payload: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    if dry_run:
        return {"status": "dry_run", "url": payload["url"], "publisher": "linkedin"}
    token = os.environ.get("LINKEDIN_ACCESS_TOKEN")
    author = payload.get("linkedin_author")
    if not token:
        return {"status": "error", "error": "LINKEDIN_ACCESS_TOKEN is not set", "publisher": "linkedin"}
    if not author:
        return {"status": "error", "error": "linkedin_author missing from payload", "publisher": "linkedin"}
    body = {
        "author": author,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": payload.get("body", "")},
                "shareMediaCategory": "ARTICLE",
                "media": [
                    {
                        "status": "READY",
                        "originalUrl": payload.get("url"),
                        "title": {"text": payload.get("title", "")},
                    }
                ],
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }
    response = json_post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers={"Authorization": f"Bearer {token}", "X-Restli-Protocol-Version": "2.0.0", "User-Agent": "orbit-pilot"},
        body=body,
    )
    if not response["ok"]:
        return {"status": "error", "error": response["error"], "publisher": "linkedin"}
    return {"status": "published", "url": payload["url"], "publisher": "linkedin"}
