#!/usr/bin/env python3
"""Analyze benchmark results and generate aggregate report."""

import json
import os
import sys
import statistics
from collections import defaultdict
from typing import Any, Dict, List

def load_results(results_file: str) -> List[Dict[str, Any]]:
    """Load all result records from JSONL file."""
    results = []
    with open(results_file) as f:
        for line in f:
            if not line.strip():
                continue
            record = json.loads(line)
            if record.get("record_type") == "result":
                results.append(record)
    return results

def aggregate_by_model(results: List[Dict]) -> Dict[str, Dict]:
    """Aggregate results by model."""
    agg = {}
    
    for result in results:
        model = result.get("model")
        if not model:
            continue
        
        if model not in agg:
            agg[model] = {
                "calls": [],
                "success_count": 0,
                "pass_count": 0,
                "e2e_times": [],
                "failures": defaultdict(int),
            }
        
        agg[model]["calls"].append(result)
        agg[model]["e2e_times"].append(result.get("e2e_ms", 0))
        
        if result.get("success"):
            agg[model]["success_count"] += 1
        
        if result.get("objective_pass"):
            agg[model]["pass_count"] += 1
        else:
            violation = result.get("violation", "unknown")
            agg[model]["failures"][violation] += 1
    
    return agg

def compute_percentiles(times: List[int]) -> Dict[str, float]:
    """Compute p50, p95, p99 from latencies."""
    if not times:
        return {"p50": 0, "p95": 0, "p99": 0}
    
    sorted_times = sorted(times)
    return {
        "p50": sorted_times[int(len(sorted_times) * 0.50)],
        "p95": sorted_times[int(len(sorted_times) * 0.95)] if len(sorted_times) > 1 else sorted_times[0],
        "p99": sorted_times[int(len(sorted_times) * 0.99)] if len(sorted_times) > 1 else sorted_times[0],
    }

def generate_summary(agg: Dict[str, Dict]) -> Dict[str, Any]:
    """Generate summary statistics per model."""
    summary = {}
    
    for model, data in agg.items():
        times = data["e2e_times"]
        n = len(data["calls"])
        
        summary[model] = {
            "num_prompts": n,
            "success_count": data["success_count"],
            "success_rate_pct": 100.0 * data["success_count"] / n if n > 0 else 0,
            "objective_pass_count": data["pass_count"],
            "objective_pass_rate_pct": 100.0 * data["pass_count"] / n if n > 0 else 0,
            "mean_latency_ms": statistics.mean(times) if times else 0,
            "median_latency_ms": statistics.median(times) if times else 0,
            "min_latency_ms": min(times) if times else 0,
            "max_latency_ms": max(times) if times else 0,
            "percentiles_ms": compute_percentiles(times),
            "error_taxonomy": dict(data["failures"]),
        }
    
    return summary

def rank_models(summary: Dict[str, Dict]) -> List[tuple]:
    """Rank models by objective_pass_rate (descending), then mean_latency (ascending)."""
    ranked = sorted(
        summary.items(),
        key=lambda x: (-x[1]["objective_pass_rate_pct"], x[1]["mean_latency_ms"])
    )
    return ranked

def generate_markdown_table(ranked: List[tuple]) -> str:
    """Generate markdown ranking table."""
    lines = [
        "# LLM Benchmark Results - Ranked\n",
        "| Rank | Model | Pass Rate (%) | Success Rate (%) | Mean Latency (ms) | p50 (ms) | p95 (ms) | p99 (ms) |",
        "|------|-------|---------------|-----------------|-------------------|----------|----------|----------|",
    ]
    
    for rank, (model, stats) in enumerate(ranked, 1):
        pct = compute_percentiles(stats.get("percentiles_ms", {}))
        lines.append(
            f"| {rank} | {model} | {stats['objective_pass_rate_pct']:.1f} | {stats['success_rate_pct']:.1f} | "
            f"{stats['mean_latency_ms']:.0f} | {pct['p50']:.0f} | {pct['p95']:.0f} | {pct['p99']:.0f} |"
        )
    
    return "\n".join(lines) + "\n"

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_results.py <run_id>")
        sys.exit(1)
    
    run_id = sys.argv[1]
    here = os.path.dirname(os.path.abspath(__file__))
    run_dir = os.path.join(here, "runs", run_id)
    results_file = os.path.join(run_dir, "results.jsonl")
    
    if not os.path.exists(results_file):
        print(f"Results file not found: {results_file}")
        sys.exit(1)
    
    print(f"Loading results from {results_file}...")
    results = load_results(results_file)
    print(f"Loaded {len(results)} result records")
    
    agg = aggregate_by_model(results)
    print(f"Aggregated {len(agg)} models")
    
    summary = generate_summary(agg)
    ranked = rank_models(summary)
    
    # Write JSON summary
    summary_json = os.path.join(run_dir, "summary.json")
    with open(summary_json, "w") as f:
        json.dump(summary, f, indent=2, sort_keys=True)
    print(f"Wrote {summary_json}")
    
    # Write markdown table
    markdown_table = os.path.join(run_dir, "ranking.md")
    with open(markdown_table, "w") as f:
        f.write(generate_markdown_table(ranked))
    print(f"Wrote {markdown_table}")
    
    # Write aggregate summary
    aggregate_file = os.path.join(here, "AGGREGATE_SUMMARY.md")
    with open(aggregate_file, "w") as f:
        f.write("# LLM Benchmark - Aggregate Summary\n\n")
        f.write(f"**Run ID:** {run_id}\n\n")
        f.write(f"**Total Models:** {len(summary)}\n")
        f.write(f"**Total Prompts:** {len(results)}/209\n\n")
        f.write(generate_markdown_table(ranked))
        f.write("\n\n## Error Taxonomy\n\n")
        for model, stats in ranked:
            if stats.get("error_taxonomy"):
                f.write(f"\n### {model}\n")
                for error, count in sorted(stats["error_taxonomy"].items(), key=lambda x: -x[1]):
                    f.write(f"- {error}: {count}\n")
    
    print(f"Wrote {aggregate_file}")
    print("\n" + generate_markdown_table(ranked))

if __name__ == "__main__":
    main()
