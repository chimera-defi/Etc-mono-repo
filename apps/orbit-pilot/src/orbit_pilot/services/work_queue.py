"""Next queue item for humans/agents: submit URL, paths, suggested shell commands."""

from __future__ import annotations

import json
import shlex
from pathlib import Path
from typing import Any

from orbit_pilot.services.reporting import next_manual_payload

_GUIDE_VERSION = "1"


def _operator_agent_guide(
    planned_mode: str,
    submit_url: str,
    playwright_cmd: str | None,
    mark_done_cmd: str,
) -> dict[str, Any]:
    """
    Stable machine-readable hints for local agents (Claude/Codex/Cursor MCP, local LLM shells).

    Orbit Pilot stays dependency-free of any LLM; this block documents the supported split:
    CLI + packs = deterministic layer; operator's local agent = browser/UI layer.
    """
    paths: list[dict[str, Any]] = [
        {
            "id": "local_agent_browser_mcp",
            "label": "Local coding agent + user browser (Claude Code, Codex, Cursor, etc.)",
            "requirements": [
                "Agent runs on the operator machine with access to this JSON and optional browser MCP.",
                (
                    "Paste only public marketing copy from payload / PROMPT_USER.txt — "
                    "never API tokens or private keys into third-party forms."
                ),
                "Obey each site's Terms of Service; use human-in-the-loop for ambiguous or high-risk steps.",
            ],
            "suggested_cli": [
                "orbit work --run <run_dir> --json --no-open",
                mark_done_cmd.replace("<URL>", "<live_listing_url>"),
            ],
        }
    ]
    if planned_mode == "browser_assisted" and submit_url.strip() and playwright_cmd:
        paths.append(
            {
                "id": "playwright_packaged",
                "label": (
                    "Playwright inside Orbit Pilot (local Chromium, "
                    "ORBIT_BROWSER_USER_DATA_DIR, or ORBIT_BROWSER_CDP_URL)"
                ),
                "requirements": [
                    "pip install 'orbit-pilot[browser]' && playwright install chromium",
                    "Policy + ORBIT_ALLOW_BROWSER_AUTOMATION secret pair as documented in HUMAN_GUIDE.md",
                ],
                "suggested_cli": [playwright_cmd],
            }
        )
    return {
        "schema_version": _GUIDE_VERSION,
        "summary": (
            "Use this JSON as the contract: Orbit generates packs and CLI commands; a local LLM/agent "
            "drives the browser session. No LLM is bundled in the Python package."
        ),
        "paths": paths,
    }


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

    pw_cmd: str | None = None
    if planned == "browser_assisted" and submit_url:
        pw_cmd = f"orbit publish --run {run_s} --platform {plat_q} --execute --browser"
        out["playwright_assist_command"] = pw_cmd
    elif submit_url:
        out["open_hint"] = f"Open in browser: {submit_url}"

    out["operator_agent_guide"] = _operator_agent_guide(
        planned, submit_url, pw_cmd, mark_done_cmd
    )

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
