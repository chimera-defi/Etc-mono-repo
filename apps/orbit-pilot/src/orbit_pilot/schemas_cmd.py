"""Bundled JSON Schema paths for agent validation (orbit schemas)."""

from __future__ import annotations

import json
from importlib import resources
from pathlib import Path
from typing import Any

SCHEMA_FILES = (
    "plan-output.schema.json",
    "doctor-output.schema.json",
    "generate-output.schema.json",
    "publish-output.schema.json",
    "report-output.schema.json",
    "next-output.schema.json",
    "export-bundle.schema.json",
    "audit-events.schema.json",
    "guide-output.schema.json",
    "mark-done-output.schema.json",
    "campaigns-output.schema.json",
)


def bundled_schemas_dir() -> Path:
    return Path(str(resources.files("orbit_pilot.bundled") / "schemas"))


def list_schemas() -> list[tuple[str, Path]]:
    root = bundled_schemas_dir()
    out: list[tuple[str, Path]] = []
    for name in SCHEMA_FILES:
        p = root / name
        if p.exists():
            out.append((name.replace(".schema.json", ""), p))
    return out


def emit_manifest_json() -> str:
    items = [{"id": sid, "path": str(path)} for sid, path in list_schemas()]
    return json.dumps({"schemas": items, "bundled_dir": str(bundled_schemas_dir())}, indent=2)


def read_schema(name: str) -> dict[str, Any]:
    """name: short id (e.g. plan-output) or filename."""
    root = bundled_schemas_dir()
    if name.endswith(".json"):
        path = root / name
    elif name.endswith(".schema.json"):
        path = root / name
    else:
        path = root / f"{name}.schema.json"
    if not path.exists():
        raise FileNotFoundError(str(path))
    return json.loads(path.read_text(encoding="utf-8"))
