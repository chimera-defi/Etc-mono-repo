#!/usr/bin/env python3
"""Comprehensive benchmark analysis for all 19 models.

Reads results.jsonl from a run folder and generates:
- CSV: 19 models × 11 prompts = 209 rows (or partial)
- JSON: per-model summary with metrics
- Markdown: ranked table (best→worst)

Usage:
    python3 analyze_comprehensive.py <run_folder>
"""

from __future__ import annotations

import csv
import json
import math
import os
import statistics
import sys
from collections import defaultdict
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class PromptResult:
    model: str
    prompt_id: str
    prompt_name: str
    e2e_ms: int
    success: bool
    objective_pass: bool
    failure_type: Optional[str]
    output_length: int
    raw_output: str


@dataclass
class ModelMetrics:
    model: str
    total_tests: int
    success_count: int
    success_rate: float
    objective_pass_count: int
    objective_pass_rate: float
    latency_mean: float
    latency_p50: float
    latency_p95: float
    latency_p99: float
    error_taxonomy: Dict[str, int]
    avg_output_length: float
    latency_values: List[int]


def percentile(xs: List[float], p: float) -> Optional[float]:
    """Compute percentile of a list."""
    xs = sorted([float(x) for x in xs if x is not None])
    if not xs:
        return None
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


def load_results(results_jsonl_path: str) -> List[PromptResult]:
    """Load results from results.jsonl."""
    results = []
    with open(results_jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            if obj.get("record_type") != "result":
                continue
            
            raw_output = obj.get("raw_output", "")
            output_length = len(raw_output) if raw_output else 0
            
            result = PromptResult(
                model=obj.get("model", ""),
                prompt_id=obj.get("prompt_id", ""),
                prompt_name=obj.get("prompt_name", ""),
                e2e_ms=obj.get("e2e_ms", 0),
                success=obj.get("success", False),
                objective_pass=obj.get("objective_pass", False),
                failure_type=obj.get("failure_type"),
                output_length=output_length,
                raw_output=raw_output,
            )
            results.append(result)
    
    return results


def compute_per_model_metrics(results: List[PromptResult]) -> Dict[str, ModelMetrics]:
    """Compute aggregated metrics per model."""
    by_model = defaultdict(list)
    for r in results:
        by_model[r.model].append(r)
    
    metrics = {}
    for model, test_results in by_model.items():
        total = len(test_results)
        success_count = sum(1 for r in test_results if r.success)
        objective_pass_count = sum(1 for r in test_results if r.objective_pass)
        
        latencies = [r.e2e_ms for r in test_results]
        latency_mean = statistics.mean(latencies) if latencies else 0
        latency_p50 = percentile(latencies, 50) or 0
        latency_p95 = percentile(latencies, 95) or 0
        latency_p99 = percentile(latencies, 99) or 0
        
        # Error taxonomy
        error_taxonomy = defaultdict(int)
        for r in test_results:
            if not r.success and r.failure_type:
                error_taxonomy[r.failure_type] += 1
        
        output_lengths = [r.output_length for r in test_results]
        avg_output_length = statistics.mean(output_lengths) if output_lengths else 0
        
        metrics[model] = ModelMetrics(
            model=model,
            total_tests=total,
            success_count=success_count,
            success_rate=100.0 * success_count / total if total > 0 else 0,
            objective_pass_count=objective_pass_count,
            objective_pass_rate=100.0 * objective_pass_count / total if total > 0 else 0,
            latency_mean=latency_mean,
            latency_p50=latency_p50,
            latency_p95=latency_p95,
            latency_p99=latency_p99,
            error_taxonomy=dict(error_taxonomy),
            avg_output_length=avg_output_length,
            latency_values=latencies,
        )
    
    return metrics


def write_csv(output_path: str, results: List[PromptResult]) -> None:
    """Write results to CSV."""
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "model",
                "prompt_id",
                "prompt_name",
                "e2e_ms",
                "success",
                "objective_pass",
                "failure_type",
                "output_length",
            ],
        )
        writer.writeheader()
        for r in results:
            writer.writerow({
                "model": r.model,
                "prompt_id": r.prompt_id,
                "prompt_name": r.prompt_name,
                "e2e_ms": r.e2e_ms,
                "success": r.success,
                "objective_pass": r.objective_pass,
                "failure_type": r.failure_type or "",
                "output_length": r.output_length,
            })


