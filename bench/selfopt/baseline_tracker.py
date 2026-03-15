from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class RegressionCheck:
    regressed: bool
    regression_pct: float
    accuracy_change: float
    baseline_accuracy: float | None
    message: str


class BaselineTracker:
    """In-memory baseline tracker for benchmark supervisor regression alerts.

    Keys by (model, phase, variant). Keeps last-known accuracy and flags
    regressions when the new score drops by >= threshold.
    """

    def __init__(self, threshold_pct: float = 5.0) -> None:
        self.threshold_pct = float(threshold_pct)
        self._baseline: dict[tuple[str, str, str], float] = {}

    @staticmethod
    def _key(job: dict[str, Any]) -> tuple[str, str, str]:
        return (
            str(job.get("model", "")),
            str(job.get("phase", "")),
            str(job.get("variant", "")),
        )

    def check_regression(self, job: dict[str, Any]) -> RegressionCheck:
        key = self._key(job)
        new_acc = float(job.get("accuracy", 0.0) or 0.0)
        baseline = self._baseline.get(key)

        if baseline is None:
            return RegressionCheck(
                regressed=False,
                regression_pct=0.0,
                accuracy_change=0.0,
                baseline_accuracy=None,
                message="No baseline yet",
            )

        accuracy_change = new_acc - baseline
        regression_pct = ((baseline - new_acc) / baseline * 100.0) if baseline > 0 else 0.0
        regressed = regression_pct >= self.threshold_pct

        if regressed:
            msg = (
                f"Regression detected: {regression_pct:.2f}% drop "
                f"({baseline:.4f} -> {new_acc:.4f})"
            )
        else:
            msg = "No regression"

        return RegressionCheck(
            regressed=regressed,
            regression_pct=round(regression_pct, 4),
            accuracy_change=round(accuracy_change, 4),
            baseline_accuracy=round(baseline, 4),
            message=msg,
        )

    def update_baseline(self, job: dict[str, Any]) -> None:
        key = self._key(job)
        self._baseline[key] = float(job.get("accuracy", 0.0) or 0.0)
