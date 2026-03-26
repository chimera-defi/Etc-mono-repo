"""CLI argument parsing and command implementations (entry: `orbit_pilot.cli.main`)."""

from __future__ import annotations

import argparse
import json
import os
import sys
from collections.abc import Callable
from dataclasses import asdict
from importlib import resources
from pathlib import Path
from typing import Any

from orbit_pilot.audit import read_audit_events, record_submission
from orbit_pilot.cli_io import require_run_dir
from orbit_pilot.config import load_document
from orbit_pilot.models import REQUIRED_LAUNCH_FIELDS, LaunchProfile
from orbit_pilot.policy import bundled_default_policy_path, decide_platform, load_risk_policy
from orbit_pilot.profile_loader import profile_from_parsed_yaml
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
from orbit_pilot.services.work_queue import open_submit_url, work_next_payload

# (bundled filename, destination filename under init --dir)
_INIT_BUNDLED_FILES: tuple[tuple[str, str], ...] = (
    ("seed_platforms.yaml", "seed_platforms.yaml"),
    ("risk.defaults.yaml", "risk.defaults.yaml"),
)

_INIT_LAUNCH_BY_PRESET: dict[str, str] = {
    "default": "launch.sample.yaml",
    "walletradar": "launch.walletradar.sample.yaml",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="orbit",
        description=(
            "Launch distribution operator: one launch.yaml + platform registry → packs, publish, audit. "
            "Use --json on subcommands for machine-readable output; validate with "
            "orbit validate-json and orbit schemas."
        ),
        epilog=(
            "Agent quick path: orbit pipeline --launch … --platforms … --out out/ --json  |  "
            "Human queue: orbit work --run <run_dir>  |  "
            "Docs: apps/orbit-pilot/AGENTS.md (repo)  |  "
            "Also: python -m orbit_pilot …  |  Webhook entrypoint: orbit-serve"
        ),
    )
    subparsers = parser.add_subparsers(dest="command", required=True, metavar="COMMAND")

    init_p = subparsers.add_parser(
        "init",
        help="Write launch.yaml, seed_platforms.yaml, and risk.defaults.yaml into --dir",
    )
    init_p.add_argument("--dir", default=".", help="Directory to write launch.yaml and seed_platforms.yaml")
    init_p.add_argument(
        "--preset",
        choices=["default", "walletradar"],
        default="default",
        help="launch.yaml template: default (OrbitPilot sample) or walletradar (WalletRadar-shaped stub)",
    )

    _plan_help = {
        "plan": "Preview platforms, risk modes, and missing launch fields",
        "doctor": "Readiness per platform (secrets, payload gaps, optional browser checks)",
        "generate": "Create run directory and per-platform submission packs under --out",
    }
    for name in ("plan", "generate", "doctor"):
        cmd = subparsers.add_parser(name, help=_plan_help[name])
        cmd.add_argument("--launch", required=True, help="Path to launch.yaml")
        cmd.add_argument("--platforms", required=True, help="Path to platform registry YAML")
        cmd.add_argument("--policy", help="Risk policy YAML (default: bundled risk.defaults.yaml)")
        cmd.add_argument("--json", action="store_true", help="Print JSON to stdout for agents/CI")
        if name == "generate":
            cmd.add_argument("--out", default="out", help="Output root (default: out)")
            cmd.add_argument("--campaign", help="Override campaign id derived from product name")

    subparsers.add_parser(
        "serve",
        help="Run FastAPI webhook server (GET /health, POST /hooks/launch); same as orbit-serve",
    )

    regenerate = subparsers.add_parser(
        "regenerate",
        help="Regenerate selected platforms inside an existing run directory",
    )
    regenerate.add_argument("--run", required=True, help="Path to run-* directory")
    regenerate.add_argument("--platform", action="append", help="Platform slug (repeatable); default all planned")
    regenerate.add_argument("--policy", help="Risk policy YAML (default: bundled risk.defaults.yaml)")
    regenerate.add_argument("--json", action="store_true", help="Print JSON to stdout")

    publish = subparsers.add_parser(
        "publish",
        help="Dry-run or execute publish for --platform (API or browser_assisted when enabled)",
    )
    publish.add_argument("--run", required=True, help="Path to run-* directory")
    publish.add_argument(
        "--platform",
        action="append",
        required=True,
        help="Platform slug (repeatable)",
    )
    publish.add_argument("--json", action="store_true", help="Print JSON to stdout")
    publish.add_argument(
        "--execute",
        action="store_true",
        help="Perform real publishes (default is dry-run for API modes)",
    )
    publish.add_argument(
        "--browser",
        action="store_true",
        help="Allow browser_assisted publish path (still requires env ORBIT_ALLOW_BROWSER_AUTOMATION etc.)",
    )

    mark_done = subparsers.add_parser(
        "mark-done",
        help="Record manual completion: live listing URL + optional note",
    )
    mark_done.add_argument("--run", required=True, help="Path to run-* directory")
    mark_done.add_argument("--platform", required=True, help="Platform slug")
    mark_done.add_argument("--live-url", required=True, help="Final public URL after manual post")
    mark_done.add_argument("--note", default="", help="Optional operator note (approval context, rejection reason)")
    mark_done.add_argument("--json", action="store_true", help="Print JSON to stdout")

    next_cmd = subparsers.add_parser("next", help="Next manual or browser_assisted tasks for a run")
    next_cmd.add_argument("--run", required=True, help="Path to run-* directory")
    next_cmd.add_argument("--json", action="store_true", help="Print JSON to stdout")

    work_p = subparsers.add_parser(
        "work",
        help="Next queue item: open submit URL in browser; optional Playwright assist for browser_assisted",
    )
    work_p.add_argument("--run", required=True, help="Path to run-* directory")
    work_p.add_argument("--json", action="store_true", help="Print JSON to stdout (agents)")
    work_p.add_argument(
        "--no-open",
        action="store_true",
        help="Do not open the system browser (still prints URLs and suggested commands)",
    )
    work_p.add_argument(
        "--playwright",
        action="store_true",
        help="browser_assisted only: run publish assist (needs ORBIT_BROWSER_* secrets + orbit-pilot[browser])",
    )

    guide = subparsers.add_parser("guide", help="Human-oriented next steps for a run (--json for agents)")
    guide.add_argument("--run", required=True, help="Path to run-* directory")
    guide.add_argument("--json", action="store_true", help="Structured guide payload")

    campaigns = subparsers.add_parser("campaigns", help="List campaigns under --out")
    campaigns.add_argument("--out", default="out", help="Output root (default: out)")
    campaigns.add_argument("--json", action="store_true", help="Print JSON to stdout")

    latest = subparsers.add_parser("latest", help="Print latest run path for a campaign")
    latest.add_argument("--out", default="out", help="Output root (default: out)")
    latest.add_argument("--campaign", required=True, help="Campaign id")
    latest.add_argument("--json", action="store_true", help="Print JSON to stdout")

    report = subparsers.add_parser("report", help="Status summary for all platforms in a run")
    report.add_argument("--run", required=True, help="Path to run-* directory")
    report.add_argument("--json", action="store_true", help="Print JSON to stdout")

    export_cmd = subparsers.add_parser("export", help="Export run snapshot as json, md, or html")
    export_cmd.add_argument("--run", required=True, help="Path to run-* directory")
    export_cmd.add_argument("--format", choices=["json", "md", "html"], default="json")
    export_cmd.add_argument("-o", "--out", help="Write to file instead of stdout")
    export_cmd.add_argument("--json", action="store_true", help="Machine-readable errors (e.g. missing run dir)")

    audit_cmd = subparsers.add_parser("audit", help="Print audit.jsonl events for a run")
    audit_cmd.add_argument("--run", required=True, help="Path to run-* directory")
    audit_cmd.add_argument("--json", action="store_true", help="Print JSON array to stdout")
    audit_cmd.add_argument("--tail", type=int, help="Only last N events")

    tui_cmd = subparsers.add_parser(
        "tui",
        help="Interactive run dashboard (requires orbit-pilot[tui]: pip or uv pip install)",
    )
    tui_cmd.add_argument("--run", required=True, help="Path to run-* directory")

    schemas_cmd = subparsers.add_parser(
        "schemas",
        help="List bundled JSON Schemas (use with orbit validate-json for agent parsers)",
    )
    schemas_cmd.add_argument("--json", action="store_true")
    schemas_cmd.add_argument(
        "--show",
        metavar="NAME",
        help="Print schema JSON (id, command alias e.g. plan, or filename)",
    )

    val_cmd = subparsers.add_parser(
        "validate-json",
        help="Validate JSON stdin or file against a bundled schema",
    )
    val_cmd.add_argument(
        "schema",
        help="Schema id or command alias (plan, doctor, generate, report, …)",
    )
    val_cmd.add_argument(
        "file",
        nargs="?",
        help="JSON file (default: read stdin)",
    )
    val_cmd.add_argument("--json", action="store_true", help="Emit {\"valid\":…} JSON result")

    subparsers.add_parser("version", help="Print package version")

    check_run_cmd = subparsers.add_parser(
        "check-run",
        help="Validate run.json and referenced launch/registry paths (for agents/CI)",
    )
    check_run_cmd.add_argument("--run", required=True)
    check_run_cmd.add_argument("--json", action="store_true")

    pipe = subparsers.add_parser(
        "pipeline",
        help="One-shot: plan + doctor + generate + check-run (agents: single --json round-trip)",
    )
    pipe.add_argument("--launch", required=True)
    pipe.add_argument("--platforms", required=True)
    pipe.add_argument("--out", default="out")
    pipe.add_argument("--campaign", help="Override campaign id/name from launch product_name")
    pipe.add_argument("--policy", help="Risk policy YAML (default: bundled risk.defaults.yaml)")
    pipe.add_argument("--json", action="store_true")

    reg_lint = subparsers.add_parser(
        "registry-lint",
        help="Validate platform registry YAML (HTTPS URLs, no unknown/placeholder links)",
    )
    reg_lint.add_argument("--platforms", required=True, help="Path to platforms YAML")
    reg_lint.add_argument("--json", action="store_true")

    sch_add = subparsers.add_parser(
        "schedule-add",
        help="Queue a command for later (JSONL file); run with orbit schedule-run or schedule-run --loop",
    )
    sch_add.add_argument("--due", required=True, help="ISO-8601 time (Z/offset) or naive with --timezone")
    sch_add.add_argument(
        "--timezone",
        metavar="IANA",
        help="If --due has no zone, interpret as local wall time in this zone (e.g. America/New_York)",
    )
    sch_add.add_argument(
        "--recurrence",
        choices=["none", "daily", "weekly", "monthly"],
        default="none",
        help="After a successful run, enqueue next occurrence (UTC anchor from due_at)",
    )
    sch_add.add_argument("--cwd", default=".", help="Working directory for the command")
    sch_add.add_argument(
        "--file",
        help="Path to schedule file (default: ~/.orbit-pilot/schedule.jsonl or ORBIT_SCHEDULE_PATH)",
    )
    sch_add.add_argument("command", nargs=argparse.REMAINDER, help="Command and args (e.g. orbit publish ...)")

    sch_list = subparsers.add_parser("schedule-list", help="List pending scheduled jobs")
    sch_list.add_argument("--json", action="store_true")
    sch_list.add_argument("--file", help="Schedule file path override")

    sch_run = subparsers.add_parser(
        "schedule-run",
        help="Run due jobs once, or loop as a daemon (poll interval ORBIT_SCHEDULE_POLL_SECONDS)",
    )
    sch_run.add_argument("--loop", action="store_true", help="Run forever polling for due jobs")
    sch_run.add_argument("--file", help="Schedule file path override")
    sch_run.add_argument("--json", action="store_true")

    sch_cancel = subparsers.add_parser("schedule-cancel", help="Cancel a pending job by id")
    sch_cancel.add_argument("--id", dest="job_id", required=True, help="Job id from schedule-add or schedule-list")
    sch_cancel.add_argument("--file", help="Schedule file path override")
    sch_cancel.add_argument("--json", action="store_true")
    return parser


