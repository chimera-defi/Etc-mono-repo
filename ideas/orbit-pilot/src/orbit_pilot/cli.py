from __future__ import annotations

import argparse
import json
from dataclasses import asdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from orbit_pilot.assets import prepare_assets
from orbit_pilot.audit import init_db, list_submissions, record_submission
from orbit_pilot.config import load_document
from orbit_pilot.dedupe import digest_text
from orbit_pilot.graph import build_payload, plan_platform
from orbit_pilot.manual_pack import write_manual_pack
from orbit_pilot.models import LaunchProfile, REQUIRED_LAUNCH_FIELDS
from orbit_pilot.publishers.router import PUBLISHERS, publish_platform
from orbit_pilot.registry import load_platforms
from orbit_pilot.state import cooldown_remaining, record_digest, record_publish_attempt, seen_digest

RISK_ORDER = {
    "low": 1,
    "low_medium": 2,
    "medium": 3,
    "medium_high": 4,
    "high": 5,
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="orbit")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("init")

    for name in ("plan", "generate"):
        cmd = subparsers.add_parser(name)
        cmd.add_argument("--launch", required=True)
        cmd.add_argument("--platforms", required=True)
        cmd.add_argument("--json", action="store_true")
        if name == "generate":
            cmd.add_argument("--out", default="out")

    publish = subparsers.add_parser("publish")
    publish.add_argument("--run", required=True)
    publish.add_argument("--platform", action="append", required=True)
    publish.add_argument("--json", action="store_true")
    publish.add_argument("--execute", action="store_true")

    mark_done = subparsers.add_parser("mark-done")
    mark_done.add_argument("--run", required=True)
    mark_done.add_argument("--platform", required=True)
    mark_done.add_argument("--live-url", required=True)

    next_cmd = subparsers.add_parser("next")
    next_cmd.add_argument("--run", required=True)
    next_cmd.add_argument("--json", action="store_true")

    report = subparsers.add_parser("report")
    report.add_argument("--run", required=True)
    report.add_argument("--json", action="store_true")
    return parser


def load_launch(path: str) -> LaunchProfile:
    raw = load_document(path)
    return LaunchProfile(
        product_name=raw.get("product_name", ""),
        website_url=raw.get("website_url", ""),
        tagline=raw.get("tagline", ""),
        summary=raw.get("summary", ""),
        descriptions=raw.get("descriptions", {}),
        features=raw.get("features", []),
        assets=raw.get("assets", {}),
        company=raw.get("company", {}),
        publish=raw.get("publish", {}),
    )


def plan_command(args: argparse.Namespace) -> int:
    launch = load_launch(args.launch)
    platforms = load_platforms(args.platforms)
    launch_dict = asdict(launch)
    missing = [field for field in REQUIRED_LAUNCH_FIELDS if not launch_dict.get(field)]
    questions = [f"Please provide {field.replace('_', ' ')}." for field in missing]
    output = {
        "missing_fields": missing,
        "questions": questions,
        "platform_count": len(platforms),
        "platforms": [record.slug for record in platforms],
    }
    emit(output, args.json)
    return 0


def generate_command(args: argparse.Namespace) -> int:
    launch = load_launch(args.launch)
    platforms = load_platforms(args.platforms)
    run_dir = Path(args.out) / f"run-{datetime.now(UTC).strftime('%Y%m%dT%H%M%SZ')}"
    run_dir.mkdir(parents=True, exist_ok=True)
    init_db(run_dir)
    results: list[dict[str, Any]] = []
    for record in platforms:
        decision = plan_platform(record)
        decision.payload = build_payload(launch, record)
        write_manual_pack(run_dir, record, decision)
        digest = digest_text(f"{decision.payload.get('title', '')}\n{decision.payload.get('body', '')}")
        duplicate = seen_digest(run_dir, digest)
        record_digest(run_dir, digest, record.slug)
        assets = prepare_assets(launch, record, run_dir / record.slug)
        result = {"status": "generated", "url": decision.payload["url"], "duplicate": duplicate, "assets": assets}
        decision.result = result
        record_submission(run_dir, record.slug, decision.mode, result["status"], decision.reason, result)
        results.append(
            {
                "platform": record.slug,
                "mode": decision.mode,
                "risk_level": decision.risk_level,
                "reason": decision.reason,
                "payload_path": str(run_dir / record.slug / "payload.json"),
                "duplicate": duplicate,
                "asset_count": len(assets),
            }
        )
    emit({"run_dir": str(run_dir), "results": results}, args.json)
    return 0