def write_json_summary(output_path: str, metrics: Dict[str, ModelMetrics]) -> None:
    """Write per-model metrics to JSON."""
    summary = {}
    for model, m in metrics.items():
        summary[model] = {
            "total_tests": m.total_tests,
            "success_count": m.success_count,
            "success_rate_percent": round(m.success_rate, 2),
            "objective_pass_count": m.objective_pass_count,
            "objective_pass_rate_percent": round(m.objective_pass_rate, 2),
            "latency": {
                "mean_ms": round(m.latency_mean, 1),
                "p50_ms": round(m.latency_p50, 1),
                "p95_ms": round(m.latency_p95, 1),
                "p99_ms": round(m.latency_p99, 1),
            },
            "avg_output_length": round(m.avg_output_length, 1),
            "error_taxonomy": m.error_taxonomy,
        }
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, sort_keys=True)
        f.write("\n")


def write_markdown_table(output_path: str, metrics: Dict[str, ModelMetrics]) -> None:
    """Write ranked markdown table."""
    # Sort by success_rate descending
    sorted_models = sorted(metrics.values(), key=lambda m: m.success_rate, reverse=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("# Comprehensive Benchmark Results (All 19 Models)\n\n")
        f.write("Ranked by success rate (% of all 11 prompts passed)\n\n")
        
        # Rankings table
        f.write("| Rank | Model | Success% | Obj Pass% | Tests | Latency p50 | Latency p95 | Latency p99 | Mean Latency | Avg Output Len | Errors |\n")
        f.write("|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---|\n")
        
        for rank, m in enumerate(sorted_models, 1):
            errors_str = ", ".join(f"{k}:{v}" for k, v in sorted(m.error_taxonomy.items())) or "none"
            f.write(f"| {rank} | {m.model} | {m.success_rate:.1f}% | {m.objective_pass_rate:.1f}% | {m.total_tests} | {m.latency_p50:.0f} | {m.latency_p95:.0f} | {m.latency_p99:.0f} | {m.latency_mean:.0f} | {m.avg_output_length:.0f} | {errors_str} |\n")
        
        f.write("\n## Hidden Gems\n\n")
        f.write("Models with good latency despite lower success rates:\n\n")
        
        # Find hidden gems: high latency efficiency + moderate success
        gems = []
        for m in sorted_models:
            if m.success_rate >= 50:  # At least 50% success
                efficiency = m.latency_mean / (m.success_rate / 100)
                gems.append((efficiency, m))
        
        gems.sort()
        for efficiency, m in gems[:5]:
            f.write(f"- **{m.model}**: {m.success_rate:.1f}% success, {m.latency_mean:.0f}ms avg latency, efficiency={efficiency:.0f}\n")
        
        f.write("\n## Model Categories\n\n")
        
        # Categorize
        high_success = [m for m in sorted_models if m.success_rate >= 80]
        medium_success = [m for m in sorted_models if 50 <= m.success_rate < 80]
        low_success = [m for m in sorted_models if m.success_rate < 50]
        
        f.write(f"### High Success (≥80%): {len(high_success)} models\n")
        for m in high_success:
            f.write(f"- {m.model}: {m.success_rate:.1f}%\n")
        
        f.write(f"\n### Medium Success (50-80%): {len(medium_success)} models\n")
        for m in medium_success:
            f.write(f"- {m.model}: {m.success_rate:.1f}%\n")
        
        f.write(f"\n### Low Success (<50%): {len(low_success)} models\n")
        for m in low_success:
            f.write(f"- {m.model}: {m.success_rate:.1f}%\n")


def main() -> int:
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <run_folder>", file=sys.stderr)
        return 1
    
    run_folder = sys.argv[1]
    results_jsonl = os.path.join(run_folder, "results.jsonl")
    
    if not os.path.exists(results_jsonl):
        print(f"Error: {results_jsonl} not found", file=sys.stderr)
        return 1
    
    # Load results
    results = load_results(results_jsonl)
    print(f"Loaded {len(results)} test results", file=sys.stderr)
    
    # Compute metrics
    metrics = compute_per_model_metrics(results)
    print(f"Computed metrics for {len(metrics)} models", file=sys.stderr)
    
    # Write outputs
    csv_path = os.path.join(run_folder, "results_comprehensive.csv")
    json_path = os.path.join(run_folder, "metrics_comprehensive.json")
    md_path = os.path.join(run_folder, "COMPREHENSIVE_RESULTS.md")
    
    write_csv(csv_path, results)
    print(f"Wrote CSV: {csv_path}")
    
    write_json_summary(json_path, metrics)
    print(f"Wrote JSON: {json_path}")
    
    write_markdown_table(md_path, metrics)
    print(f"Wrote Markdown: {md_path}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
