from __future__ import annotations

import json
from pathlib import Path

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
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    notes_path.write_text(
        "\n".join(
            [
                f"Platform: {record.name}",
                f"Submit URL: {record.submit_url}",
                f"Priority: {record.priority}",
                f"Mode: {decision.mode}",
                f"Risk: {decision.risk_level}",
                f"Reason: {decision.reason}",
                "",
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
