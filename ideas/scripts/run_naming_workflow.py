#!/usr/bin/env python3
"""
Strict naming workflow for idea-pack naming validation.

Default target is the collab markdown spec studio naming folder.
"""

from __future__ import annotations

import argparse
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_BASE = REPO_ROOT / "ideas" / "collab-markdown-spec-studio" / "branding"
DEFAULT_CANDIDATES = DEFAULT_BASE / "CANDIDATES.txt"
DEFAULT_MARKDOWN = DEFAULT_BASE / "NAMING_VALIDATION.md"
DEFAULT_JSON = DEFAULT_BASE / "naming-workflow-output.json"

TLD_SUFFIXES = (".com", ".org", ".net", ".xyz", ".finance")

CATEGORY_TOKENS = {
    "spec",
    "plan",
    "brief",
    "task",
    "scope",
    "design",
    "workflow",
    "ship",
    "build",
    "launch",
    "draft",
    "repo",
}

INTENT_TOKENS = {
    "pilot",
    "frame",
    "flow",
    "grid",
    "bridge",
    "engine",
    "studio",
    "kernel",
    "track",
    "weave",
    "sprint",
}

GENERIC_TOKENS = {"app", "tool", "data", "lab", "labs", "platform", "system"}
BLOCKLIST_TOKENS = {"crypto", "blockchain", "wallet", "defi"}
KNOWN_COLLISIONS = {"specforge"}


@dataclass
class DomainCheck:
    tld: str
    domain: str
    status: str
    detail: str


@dataclass
class CandidateResult:
    name: str
    tokens: list[str]
    hard_fail_reasons: list[str]
    domain_checks: list[DomainCheck]
    component_scores: dict[str, int]
    total_score: int
    decision: str
    rank: int = 0


def parse_candidates(path: Path) -> list[str]:
    names: list[str] = []
    seen: set[str] = set()
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        key = line.lower()
        if key in seen:
            continue
        seen.add(key)
        names.append(line)
    return names


def tokenize_name(name: str) -> list[str]:
    cleaned = re.sub(r"[^A-Za-z0-9]+", " ", name).strip()
    if not cleaned:
        return []
    if " " in cleaned:
        pieces = [part for part in cleaned.split() if part]
    else:
        pieces = re.findall(r"[A-Z]+(?=[A-Z][a-z]|\d|$)|[A-Z]?[a-z]+|\d+", cleaned)
        if not pieces:
            pieces = [cleaned]
    return [piece.lower() for piece in pieces]


def looks_pronounceable(tokens: list[str]) -> bool:
    compact = "".join(tokens)
    if not compact:
        return False
    if not re.search(r"[aeiouy]", compact):
        return False
    if re.search(r"[^aeiouy]{5,}", compact):
        return False
    return True


def hard_filter(name: str, tokens: list[str], max_words: int) -> list[str]:
    reasons: list[str] = []
    normalized = name.lower()
    compact = "".join(tokens)

    if not tokens:
        reasons.append("unparseable_name")
    if len(tokens) > max_words:
        reasons.append(f"word_count_gt_{max_words}")
    if len(compact) < 6:
        reasons.append("too_short")
    if len(compact) > 24:
        reasons.append("too_long")
    for token in tokens:
        if token in BLOCKLIST_TOKENS:
            reasons.append(f"blocked_token:{token}")
    if normalized in KNOWN_COLLISIONS:
        reasons.append("known_market_collision")
    if not looks_pronounceable(tokens):
        reasons.append("low_pronounceability")

    return sorted(set(reasons))


def check_domain(domain: str, timeout: int, retries: int) -> tuple[str, str]:
    url = f"https://rdap.org/domain/{domain}"
    headers = {"User-Agent": "ideas-naming-workflow/1.0"}

    for attempt in range(retries + 1):
        try:
            req = Request(url, headers=headers)
            with urlopen(req, timeout=timeout) as response:
                code = response.getcode()
            if code == 200:
                return "registered", "rdap_200"
            return "unknown", f"http_{code}"
        except HTTPError as exc:
            if exc.code == 404:
                return "available", "rdap_404"
            if exc.code in (429, 500, 502, 503, 504) and attempt < retries:
                time.sleep(1.2 * (attempt + 1))
                continue
            return "unknown", f"http_{exc.code}"
        except (URLError, TimeoutError, OSError) as exc:
            if attempt < retries:
                time.sleep(0.8 * (attempt + 1))
                continue
            return "unknown", f"error:{type(exc).__name__}"
    return "unknown", "retry_exhausted"


