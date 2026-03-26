from __future__ import annotations

from typing import Any

from orbit_pilot.browser_assist import (
    chromium_launchable,
    playwright_available,
    submit_selector_for_registry,
)
from orbit_pilot.graph import build_body_for_platform, build_payload
from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.policy import RiskPolicy, decide_platform
from orbit_pilot.publishers.requirements import validate_platform


def doctor_payload(
    launch: LaunchProfile,
    platforms: list[PlatformRecord],
    policy: RiskPolicy | None = None,
) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    for record in platforms:
        decision = decide_platform(record, launch, policy)
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
        elif decision.mode == "browser_assisted":
            row: dict[str, Any] = {
                "platform": record.slug,
                "mode": decision.mode,
                "ready": True,
                "missing_secrets": [],
                "missing_payload": [],
            }
            if policy and policy.allow_browser_automation:
                if not playwright_available():
                    row["ready"] = False
                    row["missing_secrets"] = ["orbit-pilot[browser] (pip install)"]
                else:
                    ok, err = chromium_launchable()
                    if not ok:
                        row["ready"] = False
                        row["missing_secrets"] = [f"playwright chromium: {err}"]
                if policy.allow_browser_autofill and record.browser_form_selectors:
                    row["browser_autofill_selectors"] = list(record.browser_form_selectors.keys())
                elif policy.allow_browser_autofill and not record.browser_form_selectors:
                    row["browser_autofill_note"] = (
                        "allow_browser_autofill is true but registry has no browser_form_selectors for this slug"
                    )
                if policy.allow_browser_auto_submit:
                    bfs = record.browser_form_selectors
                    if not bfs or not submit_selector_for_registry(dict(bfs)):
                        row["browser_auto_submit_note"] = (
                            "allow_browser_auto_submit requires registry browser_form_selectors "
                            "including submit (or submit_button / submit_selector)"
                        )
            results.append(row)
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
