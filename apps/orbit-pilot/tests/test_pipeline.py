from __future__ import annotations

import argparse
import json
from pathlib import Path
from unittest.mock import patch

import orbit_pilot.cli_commands as cc


def test_pipeline_json_generates_run(tmp_path: Path) -> None:
    launch = tmp_path / "l.yaml"
    launch.write_text(
        "\n".join(
            [
                "product_name: P",
                "website_url: https://p.example",
                "tagline: t",
                "summary: s",
            ]
        ),
        encoding="utf-8",
    )
    plat = tmp_path / "p.yaml"
    plat.write_text(
        "platforms:\n"
        "  - name: GitHub\n    slug: github\n    mode: official_api\n    risk: low\n"
        "    category: x\n    official_url: https://github.com\n    submit_url: https://github.com\n",
        encoding="utf-8",
    )
    outd = tmp_path / "out"
    args = argparse.Namespace(
        launch=str(launch),
        platforms=str(plat),
        out=str(outd),
        campaign=None,
        policy=None,
        json=True,
    )
    buf: list[str] = []

    def fake_print(s: str) -> None:
        buf.append(s)

    with patch.object(cc, "print", fake_print):
        code = cc.pipeline_command(args)
    data = json.loads(buf[0])
    assert "run_dir" in data["generate"]
    assert Path(data["generate"]["run_dir"]).is_dir()
    assert data["ok_plan"] is True
    # doctor may be false without tokens for github official_api
    assert "doctor" in data
    assert code in (0, 1)
