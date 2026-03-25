"""Optional webhook → generate run (ORBIT_WEBHOOK_ALLOW_GENERATE=1)."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from orbit_pilot.policy import bundled_default_policy_path, load_risk_policy
from orbit_pilot.registry import load_platforms
from orbit_pilot.services.campaigns import build_campaign, create_run_dir, write_run_manifest
from orbit_pilot.services.generation import generate_run


def try_generate_from_hook_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    If ORBIT_WEBHOOK_ALLOW_GENERATE=1 and payload includes launch_path, platforms_path, out:
    run generate and return run_dir + result count. Otherwise return skipped reason.
    """
    if os.environ.get("ORBIT_WEBHOOK_ALLOW_GENERATE", "").strip() not in ("1", "true", "yes"):
        return {"skipped": True, "reason": "ORBIT_WEBHOOK_ALLOW_GENERATE not enabled"}

    launch_path = payload.get("launch_path") or payload.get("launch")
    plat_path = payload.get("platforms_path") or payload.get("platforms")
    out = payload.get("out") or os.environ.get("ORBIT_HOOK_OUT", "out")
    policy_path = (
        payload.get("policy_path") or os.environ.get("ORBIT_HOOK_POLICY_PATH") or bundled_default_policy_path()
    )

    if not launch_path or not plat_path:
        return {"skipped": True, "reason": "launch_path and platforms_path required in payload"}

    from orbit_pilot.cli import load_launch

    launch = load_launch(str(launch_path))
    platforms = load_platforms(plat_path)
    policy = load_risk_policy(policy_path)

    campaign = build_campaign(launch, explicit_name=payload.get("campaign"))
    run_dir = create_run_dir(out, campaign)
    write_run_manifest(
        run_dir,
        campaign,
        str(Path(launch_path).resolve()),
        str(Path(plat_path).resolve()),
        policy_path=policy_path,
    )
    results = generate_run(launch, platforms, run_dir, policy=policy)
    return {
        "skipped": False,
        "run_dir": str(run_dir),
        "generated": len(results),
        "results": results,
    }
