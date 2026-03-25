from __future__ import annotations

import tempfile
from pathlib import Path

from orbit_pilot.config import load_document
from orbit_pilot.profile_loader import profile_from_parsed_yaml


def test_profile_resolves_logo_relative_path() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "img").mkdir()
        (root / "img" / "logo.png").write_bytes(b"x")
        launch = root / "launch.yaml"
        launch.write_text(
            "product_name: P\nwebsite_url: https://p.example\ntagline: t\nsummary: s\n"
            "assets:\n  logo: img/logo.png\n",
            encoding="utf-8",
        )
        raw = load_document(launch)
        p = profile_from_parsed_yaml(raw, launch)
        assert Path(p.assets["logo"]).is_file()