def load_launch(path: str) -> LaunchProfile:
    source_path = Path(path)
    return profile_from_parsed_yaml(load_document(source_path), source_path)


def _policy_path(args: argparse.Namespace) -> str | None:
    if getattr(args, "policy", None):
        return args.policy
    return bundled_default_policy_path()


def _policy_path_regenerate(args: argparse.Namespace, manifest: dict[str, Any]) -> str | None:
    if getattr(args, "policy", None):
        return args.policy
    stored = manifest.get("policy_path")
    if stored:
        return str(stored)
    return bundled_default_policy_path()


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


def pipeline_command(args: argparse.Namespace) -> int:
    """plan → doctor → generate → check-run in one JSON object (default exit 0; use ok_all for agents)."""
    from orbit_pilot.check_run import check_run

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
    plan_out = {
        "missing_fields": missing,
        "questions": questions,
        "platform_count": len(platforms),
        "platforms": [record.slug for record in platforms],
        "platform_preview": platform_preview,
    }
    doctor_out = doctor_payload(launch, platforms, policy)
    campaign = build_campaign(launch, explicit_name=args.campaign)
    run_dir = create_run_dir(args.out, campaign)
    write_run_manifest(
        run_dir,
        campaign,
        args.launch,
        args.platforms,
        policy_path=_policy_path(args),
    )
    gen_results = generate_run(launch, platforms, run_dir, policy=policy)
    check_out = check_run(run_dir)
    ok_plan = not missing
    ok_doctor = all(r.get("ready") for r in doctor_out.get("results", []))
    ok_check = bool(check_out.get("ok"))
    payload = {
        "ok_all": ok_plan and ok_doctor and ok_check,
        "ok_plan": ok_plan,
        "ok_doctor": ok_doctor,
        "ok_check_run": ok_check,
        "plan": plan_out,
        "doctor": doctor_out,
        "generate": {"run_dir": str(run_dir), "results": gen_results},
        "check_run": check_out,
    }
    if args.json:
        print(json.dumps(payload, indent=2))
    else:
        print(f"run_dir: {run_dir}")
        print(f"ok_all: {payload['ok_all']} (plan={ok_plan} doctor={ok_doctor} check_run={ok_check})")
        if check_out.get("warnings"):
            for w in check_out["warnings"]:
                print(f"warning: {w}", file=sys.stderr)
        if check_out.get("errors"):
            for e in check_out["errors"]:
                print(f"error: {e}", file=sys.stderr)
    return 0 if payload["ok_all"] else 1


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
    if not require_run_dir(run_dir, json_mode=args.json):
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
    if args.browser:
        os.environ["ORBIT_ALLOW_BROWSER_AUTOMATION"] = "1"
    try:
        results = publish_from_run(run_dir, args.platform, execute=args.execute)
    except FileNotFoundError as exc:
        emit({"error": str(exc)}, args.json)
        return 1
    emit({"results": results}, args.json)
    return 0


