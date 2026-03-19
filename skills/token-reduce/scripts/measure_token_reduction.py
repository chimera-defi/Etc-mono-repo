#!/usr/bin/env python3
"""Measure token-reduction adoption from Claude and Codex session logs."""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


QMD_RE = re.compile(r"\bqmd\s+search\b")
TOKEN_REDUCE_SEARCH_RE = re.compile(
    r"(?:^|/)(?:\.claude/)?token-reduce-(?:search|paths|snippet)\.sh\b|\btoken-reduce-(?:search|paths|snippet)\.sh\b"
)
SCOPED_RG_RE = re.compile(r"\brg\b(?=.*(?:\s-g\s|\s--glob\s))(?!.*\s--files\b)")
RG_FILES_BROAD_RE = re.compile(r"\brg\b.*\s--files(?:\s+\.|\s*$)")
TARGETED_BASH_RE = re.compile(r"\b(head|tail)\b|\bsed\s+-n\b|\bqmd\s+get\b")
BROAD_SCAN_RE = re.compile(r"\bfind\s+(\.|/)|\bls\s+-R\b|\bgrep\s+-R\b|\bgrep\s+--recursive\b")
TOKEN_REDUCE_RE = re.compile(r"token-reduce|/token-reduce", re.IGNORECASE)


def repo_session_roots(scope: str) -> list[Path]:
    base = Path.home() / ".claude" / "projects"
    if scope == "global":
        return [base]
    patterns = [
        "-root--openclaw-workspace-dev-Etc-mono-repo",
        "-root--openclaw-workspace-dev-Etc-mono-repo--worktrees-main",
    ]
    return [base / p for p in patterns if (base / p).exists()]


def top_level_session_files(root: Path) -> list[Path]:
    return sorted(
        p
        for p in root.glob("*.jsonl")
        if p.is_file()
    )


def session_related_files(session_file: Path) -> list[Path]:
    files = [session_file]
    subagent_dir = session_file.with_suffix("") / "subagents"
    if subagent_dir.exists():
        files.extend(sorted(subagent_dir.glob("*.jsonl")))
    return files


def codex_session_roots() -> list[Path]:
    root = Path.home() / ".codex" / "sessions"
    return [root] if root.exists() else []


def codex_session_files(scope: str, repo_root: str) -> list[Path]:
    roots = codex_session_roots()
    if not roots:
        return []

    repo_prefix = Path(repo_root).resolve().as_posix()
    matches: list[Path] = []
    for root in roots:
        for session_file in root.rglob("*.jsonl"):
            try:
                if codex_session_matches_repo(session_file, scope, repo_prefix):
                    matches.append(session_file)
            except OSError:
                continue
    return sorted(matches)


def codex_session_matches_repo(session_file: Path, scope: str, repo_prefix: str) -> bool:
    if scope == "global":
        return True

    try:
        lines = session_file.read_text(errors="ignore").splitlines()
    except OSError:
        return False

    for line in lines[:40]:
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        payload = event.get("payload", {})
        cwd = payload.get("cwd")
        if isinstance(cwd, str) and cwd.startswith(repo_prefix):
            return True
    return False


def fresh_metrics(source: str) -> dict:
    return {
        "source": source,
        "qmd_search": False,
        "token_reduce_search": False,
        "scoped_rg": False,
        "targeted_reads": False,
        "subagents": False,
        "token_reduce_mention": False,
        "broad_scan_violation": False,
        "first_discovery_compliant": False,
        "first_discovery_seen": False,
    }


def note_first_discovery(metrics: dict, compliant: bool) -> None:
    if not metrics["first_discovery_seen"]:
        metrics["first_discovery_seen"] = True
        metrics["first_discovery_compliant"] = compliant


def apply_command_metrics(metrics: dict, command: str) -> None:
    if QMD_RE.search(command):
        metrics["qmd_search"] = True
        note_first_discovery(metrics, True)
    if TOKEN_REDUCE_SEARCH_RE.search(command):
        metrics["token_reduce_search"] = True
        note_first_discovery(metrics, True)
    if SCOPED_RG_RE.search(command):
        metrics["scoped_rg"] = True
        note_first_discovery(metrics, True)
    if TARGETED_BASH_RE.search(command):
        metrics["targeted_reads"] = True
    if BROAD_SCAN_RE.search(command) or RG_FILES_BROAD_RE.search(command):
        metrics["broad_scan_violation"] = True
        note_first_discovery(metrics, False)


