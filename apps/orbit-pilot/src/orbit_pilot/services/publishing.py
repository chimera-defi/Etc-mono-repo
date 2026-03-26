from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from orbit_pilot.audit import append_audit_event, record_submission
from orbit_pilot.policy import load_risk_policy
from orbit_pilot.publishers.requirements import validate_platform
from orbit_pilot.publishers.router import PUBLISHERS, publish_platform
from orbit_pilot.registry import load_platforms
from orbit_pilot.services.campaigns import load_run_manifest
from orbit_pilot.state import cooldown_remaining, record_publish_attempt


def _record_blocked(
    run_dir: Path,
    platform: str,
    mode: str,
    status: str,
    reason: str,
    result: dict[str, Any],
    results: list[dict[str, Any]],
) -> None:
    record_submission(run_dir, platform, mode, status, reason, result)
    results.append({"platform": platform, "result": result})


def publish_from_run(run_dir: Path, platforms: list[str], execute: bool) -> list[dict[str, Any]]:
    if not run_dir.exists():
        raise FileNotFoundError(f"Run directory not found: {run_dir}")
    manifest = load_run_manifest(run_dir)
    policy = load_risk_policy(manifest.get("policy_path"))
    reg_path = manifest.get("platform_registry_path")
    reg_records: list = []
    if reg_path and Path(reg_path).is_file():
        try:
            reg_records = load_platforms(reg_path)
        except OSError:
            reg_records = []
    slug_to_record = {r.slug: r for r in reg_records}
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
            _record_blocked(
                run_dir,
                platform,
                "manual",
                result["status"],
                "publish blocked: manual mode",
                result,
                results,
            )
            continue

        if planned_mode == "skipped":
            result = {
                "status": "blocked",
                "error": "Platform was skipped in generate; nothing to publish",
                "publisher": platform,
            }
            _record_blocked(run_dir, platform, "skipped", result["status"], "publish blocked: skipped", result, results)
            continue

        if planned_mode == "browser_fallback":
            result = {
                "status": "blocked",
                "error": "browser_fallback is manual/high-risk only; use PROMPT_USER.txt and orbit mark-done",
                "publisher": platform,
            }
            _record_blocked(
                run_dir,
                platform,
                "browser_fallback",
                result["status"],
                "publish blocked: browser_fallback",
                result,
                results,
            )
            continue

        if planned_mode == "browser_assisted":
            submit_url = str(meta.get("submit_url") or "")
            if not submit_url:
                result = {
                    "status": "error",
                    "error": "browser_assisted: missing submit_url in meta.json",
                    "publisher": platform,
                }
                _record_blocked(
                    run_dir,
                    platform,
                    "browser_assisted",
                    result["status"],
                    "publish browser assist",
                    result,
                    results,
                )
                continue
            if not execute:
                result = {
                    "status": "dry_run",
                    "url": submit_url,
                    "publisher": platform,
                    "next_step": (
                        "Run with --execute after setting ORBIT_ALLOW_BROWSER_AUTOMATION=1 and "
                        "ORBIT_BROWSER_AUTOMATION_CONFIRM to match ORBIT_BROWSER_AUTOMATION_SECRET; "
                        "install orbit-pilot[browser] and playwright install chromium. "
                        "Optional autofill: risk.allow_browser_autofill + registry browser_form_selectors + "
                        "ORBIT_ALLOW_BROWSER_AUTOFILL=1"
                    ),
                }
                record_submission(run_dir, platform, "browser_assisted", result["status"], "publish dry_run", result)
                results.append({"platform": platform, "result": result})
                continue
            allow = os.environ.get("ORBIT_ALLOW_BROWSER_AUTOMATION", "").strip() == "1"
            secret = os.environ.get("ORBIT_BROWSER_AUTOMATION_SECRET", "").strip()
            confirm = os.environ.get("ORBIT_BROWSER_AUTOMATION_CONFIRM", "").strip()
            if not allow or not secret or confirm != secret:
                result = {
                    "status": "blocked",
                    "error": (
                        "browser automation blocked: set ORBIT_ALLOW_BROWSER_AUTOMATION=1 and "
                        "ORBIT_BROWSER_AUTOMATION_SECRET + ORBIT_BROWSER_AUTOMATION_CONFIRM (same value)"
                    ),
                    "publisher": platform,
                }
                _record_blocked(
                    run_dir,
                    platform,
                    "browser_assisted",
                    result["status"],
                    "publish blocked: browser env",
                    result,
                    results,
                )
                continue
            from orbit_pilot.browser_assist import playwright_available, run_submit_portal_assist

            if not playwright_available():
                result = {
                    "status": "error",
                    "error": (
                        "playwright not installed; pip install 'orbit-pilot[browser]' "
                        "&& playwright install chromium"
                    ),
                    "publisher": platform,
                }
                record_submission(run_dir, platform, "browser_assisted", result["status"], "browser assist", result)
                results.append({"platform": platform, "result": result})
                continue
            headless = os.environ.get("ORBIT_BROWSER_HEADLESS", "1").strip() not in ("0", "false", "no")
            autofill_ok = (
                policy.allow_browser_autofill
                and os.environ.get("ORBIT_ALLOW_BROWSER_AUTOFILL", "").strip() == "1"
            )
            auto_submit_ok = (
                policy.allow_browser_auto_submit
                and os.environ.get("ORBIT_ALLOW_BROWSER_AUTO_SUBMIT", "").strip() == "1"
            )
            rec = slug_to_record.get(platform)
            selectors = dict(rec.browser_form_selectors) if rec else {}
            autofill = bool(autofill_ok and selectors)
            auto_submit = bool(auto_submit_ok and autofill)
            try:
                assist_out = run_submit_portal_assist(
                    submit_url,
                    payload,
                    selectors,
                    headless=headless,
                    autofill=autofill,
                    auto_submit=auto_submit,
                )
                opened = assist_out.get("url", submit_url)
                result = {
                    "status": "browser_assist_ran",
                    "url": opened,
                    "publisher": platform,
                    "autofill": autofill,
                    "auto_submit": assist_out.get("auto_submit", False),
                    "persistent_profile": assist_out.get("persistent_profile", False),
                    "auto_submit_error": assist_out.get("auto_submit_error"),
                    "note": (
                        "auto_submit attempted; verify page and run orbit mark-done --live-url … with final URL"
                        if assist_out.get("auto_submit")
                        else (
                            "Review the browser window, submit if correct, then orbit mark-done --live-url …"
                            if autofill
                            else "Operator must submit in the opened browser; then orbit mark-done --live-url …"
                        )
                    ),
                }
            except Exception as exc:  # pragma: no cover - browser env specific
                result = {"status": "error", "error": str(exc), "publisher": platform}
            record_submission(run_dir, platform, "browser_assisted", result["status"], "browser assist", result)
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