def mark_done_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not require_run_dir(run_dir, json_mode=args.json):
        return 1
    mode = "manual"
    meta_path = run_dir / args.platform / "meta.json"
    if meta_path.exists():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        pm = meta.get("planned_mode")
        if pm in ("manual", "browser_fallback", "browser_assisted"):
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
    if not require_run_dir(run_dir, json_mode=args.json):
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


def work_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not require_run_dir(run_dir, json_mode=args.json):
        return 1
    data = work_next_payload(run_dir)
    if data.get("kind") == "empty":
        if args.json:
            emit(data, True)
        else:
            print(data.get("message", "No pending manual submissions."))
        return 0

    platform = str(data["platform"])
    planned = str(data.get("planned_mode", "manual"))
    submit_url = data.get("submit_url") or ""

    if args.playwright:
        if planned != "browser_assisted":
            err = f"--playwright only applies to browser_assisted (this task is {planned})"
            if args.json:
                emit({**data, "error": err, "assist_ran": False}, True)
            else:
                print(err, file=sys.stderr)
            return 1
        os.environ["ORBIT_ALLOW_BROWSER_AUTOMATION"] = "1"
        try:
            assist_results = publish_from_run(run_dir, [platform], execute=True)
        except FileNotFoundError as exc:
            emit({"error": str(exc), **data}, args.json)
            return 1
        data["assist_ran"] = True
        data["publish_results"] = assist_results
        r0 = assist_results[0]["result"] if assist_results else {}
        data["assist_status"] = r0.get("status")
        data["assist_error"] = r0.get("error")
        if args.json:
            emit(data, True)
            return 0 if r0.get("status") not in ("error", "blocked") else 1
        print(f"Playwright assist: {platform} → status={r0.get('status')}")
        if r0.get("error"):
            print(f"  error: {r0['error']}", file=sys.stderr)
        if r0.get("note"):
            print(f"  note: {r0['note']}")
        print(f"\nWhen done: {data['mark_done_command'].replace('<URL>', '<paste-live-listing-url>')}")
        return 0 if r0.get("status") not in ("error", "blocked") else 1

    opened = False
    open_err = ""
    if submit_url and not args.no_open:
        opened, open_err = open_submit_url(submit_url)
    data["opened_browser"] = opened
    if open_err:
        data["open_error"] = open_err

    if args.json:
        emit(data, True)
        return 0

    print(f"Next queue: {platform}  [{planned}]")
    if submit_url:
        print(f"Submit URL: {submit_url}")
        if args.no_open:
            print("(browser not opened: --no-open)")
        elif opened:
            print("(opened in default browser)")
        else:
            print(f"(could not open browser: {open_err})" if open_err else "(browser open may have failed)")
    else:
        print("No submit_url in meta.json — use pack files below.")
    print()
    print(data.get("prompt", ""))
    print()
    print("Then record the live listing:")
    print(f"  {data['mark_done_command']}")
    if data.get("playwright_assist_command"):
        print("\nOr run supervised Playwright assist (policy + env secrets required):")
        print(f"  {data['playwright_assist_command']}")
        print("  (shorthand: orbit work --run … --playwright)")
    return 0


