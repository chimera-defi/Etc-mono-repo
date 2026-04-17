#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    import sys

    sys.path.insert(0, str(Path(__file__).resolve().parent))

from eval_adapter import evaluate_candidate


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Meta-Harness-style outer loop for bench tool-calling experiments."
    )
    parser.add_argument(
        "--pending-eval",
        type=Path,
        required=True,
        help="Path to pending_eval.json candidate file.",
    )
    parser.add_argument(
        "--logs-dir",
        type=Path,
        required=True,
        help="Directory for loop logs/artifacts.",
    )
    parser.add_argument(
        "--max-candidates",
        type=int,
        default=0,
        help="Optional cap on number of candidates to evaluate (0 = all).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate input and print candidate plan without executing evaluations.",
    )
    return parser.parse_args()


def _require(cond: bool, msg: str) -> None:
    if not cond:
        raise ValueError(msg)


def validate_pending(payload: dict[str, Any]) -> None:
    _require(isinstance(payload, dict), "pending_eval must be a JSON object")
    _require(isinstance(payload.get("iteration"), int), "missing integer: iteration")
    candidates = payload.get("candidates")
    _require(isinstance(candidates, list), "missing array: candidates")
    _require(len(candidates) > 0, "candidates must not be empty")

    for idx, c in enumerate(candidates):
        _require(isinstance(c, dict), f"candidate[{idx}] must be object")
        _require(bool(c.get("name")), f"candidate[{idx}] missing name")
        target = c.get("target")
        _require(isinstance(target, dict), f"candidate[{idx}] missing target")
        for key in ("model", "phase", "variant"):
            _require(bool(target.get(key)), f"candidate[{idx}] target missing {key}")
        _require(target["phase"] in ("atomic", "extended"), "phase must be atomic|extended")
        _require(bool(c.get("hypothesis")), f"candidate[{idx}] missing hypothesis")
        patch = c.get("patch")
        if patch is not None:
            _require(isinstance(patch, dict), f"candidate[{idx}] patch must be object")


def _target_key(result: dict[str, Any]) -> str:
    target = result["target"]
    return f"{target['model']}|{target['phase']}|{target['variant']}"


def load_frontier(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"_best": None, "by_target": {}}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"_best": None, "by_target": {}}
    if not isinstance(data, dict):
        return {"_best": None, "by_target": {}}
    data.setdefault("_best", None)
    data.setdefault("by_target", {})
    return data


def better_than(a: dict[str, Any], b: dict[str, Any] | None) -> bool:
    if b is None:
        return True
    a_acc = float(a.get("summary", {}).get("accuracy", 0.0) or 0.0)
    b_acc = float(b.get("summary", {}).get("accuracy", 0.0) or 0.0)
    if a_acc != b_acc:
        return a_acc > b_acc

    a_rest = a.get("summary", {}).get("restraint_score")
    b_rest = b.get("summary", {}).get("restraint_score")
    if a_rest is None and b_rest is None:
        return False
    if a_rest is None:
        return False
    if b_rest is None:
        return True
    return float(a_rest) > float(b_rest)


def update_frontier(frontier: dict[str, Any], results: list[dict[str, Any]]) -> dict[str, Any]:
    by_target = frontier.setdefault("by_target", {})
    best = frontier.get("_best")

    for r in results:
        key = _target_key(r)
        current = by_target.get(key)
        if better_than(r, current):
            by_target[key] = r
        if better_than(r, best):
            best = r

    frontier["_best"] = best
    return frontier


def append_evolution_summary(path: Path, iteration: int, results: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        for r in results:
            row = {
                "ts": time.time(),
                "iteration": iteration,
                "candidate": r["candidate"],
                "target": r["target"],
                "accuracy": r["summary"]["accuracy"],
                "passed": r["summary"]["passed"],
                "total": r["summary"]["total"],
                "restraint_score": r["summary"]["restraint_score"],
                "rc": r["rc"],
                "elapsed_s": r["elapsed_s"],
                "hypothesis": r.get("hypothesis", ""),
                "changes": r.get("changes", ""),
                "expected_delta": r.get("expected_delta", ""),
            }
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def main() -> int:
    args = parse_args()

    payload = json.loads(args.pending_eval.read_text(encoding="utf-8"))
    validate_pending(payload)

    candidates = payload["candidates"]
    if args.max_candidates > 0:
        candidates = candidates[: args.max_candidates]

    iteration = int(payload["iteration"])
    logs_dir = args.logs_dir
    logs_dir.mkdir(parents=True, exist_ok=True)

    print(f"[meta-harness] iteration={iteration} candidates={len(candidates)}")
    for c in candidates:
        target = c["target"]
        print(
            f"[meta-harness] plan {c['name']} -> {target['model']} {target['phase']} {target['variant']}"
        )

    if args.dry_run:
        print("[meta-harness] dry-run complete")
        return 0

    results: list[dict[str, Any]] = []
    for idx, candidate in enumerate(candidates, start=1):
        print(f"[meta-harness] evaluating {idx}/{len(candidates)}: {candidate['name']}")
        result = evaluate_candidate(candidate, logs_dir)
        results.append(result)
        summary = result["summary"]
        print(
            f"[meta-harness] result {candidate['name']} rc={result['rc']} "
            f"acc={summary['accuracy']:.3f} ({summary['passed']}/{summary['total']})"
        )

    frontier_path = logs_dir / "frontier_val.json"
    frontier = load_frontier(frontier_path)
    frontier = update_frontier(frontier, results)
    frontier_path.write_text(json.dumps(frontier, indent=2), encoding="utf-8")

    append_evolution_summary(logs_dir / "evolution_summary.jsonl", iteration, results)
    (logs_dir / f"iteration_{iteration}.json").write_text(
        json.dumps({"iteration": iteration, "results": results}, indent=2),
        encoding="utf-8",
    )

    best = frontier.get("_best")
    if best:
        s = best["summary"]
        print(
            f"[meta-harness] frontier={best['candidate']} "
            f"acc={s['accuracy']:.3f} ({s['passed']}/{s['total']})"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
