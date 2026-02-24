#!/usr/bin/env python3
"""Baseline tracker for regression detection.

Saves baseline results after each run, compares new results vs baseline,
calculates accuracy change and regression %, and alerts if regression > 10%.

Usage:
    from bench.baseline_tracker import BaselineTracker
    
    tracker = BaselineTracker()
    
    # After a run completes:
    results = {"accuracy": 0.85, "model": "lfm2.5-thinking:1.2b", "phase": "atomic"}
    tracker.update_baseline(results)
    
    # Check for regression:
    check_result = tracker.check_regression(results)
    if check_result["regressed"]:
        print(f"ALERT: {check_result['regression_pct']:.1f}% regression detected!")
"""

from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any


ROOT = Path('/root/.openclaw/workspace/bench')
BASELINE_PATH = ROOT / 'baseline.json'
HISTORY_PATH = ROOT / 'baseline_history.json'
REGRESSION_ALERT_THRESHOLD = 0.10  # 10%


@dataclass
class BaselineEntry:
    model: str
    phase: str
    variant: str
    accuracy: float
    passed: int
    total: int
    timestamp: float
    run_id: str | None = None


@dataclass
class RegressionCheck:
    regressed: bool
    regression_pct: float | None
    accuracy_change: float | None
    baseline_accuracy: float | None
    current_accuracy: float | None
    message: str


class BaselineTracker:
    def __init__(self, baseline_path: Path | None = None, history_path: Path | None = None):
        self.baseline_path = baseline_path or BASELINE_PATH
        self.history_path = history_path or HISTORY_PATH
    
    def _load_baseline(self) -> dict[str, Any]:
        """Load current baseline data."""
        if not self.baseline_path.exists():
            return {}
        try:
            return json.loads(self.baseline_path.read_text())
        except (json.JSONDecodeError, IOError):
            return {}
    
    def _load_history(self) -> list[dict[str, Any]]:
        """Load baseline history."""
        if not self.history_path.exists():
            return []
        try:
            return json.loads(self.history_path.read_text())
        except (json.JSONDecodeError, IOError):
            return []
    
    def _save_baseline(self, data: dict[str, Any]) -> None:
        """Save baseline data."""
        self.baseline_path.write_text(json.dumps(data, indent=2))
    
    def _save_history(self, data: list[dict[str, Any]]) -> None:
        """Save baseline history."""
        self.history_path.write_text(json.dumps(data, indent=2))
    
    def _make_key(self, model: str, phase: str, variant: str = "") -> str:
        """Create a unique key for a model/phase/variant combination."""
        return f"{model}:{phase}:{variant or 'default'}"
    
    def get_baseline(self, model: str, phase: str, variant: str = "") -> BaselineEntry | None:
        """Get baseline entry for a model/phase/variant."""
        baseline = self._load_baseline()
        key = self._make_key(model, phase, variant)
        entry = baseline.get(key)
        if entry:
            return BaselineEntry(**entry)
        return None
    
    def update_baseline(self, results: dict[str, Any]) -> BaselineEntry:
        """Update baseline with new results.
        
        Args:
            results: Dict with keys: model, phase, variant (optional), accuracy,
                    passed, total, run_id (optional)
        
        Returns:
            The new BaselineEntry
        """
        model = results.get('model', '')
        phase = results.get('phase', 'atomic')
        variant = results.get('variant', 'default')
        accuracy = float(results.get('accuracy', 0))
        passed = int(results.get('passed', 0))
        total = int(results.get('total', 0))
        run_id = results.get('run_id')
        
        entry = BaselineEntry(
            model=model,
            phase=phase,
            variant=variant,
            accuracy=accuracy,
            passed=passed,
            total=total,
            timestamp=time.time(),
            run_id=run_id,
        )
        
        # Update baseline
        baseline = self._load_baseline()
        key = self._make_key(model, phase, variant)
        baseline[key] = asdict(entry)
        self._save_baseline(baseline)
        
        # Add to history
        history = self._load_history()
        history.append({
            'key': key,
            **asdict(entry),
        })
        # Keep last 100 entries
        if len(history) > 100:
            history = history[-100:]
        self._save_history(history)
        
        return entry
    
    def check_regression(self, results: dict[str, Any]) -> RegressionCheck:
        """Check if new results represent a regression vs baseline.
        
        Args:
            results: Dict with keys: model, phase, variant (optional), accuracy
        
        Returns:
            RegressionCheck with regressed flag, percentages, and message
        """
        model = results.get('model', '')
        phase = results.get('phase', 'atomic')
        variant = results.get('variant', 'default')
        current_accuracy = float(results.get('accuracy', 0))
        
        baseline_entry = self.get_baseline(model, phase, variant)
        
        if baseline_entry is None:
            return RegressionCheck(
                regressed=False,
                regression_pct=None,
                accuracy_change=None,
                baseline_accuracy=None,
                current_accuracy=current_accuracy,
                message="No baseline exists yet; initializing baseline with current results",
            )
        
        baseline_accuracy = baseline_entry.accuracy
        accuracy_change = current_accuracy - baseline_accuracy
        
        # Calculate regression percentage (negative change = regression)
        if baseline_accuracy > 0:
            regression_pct = -accuracy_change / baseline_accuracy
        else:
            regression_pct = 0.0
        
        regressed = regression_pct >= REGRESSION_ALERT_THRESHOLD
        
        if regressed:
            message = (
                f"REGRESSION ALERT: {model}/{phase}/{variant} "
                f"dropped {abs(accuracy_change):.2%} "
                f"({baseline_accuracy:.2%} -> {current_accuracy:.2%})"
            )
        elif accuracy_change > 0:
            message = (
                f"IMPROVEMENT: {model}/{phase}/{variant} "
                f"improved {accuracy_change:+.2%} "
                f"({baseline_accuracy:.2%} -> {current_accuracy:.2%})"
            )
        else:
            message = (
                f"STABLE: {model}/{phase}/{variant} "
                f"change {accuracy_change:+.2%} "
                f"({baseline_accuracy:.2%} -> {current_accuracy:.2%})"
            )
        
        return RegressionCheck(
            regressed=regressed,
            regression_pct=regression_pct,
            accuracy_change=accuracy_change,
            baseline_accuracy=baseline_accuracy,
            current_accuracy=current_accuracy,
            message=message,
        )
    
    def get_all_baselines(self) -> dict[str, BaselineEntry]:
        """Get all current baselines."""
        baseline = self._load_baseline()
        result = {}
        for key, entry in baseline.items():
            result[key] = BaselineEntry(**entry)
        return result
    
    def clear_baseline(self, model: str | None = None, phase: str | None = None, variant: str | None = None) -> int:
        """Clear baseline(s). If all args are None, clears all baselines.
        
        Returns:
            Number of entries cleared
        """
        if model is None and phase is None and variant is None:
            # Clear all
            self._save_baseline({})
            return 1
        
        baseline = self._load_baseline()
        keys_to_remove = []
        for key in baseline:
            parts = key.split(':')
            if len(parts) >= 2:
                b_model, b_phase = parts[0], parts[1]
                b_variant = parts[2] if len(parts) > 2 else 'default'
                
                if (model is None or model == b_model) and \
                   (phase is None or phase == b_phase) and \
                   (variant is None or variant == b_variant):
                    keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del baseline[key]
        
        self._save_baseline(baseline)
        return len(keys_to_remove)


