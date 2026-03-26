from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import patch

from orbit_pilot.audit import record_submission
from orbit_pilot.models import Campaign
from orbit_pilot.services.campaigns import write_run_manifest
from orbit_pilot.services.work_queue import work_next_payload


def _run_with_manual(tmp: Path) -> Path:
    run_dir = tmp / "r"
    run_dir.mkdir()
    write_run_manifest(
        run_dir,
        Campaign(id="c", name="C", created_at="2026-01-01T00:00:00Z"),
        str(tmp / "l.yaml"),
        str(tmp / "p.yaml"),
    )
    (tmp / "l.yaml").write_text("x: 1\n", encoding="utf-8")
    (tmp / "p.yaml").write_text("platforms: []\n", encoding="utf-8")
    plat = run_dir / "hn"
    plat.mkdir()
    (plat / "payload.json").write_text(json.dumps({"title": "t", "body": "b"}), encoding="utf-8")
    (plat / "PROMPT_USER.txt").write_text("paste me", encoding="utf-8")
    (plat / "meta.json").write_text(
        json.dumps(
            {
                "planned_mode": "manual",
                "submit_url": "https://example.com/submit",
                "priority": 10,
                "cooldown_seconds": 0,
            }
        ),
        encoding="utf-8",
    )
    record_submission(
        run_dir,
        "hn",
        "manual",
        "pending",
        "seed",
        {"status": "pending"},
    )
    return run_dir


def test_work_next_payload_manual(tmp_path: Path) -> None:
    run_dir = _run_with_manual(tmp_path)
    w = work_next_payload(run_dir)
    assert w["kind"] == "task"
    assert w["platform"] == "hn"
    assert w["planned_mode"] == "manual"
    assert w["submit_url"] == "https://example.com/submit"
    assert "orbit mark-done" in w["mark_done_command"]
    assert "hn" in w["mark_done_command"]


def test_work_next_payload_browser_assisted_has_playwright_cmd(tmp_path: Path) -> None:
    run_dir = _run_with_manual(tmp_path)
    meta = json.loads((run_dir / "hn" / "meta.json").read_text(encoding="utf-8"))
    meta["planned_mode"] = "browser_assisted"
    (run_dir / "hn" / "meta.json").write_text(json.dumps(meta), encoding="utf-8")
    w = work_next_payload(run_dir)
    assert w["planned_mode"] == "browser_assisted"
    assert w.get("playwright_assist_command")
    assert "--execute --browser" in w["playwright_assist_command"]


def test_work_command_opens_browser(tmp_path: Path) -> None:
    import argparse

    from orbit_pilot.cli_commands import work_command

    run_dir = _run_with_manual(tmp_path)
    opened: list[str] = []

    def fake_open(url: str, new: int = 0) -> bool:
        opened.append(url)
        return True

    with patch("webbrowser.open", fake_open):
        args = argparse.Namespace(run=str(run_dir), json=False, no_open=False, playwright=False)
        assert work_command(args) == 0
    assert opened == ["https://example.com/submit"]


def test_work_command_json_empty(tmp_path: Path, capsys) -> None:
    import argparse

    from orbit_pilot.cli_commands import work_command

    run_dir = tmp_path / "empty"
    run_dir.mkdir()
    write_run_manifest(
        run_dir,
        Campaign(id="c", name="C", created_at="2026-01-01T00:00:00Z"),
        str(tmp_path / "l.yaml"),
        str(tmp_path / "p.yaml"),
    )
    (tmp_path / "l.yaml").write_text("x: 1\n", encoding="utf-8")
    (tmp_path / "p.yaml").write_text("platforms: []\n", encoding="utf-8")

    args = argparse.Namespace(run=str(run_dir), json=True, no_open=False, playwright=False)
    assert work_command(args) == 0
    out = capsys.readouterr().out
    data = json.loads(out.strip())
    assert data.get("kind") == "empty"
