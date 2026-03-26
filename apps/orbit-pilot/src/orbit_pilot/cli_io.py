"""Shared CLI output helpers (keep cli.py thin)."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def require_run_dir(run_dir: Path, *, json_mode: bool) -> bool:
    """If run_dir is missing, print error (JSON or stderr). Return True if usable."""
    if run_dir.is_dir():
        return True
    msg = f"Run directory not found: {run_dir}"
    if json_mode:
        print(json.dumps({"error": msg}))
    else:
        print(msg, file=sys.stderr)
    return False
