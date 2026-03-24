from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from orbit_pilot.audit import list_submissions
from orbit_pilot.services.campaigns import load_run_manifest
from orbit_pilot.services.reporting import report_payload


def export_run(run_dir: Path, fmt: str) -> str:
    manifest = load_run_manifest(run_dir)
    report = report_payload(run_dir)
    rows = list_submissions(run_dir)
    payload: dict[str, Any] = {
        "run_dir": str(run_dir),
        "manifest": manifest,
        "report": report,
        "submissions": rows,
    }
    if fmt == "json":
        return json.dumps(payload, indent=2, ensure_ascii=False)
    return _to_markdown(payload)


def _to_markdown(data: dict[str, Any]) -> str:
    lines = [
        "# Orbit Pilot run export",
        "",
        f"**Run:** `{data['run_dir']}`",
        "",
        "## Platforms",
        "",
        "| Platform | Mode | Status | Live URL |",
        "|----------|------|--------|----------|",
    ]
    for row in data["submissions"]:
        url = row.get("live_url") or ""
        lines.append(f"| {row['platform']} | {row['mode']} | {row['status']} | {url} |")
    lines.extend(["", "## Pending manual", ""])
    pending = data["report"].get("pending_manual") or []
    if pending:
        lines.append(", ".join(pending))
    else:
        lines.append("(none)")
    lines.append("")
    return "\n".join(lines)