def guide_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not require_run_dir(run_dir, json_mode=args.json):
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
        print(f"  Streamline: orbit work --run {run_dir}")
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
    if not require_run_dir(run_dir, json_mode=args.json):
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
        browser_asst = data.get("browser_assisted", [])
        if browser_asst:
            print(f"\nBrowser assisted (Playwright): {', '.join(browser_asst)}")
    return 0


def audit_command(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    if not require_run_dir(run_dir, json_mode=args.json):
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
    if not require_run_dir(run_dir, json_mode=bool(args.json)):
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
    from orbit_pilot.schemas_cmd import emit_manifest_json, list_schemas, read_schema, resolve_schema_id

    if args.show:
        sid = resolve_schema_id(args.show)
        try:
            print(json.dumps(read_schema(sid), indent=2))
        except FileNotFoundError:
            print(f"Unknown schema: {args.show} (resolved: {sid})", file=sys.stderr)
            print("Use: orbit schemas --json", file=sys.stderr)
            return 1
        return 0
    if args.json:
        print(emit_manifest_json())
        return 0
    for sid, path in list_schemas():
        print(f"{sid}\t{path}")
    return 0


def version_command(args: argparse.Namespace) -> int:
    from orbit_pilot import __version__

    print(__version__)
    return 0


def check_run_command(args: argparse.Namespace) -> int:
    from orbit_pilot.check_run import check_run

    run_dir = Path(args.run)
    result = check_run(run_dir)
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        if result.get("manifest"):
            m = result["manifest"]
            print(f"Run: {run_dir}")
            mv = m.get("orbit_manifest_version", "?")
            pv = m.get("orbit_pilot_version", "?")
            print(f"  manifest v{mv}  orbit-pilot {pv}")
        for w in result.get("warnings") or []:
            print(f"warning: {w}", file=sys.stderr)
        for e in result.get("errors") or []:
            print(f"error: {e}", file=sys.stderr)
    return 0 if result.get("ok") else 1


def registry_lint_command(args: argparse.Namespace) -> int:
    from orbit_pilot.registry_lint import lint_platform_registry

    result = lint_platform_registry(args.platforms)
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"registry-lint: {args.platforms} ({result.get('platform_count', 0)} platforms)")
        for w in result.get("warnings") or []:
            print(f"warning: {w}", file=sys.stderr)
        for e in result.get("errors") or []:
            print(f"error: {e}", file=sys.stderr)
    return 0 if result.get("ok") else 1


