#!/usr/bin/env python3
"""Aggregate repo-local token reduction adoption measurements."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path


def main() -> int:
    script_dir = Path(__file__).resolve().parent
    try:
        repo_root = Path(
            subprocess.run(
                ["git", "-C", str(script_dir), "rev-parse", "--show-toplevel"],
                check=True,
                capture_output=True,
                text=True,
            ).stdout.strip()
        )
    except subprocess.CalledProcessError:
        repo_root = script_dir.parents[2]

    out_dir = repo_root / ".cursor" / "artifacts" / "token-reduction"
    files = sorted(out_dir.glob("adoption-repo-*.json"))
    if not files:
        print("No repo-local adoption measurements found.")
        return 0

    latest = [json.loads(path.read_text()) for path in files[-7:]]
    avg = lambda key: round(sum(item["compliance" if key.startswith("discovery") or key.startswith("broad") else "adoption"][key] for item in latest) / len(latest), 1)

    print("Token Reduction Weekly Summary")
    print(f"Samples: {len(latest)}")
    print(f"Avg discovery compliance: {avg('discovery_compliance_pct')}%")
    print(f"Avg token-reduce search usage: {avg('token_reduce_search_pct')}%")
    print(f"Avg qmd usage: {avg('qmd_search_pct')}%")
    print(f"Avg scoped rg usage: {avg('scoped_rg_pct')}%")
    print(f"Avg targeted read usage: {avg('targeted_read_pct')}%")
    print(f"Avg broad-scan violations: {avg('broad_scan_violations')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
