#!/usr/bin/env python3
"""Benchmark discovery payload size for token-reduction workflows."""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


def run(cmd: list[str], cwd: Path) -> dict[str, object]:
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, check=False)
    output = proc.stdout.strip()
    return {
        "command": " ".join(cmd),
        "exit_code": proc.returncode,
        "chars": len(output),
        "lines": 0 if not output else len(output.splitlines()),
        "output": output,
    }


def token_count(text: str) -> int:
    try:
        import tiktoken  # type: ignore
    except ImportError:
        return len(text.split())

    enc = tiktoken.get_encoding("o200k_base")
    return len(enc.encode(text))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--query", default="token reduction")
    parser.add_argument("--repo-root", default=str(Path(__file__).resolve().parents[1]))
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    cases = {
        "broad_inventory": ["bash", "-lc", "rg --files . | head -200"],
        "scoped_search": ["bash", "-lc", f"rg -n -g '*.md' {json.dumps(args.query)} . | head -40"],
        "token_reduce_helper": ["bash", "-lc", f"./.claude/token-reduce-search.sh {json.dumps(args.query)} | head -80"],
    }

    results: dict[str, dict[str, object]] = {}
    for name, cmd in cases.items():
        result = run(cmd, repo_root)
        result["tokens"] = token_count(str(result["output"]))
        results[name] = result

    broad = int(results["broad_inventory"]["tokens"])
    for name in ("scoped_search", "token_reduce_helper"):
        current = int(results[name]["tokens"])
        savings = round((1 - (current / broad)) * 100, 1) if broad else 0.0
        results[name]["vs_broad_pct"] = savings

    print(json.dumps(results, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
