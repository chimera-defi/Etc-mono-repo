from __future__ import annotations

import tempfile
from importlib import resources
from pathlib import Path

from orbit_pilot.registry_lint import lint_platform_registry


def test_bundled_seed_passes_lint() -> None:
    bundled = resources.files("orbit_pilot.bundled") / "seed_platforms.yaml"
    out = lint_platform_registry(Path(str(bundled)))
    assert out["ok"], out
    assert out["platform_count"] >= 10
    assert not out["errors"]


def test_lint_catches_unknown_url() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        p = Path(tmp) / "p.yaml"
        p.write_text(
            "platforms:\n"
            "  - name: Bad\n    slug: bad\n    category: x\n"
            "    official_url: unknown\n    submit_url: https://example.com/\n"
            "    mode: manual\n    risk: low\n",
            encoding="utf-8",
        )
        out = lint_platform_registry(p)
        assert out["ok"] is False
        assert any("official_url" in e for e in out["errors"])
