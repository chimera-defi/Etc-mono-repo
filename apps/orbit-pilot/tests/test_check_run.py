from __future__ import annotations

import json
import tempfile
from pathlib import Path

from orbit_pilot.check_run import check_run
from orbit_pilot.models import Campaign
from orbit_pilot.services.campaigns import ORBIT_MANIFEST_VERSION, load_run_manifest, write_run_manifest


def test_check_run_ok() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        launch = root / "l.yaml"
        plat = root / "p.yaml"
        launch.write_text("x: 1\n", encoding="utf-8")
        plat.write_text("platforms: []\n", encoding="utf-8")
        run_dir = root / "r"
        run_dir.mkdir()
        write_run_manifest(
            run_dir,
            Campaign(id="c", name="C", created_at="2026-01-01T00:00:00Z"),
            str(launch),
            str(plat),
            policy_path=str(root / "risk.yaml"),
        )
        out = check_run(run_dir)
        assert out["ok"] is True
        assert out["warnings"]  # missing policy + sqlite


def test_check_run_missing_launch() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        run_dir = root / "r"
        run_dir.mkdir()
        write_run_manifest(
            run_dir,
            Campaign(id="c", name="C", created_at="2026-01-01T00:00:00Z"),
            str(root / "missing.yaml"),
            str(root / "missing2.yaml"),
        )
        out = check_run(run_dir)
        assert out["ok"] is False
        assert len(out["errors"]) >= 2


def test_load_run_manifest_rejects_newer_version() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        run_dir = Path(tmp) / "r"
        run_dir.mkdir()
        (run_dir / "run.json").write_text(
            json.dumps(
                {
                    "orbit_manifest_version": ORBIT_MANIFEST_VERSION + 99,
                    "campaign": {"id": "c", "name": "C", "created_at": "x"},
                    "launch_path": "/x",
                    "platform_registry_path": "/y",
                    "run_dir": str(run_dir),
                }
            ),
            encoding="utf-8",
        )
        try:
            load_run_manifest(run_dir)
        except ValueError as exc:
            assert "newer" in str(exc).lower() or "upgrade" in str(exc).lower()
        else:
            raise AssertionError("expected ValueError")
