from __future__ import annotations

from pathlib import Path

from orbit_pilot.config import load_document
from orbit_pilot.models import PlatformRecord


def load_platforms(path: str | Path) -> list[PlatformRecord]:
    raw = load_document(path)
    records: list[PlatformRecord] = []
    for item in raw.get("platforms", []):
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
            )
        )
    return records