def run_domain_checks(
    domains: list[str],
    timeout: int,
    retries: int,
    workers: int,
) -> dict[str, tuple[str, str]]:
    statuses: dict[str, tuple[str, str]] = {}
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(check_domain, domain, timeout, retries): domain
            for domain in domains
        }
        for future in as_completed(futures):
            domain = futures[future]
            try:
                statuses[domain] = future.result()
            except Exception as exc:
                statuses[domain] = ("unknown", f"error:{type(exc).__name__}")
    return statuses


def clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def compute_scores(
    name: str,
    tokens: list[str],
    hard_fail_reasons: list[str],
    domain_checks: list[DomainCheck],
) -> tuple[dict[str, int], int, str]:
    if hard_fail_reasons:
        return (
            {
                "category_clarity": 0,
                "distinctiveness": 0,
                "memorability": 0,
                "brevity_readability": 0,
                "seo_intent_fit": 0,
                "domain_headroom": 0,
            },
            0,
            "reject",
        )

    category_hits = sum(1 for token in tokens if token in CATEGORY_TOKENS)
    intent_hits = sum(1 for token in tokens if token in INTENT_TOKENS)
    generic_hits = sum(1 for token in tokens if token in GENERIC_TOKENS)

    category_clarity = clamp((category_hits * 13) + (intent_hits * 4), 0, 25)

    distinctiveness = 20 - (generic_hits * 6)
    if name.lower() in KNOWN_COLLISIONS:
        distinctiveness -= 20
    distinctiveness = clamp(distinctiveness, 0, 20)

    compact_len = len("".join(tokens))
    memorability = clamp(15 - int(abs(compact_len - 10) * 1.5), 0, 15)
    if len(tokens) == 2 and all(len(token) >= 4 for token in tokens):
        memorability = clamp(memorability + 2, 0, 15)

    if 8 <= compact_len <= 14:
        brevity_readability = 10
    elif 6 <= compact_len <= 16:
        brevity_readability = 7
    else:
        brevity_readability = 4
    if not looks_pronounceable(tokens):
        brevity_readability = clamp(brevity_readability - 4, 0, 10)

    seo_intent_fit = 0
    if "spec" in tokens:
        seo_intent_fit += 8
    if category_hits > 0:
        seo_intent_fit += 5
    if intent_hits > 0:
        seo_intent_fit += 2
    seo_intent_fit = clamp(seo_intent_fit, 0, 15)

    available = sum(1 for check in domain_checks if check.status == "available")
    unknown = sum(1 for check in domain_checks if check.status == "unknown")
    domain_headroom = clamp((available * 3) - unknown, 0, 15)

    scores = {
        "category_clarity": category_clarity,
        "distinctiveness": distinctiveness,
        "memorability": memorability,
        "brevity_readability": brevity_readability,
        "seo_intent_fit": seo_intent_fit,
        "domain_headroom": domain_headroom,
    }
    total = sum(scores.values())

    registered = sum(1 for check in domain_checks if check.status == "registered")
    if total >= 75 and available >= 2 and unknown <= 2:
        decision = "clear"
    elif total >= 60 and (available >= 1 or unknown >= 1):
        decision = "watch"
    elif total >= 60 and available == 0 and unknown == 0 and registered > 0:
        decision = "watch"
    else:
        decision = "reject"

    return scores, total, decision


