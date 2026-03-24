from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from orbit_pilot.audit import append_audit_event, record_submission
from orbit_pilot.publishers.requirements import validate_platform
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
        planned_mode = str(meta.get("planned_mode", "manual"))

        if planned_mode == "manual":
            result = {
                "status": "blocked",
                "error": "Platform is manual-only in this run; complete submission by hand and use orbit mark-done",
                "publisher": platform,
            }
            record_submission(run_dir, platform, "manual", result["status"], "publish blocked: manual mode", result)
            results.append({"platform": platform, "result": result})
            continue

        if planned_mode == "skipped":
            result = {
                "status": "blocked",
                "error": "Platform was skipped in generate; nothing to publish",
                "publisher": platform,
            }
            record_submission(run_dir, platform, "skipped", result["status"], "publish blocked: skipped", result)
            results.append({"platform": platform, "result": result})
            continue

        if planned_mode == "browser_fallback":
            result = {
                "status": "blocked",
                "error": "browser_fallback is manual/high-risk only; use PROMPT_USER.txt and orbit mark-done",
                "publisher": platform,
            }
            record_submission(
                run_dir,
                platform,
                "browser_fallback",
                result["status"],
                "publish blocked: browser_fallback",
                result,
            )
            results.append({"platform": platform, "result": result})
            continue

        remaining = cooldown_remaining(run_dir, platform, int(meta.get("cooldown_seconds", 0)))
        if remaining > 0:
            result = {"status": "cooldown_blocked", "error": f"{remaining}s cooldown remaining", "publisher": platform}
            append_audit_event(
                run_dir,
                {"type": "publish_blocked", "platform": platform, "reason": "cooldown", "remaining_s": remaining},
            )
            results.append({"platform": platform, "result": result})
            continue

        result = publish_platform(platform, payload, dry_run=not execute)
        if not execute:
            if platform in PUBLISHERS:
                readiness = validate_platform(platform, payload)
                result["readiness"] = readiness
                if readiness["ready"]:
                    result["next_step"] = f"Run with --execute for {platform} when you are ready."
                else:
                    missing = ", ".join(readiness["missing_secrets"] + readiness["missing_payload"])
                    result["next_step"] = f"Provide missing requirements ({missing}) and rerun orbit doctor."
            else:
                result["next_step"] = f"Open {meta.get('submit_url', 'the platform')} and use PROMPT_USER.txt."
        api_mode = "official_api" if planned_mode == "official_api" else planned_mode
        record_submission(run_dir, platform, api_mode, result["status"], "publish command", result)
        if execute and result.get("status") == "published":
            record_publish_attempt(run_dir, platform)
        results.append({"platform": platform, "result": result})
    return results
