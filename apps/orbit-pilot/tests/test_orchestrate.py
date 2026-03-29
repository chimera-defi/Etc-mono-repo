from __future__ import annotations

import tempfile
from pathlib import Path

from orbit_pilot.orchestrate import run_plan_graph


def test_run_plan_graph_returns_preview() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        launch = root / "launch.yaml"
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
        plat = root / "plat.yaml"
        plat.write_text(
            "platforms:\n"
            "  - name: GitHub\n    slug: github\n    mode: official_api\n    risk: low\n",
            encoding="utf-8",
        )
        out = run_plan_graph(str(launch), str(plat), policy_path=None)
        assert not out.get("error")
        assert "preview" in out
        assert any(p["slug"] == "github" for p in out["preview"])