def main():
    """CLI for baseline tracker."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Baseline tracker for regression detection')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Check regression
    check_parser = subparsers.add_parser('check', help='Check for regression')
    check_parser.add_argument('--model', required=True)
    check_parser.add_argument('--phase', required=True)
    check_parser.add_argument('--variant', default='default')
    check_parser.add_argument('--accuracy', type=float, required=True)
    
    # Update baseline
    update_parser = subparsers.add_parser('update', help='Update baseline')
    update_parser.add_argument('--model', required=True)
    update_parser.add_argument('--phase', required=True)
    update_parser.add_argument('--variant', default='default')
    update_parser.add_argument('--accuracy', type=float, required=True)
    update_parser.add_argument('--passed', type=int, default=0)
    update_parser.add_argument('--total', type=int, default=0)
    update_parser.add_argument('--run-id', default=None)
    
    # Show baselines
    subparsers.add_parser('list', help='List all baselines')
    
    # Clear baseline
    clear_parser = subparsers.add_parser('clear', help='Clear baseline(s)')
    clear_parser.add_argument('--model', default=None)
    clear_parser.add_argument('--phase', default=None)
    clear_parser.add_argument('--variant', default=None)
    
    args = parser.parse_args()
    tracker = BaselineTracker()
    
    if args.command == 'check':
        result = tracker.check_regression({
            'model': args.model,
            'phase': args.phase,
            'variant': args.variant,
            'accuracy': args.accuracy,
        })
        print(json.dumps(asdict(result), indent=2))
    
    elif args.command == 'update':
        entry = tracker.update_baseline({
            'model': args.model,
            'phase': args.phase,
            'variant': args.variant,
            'accuracy': args.accuracy,
            'passed': args.passed,
            'total': args.total,
            'run_id': args.run_id,
        })
        print(f"Updated baseline: {entry.model}/{entry.phase}/{entry.variant} = {entry.accuracy:.2%}")
    
    elif args.command == 'list':
        baselines = tracker.get_all_baselines()
        for key, entry in baselines.items():
            print(f"{key}: {entry.accuracy:.2%} (updated {time.ctime(entry.timestamp)})")
    
    elif args.command == 'clear':
        count = tracker.clear_baseline(args.model, args.phase, args.variant)
        print(f"Cleared {count} baseline(s)")
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