def parse_claude_session(session_file: Path) -> dict:
    metrics = fresh_metrics("claude")

    for path in session_related_files(session_file):
        if path != session_file:
            metrics["subagents"] = True
        try:
            lines = path.read_text(errors="ignore").splitlines()
        except OSError:
            continue
        for line in lines:
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue

            message = event.get("message", {})
            content = message.get("content")
            if isinstance(content, str) and TOKEN_REDUCE_RE.search(content):
                metrics["token_reduce_mention"] = True

            if isinstance(content, list):
                for item in content:
                    if item.get("type") == "text" and TOKEN_REDUCE_RE.search(item.get("text", "")):
                        metrics["token_reduce_mention"] = True
                    if item.get("type") != "tool_use":
                        continue

                    name = item.get("name")
                    tool_input = item.get("input", {})

                    if name == "Read":
                        if tool_input.get("limit") is not None or tool_input.get("offset") is not None:
                            metrics["targeted_reads"] = True
                        note_first_discovery(metrics, True)

                    if name == "Bash":
                        command = tool_input.get("command", "")
                        apply_command_metrics(metrics, command)

                    if name == "Glob":
                        pattern = tool_input.get("pattern", "")
                        if "**/*" in pattern or pattern.startswith("**/"):
                            note_first_discovery(metrics, False)
                            metrics["broad_scan_violation"] = True

    return metrics


def parse_codex_session(session_file: Path) -> dict:
    metrics = fresh_metrics("codex")
    try:
        lines = session_file.read_text(errors="ignore").splitlines()
    except OSError:
        return metrics

    for line in lines:
        if TOKEN_REDUCE_RE.search(line):
            metrics["token_reduce_mention"] = True
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue

        payload = event.get("payload", {})
        event_type = payload.get("type")

        if event_type == "function_call" and payload.get("name") == "exec_command":
            arguments_raw = payload.get("arguments", "{}")
            try:
                arguments = json.loads(arguments_raw)
            except json.JSONDecodeError:
                arguments = {}
            command = arguments.get("cmd", "")
            apply_command_metrics(metrics, command)

    return metrics


def measure(scope: str, repo_root: str) -> dict:
    claude_session_files: list[Path] = []
    for root in repo_session_roots(scope):
        claude_session_files.extend(top_level_session_files(root))
    codex_files = codex_session_files(scope, repo_root)

    parsed = [parse_claude_session(p) for p in claude_session_files]
    parsed.extend(parse_codex_session(p) for p in codex_files)
    session_count = len(parsed)

    adoption = defaultdict(int)
    compliant_sessions = 0
    broad_violation_sessions = 0
    broad_violation_count = 0
    for item in parsed:
        adoption["qmd_search_sessions"] += int(item["qmd_search"])
        adoption["token_reduce_search_sessions"] += int(item["token_reduce_search"])
        adoption["scoped_rg_sessions"] += int(item["scoped_rg"])
        adoption["targeted_read_sessions"] += int(item["targeted_reads"])
        adoption["subagent_sessions"] += int(item["subagents"])
        adoption["token_reduce_mentions"] += int(item["token_reduce_mention"])
        compliant_sessions += int(item["first_discovery_compliant"])
        broad_violation_sessions += int(item["broad_scan_violation"])
        broad_violation_count += int(item["broad_scan_violation"])

    pct = lambda n: round((n * 100.0 / session_count), 1) if session_count else 0.0

    return {
        "measured_at": datetime.now(timezone.utc).isoformat(),
        "scope": scope,
        "repo_root": repo_root,
        "session_count": session_count,
        "sources": {
            "claude_sessions": len(claude_session_files),
            "codex_sessions": len(codex_files),
        },
        "adoption": {
            **adoption,
            "qmd_search_pct": pct(adoption["qmd_search_sessions"]),
            "token_reduce_search_pct": pct(adoption["token_reduce_search_sessions"]),
            "scoped_rg_pct": pct(adoption["scoped_rg_sessions"]),
            "targeted_read_pct": pct(adoption["targeted_read_sessions"]),
            "subagent_pct": pct(adoption["subagent_sessions"]),
            "token_reduce_mention_pct": pct(adoption["token_reduce_mentions"]),
        },
        "compliance": {
            "sessions_with_compliant_first_discovery": compliant_sessions,
            "sessions_with_broad_scan_violation": broad_violation_sessions,
            "broad_scan_violations": broad_violation_count,
            "discovery_compliance_pct": pct(compliant_sessions),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", choices=["repo", "global"], default="repo")
    parser.add_argument("--repo-root", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    result = measure(args.scope, args.repo_root)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
