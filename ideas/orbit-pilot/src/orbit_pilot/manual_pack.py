from __future__ import annotations

import json
from pathlib import Path

from orbit_pilot.models import SubmissionDecision


def write_manual_pack(run_dir: Path, decision: SubmissionDecision) -> None:
    platform_dir = run_dir / decision.platform
    platform_dir.mkdir(parents=True, exist_ok=True)
    payload_path = platform_dir / "payload.json"
    notes_path = platform_dir / "README.txt"
    payload_path.write_text(json.dumps(decision.payload or {}, indent=2), encoding="utf-8")
    notes_path.write_text(
        "\n".join(
            [
                f"Platform: {decision.platform}",
                f"Mode: {decision.mode}",
                f"Risk: {decision.risk_level}",
                f"Reason: {decision.reason}",
            ]
        ),
        encoding="utf-8",
    )