def validate_json_command(args: argparse.Namespace) -> int:
    from orbit_pilot.schemas_cmd import read_schema, resolve_schema_id, validate_instance

    sid = resolve_schema_id(args.schema)
    try:
        read_schema(sid)
    except FileNotFoundError:
        err = {"valid": False, "errors": [f"unknown schema: {args.schema} (resolved: {sid})"]}
        if args.json:
            print(json.dumps(err))
        else:
            print(err["errors"][0], file=sys.stderr)
        return 2
    raw = Path(args.file).read_text(encoding="utf-8") if args.file else sys.stdin.read()
    try:
        instance = json.loads(raw)
    except json.JSONDecodeError as exc:
        err = {"valid": False, "errors": [f"invalid JSON: {exc}"]}
        if args.json:
            print(json.dumps(err))
        else:
            print(err["errors"][0], file=sys.stderr)
        return 1
    errors = validate_instance(sid, instance)
    if errors:
        if args.json:
            print(json.dumps({"valid": False, "schema": sid, "errors": errors}))
        else:
            for line in errors:
                print(line, file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps({"valid": True, "schema": sid}))
    return 0


def tui_command(args: argparse.Namespace) -> int:
    from orbit_pilot.tui_app import run_tui, tui_available

    run_dir = Path(args.run)
    if not require_run_dir(run_dir, json_mode=False):
        return 1
    if not tui_available():
        print(
            "Textual is not installed. Run: pip install 'orbit-pilot[tui]'",
            file=sys.stderr,
        )
        return 1
    run_tui(run_dir)
    return 0


