#!/usr/bin/env python3
"""Summarize benchmark fallback routing traces.

Reads fallback_trace.jsonl emitted by bench/selfopt/benchmark_supervisor.py and
prints an operator-friendly summary of primary failures, fallback selections,
and final outcomes per job.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

DEFAULT_RUNS_DIR = Path(__file__).resolve().parents[1] / "supervisor_runs"


def load_rows(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict):
            rows.append(obj)
    return rows


def latest_trace(runs_dir: Path) -> Path | None:
    if not runs_dir.exists():
        return None
    candidates = sorted(
        runs_dir.glob("*/fallback_trace.jsonl"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return candidates[0] if candidates else None


def latest_manifest(runs_dir: Path) -> Path | None:
    if not runs_dir.exists():
        return None
    candidates = sorted(
        runs_dir.glob("*/manifest.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return candidates[0] if candidates else None


def load_manifest(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("manifest root must be a JSON object")
    return data


def summarize(rows: list[dict[str, Any]]) -> dict[str, Any]:
    event_counts = Counter(r.get("event", "unknown") for r in rows)

    per_job: dict[tuple[str, int], dict[str, Any]] = {}

    for r in rows:
        run_id = r.get("run_id")
        job_index = r.get("job_index")
        if run_id is None or job_index is None:
            continue

        key = (str(run_id), int(job_index))
        cur = per_job.get(key)
        if cur is None or float(r.get("ts", 0.0)) >= float(cur.get("ts", 0.0)):
            per_job[key] = r

    final_outcomes = Counter(r.get("event", "unknown") for r in per_job.values())

    # Count route transitions once per job based on the latest event only
    edge_counts = Counter()
    for row in per_job.values():
        primary = row.get("primary_model")
        selected = row.get("selected_fallback")
        if primary and selected:
            edge_counts[(primary, selected)] += 1

    return {
        "total_events": len(rows),
        "event_counts": dict(event_counts),
        "unique_jobs_with_trace": len(per_job),
        "final_outcomes": dict(final_outcomes),
        "fallback_edges": [
            {"from": frm, "to": to, "count": c}
            for (frm, to), c in edge_counts.most_common()
        ],
        "latest_per_job": sorted(
            [
                {
                    "run_id": run_id,
                    "job_index": job_idx,
                    "phase": row.get("phase"),
                    "variant": row.get("variant"),
                    "event": row.get("event"),
                    "primary_model": row.get("primary_model"),
                    "mapped_fallback": row.get("mapped_fallback"),
                    "selected_fallback": row.get("selected_fallback"),
                    "reason": row.get("reason"),
                }
                for (run_id, job_idx), row in per_job.items()
            ],
            key=lambda x: (x["run_id"], x["job_index"]),
        ),
    }


def summarize_manifest(data: dict[str, Any], source: Path) -> dict[str, Any]:
    jobs = data.get("jobs")
    if not isinstance(jobs, list):
        jobs = []

    event_counts = Counter()
    final_outcomes = Counter()
    fallback_edges = Counter()
    latest_per_job: list[dict[str, Any]] = []

    for job in jobs:
        if not isinstance(job, dict):
            continue

        fallback_used = bool(job.get("used_fallback", False))
        event = "fallback_succeeded" if fallback_used else "primary_succeeded"
        primary = job.get("original_model") or job.get("model")
        selected = job.get("fallback_model")
        served_by = job.get("served_by") or primary or "unknown"

        event_counts[event] += 1
        final_outcomes[event] += 1
        if primary and selected:
            fallback_edges[(str(primary), str(selected))] += 1

        latest_per_job.append(
            {
                "run_id": data.get("run_id", "unknown"),
                "job_index": job.get("job_index", "unknown"),
                "phase": job.get("phase"),
                "variant": job.get("variant"),
                "event": event,
                "primary_model": primary,
                "mapped_fallback": selected,
                "selected_fallback": selected,
                "served_by": served_by,
                "used_fallback": fallback_used,
            }
        )

    latest_per_job.sort(key=lambda x: (str(x["run_id"]), int(x["job_index"]) if str(x["job_index"]).isdigit() else str(x["job_index"])))

    return {
        "source": "manifest",
        "manifest": str(source),
        "run_id": data.get("run_id"),
        "total_events": len(latest_per_job),
        "event_counts": dict(event_counts),
        "unique_jobs_with_trace": len(latest_per_job),
        "final_outcomes": dict(final_outcomes),
        "fallback_edges": [
            {"from": frm, "to": to, "count": c}
            for (frm, to), c in fallback_edges.most_common()
        ],
        "latest_per_job": latest_per_job,
    }


def _latest_event(rows: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not rows:
        return None
    return max(rows, key=lambda r: float(r.get("ts", 0.0)))


def print_one_line(rows: list[dict[str, Any]], source: Path) -> None:
    latest = _latest_event(rows)
    if latest is None:
        print(f"trace={source} events=0 served_by=unknown fallback_used=false")
        return

    event = str(latest.get("event", "unknown"))
    primary = latest.get("primary_model")
    selected = latest.get("selected_fallback")
    mapped = latest.get("mapped_fallback")

    fallback_used = event == "fallback_succeeded"
    served_by = selected if fallback_used and selected else primary or "unknown"

    parts = [
        f"trace={source}",
        f"run_id={latest.get('run_id', 'unknown')}",
        f"job_index={latest.get('job_index', 'unknown')}",
        f"event={event}",
        f"primary={primary or 'unknown'}",
        f"mapped_fallback={mapped or 'none'}",
        f"selected_fallback={selected or 'none'}",
        f"served_by={served_by}",
        f"fallback_used={'true' if fallback_used else 'false'}",
    ]
    print(" ".join(parts))


def _print_one_line_from_manifest(manifest_path: Path) -> bool:
    try:
        data = load_manifest(manifest_path)
    except Exception:
        return False

    jobs = data.get("jobs") or []
    if not jobs:
        print(f"manifest={manifest_path} jobs=0 served_by=unknown fallback_used=false")
        return True

    job = jobs[-1]
    served_by = job.get("served_by") or job.get("model") or "unknown"
    fallback_used = bool(job.get("used_fallback", False))
    print(
        " ".join(
            [
                f"manifest={manifest_path}",
                f"run_id={data.get('run_id', 'unknown')}",
                f"job_index={job.get('job_index', 'unknown')}",
                f"event={'fallback_succeeded' if fallback_used else 'primary_succeeded'}",
                f"primary={job.get('original_model') or job.get('model') or 'unknown'}",
                f"selected_fallback={job.get('fallback_model') or 'none'}",
                f"served_by={served_by}",
                f"fallback_used={'true' if fallback_used else 'false'}",
            ]
        )
    )
    return True


def print_human(summary: dict[str, Any], source: Path) -> None:
    print(f"source: {source}")
    print(f"events: {summary['total_events']}")
    print(f"jobs with fallback trace: {summary['unique_jobs_with_trace']}")

    print("\nEvent counts:")
    if summary["event_counts"]:
        for k, v in sorted(summary["event_counts"].items()):
            print(f"  - {k}: {v}")
    else:
        print("  (none)")

    print("\nFinal outcome per job:")
    if summary["final_outcomes"]:
        for k, v in sorted(summary["final_outcomes"].items()):
            print(f"  - {k}: {v}")
    else:
        print("  (none)")

    print("\nPrimary -> selected fallback:")
    if summary["fallback_edges"]:
        for edge in summary["fallback_edges"]:
            print(f"  - {edge['from']} -> {edge['to']} ({edge['count']})")
    else:
        print("  (none)")


def main() -> int:
    ap = argparse.ArgumentParser(description="Summarize benchmark fallback route traces")
    ap.add_argument(
        "--trace",
        type=Path,
        help="Path to fallback_trace.jsonl (if omitted, picks latest from bench/supervisor_runs)",
    )
    ap.add_argument(
        "--runs-dir",
        type=Path,
        default=DEFAULT_RUNS_DIR,
        help=f"Runs directory for --trace auto-discovery (default: {DEFAULT_RUNS_DIR})",
    )
    ap.add_argument("--json", action="store_true", help="Emit summary as JSON")
    ap.add_argument(
        "--one-line",
        action="store_true",
        help="Emit a compact single-line status (served_by + fallback_used)",
    )
    args = ap.parse_args()

    trace = args.trace or latest_trace(args.runs_dir)
    if trace is None:
        # No fallback trace exists (common when no fallback happened). Fall back
        # to latest supervisor manifest so operator views still expose route
        # attribution for no-fallback runs.
        manifest = latest_manifest(args.runs_dir)
        if manifest is None:
            raise SystemExit("No fallback_trace.jsonl or manifest.json found. Run benchmark_supervisor first.")

        if args.one_line:
            if _print_one_line_from_manifest(manifest):
                return 0
            raise SystemExit(f"Failed to read manifest fallback: {manifest}")

        data = load_manifest(manifest)
        summary = summarize_manifest(data, manifest)
        if args.json:
            print(json.dumps(summary, indent=2, ensure_ascii=False))
        else:
            print_human(summary, manifest)
        return 0

    rows = load_rows(trace)
    summary = summarize(rows)

    if args.one_line:
        print_one_line(rows, trace)
    elif args.json:
        print(json.dumps({"source": "trace", "trace": str(trace), **summary}, indent=2, ensure_ascii=False))
    else:
        print_human(summary, trace)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
