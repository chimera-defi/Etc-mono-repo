from __future__ import annotations

import argparse
import json
from dataclasses import asdict
from importlib import resources
from pathlib import Path
from typing import Any

from orbit_pilot.audit import record_submission
from orbit_pilot.config import load_document
from orbit_pilot.graph import plan_platform
from orbit_pilot.models import LaunchProfile, REQUIRED_LAUNCH_FIELDS
from orbit_pilot.registry import load_platforms
from orbit_pilot.services.campaigns import (
    build_campaign,
    create_run_dir,
    latest_run,
    list_campaigns,
    load_run_manifest,
    write_run_manifest,
)
from orbit_pilot.services.generation import generate_run, select_platforms
from orbit_pilot.services.publishing import publish_from_run
from orbit_pilot.services.reporting import human_guide, next_manual_payload, report_payload
from orbit_pilot.services.validation import doctor_payload


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="orbit")
    subparsers = parser.add_subparsers(dest="command", required=True)

    init_p = subparsers.add_parser("init")
    init_p.add_argument("--dir", default=".", help="Directory to write launch.yaml and seed_platforms.yaml")

    for name in ("plan", "generate", "doctor"):
        cmd = subparsers.add_parser(name)
        cmd.add_argument("--launch", required=True)
        cmd.add_argument("--platforms", required=True)
        cmd.add_argument("--json", action="store_true")
        if name == "generate":
            cmd.add_argument("--out", default="out")
            cmd.add_argument("--campaign")

    regenerate = subparsers.add_parser("regenerate")
    regenerate.add_argument("--run", required=True)
    regenerate.add_argument("--platform", action="append")
    regenerate.add_argument("--json", action="store_true")

    publish = subparsers.add_parser("publish")
    publish.add_argument("--run", required=True)
    publish.add_argument("--platform", action="append", required=True)
    publish.add_argument("--json", action="store_true")
    publish.add_argument("--execute", action="store_true")

    mark_done = subparsers.add_parser("mark-done")
    mark_done.add_argument("--run", required=True)
    mark_done.add_argument("--platform", required=True)
    mark_done.add_argument("--live-url", required=True)
    mark_done.add_argument("--json", action="store_true")

    next_cmd = subparsers.add_parser("next")
    next_cmd.add_argument("--run", required=True)
    next_cmd.add_argument("--json", action="store_true")

    guide = subparsers.add_parser("guide")
    guide.add_argument("--run", required=True)
    guide.add_argument("--json", action="store_true")

    campaigns = subparsers.add_parser("campaigns")
    campaigns.add_argument("--out", default="out")
    campaigns.add_argument("--json", action="store_true")

    latest = subparsers.add_parser("latest")
    latest.add_argument("--out", default="out")
    latest.add_argument("--campaign", required=True)
    latest.add_argument("--json", action="store_true")

    report = subparsers.add_parser("report")
    report.add_argument("--run", required=True)
    report.add_argument("--json", action="store_true")
    return parser


def load_launch(path: str) -> LaunchProfile:
    source_path = Path(path)
    raw = load_document(source_path)
    assets = raw.get("assets", {})
    logo = assets.get("logo")
    if logo:
        assets["logo"] = str((source_path.parent / logo).resolve())
    screenshots = [str((source_path.parent / item).resolve()) for item in assets.get("screenshots", [])]
    if screenshots:
        assets["screenshots"] = screenshots
    return LaunchProfile(
        product_name=raw.get("product_name", ""),
        website_url=raw.get("website_url", ""),
        tagline=raw.get("tagline", ""),
        summary=raw.get("summary", ""),
        descriptions=raw.get("descriptions", {}),
        features=raw.get("features", []),
        assets=assets,
        company=raw.get("company", {}),
        publish=raw.get("publish", {}),
    )


def plan_command(args: argparse.Namespace) -> int:
    launch = load_launch(args.launch)
    platforms = load_platforms(args.platforms)
    launch_dict = asdict(launch)
    missing = [field for field in REQUIRED_LAUNCH_FIELDS if not launch_dict.get(field)]
    questions = [f"Please provide {field.replace('_', ' ')}." for field in missing]
    platform_preview: list[dict[str, Any]] = []
    for record in platforms:
        decision = plan_platform(record, launch)
        platform_preview.append(
            {
                "slug": record.slug,
                "planned_mode": decision.mode,
                "risk": decision.risk_level,
                "reason": decision.reason,
            }
        )
    output = {
        "missing_fields": missing,
        "questions": questions,
        "platform_count": len(platforms),
        "platforms": [record.slug for record in platforms],
        "platform_preview": platform_preview,
    }
    emit_plan(output, args.json)
    return 0


def doctor_command(args: argparse.Namespace) -> int:
    launch = load_launch(args.launch)
    platforms = load_platforms(args.platforms)
    emit(doctor_payload(launch, platforms), args.json)
    return 0


def generate_command(args: argparse.Namespace) -> int:
    launch = load_launch(args.launch)
    platforms = load_platforms(args.platforms)
    campaign = build_campaign(launch, explicit_name=args.campaign)
    run_dir = create_run_dir(args.out, campaign)
    write_run_manifest(run_dir, campaign, args.launch, args.platforms)
    results = generate_run(launch, platforms, run_dir)
    emit({"run_dir": str(run_dir), "results": results}, args.json)
    return 0


