#!/usr/bin/env python3
"""Draft release notes from git history for the monorepo."""

from __future__ import annotations

import argparse
import collections
import dataclasses
import datetime as dt
import re
import subprocess
import sys
from typing import Dict, Iterable, List, Sequence, Set, Tuple


COMMIT_TYPES = ["feat", "fix", "docs", "refactor", "perf", "test", "ci", "build", "chore", "other"]
CONVENTIONAL_SUBJECT_RE = re.compile(
    r"^(?P<type>feat|fix|docs|chore|refactor|perf|test|ci|build)(\([^)]+\))?(?P<breaking>!)?:\s*(?P<desc>.+)$",
    re.IGNORECASE,
)
BREAKING_BODY_RE = re.compile(r"BREAKING[\s-]CHANGE", re.IGNORECASE)


@dataclasses.dataclass(frozen=True)
class Commit:
    sha: str
    short_sha: str
    subject: str
    body: str
    author: str
    date: str
    files: Tuple[str, ...]
    commit_type: str
    description: str
    is_breaking: bool
    areas: Tuple[str, ...]


def run_git(args: Sequence[str]) -> str:
    proc = subprocess.run(
        ["git", *args],
        text=True,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {proc.stderr.strip()}")
    return proc.stdout


def resolve_default_from_ref(to_ref: str) -> str | None:
    try:
        tag = run_git(["describe", "--tags", "--abbrev=0", to_ref]).strip()
    except RuntimeError:
        return None
    return tag or None


def parse_conventional_subject(subject: str) -> Tuple[str, str, bool]:
    match = CONVENTIONAL_SUBJECT_RE.match(subject.strip())
    if not match:
        return "other", subject.strip(), False
    commit_type = match.group("type").lower()
    description = match.group("desc").strip()
    is_breaking = bool(match.group("breaking"))
    return commit_type, description, is_breaking


def detect_breaking_change(subject: str, body: str, conventional_breaking: bool) -> bool:
    if conventional_breaking:
        return True
    content = f"{subject}\n{body}"
    return bool(BREAKING_BODY_RE.search(content))


def extract_areas_from_files(files: Iterable[str]) -> Tuple[str, ...]:
    areas: Set[str] = set()
    for path in files:
        clean = path.strip()
        if not clean:
            continue
        if "/" in clean:
            area = clean.split("/", 1)[0]
        else:
            area = "root"
        areas.add(area)
    if not areas:
        return ("unknown",)
    return tuple(sorted(areas))


def commit_range(from_ref: str | None, to_ref: str) -> Tuple[str, str]:
    if from_ref:
        return f"{from_ref}..{to_ref}", from_ref
    inferred = resolve_default_from_ref(to_ref)
    if inferred:
        return f"{inferred}..{to_ref}", inferred
    return to_ref, "repository-start"


def load_commits(range_arg: str) -> List[Commit]:
    commits: List[Commit] = []

    shas = [line.strip() for line in run_git(["rev-list", "--reverse", range_arg]).splitlines() if line.strip()]
    for sha in shas:
        meta_line = run_git(
            ["show", "-s", "--date=short", "--format=%H%x1f%s%x1f%B%x1f%an%x1f%ad", sha]
        ).strip()
        meta = meta_line.split("\x1f")
        if len(meta) != 5:
            raise RuntimeError(f"Unexpected git show metadata format for commit {sha}")
        full_sha, subject, body, author, date = meta
        files = tuple(
            line.strip()
            for line in run_git(["diff-tree", "--no-commit-id", "--name-only", "-r", full_sha]).splitlines()
            if line.strip()
        )
        commit_type, description, conventional_breaking = parse_conventional_subject(subject)
        is_breaking = detect_breaking_change(subject, body, conventional_breaking)
        areas = extract_areas_from_files(files)
        commits.append(
            Commit(
                sha=full_sha,
                short_sha=full_sha[:8],
                subject=subject.strip(),
                body=body.strip(),
                author=author.strip(),
                date=date.strip(),
                files=files,
                commit_type=commit_type,
                description=description,
                is_breaking=is_breaking,
                areas=areas,
            )
        )

    return commits


def filter_by_areas(commits: Sequence[Commit], allowed_areas: Set[str] | None) -> List[Commit]:
    if not allowed_areas:
        return list(commits)
    normalized = {area.strip() for area in allowed_areas if area.strip()}
    if not normalized:
        return list(commits)
    return [commit for commit in commits if normalized.intersection(commit.areas)]


def group_commits(
    commits: Sequence[Commit], allowed_areas: Set[str] | None = None
) -> Dict[str, Dict[str, List[Commit]]]:
    grouped: Dict[str, Dict[str, List[Commit]]] = {
        commit_type: collections.defaultdict(list) for commit_type in COMMIT_TYPES
    }
    normalized_areas = {area.strip() for area in (allowed_areas or set()) if area.strip()}
    for commit in commits:
        target_type = commit.commit_type if commit.commit_type in grouped else "other"
        for area in commit.areas:
            if normalized_areas and area not in normalized_areas:
                continue
            grouped[target_type][area].append(commit)
    return grouped


def build_markdown(
    commits: Sequence[Commit],
    grouped: Dict[str, Dict[str, List[Commit]]],
    from_ref_label: str,
    to_ref: str,
    areas_filter: Set[str] | None,
) -> str:
    date_str = dt.datetime.now(dt.UTC).strftime("%Y-%m-%d")
    lines: List[str] = []
    lines.append("# Release Notes Draft")
    lines.append("")
    lines.append(f"- Generated: {date_str} (UTC)")
    lines.append(f"- Range: `{from_ref_label}` -> `{to_ref}`")
    if areas_filter:
        lines.append(f"- Area filter: `{', '.join(sorted(areas_filter))}`")
    lines.append("")
    lines.append("## Highlights")

    highlight_types = {"feat", "fix", "perf"}
    highlights = [c for c in commits if c.commit_type in highlight_types]
    if not highlights:
        lines.append("- _No feature/fix/perf highlights detected in this range._")
    else:
        for commit in highlights[:10]:
            lines.append(f"- {commit.description} ({commit.short_sha})")
    lines.append("")

    lines.append("## Breaking Changes")
    breaking = [c for c in commits if c.is_breaking]
    if not breaking:
        lines.append("- None detected by heuristic. Review manually before publishing.")
    else:
        for commit in breaking:
            lines.append(f"- {commit.subject} ({commit.short_sha})")
    lines.append("")

    lines.append("## Full Changes")
    for commit_type in COMMIT_TYPES:
        by_area = grouped.get(commit_type, {})
        if not by_area:
            continue
        lines.append("")
        lines.append(f"### {commit_type}")
        for area in sorted(by_area.keys()):
            lines.append(f"- **{area}**")
            for commit in by_area[area]:
                lines.append(f"  - {commit.description} ({commit.short_sha}, {commit.author})")

    lines.append("")
    lines.append("## Maintainer Checklist")
    lines.append("- [ ] Edit highlights to be user-facing")
    lines.append("- [ ] Confirm breaking changes and migration notes")
    lines.append("- [ ] Remove noisy internal-only commits as needed")
    lines.append("- [ ] Add links to PRs/issues if desired")
    lines.append("")
    return "\n".join(lines)


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from", dest="from_ref", default=None, help="Start ref/tag (exclusive).")
    parser.add_argument("--to", dest="to_ref", default="HEAD", help="End ref/tag (inclusive, default HEAD).")
    parser.add_argument(
        "--area",
        action="append",
        default=[],
        help="Restrict output to top-level paths (repeat or comma-separated).",
    )
    parser.add_argument("--output", default="-", help="Output file path (default stdout).")
    return parser.parse_args(argv)


def normalize_area_args(raw_areas: Sequence[str]) -> Set[str]:
    areas: Set[str] = set()
    for value in raw_areas:
        for part in value.split(","):
            cleaned = part.strip()
            if cleaned:
                areas.add(cleaned)
    return areas


def main(argv: Sequence[str]) -> int:
    args = parse_args(argv)
    areas_filter = normalize_area_args(args.area)
    range_arg, from_label = commit_range(args.from_ref, args.to_ref)
    commits = load_commits(range_arg)
    filtered = filter_by_areas(commits, areas_filter if areas_filter else None)
    grouped = group_commits(filtered, areas_filter if areas_filter else None)
    markdown = build_markdown(
        commits=filtered,
        grouped=grouped,
        from_ref_label=from_label,
        to_ref=args.to_ref,
        areas_filter=areas_filter if areas_filter else None,
    )

    if args.output == "-":
        sys.stdout.write(markdown)
    else:
        with open(args.output, "w", encoding="utf-8") as handle:
            handle.write(markdown)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
