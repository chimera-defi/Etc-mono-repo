from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from orbit_pilot.audit import list_submissions

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
        if row["mode"] != "manual" or row["status"] == "manual_completed":
            continue
        meta_path = run_dir / row["platform"] / "meta.json"
        meta = {}
        if meta_path.exists():
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
        row = {**row, "priority": int(meta.get("priority", 50)), "risk_rank": RISK_ORDER.get(meta.get("risk", "medium"), 99)}
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
    return {"results": rows, "pending_manual": pending_manual, "next_manual": next_manual}
