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
    "latest-output.schema.json",
    "error-response.schema.json",
    "run-manifest.schema.json",
    "schedule-job.schema.json",
    "schedule-add-output.schema.json",
    "schedule-list-output.schema.json",
    "schedule-run-output.schema.json",
    "schedule-cancel-output.schema.json",
    "registry-lint-output.schema.json",
)

# CLI / command aliases → canonical schema id (for orbit validate-json)
SCHEMA_ALIASES: dict[str, str] = {
    "plan": "plan-output",
    "doctor": "doctor-output",
    "generate": "generate-output",
    "publish": "publish-output",
    "report": "report-output",
    "next": "next-output",
    "export": "export-bundle",
    "audit": "audit-events",
    "guide": "guide-output",
    "mark-done": "mark-done-output",
    "campaigns": "campaigns-output",
    "latest": "latest-output",
    "error": "error-response",
    "run-manifest": "run-manifest",
    "manifest": "run-manifest",
    "schedule-add": "schedule-add-output",
    "schedule-list": "schedule-list-output",
    "schedule-run": "schedule-run-output",
    "schedule-cancel": "schedule-cancel-output",
    "schedule-job": "schedule-job",
    "registry-lint": "registry-lint-output",
}


def bundled_schemas_dir() -> Path:
    return Path(str(resources.files("orbit_pilot.bundled") / "schemas"))


def resolve_schema_id(name: str) -> str:
    n = name.strip().lower().replace("_", "-")
    if n.endswith(".schema.json"):
        n = n[: -len(".schema.json")]
    if n.endswith(".json"):
        n = n[: -len(".json")]
    if n in SCHEMA_ALIASES:
        return SCHEMA_ALIASES[n]
    root = bundled_schemas_dir()
    if (root / f"{n}.schema.json").exists():
        return n
    if (root / f"{n}-output.schema.json").exists():
        return f"{n}-output"
    return n


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
    aliases = {v: k for k, v in SCHEMA_ALIASES.items()}
    enriched = [{**item, "command_alias": aliases.get(item["id"])} for item in items]
    return json.dumps({"schemas": enriched, "bundled_dir": str(bundled_schemas_dir())}, indent=2)


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


def validate_instance(schema_id: str, instance: Any) -> list[str]:
    """Return list of validation error messages (empty if ok)."""
    from jsonschema import Draft202012Validator

    schema = read_schema(schema_id)
    validator = Draft202012Validator(schema)
    return [f"{e.json_path}: {e.message}" for e in validator.iter_errors(instance)]
