"""Validate scheduled subprocess argv (safety for agent-driven queues)."""

from __future__ import annotations

import os
import shutil
from typing import Any


def validate_schedule_argv(argv: list[str]) -> dict[str, Any]:
    """
    Unless ORBIT_SCHEDULE_ALLOW_ARBITRARY=1, first token must resolve to orbit or python
    (agents should schedule `orbit …` or `python3 -m orbit_pilot …`).
    """
    if os.environ.get("ORBIT_SCHEDULE_ALLOW_ARBITRARY", "").strip() in ("1", "true", "yes"):
        return {"ok": True}
    if not argv:
        return {"ok": False, "error": "empty argv"}
    cmd = argv[0]
    base = cmd.split("/")[-1].lower()
    if base in ("orbit", "orbit.exe"):
        return {"ok": True}
    if base.startswith("python") and len(argv) >= 2 and argv[1] == "-m" and argv[2] in ("orbit_pilot", "orbit-pilot"):
        return {"ok": True}
    orbit_path = shutil.which("orbit")
    if orbit_path and cmd == orbit_path:
        return {"ok": True}
    return {
        "ok": False,
        "error": (
            "first command must be `orbit` or `python -m orbit_pilot` "
            "(set ORBIT_SCHEDULE_ALLOW_ARBITRARY=1 to override)"
        ),
    }