def render_markdown(
    generated_utc: str,
    methodology_version: str,
    max_words: int,
    results: list[CandidateResult],
) -> str:
    clear_count = sum(1 for result in results if result.decision == "clear")
    watch_count = sum(1 for result in results if result.decision == "watch")
    reject_count = sum(1 for result in results if result.decision == "reject")

    lines: list[str] = []
    lines.append("# Naming Validation Report")
    lines.append("")
    lines.append(f"- Generated (UTC): {generated_utc}")
    lines.append(f"- Methodology: `{methodology_version}`")
    lines.append(
        f"- Hard constraint: `<= {max_words}` semantic words (including fused compounds)"
    )
    lines.append("- Domain checks: `.com`, `.org`, `.net`, `.xyz`, `.finance` via RDAP")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Clear: **{clear_count}**")
    lines.append(f"- Watch: **{watch_count}**")
    lines.append(f"- Reject: **{reject_count}**")
    lines.append("")
    lines.append("## Ranked Candidates")
    lines.append("")
    lines.append("| Rank | Name | Score | Decision | Avail | Taken | Unknown | Notes |")
    lines.append("|------|------|-------|----------|-------|-------|---------|-------|")

    for result in results:
        available = sum(1 for check in result.domain_checks if check.status == "available")
        registered = sum(
            1 for check in result.domain_checks if check.status == "registered"
        )
        unknown = sum(1 for check in result.domain_checks if check.status == "unknown")
        notes = ", ".join(result.hard_fail_reasons) if result.hard_fail_reasons else "-"
        lines.append(
            f"| {result.rank} | `{result.name}` | {result.total_score} | "
            f"{result.decision} | {available} | {registered} | {unknown} | {notes} |"
        )

    lines.append("")
    lines.append("## Domain Matrix (Top 20)")
    lines.append("")
    for result in results[:20]:
        fragments = [f"{check.tld}={check.status}" for check in result.domain_checks]
        lines.append(f"- **{result.name}**: " + ", ".join(fragments))

    lines.append("")
    lines.append("## Notes")
    lines.append("")
    lines.append("- `clear` means high score with enough domain headroom to proceed.")
    lines.append("- `watch` means viable but with ambiguity (domain/noise/fit).")
    lines.append("- `reject` means failed hard filters or weak composite score.")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run strict naming workflow checks for idea packs.")
    parser.add_argument(
        "--candidates",
        type=Path,
        default=DEFAULT_CANDIDATES,
        help="Path to candidate list.",
    )
    parser.add_argument(
        "--markdown-output",
        type=Path,
        default=DEFAULT_MARKDOWN,
        help="Path for markdown report output.",
    )
    parser.add_argument(
        "--json-output",
        type=Path,
        default=DEFAULT_JSON,
        help="Path for JSON report output.",
    )
    parser.add_argument("--max-words", type=int, default=2)
    parser.add_argument("--timeout", type=int, default=8)
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--workers", type=int, default=12)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    candidates_path = args.candidates.resolve()
    if not candidates_path.exists():
        raise FileNotFoundError(f"Candidate file not found: {candidates_path}")

    candidates = parse_candidates(candidates_path)
    if not candidates:
        raise ValueError("No candidates found after filtering blank/comment lines.")

    candidate_tokens = {name: tokenize_name(name) for name in candidates}
    all_domains: list[str] = []
    for name in candidates:
        compact = "".join(candidate_tokens[name]).lower()
        for tld in TLD_SUFFIXES:
            all_domains.append(f"{compact}{tld}")
    domain_status_map = run_domain_checks(
        domains=sorted(set(all_domains)),
        timeout=args.timeout,
        retries=args.retries,
        workers=max(1, args.workers),
    )

    results: list[CandidateResult] = []
    for name in candidates:
        tokens = candidate_tokens[name]
        hard_fail_reasons = hard_filter(name, tokens, args.max_words)
        compact = "".join(tokens).lower()

        domain_checks: list[DomainCheck] = []
        for tld in TLD_SUFFIXES:
            domain = f"{compact}{tld}"
            status, detail = domain_status_map.get(domain, ("unknown", "missing_result"))
            domain_checks.append(DomainCheck(tld=tld, domain=domain, status=status, detail=detail))

        component_scores, total_score, decision = compute_scores(
            name=name,
            tokens=tokens,
            hard_fail_reasons=hard_fail_reasons,
            domain_checks=domain_checks,
        )

        results.append(
            CandidateResult(
                name=name,
                tokens=tokens,
                hard_fail_reasons=hard_fail_reasons,
                domain_checks=domain_checks,
                component_scores=component_scores,
                total_score=total_score,
                decision=decision,
            )
        )

    decision_priority = {"clear": 0, "watch": 1, "reject": 2}
    results.sort(
        key=lambda item: (
            decision_priority[item.decision],
            -item.total_score,
            item.name.lower(),
        )
    )
    for idx, result in enumerate(results, start=1):
        result.rank = idx

    generated_utc = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    methodology_version = "2026-04-idea-strict-naming-v1"
    markdown = render_markdown(
        generated_utc=generated_utc,
        methodology_version=methodology_version,
        max_words=args.max_words,
        results=results,
    )

    payload = {
        "generated_utc": generated_utc,
        "methodology_version": methodology_version,
        "constraints": {"max_words": args.max_words, "tlds": list(TLD_SUFFIXES)},
        "source_candidates": str(candidates_path),
        "results": [
            {
                **asdict(result),
                "domain_checks": [asdict(check) for check in result.domain_checks],
            }
            for result in results
        ],
    }

    if args.write:
        args.markdown_output.parent.mkdir(parents=True, exist_ok=True)
        args.json_output.parent.mkdir(parents=True, exist_ok=True)
        args.markdown_output.write_text(markdown + "\n")
        args.json_output.write_text(json.dumps(payload, indent=2) + "\n")
        print(args.markdown_output)
        print(args.json_output)
        return 0

    print(markdown)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
