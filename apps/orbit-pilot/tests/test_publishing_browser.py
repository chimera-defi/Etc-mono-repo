from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import patch

from orbit_pilot.models import Campaign
from orbit_pilot.services.campaigns import write_run_manifest
from orbit_pilot.services.publishing import publish_from_run


def _minimal_run(tmp: Path) -> Path:
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
    (plat / "meta.json").write_text(
        json.dumps(
            {
                "planned_mode": "browser_assisted",
                "submit_url": "https://example.com/submit",
                "cooldown_seconds": 0,
            }
        ),
        encoding="utf-8",
    )
    return run_dir


def test_browser_assisted_dry_run(tmp_path: Path) -> None:
    run_dir = _minimal_run(tmp_path)
    out = publish_from_run(run_dir, ["hn"], execute=False)
    assert len(out) == 1
    r = out[0]["result"]
    assert r["status"] == "dry_run"
    assert "next_step" in r


def test_browser_assisted_execute_opens_browser(tmp_path: Path, monkeypatch) -> None:
    run_dir = _minimal_run(tmp_path)
    monkeypatch.setenv("ORBIT_ALLOW_BROWSER_AUTOMATION", "1")
    monkeypatch.setenv("ORBIT_BROWSER_AUTOMATION_SECRET", "s")
    monkeypatch.setenv("ORBIT_BROWSER_AUTOMATION_CONFIRM", "s")
    monkeypatch.setenv("ORBIT_BROWSER_HEADLESS", "1")
    with patch("orbit_pilot.browser_assist.playwright_available", return_value=True):
        with patch(
            "orbit_pilot.browser_assist.run_submit_portal_assist",
            return_value="https://example.com/submit",
        ) as m:
            out = publish_from_run(run_dir, ["hn"], execute=True)
    assert out[0]["result"]["status"] == "browser_assist_ran"
    assert m.call_args is not None
    assert m.call_args.kwargs.get("autofill") is False


def test_browser_assisted_blocked_without_secret(tmp_path: Path, monkeypatch) -> None:
    run_dir = _minimal_run(tmp_path)
    monkeypatch.delenv("ORBIT_ALLOW_BROWSER_AUTOMATION", raising=False)
    monkeypatch.delenv("ORBIT_BROWSER_AUTOMATION_SECRET", raising=False)
    monkeypatch.delenv("ORBIT_BROWSER_AUTOMATION_CONFIRM", raising=False)
    out = publish_from_run(run_dir, ["hn"], execute=True)
    assert out[0]["result"]["status"] == "blocked"