def regenerate_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        emit({"error": f"Run directory not found: {run_dir}"}, args.json)
        return 1
    manifest = load_run_manifest(run_dir)
    launch = load_launch(manifest["launch_path"])
    platforms = load_platforms(manifest["platform_registry_path"])
    selected = select_platforms(platforms, args.platform)
    results = generate_run(launch, selected, run_dir)
    emit({"run_dir": str(run_dir), "results": results}, args.json)
    return 0


def publish_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    try:
        results = publish_from_run(run_dir, args.platform, execute=args.execute)
    except FileNotFoundError as exc:
        emit({"error": str(exc)}, args.json)
        return 1
    emit({"results": results}, args.json)
    return 0


def mark_done_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        emit({"error": f"Run directory not found: {run_dir}"}, args.json)
        return 1
    result = {"status": "manual_completed", "url": args.live_url}
    record_submission(run_dir, args.platform, "manual", "manual_completed", "marked done by operator", result)
    message = f"Marked {args.platform} complete: {args.live_url}"
    if args.json:
        emit({"message": message, "platform": args.platform, "live_url": args.live_url}, True)
    else:
        print(message)
    return 0


def next_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        emit({"error": f"Run directory not found: {run_dir}"}, args.json)
        return 1
    payload = next_manual_payload(run_dir)
    if args.json:
        emit(payload, True)
    elif payload.get("message"):
        print(payload["message"])
    else:
        print(f"Next: {payload['platform']}\n")
        print(payload["prompt"])
    return 0


def guide_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        emit({"error": f"Run directory not found: {run_dir}"}, args.json)
        return 1
    emit(human_guide(run_dir), args.json)
    return 0


def campaigns_command(args: argparse.Namespace) -> int:
    emit({"campaigns": list_campaigns(args.out)}, args.json)
    return 0


def latest_command(args: argparse.Namespace) -> int:
    run_path = latest_run(args.out, args.campaign)
    if run_path is None:
        emit({"error": f"No runs found for campaign: {args.campaign}"}, args.json)
        return 1
    emit({"campaign": args.campaign, "latest_run": run_path}, args.json)
    return 0


def report_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        emit({"error": f"Run directory not found: {run_dir}"}, args.json)
        return 1
    data = report_payload(run_dir)
    if args.json:
        emit(data, True)
    else:
        rows = data["results"]
        pending_manual = data["pending_manual"]
        next_manual = data["next_manual"]
        skipped = data.get("skipped", [])
        print(f"Run: {run_dir}\n")
        print("--- By platform ---")
        for row in rows:
            url = row.get("live_url") or (row.get("result") or {}).get("url", "")
            print(f"  {row['platform']}: [{row['mode']}] {row['status']} - {url or row['reason']}")
        if pending_manual:
            print(f"\nPending manual ({len(pending_manual)}): {', '.join(pending_manual)}")
            print(f"Next: {next_manual}")
        else:
            print("\nNo pending manual submissions.")
        if skipped:
            print(f"\nSkipped: {', '.join(skipped)}")
    return 0


def emit_plan(payload: dict[str, Any], json_mode: bool) -> None:
    if json_mode:
        print(json.dumps(payload, indent=2))
        return
    print("Missing fields:", ", ".join(payload["missing_fields"]) or "(none)")
    for q in payload["questions"]:
        print(f"  - {q}")
    print(f"\nPlatforms ({payload['platform_count']}):")
    for item in payload["platform_preview"]:
        print(f"  - {item['slug']}: {item['planned_mode']} ({item['risk']}) - {item['reason']}")


def emit(payload: dict[str, Any], json_mode: bool) -> None:
    if json_mode:
        print(json.dumps(payload, indent=2))
        return
    for key, value in payload.items():
        print(f"{key}: {value}")


def init_command(args: argparse.Namespace) -> int:
    dest = Path(args.dir).resolve()
    dest.mkdir(parents=True, exist_ok=True)
    bundled = resources.files("orbit_pilot.bundled")
    for name in ("launch.sample.yaml", "seed_platforms.yaml"):
        target = dest / name.replace(".sample", "")
        text = bundled.joinpath(name).read_text(encoding="utf-8")
        if target.exists():
            print(f"Skip existing {target}")
        else:
            target.write_text(text, encoding="utf-8")
            print(f"Wrote {target}")
    print(
        f"\nNext: edit {dest / 'launch.yaml'}, then:\n"
        "  orbit plan --launch launch.yaml --platforms seed_platforms.yaml"
    )
    return 0


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.command == "init":
        return init_command(args)
    if args.command == "plan":
        return plan_command(args)
    if args.command == "doctor":
        return doctor_command(args)
    if args.command == "generate":
        return generate_command(args)
    if args.command == "regenerate":
        return regenerate_command(args)
    if args.command == "publish":
        return publish_command(args)
    if args.command == "mark-done":
        return mark_done_command(args)
    if args.command == "next":
        return next_command(args)
    if args.command == "guide":
        return guide_command(args)
    if args.command == "campaigns":
        return campaigns_command(args)
    if args.command == "latest":
        return latest_command(args)
    if args.command == "report":
        return report_command(args)
    parser.error(f"Unknown command: {args.command}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
