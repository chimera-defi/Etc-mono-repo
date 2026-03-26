"""Ensure bundled JSON Schemas accept representative CLI-shaped payloads (jsonschema dev dep)."""

from __future__ import annotations

import json
from pathlib import Path

from jsonschema import Draft202012Validator

from orbit_pilot.models import Campaign
from orbit_pilot.schemas_cmd import read_schema
from orbit_pilot.services.campaigns import ORBIT_MANIFEST_VERSION, write_run_manifest
from orbit_pilot.services.export_run import export_run
from orbit_pilot.services.reporting import human_guide, report_payload


def _v(name: str, instance: object) -> None:
    schema = read_schema(name)
    Draft202012Validator(schema).validate(instance)


def test_plan_output_schema() -> None:
    _v(
        "plan-output",
        {
            "missing_fields": ["product_name"],
            "questions": ["Please provide product name."],
            "platform_count": 2,
            "platforms": ["github", "dev"],
            "platform_preview": [
                {"slug": "github", "planned_mode": "official_api", "risk": "low", "reason": "ok"},
                {"slug": "dev", "planned_mode": "manual", "risk": "low", "reason": "x"},
            ],
        },
    )


def test_doctor_output_schema() -> None:
    _v(
        "doctor-output",
        {
            "results": [
                {
                    "platform": "github",
                    "mode": "official_api",
                    "ready": False,
                    "missing_secrets": ["GITHUB_TOKEN"],
                    "missing_payload": ["github_repo"],
                }
            ]
        },
    )


def test_generate_output_schema() -> None:
    _v(
        "generate-output",
        {
            "run_dir": "/tmp/out/camp/run-1",
            "results": [
                {
                    "platform": "github",
                    "mode": "official_api",
                    "risk_level": "low",
                    "reason": "V0",
                    "payload_path": "/tmp/out/camp/run-1/github/payload.json",
                    "duplicate": False,
                    "asset_count": 1,
                },
                {
                    "platform": "reddit",
                    "mode": "skipped",
                    "risk_level": "medium",
                    "reason": "policy",
                    "payload_path": None,
                    "duplicate": False,
                    "asset_count": 0,
                },
            ],
        },
    )


def test_publish_output_schema() -> None:
    _v(
        "publish-output",
        {
            "results": [
                {
                    "platform": "github",
                    "result": {
                        "status": "dry_run",
                        "url": "https://example.com",
                        "publisher": "github",
                        "readiness": {
                            "ready": True,
                            "missing_secrets": [],
                            "missing_payload": [],
                        },
                        "next_step": "Run with --execute",
                    },
                }
            ]
        },
    )


def test_report_and_guide_schema(tmp_path: Path) -> None:
    run_dir = tmp_path / "r"
    run_dir.mkdir()
    write_run_manifest(
        run_dir,
        Campaign(id="c", name="C", created_at="2026-01-01T00:00:00Z"),
        str(tmp_path / "l.yaml"),
        str(tmp_path / "p.yaml"),
    )
    data = report_payload(run_dir)
    _v("report-output", data)
    g = human_guide(run_dir)
    _v("guide-output", g)


def test_next_output_schema_variants() -> None:
    _v("next-output", {"message": "No pending manual submissions."})
    _v(
        "next-output",
        {
            "platform": "reddit",
            "status": "generated",
            "prompt": "hello",
            "payload": {"title": "t", "body": "b"},
        },
    )


def test_export_bundle_schema(tmp_path: Path) -> None:
    run_dir = tmp_path / "r"
    run_dir.mkdir()
    write_run_manifest(
        run_dir,
        Campaign(id="c", name="C", created_at="2026-01-01T00:00:00Z"),
        str(tmp_path / "l.yaml"),
        str(tmp_path / "p.yaml"),
    )
    bundle = json.loads(export_run(run_dir, "json"))
    _v("export-bundle", bundle)


def test_audit_events_schema() -> None:
    _v(
        "audit-events",
        [
            {"ts": "2026-01-01T00:00:00+00:00", "type": "submission_row", "platform": "github"},
        ],
    )


def test_run_manifest_schema() -> None:
    _v(
        "run-manifest",
        {
            "orbit_manifest_version": ORBIT_MANIFEST_VERSION,
            "orbit_pilot_version": "0.3.8",
            "campaign": {"id": "c", "name": "C", "created_at": "2026-01-01T00:00:00Z"},
            "launch_path": "/a/launch.yaml",
            "platform_registry_path": "/a/p.yaml",
            "run_dir": "/a/out/c/run-1",
            "policy_path": "/a/risk.yaml",
        },
    )


def test_latest_and_error_schema() -> None:
    _v("latest-output", {"campaign": "acme", "latest_run": "/out/acme/run-1"})
    _v("error-response", {"error": "Run directory not found: /nope"})


def test_schedule_schemas() -> None:
    _v(
        "schedule-add-output",
        {
            "scheduled": {
                "id": "u1",
                "due_at": "2026-01-01T00:00:00Z",
                "cwd": "/tmp",
                "argv": ["orbit", "version"],
                "created_at": "2026-01-01T00:00:00Z",
                "done": False,
                "recurrence": "none",
            },
            "file": "/home/x/.orbit-pilot/schedule.jsonl",
        },
    )
    _v(
        "schedule-list-output",
        {
            "pending": [
                {
                    "id": "u1",
                    "due_at": "2026-01-01T00:00:00Z",
                    "cwd": "/tmp",
                    "argv": ["echo", "hi"],
                    "created_at": "2026-01-01T00:00:00Z",
                    "done": False,
                }
            ],
            "file": "/x/schedule.jsonl",
        },
    )
    _v(
        "schedule-run-output",
        {
            "ran": [
                {
                    "id": "u1",
                    "argv": ["true"],
                    "exit_code": 0,
                    "stdout_tail": "",
                    "stderr_tail": "",
                }
            ]
        },
    )
    _v("schedule-cancel-output", {"ok": True, "id": "u1"})


def test_pipeline_output_schema() -> None:
    _v(
        "pipeline-output",
        {
            "ok_all": False,
            "ok_plan": True,
            "ok_doctor": False,
            "ok_check_run": True,
            "plan": {
                "missing_fields": [],
                "questions": [],
                "platform_count": 1,
                "platforms": ["x"],
                "platform_preview": [],
            },
            "doctor": {"results": []},
            "generate": {"run_dir": "/tmp/r", "results": []},
            "check_run": {"ok": True, "errors": [], "warnings": []},
        },
    )


def test_registry_lint_output_schema() -> None:
    _v(
        "registry-lint-output",
        {"ok": True, "errors": [], "warnings": [], "platform_count": 22},
    )


def test_mark_done_and_campaigns_schema() -> None:
    _v(
        "mark-done-output",
        {
            "message": "Marked github complete: https://x.com/y",
            "platform": "github",
            "live_url": "https://x.com/y",
            "note": "posted",
        },
    )
    _v("campaigns-output", {"campaigns": [{"campaign": "acme", "run_count": 2, "latest_run": "/out/acme/run-2"}]})
