from __future__ import annotations

from typing import Any

from orbit_pilot.graph import build_body_for_platform, build_payload, plan_platform
from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.policy import RiskPolicy, apply_risk_policy
from orbit_pilot.publishers.requirements import validate_platform


def doctor_payload(
    launch: LaunchProfile,
    platforms: list[PlatformRecord],
    policy: RiskPolicy | None = None,
) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    for record in platforms:
        decision = apply_risk_policy(plan_platform(record, launch), record, policy)
        body = build_body_for_platform(launch, record)
        payload = build_payload(launch, record, body)
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
