#!/usr/bin/env python3
"""Generate comprehensive aggregate summary from benchmark results."""

import json
import os
import sys
import statistics
import csv
from collections import defaultdict
from typing import Any, Dict, List, Tuple
from datetime import datetime

def load_results(results_file: str) -> List[Dict[str, Any]]:
    """Load all result records from JSONL file."""
    results = []
    with open(results_file) as f:
        for line in f:
            if not line.strip():
                continue
            try:
                record = json.loads(line)
                if record.get("record_type") == "result":
                    results.append(record)
            except json.JSONDecodeError:
                pass
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
                "by_prompt": {},
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
        
        # Track per-prompt stats
        prompt_id = result.get("prompt_id", "unknown")
        if prompt_id not in agg[model]["by_prompt"]:
            agg[model]["by_prompt"][prompt_id] = {"pass": 0, "total": 0}
        agg[model]["by_prompt"][prompt_id]["total"] += 1
        if result.get("objective_pass"):
            agg[model]["by_prompt"][prompt_id]["pass"] += 1
    
    return agg

def compute_percentiles(times: List[int]) -> Dict[str, float]:
    """Compute p50, p95, p99 from latencies."""
    if not times:
        return {"p50": 0, "p95": 0, "p99": 0}
    
    sorted_times = sorted(times)
    n = len(sorted_times)
    return {
        "p50": sorted_times[int(n * 0.50)],
        "p95": sorted_times[min(int(n * 0.95), n-1)],
        "p99": sorted_times[min(int(n * 0.99), n-1)],
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
            "stdev_latency_ms": statistics.stdev(times) if len(times) > 1 else 0,
            "percentiles_ms": compute_percentiles(times),
            "error_taxonomy": dict(data["failures"]),
            "by_prompt": data["by_prompt"],
        }
    
    return summary

def rank_models(summary: Dict[str, Dict]) -> List[Tuple[str, Dict]]:
    """Rank models by objective_pass_rate (descending), then mean_latency (ascending)."""
    ranked = sorted(
        summary.items(),
        key=lambda x: (-x[1]["objective_pass_rate_pct"], x[1]["mean_latency_ms"])
    )
    return ranked

def generate_markdown_table(ranked: List[tuple]) -> str:
    """Generate markdown ranking table."""
    lines = [
        "| Rank | Model | Pass Rate (%) | Success (%) | Mean Latency (ms) | p50 | p95 | p99 |",
        "|------|-------|---------------|-------------|-------------------|-----|-----|-----|",
    ]
    
    for rank, (model, stats) in enumerate(ranked, 1):
        pcts = stats.get("percentiles_ms", {})
        lines.append(
            f"| {rank:2d} | {model:30s} | {stats['objective_pass_rate_pct']:6.1f} | "
            f"{stats['success_rate_pct']:6.1f} | {stats['mean_latency_ms']:8.0f} | "
            f"{pcts.get('p50', 0):5.0f} | {pcts.get('p95', 0):5.0f} | {pcts.get('p99', 0):5.0f} |"
        )
    
    return "\n".join(lines)

def generate_csv(results: List[Dict], csv_path: str) -> None:
    """Export all results to CSV."""
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "model", "prompt_id", "prompt_name", "e2e_ms", "ttft_ms",
            "success", "objective_pass", "violation", "input_tokens", "output_tokens"
        ])
        writer.writeheader()
        
        for result in results:
            writer.writerow({
                "model": result.get("model", ""),
                "prompt_id": result.get("prompt_id", ""),
                "prompt_name": result.get("prompt_name", ""),
                "e2e_ms": result.get("e2e_ms", ""),
                "ttft_ms": result.get("ttft_ms", ""),
                "success": result.get("success", ""),
                "objective_pass": result.get("objective_pass", ""),
                "violation": result.get("violation", ""),
                "input_tokens": result.get("input_tokens", ""),
                "output_tokens": result.get("output_tokens", ""),
            })

def generate_hidden_gems(ranked: List[tuple]) -> List[str]:
    """Identify hidden gems - small models with surprising performance."""
    gems = []
    for model, stats in ranked:
        # Extract model size from name if possible
        if ":" in model:
            size_part = model.split(":")[-1]
            # Models under 5b with >50% pass rate
            if any(x in size_part for x in ["1.7b", "2b", "3b", "3.8b"]):
                if stats["objective_pass_rate_pct"] > 50:
                    gems.append({
                        "model": model,
                        "pass_rate": stats["objective_pass_rate_pct"],
                        "latency": stats["mean_latency_ms"],
                    })
    return sorted(gems, key=lambda x: -x["pass_rate"])

def main():
    if len(sys.argv) < 2:
        run_id = "20260214_093023"  # Default
    else:
        run_id = sys.argv[1]
    
    here = os.path.dirname(os.path.abspath(__file__))
    run_dir = os.path.join(here, "runs", run_id)
    results_file = os.path.join(run_dir, "results.jsonl")
    
    if not os.path.exists(results_file):
        print(f"Results file not found: {results_file}")
        sys.exit(1)
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Loading results from {results_file}...")
    results = load_results(results_file)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Loaded {len(results)} result records")
    
    if not results:
        print("No results found!")
        sys.exit(1)
    
    agg = aggregate_by_model(results)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Aggregated {len(agg)} models")
    
    summary = generate_summary(agg)
    ranked = rank_models(summary)
    
    # Write JSON summary
    summary_json = os.path.join(run_dir, "summary.json")
    with open(summary_json, "w") as f:
        json.dump(summary, f, indent=2, sort_keys=True)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Wrote {summary_json}")
    
    # Write CSV export
    csv_path = os.path.join(run_dir, "results.csv")
    generate_csv(results, csv_path)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Wrote {csv_path}")
    
    # Write markdown table
    markdown_table = os.path.join(run_dir, "ranking.md")
    with open(markdown_table, "w") as f:
        f.write("# LLM Benchmark Results - Ranked\n\n")
        f.write(f"**Run ID:** {run_id}\n")
        f.write(f"**Generated:** {datetime.now().isoformat()}\n\n")
        f.write(generate_markdown_table(ranked))
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Wrote {markdown_table}")
    
    # Write aggregate summary
    aggregate_file = os.path.join(here, "AGGREGATE_SUMMARY.md")
    with open(aggregate_file, "w") as f:
        f.write("# LLM Benchmark - Aggregate Summary\n\n")
        f.write(f"**Run ID:** {run_id}\n")
        f.write(f"**Generated:** {datetime.now().isoformat()}\n\n")
        f.write(f"**Total Models:** {len(summary)}\n")
        f.write(f"**Total Prompts:** {len(results)}/209\n\n")
        f.write(generate_markdown_table(ranked))
        
        gems = generate_hidden_gems(ranked)
        if gems:
            f.write("\n\n## Hidden Gems (Small Models with Great Performance)\n\n")
            for gem in gems:
                f.write(f"- **{gem['model']}**: {gem['pass_rate']:.1f}% pass rate, {gem['latency']:.0f}ms latency\n")
        
        f.write("\n\n## Error Taxonomy\n\n")
        for rank, (model, stats) in enumerate(ranked, 1):
            if stats.get("error_taxonomy"):
                f.write(f"\n### {rank}. {model}\n")
                for error, count in sorted(stats["error_taxonomy"].items(), key=lambda x: -x[1]):
                    f.write(f"- {error}: {count}\n")
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Wrote {aggregate_file}")
    print(f"\n{generate_markdown_table(ranked)}")

if __name__ == "__main__":
    main()