def serve_main() -> None:
    import os

    import uvicorn

    from orbit_pilot.webhook import app

    host = os.environ.get("ORBIT_BIND_HOST", "127.0.0.1")
    port = int(os.environ.get("ORBIT_BIND_PORT", "8765"))
    uvicorn.run(app, host=host, port=port)


def serve_command(args: argparse.Namespace) -> int:
    serve_main()
    return 0


def schedule_add_command(args: argparse.Namespace) -> int:
    from orbit_pilot.schedule_timezone import due_to_utc_iso
    from orbit_pilot.scheduler import append_job, default_schedule_path

    argv = [x for x in args.command if x]
    if not argv:
        emit({"error": "schedule-add requires a command after --"}, args.json)
        return 1
    if args.file:
        os.environ["ORBIT_SCHEDULE_PATH"] = str(Path(args.file).resolve())
    try:
        due_utc = due_to_utc_iso(args.due, args.timezone)
        entry = append_job(
            due_utc,
            args.cwd,
            argv,
            recurrence=args.recurrence,
            timezone_label=args.timezone,
        )
    except ValueError as exc:
        emit({"error": str(exc)}, args.json)
        return 1
    if args.json:
        emit({"scheduled": entry.to_dict(), "file": str(default_schedule_path())}, True)
    else:
        print(f"Scheduled {entry.id} due {entry.due_at}")
        print(f"  file: {default_schedule_path()}")
        print(f"  argv: {' '.join(argv)}")
        if args.recurrence != "none":
            print(f"  recurrence: {args.recurrence}")
    return 0


