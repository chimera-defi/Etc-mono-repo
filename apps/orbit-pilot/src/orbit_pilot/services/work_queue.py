"""Next queue item for humans/agents: submit URL, paths, suggested shell commands."""

from __future__ import annotations

import json
import shlex
from pathlib import Path
from typing import Any

from orbit_pilot.services.reporting import next_manual_payload


def work_next_payload(run_dir: Path) -> dict[str, Any]:
    """
    Extend next_manual_payload with URLs, file paths, and copy-paste shell hints.
    """
    base = next_manual_payload(run_dir)
    if base.get("message"):
        return {**base, "kind": "empty"}

    platform = str(base["platform"])
    run_s = shlex.quote(str(run_dir.resolve()))
    plat_q = shlex.quote(platform)
    meta_path = run_dir / platform / "meta.json"
    meta: dict[str, Any] = {}
    if meta_path.exists():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
    planned = str(meta.get("planned_mode", "manual"))
    submit_url = str(meta.get("submit_url") or "")
    prompt_path = run_dir / platform / "PROMPT_USER.txt"

    mark_done_cmd = f"orbit mark-done --run {run_s} --platform {plat_q} --live-url <URL>"
    out: dict[str, Any] = {
        **base,
        "kind": "task",
        "planned_mode": planned,
        "submit_url": submit_url or None,
        "prompt_path": str(prompt_path.resolve()) if prompt_path.exists() else None,
        "meta_path": str(meta_path.resolve()) if meta_path.exists() else None,
        "mark_done_command": mark_done_cmd,
    }

    if planned == "browser_assisted" and submit_url:
        out["playwright_assist_command"] = (
            f"orbit publish --run {run_s} --platform {plat_q} --execute --browser"
        )
    elif submit_url:
        out["open_hint"] = f"Open in browser: {submit_url}"

    return out


def open_submit_url(url: str) -> tuple[bool, str]:
    """Open URL in the default handler (usually the system browser)."""
    import webbrowser

    if not url.strip():
        return False, "empty URL"
    try:
        webbrowser.open(url, new=1)
    except Exception as exc:  # pragma: no cover - platform specific
        return False, str(exc)
    return True, ""
