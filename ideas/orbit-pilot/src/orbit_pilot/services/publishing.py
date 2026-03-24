from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from orbit_pilot.audit import record_submission
from orbit_pilot.publishers.router import PUBLISHERS, publish_platform
from orbit_pilot.state import cooldown_remaining, record_publish_attempt


def publish_from_run(run_dir: Path, platforms: list[str], execute: bool) -> list[dict[str, Any]]:
    if not run_dir.exists():
        raise FileNotFoundError(f"Run directory not found: {run_dir}")
    results: list[dict[str, Any]] = []
    for platform in platforms:
        payload_path = run_dir / platform / "payload.json"
        if not payload_path.exists():
            raise FileNotFoundError(f"Payload not found for platform '{platform}' in {run_dir}")
        meta_path = run_dir / platform / "meta.json"
        payload = json.loads(payload_path.read_text(encoding="utf-8"))
        meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
        remaining = cooldown_remaining(run_dir, platform, int(meta.get("cooldown_seconds", 0)))
        if remaining > 0:
            result = {"status": "cooldown_blocked", "error": f"{remaining}s cooldown remaining", "publisher": platform}
            results.append({"platform": platform, "result": result})
            continue
        result = publish_platform(platform, payload, dry_run=not execute)
        record_submission(run_dir, platform, "official_api" if platform in PUBLISHERS else "manual", result["status"], "publish command", result)
        if execute and result.get("status") == "published":
            record_publish_attempt(run_dir, platform)
        results.append({"platform": platform, "result": result})
    return results
