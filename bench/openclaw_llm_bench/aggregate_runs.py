#!/usr/bin/env python3
"""Aggregate multiple run folders into one markdown progress report.

Reads runs/*/summary.json when present; otherwise falls back to results.jsonl.
Outputs:
- runs/AGGREGATE_SUMMARY.md

Stdlib only.
"""

from __future__ import annotations

import json
import os
import math
import statistics
from typing import Any, Dict, List, Optional, Tuple

HERE = os.path.dirname(os.path.abspath(__file__))
RUNS_DIR = os.path.join(HERE, "runs")
OUT_MD = os.path.join(RUNS_DIR, "AGGREGATE_SUMMARY.md")
DOCS_PROGRESS_MD = os.path.abspath(os.path.join(HERE, "..", "..", "docs", "OPENCLAW_LLM_BENCHMARK_PROGRESS.md"))
AUTO_BEGIN = "<!-- BEGIN AUTO: aggregate_runs.py -->"
AUTO_END = "<!-- END AUTO: aggregate_runs.py -->"


def read_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def percentile(xs: List[float], p: float) -> Optional[float]:
    xs = [float(x) for x in xs if x is not None]
    if not xs:
        return None
    xs = sorted(xs)
    if len(xs) == 1:
        return xs[0]
    k = (len(xs) - 1) * (p / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return xs[int(k)]
    d0 = xs[f] * (c - k)
    d1 = xs[c] * (k - f)
    return d0 + d1


def load_results(run_dir: str) -> List[Dict[str, Any]]:
    p = os.path.join(run_dir, "results.jsonl")
    if not os.path.exists(p):
        return []
    rows = []
    with open(p, "r", encoding="utf-8") as f:
        for ln in f:
            ln = ln.strip()
            if not ln:
                continue
            obj = json.loads(ln)
            if obj.get("record_type") == "result":
                rows.append(obj)
    return rows


def fmt(x: Any) -> str:
    if x is None:
        return ""
    if isinstance(x, float):
        return f"{x:.0f}"
    return str(x)


def pct(x: Any) -> str:
    if x is None:
        return ""
    try:
        return f"{100.0*float(x):.1f}%"
    except Exception:
        return ""


def sync_progress_doc(markdown_block: str) -> None:
    """Replace the AUTO block in docs/OPENCLAW_LLM_BENCHMARK_PROGRESS.md."""
    if not os.path.exists(DOCS_PROGRESS_MD):
        return
    doc = open(DOCS_PROGRESS_MD, "r", encoding="utf-8").read()
    if AUTO_BEGIN not in doc or AUTO_END not in doc:
        return
    pre, rest = doc.split(AUTO_BEGIN, 1)
    _, post = rest.split(AUTO_END, 1)
    new_doc = pre + AUTO_BEGIN + "\n" + markdown_block.strip() + "\n" + AUTO_END + post
    with open(DOCS_PROGRESS_MD, "w", encoding="utf-8") as f:
        f.write(new_doc)


def main() -> int:
    if not os.path.isdir(RUNS_DIR):
        raise SystemExit(f"missing runs dir: {RUNS_DIR}")

    run_ids = sorted([d for d in os.listdir(RUNS_DIR) if os.path.isdir(os.path.join(RUNS_DIR, d)) and not d.startswith(".")])

    # Aggregate per (provider, model, thinking)
    agg: Dict[Tuple[str, str, Optional[str]], Dict[str, Any]] = {}

    for rid in run_ids:
        rdir = os.path.join(RUNS_DIR, rid)
        rows = load_results(rdir)
        if not rows:
            continue

        # group per model
        groups: Dict[Tuple[str, str, Optional[str]], List[Dict[str, Any]]] = {}
        for r in rows:
            k = (r.get("provider"), r.get("model"), r.get("thinking_level"))
            groups.setdefault(k, []).append(r)

        for k, rs in groups.items():
            prov, model, thinking = k
            a = agg.setdefault(
                k,
                {
                    "provider": prov,
                    "model": model,
                    "thinking": thinking,
                    "runs": [],
                    "n_total": 0,
                    "n_ok": 0,
                    "n_success": 0,
                    "n_error": 0,
                    "n_rate_limited": 0,
                    "n_skipped": 0,
                    "e2e_success": [],
                    "wall_ms_spans": [],
                },
            )
            a["runs"].append(rid)
            a["n_total"] += len(rs)
            a["n_ok"] += sum(1 for r in rs if r.get("availability_status") == "ok")
            a["n_success"] += sum(1 for r in rs if r.get("availability_status") == "ok" and r.get("success"))
            a["n_error"] += sum(1 for r in rs if r.get("availability_status") == "error")
            a["n_rate_limited"] += sum(1 for r in rs if r.get("availability_status") == "rate_limited")
            a["n_skipped"] += sum(1 for r in rs if r.get("availability_status") == "skipped_unavailable")

            for r in rs:
                if r.get("availability_status") == "ok" and r.get("success") and r.get("e2e_ms") is not None:
                    a["e2e_success"].append(float(r["e2e_ms"]))

            starts = [r.get("started_at_ms") for r in rs if r.get("started_at_ms") is not None]
            ends = [r.get("ended_at_ms") for r in rs if r.get("ended_at_ms") is not None]
            if starts and ends:
                a["wall_ms_spans"].append(max(ends) - min(starts))

    lines: List[str] = []
    lines.append("# Aggregate Benchmark Progress\n")
    lines.append("This file is auto-generated from `runs/*/results.jsonl`.\n")
    lines.append(
        "| Provider | Model | Thinking | Runs | n(total) | n(ok) | ok% (total) | n(success) | succ% (ok) | succ% (total) | n(error) | n(rate) | n(skipped) | e2e p50 | e2e p95 | suite wall p50 |"
    )
    # 16 columns
    lines.append("|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|")

    for k, a in sorted(agg.items(), key=lambda kv: (kv[0][0] or "", kv[0][1] or "", str(kv[0][2] or ""))):
        nt = a["n_total"]
        ok = a["n_ok"]
        succ = a["n_success"]
        ok_rate_total = (ok / nt) if nt else None
        succ_rate_ok = (succ / ok) if ok else None
        succ_rate_total = (succ / nt) if nt else None
        e2e = a["e2e_success"]
        wall = a["wall_ms_spans"]
        lines.append(
            "| {prov} | {model} | {think} | {runs} | {nt} | {nok} | {okr} | {ns} | {srok} | {srt} | {ne} | {nr} | {nsk} | {p50} | {p95} | {w50} |".format(
                prov=a["provider"],
                model=a["model"],
                think=a["thinking"] or "",
                runs=str(len(set(a["runs"]))),
                nt=nt,
                nok=ok,
                okr=pct(ok_rate_total),
                ns=succ,
                srok=pct(succ_rate_ok),
                srt=pct(succ_rate_total),
                ne=a["n_error"],
                nr=a["n_rate_limited"],
                nsk=a["n_skipped"],
                p50=fmt(percentile(e2e, 50)),
                p95=fmt(percentile(e2e, 95)),
                w50=fmt(percentile([float(x) for x in wall], 50) if wall else None),
            )
        )

    os.makedirs(RUNS_DIR, exist_ok=True)
    md = "\n".join(lines).rstrip() + "\n"
    with open(OUT_MD, "w", encoding="utf-8") as f:
        f.write(md)

    # Also sync into docs progress file (keeps PR table unbroken).
    sync_progress_doc(md)

    print(OUT_MD)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
