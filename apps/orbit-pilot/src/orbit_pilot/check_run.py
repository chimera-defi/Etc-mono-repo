"""Validate a run directory (run.json + referenced paths) for agents/CI."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from orbit_pilot.services.campaigns import load_run_manifest


def check_run(run_dir: Path) -> dict[str, Any]:
    run_dir = run_dir.resolve()
    errors: list[str] = []
    warnings: list[str] = []

    if not run_dir.is_dir():
        return {"ok": False, "errors": [f"not a directory: {run_dir}"], "warnings": []}

    manifest_path = run_dir / "run.json"
    if not manifest_path.is_file():
        return {"ok": False, "errors": [f"missing run.json in {run_dir}"], "warnings": []}

    try:
        manifest = load_run_manifest(run_dir)
    except ValueError as exc:
        return {"ok": False, "errors": [str(exc)], "warnings": []}
    except OSError as exc:
        return {"ok": False, "errors": [f"run.json: {exc}"], "warnings": []}

    for key in ("launch_path", "platform_registry_path"):
        p = Path(manifest.get(key) or "")
        if not p.is_file():
            errors.append(f"{key} missing or not a file: {manifest.get(key)}")

    policy = manifest.get("policy_path")
    if policy and not Path(policy).is_file():
        warnings.append(f"policy_path not found (regenerate may use default): {policy}")

    if not (run_dir / "orbit.sqlite").is_file():
        warnings.append("orbit.sqlite missing (generate may not have run yet)")

    return {"ok": not errors, "errors": errors, "warnings": warnings, "manifest": manifest}
