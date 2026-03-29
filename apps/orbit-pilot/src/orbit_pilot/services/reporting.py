from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from orbit_pilot.audit import list_submissions
from orbit_pilot.publishers.requirements import validate_platform
from orbit_pilot.publishers.router import PUBLISHERS

RISK_ORDER = {
    "low": 1,
    "low_medium": 2,
    "medium": 3,
    "medium_high": 4,
    "high": 5,
}


def get_pending_manual(run_dir: Path, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    pending: list[dict[str, Any]] = []
    for row in rows:
        if row["mode"] not in ("manual", "browser_fallback", "browser_assisted") or row["status"] == "manual_completed":
            continue
        meta_path = run_dir / row["platform"] / "meta.json"
        meta = {}
        if meta_path.exists():
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
        row = {
            **row,
            "priority": int(meta.get("priority", 50)),
            "risk_rank": RISK_ORDER.get(meta.get("risk", "medium"), 99),
        }
        pending.append(row)
    pending.sort(key=lambda item: (-item["priority"], item["risk_rank"], item["platform"]))
    return pending


def next_manual_payload(run_dir: Path) -> dict[str, Any]:
    rows = list_submissions(run_dir)
    pending = get_pending_manual(run_dir, rows)
    if not pending:
        return {"message": "No pending manual submissions."}
    row = pending[0]
    platform_dir = run_dir / row["platform"]
    prompt_text = (platform_dir / "PROMPT_USER.txt").read_text(encoding="utf-8")
    payload = json.loads((platform_dir / "payload.json").read_text(encoding="utf-8"))
    return {"platform": row["platform"], "status": row["status"], "prompt": prompt_text, "payload": payload}


def report_payload(run_dir: Path) -> dict[str, Any]:
    rows = list_submissions(run_dir)
    pending = get_pending_manual(run_dir, rows)
    pending_manual = [row["platform"] for row in pending]
    next_manual = pending_manual[0] if pending_manual else None
    skipped = [r["platform"] for r in rows if r["mode"] == "skipped"]
    browser_fb = [r["platform"] for r in rows if r["mode"] == "browser_fallback"]
    browser_asst = [r["platform"] for r in rows if r["mode"] == "browser_assisted"]
    official = [r for r in rows if r["mode"] == "official_api"]
    return {
        "results": rows,
        "pending_manual": pending_manual,
        "next_manual": next_manual,
        "skipped": skipped,
        "browser_fallback": browser_fb,
        "browser_assisted": browser_asst,
        "official_api_rows": official,
    }


def human_guide(run_dir: Path) -> dict[str, Any]:
    rows = list_submissions(run_dir)
    pending = get_pending_manual(run_dir, rows)
    official_ready: list[dict[str, Any]] = []
    official_blocked: list[dict[str, Any]] = []
    for row in rows:
        if row["platform"] not in PUBLISHERS:
            continue
        payload = json.loads((run_dir / row["platform"] / "payload.json").read_text(encoding="utf-8"))
        readiness = validate_platform(row["platform"], payload)
        item = {
            "platform": row["platform"],
            "ready": readiness["ready"],
            "missing_secrets": readiness["missing_secrets"],
            "missing_payload": readiness["missing_payload"],
        }
        if readiness["ready"]:
            item["next_step"] = f"Run orbit publish --run {run_dir} --platform {row['platform']} --execute"
            official_ready.append(item)
        else:
            item["next_step"] = "Fill missing secrets or payload fields, then rerun orbit doctor."
            official_blocked.append(item)

    manual_top: list[dict[str, Any]] = []
    for row in pending[:3]:
        meta = json.loads((run_dir / row["platform"] / "meta.json").read_text(encoding="utf-8"))
        planned = str(meta.get("planned_mode", ""))
        entry: dict[str, Any] = {
            "platform": row["platform"],
            "submit_url": meta.get("submit_url"),
            "priority": row["priority"],
            "prompt_path": str(run_dir / row["platform"] / "PROMPT_USER.txt"),
        }
        if planned == "browser_assisted":
            entry["browser_assist"] = True
            entry["next_step"] = (
                f"orbit publish --run {run_dir} --platform {row['platform']} --execute --browser "
                "(install orbit-pilot[browser]; set ORBIT_BROWSER_AUTOMATION_SECRET + CONFIRM)"
            )
        manual_top.append(entry)
    return {
        "official_ready": official_ready,
        "official_blocked": official_blocked,
        "manual_top": manual_top,
        "next_manual": manual_top[0]["platform"] if manual_top else None,
    }
