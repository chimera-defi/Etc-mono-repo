"""Validate platform registry YAML for agents/CI (URLs, slugs, placeholders)."""

from __future__ import annotations

from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from orbit_pilot.registry import load_platforms


def _bad_placeholder(url: str) -> bool:
    u = url.strip().lower()
    return u in ("", "unknown", "n/a", "na", "tbd", "todo", "none")


def _is_https(url: str) -> bool:
    return urlparse(url.strip()).scheme.lower() == "https"


def lint_platform_registry(path: str | Path) -> dict[str, Any]:
    p = Path(path)
    errors: list[str] = []
    warnings: list[str] = []

    if not p.is_file():
        return {"ok": False, "errors": [f"not a file: {p}"], "warnings": [], "platform_count": 0}

    try:
        records = load_platforms(p)
    except Exception as exc:
        return {"ok": False, "errors": [f"load failed: {exc}"], "warnings": [], "platform_count": 0}

    if not records:
        errors.append("no platforms loaded")

    seen: set[str] = set()
    for r in records:
        if r.slug in seen:
            errors.append(f"duplicate slug: {r.slug}")
        seen.add(r.slug)

        for field, val in (("official_url", r.official_url), ("submit_url", r.submit_url)):
            v = str(val or "").strip()
            if _bad_placeholder(v):
                errors.append(f"{r.slug}: {field} is missing or placeholder ({val!r})")
            elif v and not _is_https(v):
                warnings.append(f"{r.slug}: {field} should use https (got {v[:48]}…)")

    return {
        "ok": not errors,
        "errors": errors,
        "warnings": warnings,
        "platform_count": len(records),
    }
