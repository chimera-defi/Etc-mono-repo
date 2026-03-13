#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
RESULTS_DIR = ROOT / "results"
RUNS_DIR = ROOT / "supervisor_runs"
ARCHIVE_DIR = RUNS_DIR / ".archive"
INDEX_PATH = RUNS_DIR / "index.json"

DURABLE_RESULT_FILES = {
    "canonical.json",
    "baseline.json",
    "baseline_history.json",
    "SUMMARY.md",
    "LATENCY_BENCHMARK.md",
}
RESULTS_DOC_FILES = {
    "README.md",
}


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text())
    except Exception:
        return default


def age_days(ts: float, now: float) -> float:
    return round((now - ts) / 86400, 2)


def classify_result_file(path: Path) -> str:
    if path.name in DURABLE_RESULT_FILES:
        return "durable"
    if path.name in RESULTS_DOC_FILES:
        return "retention-doc"
    if path.suffix == ".log" or path.name.endswith("_state.json"):
        return "experiment-log-or-state"
    return "experiment-output"


def collect_results(now: float) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not RESULTS_DIR.exists():
        return rows
    for path in sorted(p for p in RESULTS_DIR.iterdir() if p.is_file()):
        rows.append(
            {
                "name": path.name,
                "size_bytes": path.stat().st_size,
                "modified": path.stat().st_mtime,
                "age_days": age_days(path.stat().st_mtime, now),
                "class": classify_result_file(path),
            }
        )
    return rows


def collect_runs(now: float, retain_days: int) -> dict[str, Any]:
    index = load_json(INDEX_PATH, {"runs": []})
    indexed_runs = {run.get("run_id"): run for run in index.get("runs", []) if run.get("run_id")}

    active: list[dict[str, Any]] = []
    archive_candidates: list[dict[str, Any]] = []
    unindexed: list[dict[str, Any]] = []

    if RUNS_DIR.exists():
        for path in sorted(RUNS_DIR.iterdir()):
            if not path.is_dir() or path.name.startswith('.'):
                continue
            stat = path.stat()
            summary = load_json(path / "summary.json", {})
            manifest = load_json(path / "manifest.json", {})
            run_id = path.name
            status = summary.get("status") or manifest.get("status") or indexed_runs.get(run_id, {}).get("status") or "unknown"
            row = {
                "run_id": run_id,
                "status": status,
                "age_days": age_days(stat.st_mtime, now),
                "modified": stat.st_mtime,
                "indexed": run_id in indexed_runs,
            }
            if run_id not in indexed_runs:
                unindexed.append(row)
            if status == "completed" and retain_days >= 0 and row["age_days"] > retain_days:
                archive_candidates.append(row)
            else:
                active.append(row)

    archived = []
    if ARCHIVE_DIR.exists():
        for path in sorted(ARCHIVE_DIR.iterdir()):
            if path.is_dir():
                archived.append(
                    {
                        "name": path.name,
                        "age_days": age_days(path.stat().st_mtime, now),
                    }
                )

    return {
        "indexed_run_count": len(indexed_runs),
        "active_runs": active,
        "archive_candidates": archive_candidates,
        "unindexed_runs": unindexed,
        "archived_entries": archived,
    }


def render_text(report: dict[str, Any], retain_days: int) -> str:
    lines: list[str] = []

    results = report["results"]
    durable = [r for r in results if r["class"] == "durable"]
    docs = [r for r in results if r["class"] == "retention-doc"]
    experiments = [r for r in results if r["class"] not in {"durable", "retention-doc"}]
    lines.append("bench retention status")
    lines.append(f"- results files: {len(results)} total ({len(durable)} durable, {len(docs)} docs, {len(experiments)} experimental)")
    for row in results:
        lines.append(f"  - results/{row['name']}: {row['class']}, age={row['age_days']}d, size={row['size_bytes']}B")

    runs = report["supervisor_runs"]
    lines.append(f"- supervisor runs indexed: {runs['indexed_run_count']}")
    lines.append(f"- active top-level runs: {len(runs['active_runs'])}")
    lines.append(f"- archive candidates (>{retain_days}d and completed): {len(runs['archive_candidates'])}")
    for row in runs["archive_candidates"]:
        lines.append(f"  - supervisor_runs/{row['run_id']}: status={row['status']}, age={row['age_days']}d")
    if runs["unindexed_runs"]:
        lines.append(f"- WARNING: unindexed top-level runs: {len(runs['unindexed_runs'])}")
        for row in runs["unindexed_runs"]:
            lines.append(f"  - supervisor_runs/{row['run_id']}: status={row['status']}, age={row['age_days']}d")
    lines.append(f"- archived supervisor entries: {len(runs['archived_entries'])}")
    for row in runs["archived_entries"]:
        lines.append(f"  - supervisor_runs/.archive/{row['name']}: age={row['age_days']}d")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Read-only retention/organization status for bench artifacts")
    parser.add_argument("--retain-days", type=int, default=7, help="Age threshold used to flag completed supervisor runs as archive candidates")
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text")
    args = parser.parse_args()

    now = time.time()
    report = {
        "generated_at": now,
        "retain_days": args.retain_days,
        "results": collect_results(now),
        "supervisor_runs": collect_runs(now, args.retain_days),
    }

    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print(render_text(report, args.retain_days))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
