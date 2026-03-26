from __future__ import annotations

import tempfile
from pathlib import Path

from orbit_pilot.orchestrate import run_generate_graph


def test_run_generate_graph_creates_run() -> None:
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
        out = root / "out"
        state = run_generate_graph(str(launch), str(plat), out=str(out), policy_path=None)
        assert not state.get("error")
        run_dir = Path(state["run_dir"])
        assert run_dir.exists()
        assert (run_dir / "run.json").exists()
        assert state.get("generate_results")
