from __future__ import annotations

import json
import tempfile
from pathlib import Path

from orbit_pilot.models import Campaign
from orbit_pilot.services.campaigns import write_run_manifest
from orbit_pilot.services.export_run import export_run


def test_export_run_json_contains_manifest() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        run_dir = Path(tmp) / "r"
        run_dir.mkdir()
        write_run_manifest(
            run_dir,
            Campaign(id="c", name="C", created_at="2026-01-01T00:00:00Z"),
            "/x/launch.yaml",
            "/x/plat.yaml",
            policy_path="/x/risk.yaml",
        )
        out = export_run(run_dir, "json")
        data = json.loads(out)
        assert data["manifest"]["policy_path"] == "/x/risk.yaml"
        assert "submissions" in data


def test_export_run_html() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        run_dir = Path(tmp) / "r"
        run_dir.mkdir()
        write_run_manifest(
            run_dir,
            Campaign(id="c", name="C", created_at="2026-01-01T00:00:00Z"),
            "/x/launch.yaml",
            "/x/plat.yaml",
        )
        html = export_run(run_dir, "html")
        assert "<!DOCTYPE html>" in html
        assert "Orbit Pilot run report" in html
        assert "Campaign:" in html


def test_export_run_md() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        run_dir = Path(tmp) / "r"
        run_dir.mkdir()
        write_run_manifest(
            run_dir,
            Campaign(id="c", name="C", created_at="2026-01-01T00:00:00Z"),
            "/x/launch.yaml",
            "/x/plat.yaml",
        )
        md = export_run(run_dir, "md")
        assert "# Orbit Pilot run export" in md
        assert "| Platform |" in md
