from __future__ import annotations

import json

from orbit_pilot.schemas_cmd import emit_manifest_json, list_schemas, read_schema


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
