from __future__ import annotations

from typing import Any, Callable

from orbit_pilot.publishers import github, linkedin, medium, x
from orbit_pilot.publishers import dev as dev_publisher

Publisher = Callable[[dict[str, Any], bool], dict[str, Any]]

PUBLISHERS: dict[str, Publisher] = {
    "github": github.publish,
    "dev": dev_publisher.publish,
    "medium": medium.publish,
    "linkedin": linkedin.publish,
    "x": x.publish,
}


def publish_platform(platform: str, payload: dict[str, Any], dry_run: bool) -> dict[str, Any]:
    publisher = PUBLISHERS.get(platform)
    if publisher is None:
        return {"status": "manual_only", "url": payload.get("url"), "publisher": platform}
    return publisher(payload, dry_run=dry_run)
