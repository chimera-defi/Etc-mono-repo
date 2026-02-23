#!/usr/bin/env python3
"""Self-optimizing harness policy engine.

Evaluates candidate run history against a baseline and returns one of:
- promote: candidate is stable and better/equal to baseline
- hold: insufficient evidence or too unstable (collect more runs)
- reject: regresses quality/safety gates

Input JSON schema (minimum):
{
  "baseline": {"median_accuracy": 0.74},
  "candidate_runs": [
    {"accuracy": 0.75, "restraint_score": 0.92},
    {"accuracy": 0.78, "restraint_score": 0.90},
    {"accuracy": 0.76, "restraint_score": 0.91}
  ]
}
"""

from __future__ import annotations

import argparse
import json
import statistics
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any


@dataclass
class PolicyConfig:
    min_runs: int = 3
    restraint_floor: float = 0.80
    max_accuracy_variance: float = 0.0025
    extended_phase_min_accuracy: float = 0.30  # Safety gate for extended phase
    max_regression_pct: float = 0.10  # Max allowed regression (10%)


@dataclass
class GateResult:
    name: str
    passed: bool
    observed: float | int | None
    threshold: float | int | None
    operator: str
    message: str


@dataclass
class PolicyDecision:
    decision: str
    rationale: str
    summary: dict[str, Any]
    gates: list[GateResult]
    reason_codes: list[str]

    def to_json(self) -> dict[str, Any]:
        out = asdict(self)
        out["gates"] = [asdict(g) for g in self.gates]
        return out


def _require_number(value: Any, label: str) -> float:
    if not isinstance(value, (int, float)):
        raise ValueError(f"{label} must be a number, got {type(value).__name__}")
    return float(value)


