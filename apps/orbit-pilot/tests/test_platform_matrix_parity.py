"""Bundled seed registry must match ideas/orbit-pilot/PLATFORM_MATRIX.md (canonical launch list)."""

from __future__ import annotations

from importlib import resources
from pathlib import Path

import pytest

from orbit_pilot.registry import load_platforms

# First column of PLATFORM_MATRIX.md data rows → slug in seed_platforms.yaml
_NAME_TO_SLUG = {
    "Medium": "medium",
    "Reddit": "reddit",
    "GitHub": "github",
    "LinkedIn": "linkedin",
    "X": "x",
    "DEV / Forem": "dev",
    "Product Hunt": "product_hunt",
    "Crunchbase": "crunchbase",
    "Hacker News": "hacker_news",
    "Tiny Startups": "tiny_startups",
    "TrustMRR": "trustmrr",
    "BetaList": "betalist",
    "Indie Hackers": "indie_hackers",
    "Uneed": "uneed",
    "SaaSHub": "saashub",
    "AlternativeTo": "alternativeto",
    "Startup Stash": "startup_stash",
    "Futurepedia": "futurepedia",
    "There’s An AI For That": "theres_an_ai_for_that",
    "Peerlist": "peerlist",
    "Microlaunch": "microlaunch",
    "OpenAlternative": "open_alternative",
}


def _matrix_platform_names(repo_root: Path) -> list[str]:
    md = repo_root / "ideas" / "orbit-pilot" / "PLATFORM_MATRIX.md"
    if not md.is_file():
        pytest.skip(f"PLATFORM_MATRIX.md not found at {md}")
    text = md.read_text(encoding="utf-8")
    names: list[str] = []
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("|") or line.startswith("|---"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 3:
            continue
        first = parts[1]
        if first.lower() == "platform" or first.startswith("**"):
            continue
        if not first or first == "---":
            continue
        names.append(first)
    return names


def test_seed_platforms_slugs_match_platform_matrix() -> None:
    repo = Path(__file__).resolve().parents[3]
    expected_names = _matrix_platform_names(repo)
    assert expected_names, "no platform rows parsed from PLATFORM_MATRIX.md"
    expected_slugs = [_NAME_TO_SLUG[n] for n in expected_names]
    assert len(expected_slugs) == len(set(expected_slugs)), "duplicate slug in name map"

    bundled = resources.files("orbit_pilot.bundled") / "seed_platforms.yaml"
    seed_path = Path(str(bundled))
    records = load_platforms(seed_path)
    got_slugs = [r.slug for r in records]

    assert got_slugs == expected_slugs, (
        f"seed_platforms.yaml order/slugs must match PLATFORM_MATRIX.md.\n"
        f"expected: {expected_slugs}\n"
        f"got:      {got_slugs}"
    )


def test_seed_platform_count_matches_v0_build_plan_band() -> None:
    """V0_BUILD_PLAN: ~10–20 manual platforms + APIs; matrix is the canonical count."""
    bundled = resources.files("orbit_pilot.bundled") / "seed_platforms.yaml"
    records = load_platforms(Path(str(bundled)))
    assert 10 <= len(records) <= 32, f"unexpected platform count: {len(records)}"
