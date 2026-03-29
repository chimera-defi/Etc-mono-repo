from __future__ import annotations

import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from orbit_pilot.credentials import get_secret


def publish(payload: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    if dry_run:
        return {"status": "dry_run", "url": payload["url"], "publisher": "github"}
    token = get_secret("GITHUB_TOKEN")
    repo = payload.get("github_repo")
    tag_name = payload.get("tag_name", "launch-v0")
    if not token:
        return {"status": "error", "error": "GITHUB_TOKEN is not set", "publisher": "github"}
    if not repo:
        return {"status": "error", "error": "github_repo missing from payload", "publisher": "github"}

    body = {
        "tag_name": tag_name,
        "name": payload.get("title", tag_name),
        "body": payload.get("body", ""),
        "draft": False,
        "prerelease": False,
    }
    request = Request(
        f"https://api.github.com/repos/{repo}/releases",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "orbit-pilot",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
            return {"status": "published", "url": data.get("html_url", payload["url"]), "publisher": "github"}
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        return {"status": "error", "error": f"HTTP {exc.code}: {detail}", "publisher": "github"}
    except URLError as exc:
        return {"status": "error", "error": str(exc.reason), "publisher": "github"}