def schedule_list_command(args: argparse.Namespace) -> int:
    from orbit_pilot.scheduler import default_schedule_path, list_pending

    if args.file:
        os.environ["ORBIT_SCHEDULE_PATH"] = str(Path(args.file).resolve())
    pending = list_pending()
    if args.json:
        emit({"pending": pending, "file": str(default_schedule_path())}, True)
    else:
        print(f"Pending ({len(pending)}) — {default_schedule_path()}")
        for row in pending:
            print(f"  {row.get('id')} @ {row.get('due_at')}  {' '.join(row.get('argv') or [])}")
    return 0


def schedule_run_command(args: argparse.Namespace) -> int:
    import time

    from orbit_pilot.scheduler import run_due_jobs

    if args.file:
        os.environ["ORBIT_SCHEDULE_PATH"] = str(Path(args.file).resolve())
    poll = int(os.environ.get("ORBIT_SCHEDULE_POLL_SECONDS", "60"))

    def once() -> list:
        return run_due_jobs()

    if args.loop:
        while True:
            outcomes = once()
            if args.json and outcomes:
                print(json.dumps({"ran": outcomes}, indent=2))
            elif outcomes and not args.json:
                for o in outcomes:
                    print(f"ran {o['id']} exit={o['exit_code']}")
            time.sleep(max(5, poll))
    outcomes = once()
    if args.json:
        print(json.dumps({"ran": outcomes}, indent=2))
    else:
        for o in outcomes:
            print(f"ran {o['id']} exit={o['exit_code']}")
    return 0


def schedule_cancel_command(args: argparse.Namespace) -> int:
    from orbit_pilot.scheduler import cancel_job, default_schedule_path

    if args.file:
        os.environ["ORBIT_SCHEDULE_PATH"] = str(Path(args.file).resolve())
    out = cancel_job(args.job_id)
    if args.json:
        emit({**out, "file": str(default_schedule_path())}, True)
    else:
        if out.get("ok"):
            print(f"Cancelled {out['id']}")
        else:
            print(f"schedule-cancel: {out.get('error')} ({out.get('id')})", file=sys.stderr)
    return 0 if out.get("ok") else 1


def init_command(args: argparse.Namespace) -> int:
    dest = Path(args.dir).resolve()
    dest.mkdir(parents=True, exist_ok=True)
    bundled = resources.files("orbit_pilot.bundled")
    launch_src = _INIT_LAUNCH_BY_PRESET.get(args.preset, "launch.sample.yaml")
    launch_target = dest / "launch.yaml"
    if launch_target.exists():
        print(f"Skip existing {launch_target}")
    else:
        launch_target.write_text(bundled.joinpath(launch_src).read_text(encoding="utf-8"), encoding="utf-8")
        print(f"Wrote {launch_target} (preset={args.preset})")
    for src_name, dest_name in _INIT_BUNDLED_FILES:
        target = dest / dest_name
        text = bundled.joinpath(src_name).read_text(encoding="utf-8")
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


_COMMAND_HANDLERS: dict[str, Callable[[argparse.Namespace], int]] = {
    "init": init_command,
    "serve": serve_command,
    "plan": plan_command,
    "doctor": doctor_command,
    "pipeline": pipeline_command,
    "generate": generate_command,
    "regenerate": regenerate_command,
    "publish": publish_command,
    "mark-done": mark_done_command,
    "next": next_command,
    "work": work_command,
    "guide": guide_command,
    "campaigns": campaigns_command,
    "latest": latest_command,
    "report": report_command,
    "export": export_command,
    "audit": audit_command,
    "tui": tui_command,
    "schemas": schemas_command,
    "validate-json": validate_json_command,
    "version": version_command,
    "check-run": check_run_command,
    "registry-lint": registry_lint_command,
    "schedule-add": schedule_add_command,
    "schedule-list": schedule_list_command,
    "schedule-run": schedule_run_command,
    "schedule-cancel": schedule_cancel_command,
}


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    handler = _COMMAND_HANDLERS.get(args.command)
    if handler is None:
        parser.error(f"unknown command: {args.command}")
    return handler(args)
