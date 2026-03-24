from __future__ import annotations

from pathlib import Path
from typing import Any

from orbit_pilot.assets import prepare_assets
from orbit_pilot.audit import init_db, record_submission
from orbit_pilot.dedupe import digest_text
from orbit_pilot.graph import build_body_for_platform, build_payload, plan_platform
from orbit_pilot.manual_pack import write_manual_pack
from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.policy import RiskPolicy, apply_risk_policy
from orbit_pilot.prompts import uniquify_body_if_duplicate
from orbit_pilot.state import record_digest, seen_digest


def generate_run(
    launch: LaunchProfile,
    platforms: list[PlatformRecord],
    run_dir: Path,
    policy: RiskPolicy | None = None,
) -> list[dict[str, Any]]:
    init_db(run_dir)
    results: list[dict[str, Any]] = []
    seen_in_run: dict[str, str] = {}
    for record in platforms:
        decision = apply_risk_policy(plan_platform(record, launch), record, policy)
        if decision.mode == "skipped":
            body = build_body_for_platform(launch, record)
            decision.payload = build_payload(launch, record, body)
            result = {"status": "skipped", "url": decision.payload.get("url"), "duplicate": False, "assets": []}
            decision.result = result
            record_submission(run_dir, record.slug, decision.mode, result["status"], decision.reason, result)
            results.append(
                {
                    "platform": record.slug,
                    "mode": decision.mode,
                    "risk_level": decision.risk_level,
                    "reason": decision.reason,
                    "payload_path": None,
                    "duplicate": False,
                    "asset_count": 0,
                }
            )
            continue

        base_body = build_body_for_platform(launch, record)
        body = uniquify_body_if_duplicate(base_body, record, seen_in_run)
        decision.payload = build_payload(launch, record, body)
        write_manual_pack(run_dir, record, decision)
        digest = digest_text(f"{decision.payload.get('title', '')}\n{decision.payload.get('body', '')}")
        duplicate = seen_digest(run_dir, digest)
        record_digest(run_dir, digest, record.slug)
        assets = prepare_assets(launch, record, run_dir / record.slug)
        result = {"status": "generated", "url": decision.payload["url"], "duplicate": duplicate, "assets": assets}
        decision.result = result
        record_submission(run_dir, record.slug, decision.mode, result["status"], decision.reason, result)
        results.append(
            {
                "platform": record.slug,
                "mode": decision.mode,
                "risk_level": decision.risk_level,
                "reason": decision.reason,
                "payload_path": str(run_dir / record.slug / "payload.json"),
                "duplicate": duplicate,
                "asset_count": len(assets),
            }
        )
    return results


def select_platforms(platforms: list[PlatformRecord], selected: list[str] | None) -> list[PlatformRecord]:
    if not selected:
        return platforms
    wanted = set(selected)
    return [record for record in platforms if record.slug in wanted]
