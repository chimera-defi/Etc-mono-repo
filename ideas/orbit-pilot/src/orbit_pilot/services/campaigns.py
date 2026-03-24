from __future__ import annotations

import json
import re
from datetime import UTC, datetime
from pathlib import Path

from orbit_pilot.models import Campaign, LaunchProfile


def slugify(value: str) -> str:
    lowered = value.lower().strip()
    return re.sub(r"[^a-z0-9]+", "-", lowered).strip("-") or "campaign"


def build_campaign(launch: LaunchProfile, explicit_name: str | None = None) -> Campaign:
    name = explicit_name or launch.product_name
    created_at = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    return Campaign(id=slugify(name), name=name, created_at=created_at)


def create_run_dir(base_out: str | Path, campaign: Campaign) -> Path:
    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    run_dir = Path(base_out) / campaign.id / f"run-{timestamp}"
    run_dir.mkdir(parents=True, exist_ok=True)
    return run_dir


def write_run_manifest(run_dir: Path, campaign: Campaign, launch_path: str, platform_path: str) -> None:
    manifest = {
        "campaign": {"id": campaign.id, "name": campaign.name, "created_at": campaign.created_at},
        "launch_path": launch_path,
        "platform_registry_path": platform_path,
        "run_dir": str(run_dir),
    }
    (run_dir / "run.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def load_run_manifest(run_dir: Path) -> dict:
    return json.loads((run_dir / "run.json").read_text(encoding="utf-8"))
