from __future__ import annotations

from typing import Any


def publish(payload: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    if dry_run:
        return {"status": "dry_run", "url": payload["url"], "publisher": "medium"}
    return {"status": "not_implemented", "url": payload["url"], "publisher": "medium"}