def publish_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        emit({"error": f"Run directory not found: {run_dir}"}, args.json)
        return 1
    results: list[dict[str, Any]] = []
    for platform in args.platform:
        payload_path = run_dir / platform / "payload.json"
        if not payload_path.exists():
            emit({"error": f"Payload not found for platform '{platform}' in {run_dir}"}, args.json)
            return 1
        meta_path = run_dir / platform / "meta.json"
        payload = json.loads(payload_path.read_text(encoding="utf-8"))
        meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
        remaining = cooldown_remaining(run_dir, platform, int(meta.get("cooldown_seconds", 0)))
        if remaining > 0:
            result = {"status": "cooldown_blocked", "error": f"{remaining}s cooldown remaining", "publisher": platform}
            results.append({"platform": platform, "result": result})
            continue
        result = publish_platform(platform, payload, dry_run=not args.execute)
        record_submission(run_dir, platform, "official_api" if platform in PUBLISHERS else "manual", result["status"], "publish command", result)
        if args.execute and result.get("status") == "published":
            record_publish_attempt(run_dir, platform)
        results.append({"platform": platform, "result": result})
    emit({"results": results}, args.json)
    return 0


def mark_done_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        print(f"Run directory not found: {run_dir}")
        return 1
    result = {"status": "manual_completed", "url": args.live_url}
    record_submission(run_dir, args.platform, "manual", "manual_completed", "marked done by operator", result)
    print(f"Marked {args.platform} complete")
    return 0


def next_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        emit({"error": f"Run directory not found: {run_dir}"}, args.json)
        return 1
    rows = list_submissions(run_dir)
    pending = get_pending_manual(run_dir, rows)
    if not pending:
        emit({"message": "No pending manual submissions."}, args.json)
        return 0
    row = pending[0]
    platform_dir = run_dir / row["platform"]
    prompt_text = (platform_dir / "PROMPT_USER.txt").read_text(encoding="utf-8")
    payload = json.loads((platform_dir / "payload.json").read_text(encoding="utf-8"))
    emit(
        {
            "platform": row["platform"],
            "status": row["status"],
            "prompt": prompt_text,
            "payload": payload,
        },
        args.json,
    )
    return 0


def report_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        emit({"error": f"Run directory not found: {run_dir}"}, args.json)
        return 1
    rows = list_submissions(run_dir)
    pending = get_pending_manual(run_dir, rows)
    pending_manual = [row["platform"] for row in pending]
    next_manual = pending_manual[0] if pending_manual else None
    emit({"results": rows, "pending_manual": pending_manual, "next_manual": next_manual}, args.json)
    return 0


def emit(payload: dict[str, Any], json_mode: bool) -> None:
    if json_mode:
        print(json.dumps(payload, indent=2))
        return
    for key, value in payload.items():
        print(f"{key}: {value}")


def get_pending_manual(run_dir: Path, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    pending: list[dict[str, Any]] = []
    for row in rows:
        if row["mode"] != "manual" or row["status"] == "manual_completed":
            continue
        meta_path = run_dir / row["platform"] / "meta.json"
        meta = {}
        if meta_path.exists():
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
        row = {**row, "priority": int(meta.get("priority", 50)), "risk_rank": RISK_ORDER.get(meta.get("risk", "medium"), 99)}
        pending.append(row)
    pending.sort(key=lambda item: (-item["priority"], item["risk_rank"], item["platform"]))
    return pending


def init_command() -> int:
    print("Copy examples/launch.sample.yaml and data/seed_platforms.yaml into your working directory to start.")
    return 0


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.command == "init":
        return init_command()
    if args.command == "plan":
        return plan_command(args)
    if args.command == "generate":
        return generate_command(args)
    if args.command == "publish":
        return publish_command(args)
    if args.command == "mark-done":
        return mark_done_command(args)
    if args.command == "next":
        return next_command(args)
    if args.command == "report":
        return report_command(args)
    parser.error(f"Unknown command: {args.command}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
