from __future__ import annotations

import json

from orbit_pilot.schemas_cmd import emit_manifest_json, list_schemas, read_schema, resolve_schema_id


def test_list_schemas_non_empty() -> None:
    items = list_schemas()
    assert items
    ids = {x[0] for x in items}
    assert "plan-output" in ids
    assert "doctor-output" in ids


def test_read_plan_schema() -> None:
    s = read_schema("plan-output")
    assert s.get("title") == "OrbitPilotPlanOutput"
    assert "properties" in s


def test_emit_manifest_json() -> None:
    data = json.loads(emit_manifest_json())
    assert "schemas" in data
    assert any(x["id"] == "generate-output" for x in data["schemas"])
    ids = {x["id"] for x in data["schemas"]}
    assert "guide-output" in ids
    assert "mark-done-output" in ids
    assert "run-manifest" in ids
    assert "schedule-add-output" in ids
    plan = next(x for x in data["schemas"] if x["id"] == "plan-output")
    assert plan.get("command_alias") == "plan"


def test_resolve_schema_id_aliases() -> None:
    assert resolve_schema_id("plan") == "plan-output"
    assert resolve_schema_id("export") == "export-bundle"
    assert resolve_schema_id("audit") == "audit-events"
    assert resolve_schema_id("schedule-list") == "schedule-list-output"