def evaluate_policy(payload: dict[str, Any], config: PolicyConfig, phase: str = None) -> PolicyDecision:
    baseline = payload.get("baseline", {})
    baseline_median_accuracy = _require_number(
        baseline.get("median_accuracy"), "baseline.median_accuracy"
    )

    raw_runs = payload.get("candidate_runs", [])
    if not isinstance(raw_runs, list):
        raise ValueError("candidate_runs must be a list")

    runs: list[dict[str, float]] = []
    for i, run in enumerate(raw_runs):
        if not isinstance(run, dict):
            raise ValueError(f"candidate_runs[{i}] must be an object")
        acc = _require_number(run.get("accuracy"), f"candidate_runs[{i}].accuracy")
        rst = _require_number(
            run.get("restraint_score"), f"candidate_runs[{i}].restraint_score"
        )
        runs.append({"accuracy": acc, "restraint_score": rst})

    accuracies = [r["accuracy"] for r in runs]
    restraints = [r["restraint_score"] for r in runs]
    n = len(runs)

    cand_median_acc = statistics.median(accuracies) if accuracies else None
    cand_median_restraint = statistics.median(restraints) if restraints else None
    acc_variance = statistics.pvariance(accuracies) if len(accuracies) > 1 else 0.0

    gates: list[GateResult] = []
    reason_codes: list[str] = []

    min_runs_pass = n >= config.min_runs
    gates.append(
        GateResult(
            name="min_runs",
            passed=min_runs_pass,
            observed=n,
            threshold=config.min_runs,
            operator=">=",
            message=f"Need at least {config.min_runs} candidate runs",
        )
    )
    if not min_runs_pass:
        reason_codes.append("INSUFFICIENT_RUNS")

    no_regression_pass = (
        cand_median_acc is not None and cand_median_acc >= baseline_median_accuracy
    )
    gates.append(
        GateResult(
            name="no_regression_vs_baseline_median_accuracy",
            passed=no_regression_pass,
            observed=cand_median_acc,
            threshold=baseline_median_accuracy,
            operator=">=",
            message="Candidate median accuracy must not be below baseline median accuracy",
        )
    )
    if not no_regression_pass:
        reason_codes.append("ACCURACY_REGRESSION")

    # NEW: Regression threshold gate (fail if accuracy drops > max_regression_pct)
    regression_gate_pass = True
    if cand_median_acc is not None and baseline_median_accuracy > 0:
        accuracy_drop = baseline_median_accuracy - cand_median_acc
        regression_pct = accuracy_drop / baseline_median_accuracy
        regression_gate_pass = regression_pct <= config.max_regression_pct
        gates.append(
            GateResult(
                name="max_regression_threshold",
                passed=regression_gate_pass,
                observed=regression_pct,
                threshold=config.max_regression_pct,
                operator="<=",
                message=f"Accuracy drop must not exceed {config.max_regression_pct:.0%} vs baseline",
            )
        )
        if not regression_gate_pass:
            reason_codes.append("REGRESSION_EXCEEDS_THRESHOLD")

    restraint_pass = (
        cand_median_restraint is not None
        and cand_median_restraint >= config.restraint_floor
    )
    gates.append(
        GateResult(
            name="restraint_floor",
            passed=restraint_pass,
            observed=cand_median_restraint,
            threshold=config.restraint_floor,
            operator=">=",
            message="Candidate median restraint must meet minimum floor",
        )
    )
    if not restraint_pass:
        reason_codes.append("RESTRAINT_BELOW_FLOOR")

    variance_pass = acc_variance <= config.max_accuracy_variance
    gates.append(
        GateResult(
            name="max_accuracy_variance",
            passed=variance_pass,
            observed=acc_variance,
            threshold=config.max_accuracy_variance,
            operator="<=",
            message="Candidate accuracy variance must stay below stability threshold",
        )
    )
    if not variance_pass:
        reason_codes.append("VARIANCE_TOO_HIGH")

    # NEW: Extended phase safety gate
    extended_phase_pass = True
    if phase == 'extended' and cand_median_acc is not None:
        extended_phase_pass = cand_median_acc >= config.extended_phase_min_accuracy
        gates.append(
            GateResult(
                name="extended_phase_min_accuracy",
                passed=extended_phase_pass,
                observed=cand_median_acc,
                threshold=config.extended_phase_min_accuracy,
                operator=">=",
                message=f"Extended phase minimum accuracy threshold ({config.extended_phase_min_accuracy:.1%})",
            )
        )
        if not extended_phase_pass:
            reason_codes.append("EXTENDED_PHASE_ACCURACY_TOO_LOW")

    # Decision policy:
    # - HOLD for insufficient evidence or instability
    # - REJECT for regression/safety floor failures
    # - PROMOTE only when all gates pass
    if not min_runs_pass:
        decision = "hold"
        rationale = "Insufficient run count; collect more evidence before promoting."
    elif not no_regression_pass or not regression_gate_pass or not restraint_pass or not extended_phase_pass:
        decision = "reject"
        if not extended_phase_pass:
            rationale = f"Extended phase minimum accuracy not met ({cand_median_acc:.1%} < {config.extended_phase_min_accuracy:.1%})"
        elif not regression_gate_pass:
            rationale = f"Regression exceeds threshold ({regression_pct:.1%} > {config.max_regression_pct:.0%})"
        else:
            rationale = "Candidate fails quality/safety hard gates."
    elif not variance_pass:
        decision = "hold"
        rationale = "Candidate is promising but unstable; gather more runs."
    else:
        decision = "promote"
        rationale = "All policy gates passed."

    summary = {
        "n_runs": n,
        "baseline_median_accuracy": baseline_median_accuracy,
        "candidate_median_accuracy": cand_median_acc,
        "candidate_median_restraint": cand_median_restraint,
        "candidate_accuracy_variance": acc_variance,
        "config": asdict(config),
    }

    return PolicyDecision(
        decision=decision,
        rationale=rationale,
        summary=summary,
        gates=gates,
        reason_codes=reason_codes,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate self-optimizing harness policy")
    parser.add_argument("--history", required=True, help="Path to policy input JSON")
    parser.add_argument("--min-runs", type=int, default=3)
    parser.add_argument("--restraint-floor", type=float, default=0.80)
    parser.add_argument("--max-accuracy-variance", type=float, default=0.0025)
    parser.add_argument("--extended-phase-min-accuracy", type=float, default=0.30)
    parser.add_argument(
        "--phase", type=str, default=None, help="Phase: atomic|extended (enables phase-specific gates)"
    )
    parser.add_argument(
        "--max-regression-pct", type=float, default=0.10,
        help="Max allowed regression percentage (default: 0.10 = 10%%)"
    )
    parser.add_argument(
        "--output", help="Optional path to write policy decision JSON (prints to stdout regardless)"
    )
    args = parser.parse_args()

    payload = json.loads(Path(args.history).read_text())
    config = PolicyConfig(
        min_runs=args.min_runs,
        restraint_floor=args.restraint_floor,
        max_accuracy_variance=args.max_accuracy_variance,
        extended_phase_min_accuracy=args.extended_phase_min_accuracy,
        max_regression_pct=args.max_regression_pct,
    )

    decision = evaluate_policy(payload, config, phase=args.phase)
    serialized = decision.to_json()
    text = json.dumps(serialized, indent=2)
    print(text)

    if args.output:
        Path(args.output).write_text(text + "\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
