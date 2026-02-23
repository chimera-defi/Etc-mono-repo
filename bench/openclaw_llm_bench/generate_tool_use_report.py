#!/usr/bin/env python3
"""Generate tool-use benchmark report.

Usage:
    python3 generate_tool_use_report.py tool_use_benchmark_2026-02-13
"""

import json
import sys
import os
from collections import defaultdict
from typing import Dict, List, Any, Optional, Tuple

def load_results(run_dir: str) -> List[Dict[str, Any]]:
    """Load result records from results.jsonl."""
    results_path = os.path.join(run_dir, "results.jsonl")
    results = []
    with open(results_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            if obj.get("record_type") == "result":
                results.append(obj)
    return results

def analyze_tool_use(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze tool-use metrics per model."""
    by_model = defaultdict(list)
    
    for r in results:
        model = r.get("model")
        by_model[model].append(r)
    
    report = {}
    for model, rows in sorted(by_model.items()):
        ok_rows = [r for r in rows if r.get("availability_status") == "ok" and r.get("success")]
        
        # Tool-use metrics
        tool_use_success = [r for r in rows if r.get("tool_use_success")]
        tool_use_rate = (len(tool_use_success) / len(rows)) * 100 if rows else 0
        
        # Latency
        latencies = [r["e2e_ms"] for r in ok_rows if r.get("e2e_ms") is not None]
        avg_latency = sum(latencies) / len(latencies) if latencies else None
        
        # Success rate
        success_rate = (len(ok_rows) / len(rows)) * 100 if rows else 0
        
        # Tool calls summary
        all_tools = set()
        for r in rows:
            all_tools.update(r.get("tool_calls", []))
        
        report[model] = {
            "model": model,
            "total_tests": len(rows),
            "successful": len(ok_rows),
            "success_rate_pct": round(success_rate, 1),
            "tool_use_success_count": len(tool_use_success),
            "tool_use_rate_pct": round(tool_use_rate, 1),
            "avg_latency_ms": round(avg_latency, 0) if avg_latency else None,
            "tool_calls_detected": sorted(list(all_tools)),
            "tier": classify_tool_tier(tool_use_rate),
        }
    
    return report

def classify_tool_tier(success_rate: float) -> str:
    """Classify model into tool-use tier."""
    if success_rate >= 80:
        return "Tier 1 (Tool-Capable)"
    elif success_rate >= 50:
        return "Tier 2 (Tool-Capable but Inconsistent)"
    else:
        return "Tier 3 (Tool-Incapable)"

def generate_csv(report: Dict[str, Any]) -> str:
    """Generate CSV output."""
    lines = [
        "Model,Total Tests,Successful,Success Rate (%),Tool Use (Count),Tool Use Rate (%),Avg Latency (ms),Tier,Tools Detected"
    ]
    
    for model, metrics in sorted(report.items()):
        row = [
            model,
            str(metrics["total_tests"]),
            str(metrics["successful"]),
            f"{metrics['success_rate_pct']:.1f}",
            str(metrics["tool_use_success_count"]),
            f"{metrics['tool_use_rate_pct']:.1f}",
            str(metrics["avg_latency_ms"]) if metrics["avg_latency_ms"] else "N/A",
            metrics["tier"],
            ";".join(metrics["tool_calls_detected"]),
        ]
        lines.append(",".join(row))
    
    return "\n".join(lines)

def generate_markdown_summary(report: Dict[str, Any], run_id: str) -> str:
    """Generate markdown summary."""
    lines = [
        f"# Tool-Use Benchmark Summary: {run_id}\n",
        "## Model Rankings by Tool-Use Capability\n",
        "| Model | Success % | Tool Use % | Avg Latency (ms) | Tier | Tools Detected |",
        "|-------|-----------|-----------|------------------|------|-------------|",
    ]
    
    # Sort by tool-use rate descending
    sorted_models = sorted(report.items(), key=lambda x: x[1]["tool_use_rate_pct"], reverse=True)
    
    for model, metrics in sorted_models:
        tools = ", ".join(metrics["tool_calls_detected"]) if metrics["tool_calls_detected"] else "None"
        row = (
            f"| {model} | {metrics['success_rate_pct']:.1f}% | "
            f"{metrics['tool_use_rate_pct']:.1f}% | "
            f"{metrics['avg_latency_ms'] or 'N/A'} | "
            f"{metrics['tier']} | {tools} |"
        )
        lines.append(row)
    
    lines.extend([
        "\n## Routing Recommendations\n",
        "### Tier 1 (Tool-Capable, ≥80% success)",
    ])
    
    tier1 = [m for m, r in report.items() if r["tier"] == "Tier 1 (Tool-Capable)"]
    if tier1:
        lines.append("- " + "\n- ".join(tier1))
    else:
        lines.append("*None*")
    
    lines.extend([
        "\n### Tier 2 (Tool-Capable but Inconsistent, 50-79% success)",
    ])
    
    tier2 = [m for m, r in report.items() if r["tier"] == "Tier 2 (Tool-Capable but Inconsistent)"]
    if tier2:
        lines.append("- " + "\n- ".join(tier2))
    else:
        lines.append("*None*")
    
    lines.extend([
        "\n### Tier 3 (Tool-Incapable, <50% success)",
    ])
    
    tier3 = [m for m, r in report.items() if r["tier"] == "Tier 3 (Tool-Incapable)"]
    if tier3:
        lines.append("- " + "\n- ".join(tier3))
    else:
        lines.append("*None*")
    
    lines.extend([
        "\n## Details\n",
        "Tool-use capability indicates whether a model can successfully invoke shell commands ",
        "or other tools in its responses. Models classified as Tier 1 are recommended for subagent routing with tool access.",
    ])
    
    return "\n".join(lines)

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 generate_tool_use_report.py <run_id>")
        sys.exit(1)
    
    run_id = sys.argv[1]
    here = os.path.dirname(os.path.abspath(__file__))
    run_dir = os.path.join(here, "runs", run_id)
    
    if not os.path.exists(run_dir):
        print(f"Error: Run directory not found: {run_dir}")
        sys.exit(1)
    
    print(f"Loading results from {run_dir}...", file=sys.stderr)
    results = load_results(run_dir)
    print(f"Loaded {len(results)} results", file=sys.stderr)
    
    if not results:
        print("Error: No results found", file=sys.stderr)
        sys.exit(1)
    
    report = analyze_tool_use(results)
    
    # Generate outputs
    csv_output = generate_csv(report)
    md_output = generate_markdown_summary(report, run_id)
    
    # Write CSV
    csv_path = os.path.join(run_dir, "tool_use_summary.csv")
    with open(csv_path, "w") as f:
        f.write(csv_output)
    print(f"Wrote: {csv_path}")
    
    # Write Markdown
    md_path = os.path.join(run_dir, "tool_use_summary.md")
    with open(md_path, "w") as f:
        f.write(md_output)
    print(f"Wrote: {md_path}")
    
    # Print to stdout
    print("\n" + md_output)
    print("\n" + csv_output)

if __name__ == "__main__":
    main()
