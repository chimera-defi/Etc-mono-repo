from __future__ import annotations

from typing import Any

from orbit_pilot.graph import build_payload, plan_platform
from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.publishers.requirements import validate_platform


def doctor_payload(launch: LaunchProfile, platforms: list[PlatformRecord]) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    for record in platforms:
        decision = plan_platform(record)
        payload = build_payload(launch, record)
        if decision.mode == "official_api":
            validation = validate_platform(record.slug, payload)
            results.append(
                {
                    "platform": record.slug,
                    "mode": decision.mode,
                    "ready": validation["ready"],
                    "missing_secrets": validation["missing_secrets"],
                    "missing_payload": validation["missing_payload"],
                }
            )
        else:
            results.append(
                {
                    "platform": record.slug,
                    "mode": decision.mode,
                    "ready": True,
                    "missing_secrets": [],
                    "missing_payload": [],
                }
            )
    return {"results": results}
