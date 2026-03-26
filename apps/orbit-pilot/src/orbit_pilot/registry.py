from __future__ import annotations

from pathlib import Path

from orbit_pilot.config import load_document
from orbit_pilot.models import PlatformRecord


def load_platforms(path: str | Path) -> list[PlatformRecord]:
    raw = load_document(path)
    records: list[PlatformRecord] = []
    for item in raw.get("platforms", []):
        img = item.get("image_constraints") or {}
        w = img.get("max_width")
        h = img.get("max_height")
        bfs = item.get("browser_form_selectors") or {}
        records.append(
            PlatformRecord(
                name=item["name"],
                slug=item["slug"],
                category=item.get("category", "unknown"),
                official_url=item.get("official_url", ""),
                submit_url=item.get("submit_url", ""),
                mode=item.get("mode", "manual"),
                risk=item.get("risk", "medium"),
                priority=int(item.get("priority", 50)),
                cooldown_seconds=int(item.get("cooldown_seconds", 3600)),
                image_max_width=int(w) if w is not None else None,
                image_max_height=int(h) if h is not None else None,
                cta_in_body=bool(item.get("cta_in_body", True)),
                browser_form_selectors={str(k): str(v) for k, v in bfs.items()} if isinstance(bfs, dict) else {},
            )
        )
    return records
