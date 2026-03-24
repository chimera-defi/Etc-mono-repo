from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict
from importlib import resources
from pathlib import Path
from typing import Any

from orbit_pilot.audit import read_audit_events, record_submission
from orbit_pilot.config import load_document
from orbit_pilot.models import REQUIRED_LAUNCH_FIELDS, LaunchProfile
from orbit_pilot.policy import decide_platform, load_risk_policy
from orbit_pilot.registry import load_platforms
from orbit_pilot.services.campaigns import (
    build_campaign,
    create_run_dir,
    latest_run,
    list_campaigns,
    load_run_manifest,
    write_run_manifest,
)
from orbit_pilot.services.export_run import export_run
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
        cmd.add_argument("--policy", help="Risk policy YAML (default: bundled risk.defaults.yaml)")
        cmd.add_argument("--json", action="store_true")
        if name == "generate":
            cmd.add_argument("--out", default="out")
            cmd.add_argument("--campaign")

    subparsers.add_parser("serve")

    regenerate = subparsers.add_parser("regenerate")
    regenerate.add_argument("--run", required=True)
    regenerate.add_argument("--platform", action="append")
    regenerate.add_argument("--policy", help="Risk policy YAML (default: bundled risk.defaults.yaml)")
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
    mark_done.add_argument("--note", default="", help="Optional operator note (approval context, rejection reason)")
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

    export_cmd = subparsers.add_parser("export")
    export_cmd.add_argument("--run", required=True)
    export_cmd.add_argument("--format", choices=["json", "md", "html"], default="json")
    export_cmd.add_argument("-o", "--out", help="Write to file instead of stdout")

    audit_cmd = subparsers.add_parser("audit")
    audit_cmd.add_argument("--run", required=True)
    audit_cmd.add_argument("--json", action="store_true")
    audit_cmd.add_argument("--tail", type=int, help="Only last N events")

    tui_cmd = subparsers.add_parser("tui", help="Interactive run dashboard (requires: pip install 'orbit-pilot[tui]')")
    tui_cmd.add_argument("--run", required=True, help="Path to run-* directory")

    schemas_cmd = subparsers.add_parser("schemas", help="List bundled JSON Schemas for --json CLI outputs")
    schemas_cmd.add_argument("--json", action="store_true")
    schemas_cmd.add_argument(
        "--show",
        metavar="NAME",
        help="Print schema JSON (e.g. plan-output, doctor-output, generate-output)",
    )
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
        cta_policy=raw.get("cta_policy", {}),
    )


def _default_policy_path() -> str:
    bundled = resources.files("orbit_pilot.bundled")
    return str(bundled.joinpath("risk.defaults.yaml"))


def _policy_path(args: argparse.Namespace) -> str | None:
    if getattr(args, "policy", None):
        return args.policy
    return _default_policy_path()


def _policy_path_regenerate(args: argparse.Namespace, manifest: dict[str, Any]) -> str | None:
    if getattr(args, "policy", None):
        return args.policy
    stored = manifest.get("policy_path")
    if stored:
        return str(stored)
    return _default_policy_path()


def plan_command(args: argparse.Namespace) -> int:
    launch = load_launch(args.launch)
    platforms = load_platforms(args.platforms)
    policy = load_risk_policy(_policy_path(args))
    launch_dict = asdict(launch)
    missing = [field for field in REQUIRED_LAUNCH_FIELDS if not launch_dict.get(field)]
    questions = [f"Please provide {field.replace('_', ' ')}." for field in missing]
    platform_preview: list[dict[str, Any]] = []
    for record in platforms:
        decision = decide_platform(record, launch, policy)
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
    policy = load_risk_policy(_policy_path(args))
    emit(doctor_payload(launch, platforms, policy), args.json)
    return 0


def generate_command(args: argparse.Namespace) -> int:
    launch = load_launch(args.launch)
    platforms = load_platforms(args.platforms)
    policy = load_risk_policy(_policy_path(args))
    campaign = build_campaign(launch, explicit_name=args.campaign)
    run_dir = create_run_dir(args.out, campaign)
    write_run_manifest(run_dir, campaign, args.launch, args.platforms, policy_path=_policy_path(args))
    results = generate_run(launch, platforms, run_dir, policy=policy)
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
    policy = load_risk_policy(_policy_path_regenerate(args, manifest))
    results = generate_run(launch, selected, run_dir, policy=policy)
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
    mode = "manual"
    meta_path = run_dir / args.platform / "meta.json"
    if meta_path.exists():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        pm = meta.get("planned_mode")
        if pm in ("manual", "browser_fallback"):
            mode = pm
    result = {"status": "manual_completed", "url": args.live_url}
    note = (args.note or "").strip() or None
    record_submission(
        run_dir,
        args.platform,
        mode,
        "manual_completed",
        "marked done by operator",
        result,
        operator_note=note,
    )
    message = f"Marked {args.platform} complete: {args.live_url}"
    if args.json:
        emit(
            {
                "message": message,
                "platform": args.platform,
                "live_url": args.live_url,
                "note": note or "",
            },
            True,
        )
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
    data = human_guide(run_dir)
    if args.json:
        emit(data, True)
        return 0
    print(f"Run: {run_dir}\n")
    if data.get("official_ready"):
        print("Official API — ready to execute:")
        for item in data["official_ready"]:
            print(f"  - {item['platform']}: {item['next_step']}")
    if data.get("official_blocked"):
        print("\nOfficial API — blocked (missing config):")
        for item in data["official_blocked"]:
            miss = ", ".join(item["missing_secrets"] + item["missing_payload"]) or "(none listed)"
            print(f"  - {item['platform']}: missing {miss}")
            print(f"    {item['next_step']}")
    if data.get("manual_top"):
        print("\nTop manual submissions:")
        for item in data["manual_top"]:
            print(f"  - {item['platform']} (priority {item['priority']}): {item['submit_url']}")
            print(f"    {item['prompt_path']}")
    if data.get("next_manual"):
        print(f"\nNext manual: {data['next_manual']}")
    return 0


