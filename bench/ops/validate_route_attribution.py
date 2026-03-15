#!/usr/bin/env python3
"""Validate manifest route attribution fields for benchmark supervisor runs."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

DEFAULT_RUNS_DIR = Path(__file__).resolve().parents[1] / "supervisor_runs"
REQUIRED_FIELDS = ("used_fallback", "served_by", "original_model", "fallback_model")


def latest_manifest(runs_dir: Path) -> Path | None:
    if not runs_dir.exists():
        return None
    candidates = sorted(
        runs_dir.glob("*/manifest.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return candidates[0] if candidates else None


def load_manifest(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("manifest root must be a JSON object")
    return data


def validate_job(job: dict[str, Any], *, index: int) -> list[str]:
    errors: list[str] = []

    missing = [field for field in REQUIRED_FIELDS if field not in job]
    if missing:
        errors.append(f"job[{index}]: missing required fields: {', '.join(missing)}")
        return errors

    used_fallback = job.get("used_fallback")
    served_by = job.get("served_by")
    original_model = job.get("original_model")
    fallback_model = job.get("fallback_model")

    if not isinstance(used_fallback, bool):
        errors.append(f"job[{index}]: used_fallback must be boolean")

    if not isinstance(served_by, str) or not served_by.strip():
        errors.append(f"job[{index}]: served_by must be a non-empty string")

    if not isinstance(original_model, str) or not original_model.strip():
        errors.append(f"job[{index}]: original_model must be a non-empty string")

    if fallback_model is not None and (not isinstance(fallback_model, str) or not fallback_model.strip()):
        errors.append(f"job[{index}]: fallback_model must be null or a non-empty string")

    if errors:
        return errors

    if used_fallback:
        if fallback_model is None:
            errors.append(f"job[{index}]: used_fallback=true requires fallback_model")
        if served_by != fallback_model:
            errors.append(
                f"job[{index}]: used_fallback=true requires served_by == fallback_model "
                f"(got served_by={served_by!r}, fallback_model={fallback_model!r})"
            )
    else:
        if fallback_model is not None:
            errors.append(f"job[{index}]: used_fallback=false requires fallback_model to be null")
        if served_by != original_model:
            errors.append(
                f"job[{index}]: used_fallback=false requires served_by == original_model "
                f"(got served_by={served_by!r}, original_model={original_model!r})"
            )

    return errors


def validate_manifest(data: dict[str, Any]) -> dict[str, Any]:
    jobs = data.get("jobs")
    errors: list[str] = []

    if not isinstance(jobs, list):
        errors.append("manifest: jobs must be a list")
        jobs = []

    for idx, job in enumerate(jobs):
        if not isinstance(job, dict):
            errors.append(f"job[{idx}]: must be a JSON object")
            continue
        errors.extend(validate_job(job, index=idx))

    return {
        "ok": not errors,
        "run_id": data.get("run_id"),
        "job_count": len(jobs),
        "errors": errors,
    }


def print_human(report: dict[str, Any], manifest_path: Path) -> None:
    status = "OK" if report["ok"] else "INVALID"
    print(f"{status}: {manifest_path}")
    print(f"run_id: {report.get('run_id') or 'unknown'}")
    print(f"jobs checked: {report['job_count']}")
    if report["errors"]:
        print("errors:")
        for error in report["errors"]:
            print(f"  - {error}")
    else:
        print("errors: none")


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate route attribution fields in a supervisor manifest")
    ap.add_argument("manifest", nargs="?", type=Path, help="Path to manifest.json (defaults to latest under --runs-dir)")
    ap.add_argument(
        "--runs-dir",
        type=Path,
        default=DEFAULT_RUNS_DIR,
        help=f"Runs directory for auto-discovering latest manifest (default: {DEFAULT_RUNS_DIR})",
    )
    ap.add_argument("--json", action="store_true", help="Emit validation report as JSON")
    args = ap.parse_args()

    manifest_path = args.manifest or latest_manifest(args.runs_dir)
    if manifest_path is None:
        raise SystemExit("No manifest.json found. Pass a manifest path or populate --runs-dir.")

    try:
        report = validate_manifest(load_manifest(manifest_path))
    except Exception as exc:
        report = {"ok": False, "run_id": None, "job_count": 0, "errors": [str(exc)]}

    if args.json:
        print(json.dumps({"manifest": str(manifest_path), **report}, indent=2, ensure_ascii=False))
    else:
        print_human(report, manifest_path)

    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
