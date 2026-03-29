from __future__ import annotations

import json
from pathlib import Path

from orbit_pilot.assets import PRESETS
from orbit_pilot.manual_guidance import build_guidance
from orbit_pilot.models import PlatformRecord, SubmissionDecision


def write_manual_pack(run_dir: Path, record: PlatformRecord, decision: SubmissionDecision) -> None:
    platform_dir = run_dir / decision.platform
    platform_dir.mkdir(parents=True, exist_ok=True)
    payload_path = platform_dir / "payload.json"
    notes_path = platform_dir / "README.txt"
    prompt_path = platform_dir / "PROMPT_USER.txt"
    meta_path = platform_dir / "meta.json"
    guidance = build_guidance(record)
    payload_path.write_text(json.dumps(decision.payload or {}, indent=2), encoding="utf-8")
    img: dict[str, int] | None = None
    if record.image_max_width and record.image_max_height:
        img = {"max_width": record.image_max_width, "max_height": record.image_max_height}
    elif record.slug in PRESETS:
        img = {"max_width": PRESETS[record.slug]["width"], "max_height": PRESETS[record.slug]["height"]}
    meta_path.write_text(
        json.dumps(
            {
                "name": record.name,
                "slug": record.slug,
                "submit_url": record.submit_url,
                "official_url": record.official_url,
                "priority": record.priority,
                "risk": record.risk,
                "cooldown_seconds": record.cooldown_seconds,
                "planned_mode": decision.mode,
                "image_constraints": img,
                "cta_in_body": record.cta_in_body,
                "browser_form_selectors": record.browser_form_selectors,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    assist_lines: list[str] = []
    if decision.mode == "browser_assisted":
        assist_lines = [
            "",
            "Browser assist (V1):",
            "- Install: pip install 'orbit-pilot[browser]' && playwright install chromium",
            "- Policy: risk.allow_browser_automation required; also allow_browser_fallback (browser_fallback_opt_in "
            "registry) and/or allow_browser_assist_manual (manual registry rows → browser_assisted).",
            "- Publish: orbit publish --run <run_dir> --platform "
            + record.slug
            + " --execute --browser",
            "- Env: ORBIT_ALLOW_BROWSER_AUTOMATION=1, ORBIT_BROWSER_AUTOMATION_SECRET, "
            "ORBIT_BROWSER_AUTOMATION_CONFIRM (same value).",
            "- Remote Chrome (CDP): set ORBIT_BROWSER_CDP_URL (ws:// or http:// debugger URL; e.g. hosted Kernel).",
            "- Logged-in Chromium (local): set ORBIT_BROWSER_USER_DATA_DIR; run once headed to sign in, reuse path.",
            "- Optional autofill: risk.allow_browser_autofill + ORBIT_ALLOW_BROWSER_AUTOFILL=1 + "
            "browser_form_selectors in registry (title/body/url).",
            "- Optional auto-submit: risk.allow_browser_auto_submit + ORBIT_ALLOW_BROWSER_AUTO_SUBMIT=1 + "
            "submit selector in registry (high risk; verify ToS).",
            "- Then orbit mark-done --live-url … with the final listing URL.",
            "",
        ]

    notes_path.write_text(
        "\n".join(
            [
                f"Platform: {record.name}",
                f"Submit URL: {record.submit_url}",
                f"Priority: {record.priority}",
                f"Mode: {decision.mode}",
                f"Risk: {decision.risk_level}",
                f"Reason: {decision.reason}",
                *assist_lines,
                "Checklist:",
                *[f"- {item}" for item in guidance["checklist"]],
                "",
                "Best practices:",
                *[f"- {item}" for item in guidance["best_practices"]],
            ]
        ),
        encoding="utf-8",
    )
    prompt_path.write_text(
        "\n".join(
            [
                f"Next manual task: submit {record.name}",
                f"Open: {record.submit_url}",
                *(
                    [
                        "",
                        "(browser_assisted) After `orbit publish ... --execute --browser`, Chromium opens here. "
                        "Paste title/body below (or enable policy+env autofill), submit (or auto-submit if enabled), "
                        "then mark-done with the live URL.",
                    ]
                    if decision.mode == "browser_assisted"
                    else []
                ),
                "",
                f"Suggested title: {(decision.payload or {}).get('title', '')}",
                "",
                "Suggested body:",
                (decision.payload or {}).get("body", ""),
                "",
                "Best practices:",
                *[f"- {item}" for item in guidance["best_practices"]],
            ]
        ),
        encoding="utf-8",
    )