def campaigns_command(args: argparse.Namespace) -> int:
    rows = list_campaigns(args.out)
    if args.json:
        emit({"campaigns": rows}, True)
    else:
        if not rows:
            print("No campaigns under", args.out)
        for row in rows:
            print(f"{row['campaign']}: {row['run_count']} run(s), latest {row['latest_run']}")
    return 0


def latest_command(args: argparse.Namespace) -> int:
    run_path = latest_run(args.out, args.campaign)
    if run_path is None:
        emit({"error": f"No runs found for campaign: {args.campaign}"}, args.json)
        return 1
    if args.json:
        emit({"campaign": args.campaign, "latest_run": run_path}, True)
    else:
        print(run_path)
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
        browser_fb = data.get("browser_fallback", [])
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
        if browser_fb:
            print(f"\nBrowser fallback (manual): {', '.join(browser_fb)}")
    return 0


def audit_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        print(f"Run directory not found: {run_dir}", file=sys.stderr)
        return 1
    events = read_audit_events(run_dir, tail=args.tail)
    if args.json:
        print(json.dumps(events, indent=2))
    else:
        if not events:
            print("(no audit.jsonl or empty)")
        for ev in events:
            ts = ev.get("ts", "")
            typ = ev.get("type", "")
            plat = ev.get("platform", "")
            extra = f" {plat}" if plat else ""
            print(f"{ts}  {typ}{extra}")
    return 0


def export_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not run_dir.exists():
        print(f"Run directory not found: {run_dir}", file=sys.stderr)
        return 1
    text = export_run(run_dir, args.format)
    if args.format == "html" and not args.out:
        out_path = run_dir / "report.html"
        out_path.write_text(text, encoding="utf-8")
        print(str(out_path))
        return 0
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    else:
        print(text)
    return 0


def schemas_command(args: argparse.Namespace) -> int:
    from orbit_pilot.schemas_cmd import emit_manifest_json, list_schemas, read_schema

    if args.show:
        try:
            print(json.dumps(read_schema(args.show), indent=2))
        except FileNotFoundError:
            print(f"Unknown schema: {args.show}", file=sys.stderr)
            print("Use: orbit schemas --json", file=sys.stderr)
            return 1
        return 0
    if args.json:
        print(emit_manifest_json())
        return 0
    for sid, path in list_schemas():
        print(f"{sid}\t{path}")
    return 0


def tui_command(args: argparse.Namespace) -> int:
    from orbit_pilot.tui_app import run_tui, tui_available

    run_dir = Path(args.run)
    if not run_dir.exists():
        print(f"Run directory not found: {run_dir}", file=sys.stderr)
        return 1
    if not tui_available():
        print(
            "Textual is not installed. Run: pip install 'orbit-pilot[tui]'",
            file=sys.stderr,
        )
        return 1
    run_tui(run_dir)
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


def serve_main() -> None:
    """Console script: orbit-serve"""
    import os

    import uvicorn

    from orbit_pilot.webhook import app

    host = os.environ.get("ORBIT_BIND_HOST", "127.0.0.1")
    port = int(os.environ.get("ORBIT_BIND_PORT", "8765"))
    uvicorn.run(app, host=host, port=port)


def serve_command(args: argparse.Namespace) -> int:
    serve_main()
    return 0


def init_command(args: argparse.Namespace) -> int:
    dest = Path(args.dir).resolve()
    dest.mkdir(parents=True, exist_ok=True)
    bundled = resources.files("orbit_pilot.bundled")
    for name in ("launch.sample.yaml", "seed_platforms.yaml", "risk.defaults.yaml"):
        if name == "risk.defaults.yaml":
            target = dest / name
        else:
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
    if args.command == "serve":
        return serve_command(args)
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
    if args.command == "export":
        return export_command(args)
    if args.command == "audit":
        return audit_command(args)
    if args.command == "tui":
        return tui_command(args)
    if args.command == "schemas":
        return schemas_command(args)
    parser.error(f"Unknown command: {args.command}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
