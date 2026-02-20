#!/usr/bin/env python3
"""
Aggregation + comparison script for benchmark results.

Reads all JSON results (Phase 1 atomic, Phase 2 atomic, extended, gpt-oss partial)
and generates comparison matrices.

Outputs:
1. comparison_matrix.csv — Models × Metrics
2. phase_comparison.json — Per-model atomic vs extended delta
3. markdown_summary.md — Human-readable table
4. by_prompt_analysis.json — Which prompts failed most
"""

import json
import os
import csv
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple, Any, Optional
import statistics

class ResultsAggregator:
    def __init__(self, bench_dir: str = "/root/.openclaw/workspace/bench"):
        self.bench_dir = Path(bench_dir)
        self.results_by_model: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
            "atomic": {"results": [], "phase": "atomic"},
            "extended": {"results": [], "phase": "extended"}
        })
        self.all_failed_prompts: Dict[str, List[str]] = defaultdict(list)
        self.phase_mapping: Dict[str, str] = {}  # filename -> phase type
        
    def _is_result_file(self, filename: str) -> bool:
        """Check if filename is a results file (not a suite definition or output)."""
        # Exclude benchmark suite definitions, config files, and generated outputs
        exclude = ["suite.json", "config.json", "schema.json", 
                   "comparison_matrix.csv", "markdown_summary.md"]
        if any(exc in filename for exc in exclude):
            return False
        # Only process INPUT result files, not *our* outputs
        if filename in ["phase_comparison.json", "by_prompt_analysis.json"]:
            return False
        # Include files with "results", "phase", model names, etc.
        include = ["results", "phase", "mistral", "lfm", "gpt", "llama"]
        return any(inc in filename for inc in include)
    
    def load_results(self):
        """Load all JSON files from bench directory."""
        # Match files: *results*.json, *phase*.json, extended_*.json, etc.
        json_files = sorted(self.bench_dir.glob("*.json"))
        # Filter out non-result files like extended_benchmark_suite.json
        result_files = [f for f in json_files if self._is_result_file(f.name)]
        
        for json_file in result_files:
            print(f"Loading {json_file.name}...")
            with open(json_file) as f:
                data = json.load(f)
            
            self._parse_file(json_file.name, data)
    
    def _parse_file(self, filename: str, data: Any):
        """Parse different JSON formats."""
        
        # Detect phase (atomic vs extended)
        if "extended" in filename:
            phase = "extended"
        else:
            phase = "atomic"
        
        # Case 1: List of results (lfm_native_api_results.json)
        if isinstance(data, list):
            # Infer model name from filename
            model = self._infer_model_name(filename)
            self._add_results(model, phase, data)
        
        # Case 2: Dict with model as key and nested "results" (full_validation_results_gpt_oss.json)
        elif isinstance(data, dict):
            # Check if it's a single-level model dict
            first_key = next(iter(data.keys())) if data else None
            if first_key and isinstance(data[first_key], dict) and "results" in data[first_key]:
                # Nested format: {model_name: {results: [...]}}
                for model_name, model_data in data.items():
                    results = model_data.get("results", [])
                    self._add_results(model_name, phase, results)
            elif "model" in data and "results" in data:
                # Flat format with model and results keys
                model = data["model"]
                results = data["results"]
                self._add_results(model, phase, results)
            elif "results" in data:
                # Has results but no model name
                model = self._infer_model_name(filename)
                results = data["results"]
                self._add_results(model, phase, results)
            else:
                print(f"  Warning: Could not parse {filename}")
    
    def _infer_model_name(self, filename: str) -> str:
        """Infer model name from filename."""
        if "lfm" in filename.lower():
            return "LFM2.5"
        elif "mistral" in filename.lower():
            return "mistral:7b"
        elif "gpt_oss" in filename.lower():
            return "gpt-oss:latest"
        else:
            return filename.replace("_results.json", "").replace(".json", "")
    
    def _add_results(self, model: str, phase: str, results: List[Dict]):
        """Add results to model's phase."""
        # Normalize result format
        normalized = []
        for result in results:
            norm = {
                "prompt_id": result.get("prompt_id") or result.get("id"),
                "expected": self._normalize_expected(result.get("expected")),
                "got": self._normalize_got(result.get("got")),
                "correct": result.get("correct", False),
                "latency_ms": result.get("latency_ms", 0),
                "category": result.get("category", "unknown"),
            }
            normalized.append(norm)
            
            # Track failed prompts
            if not norm["correct"]:
                self.all_failed_prompts[model].append(norm["prompt_id"])
        
        self.results_by_model[model][phase]["results"] = normalized
    
    def _normalize_expected(self, expected: Any) -> List[str]:
        """Normalize expected to list."""
        if expected is None:
            return []
        if isinstance(expected, str):
            return [expected]
        if isinstance(expected, list):
            return expected
        return []
    
    def _normalize_got(self, got: Any) -> List[str]:
        """Normalize got to list."""
        if got is None:
            return []
        if isinstance(got, str):
            return [got]
        if isinstance(got, list):
            return got
        return []
    
    def calculate_metrics(self) -> Dict[str, Dict[str, Dict[str, Any]]]:
        """Calculate accuracy, restraint, latency for each model × phase."""
        metrics = {}
        
        for model, phases in self.results_by_model.items():
            metrics[model] = {}
            
            for phase_name, phase_data in phases.items():
                results = phase_data["results"]
                if not results:
                    continue
                
                # Accuracy: fraction of correct
                correct_count = sum(1 for r in results if r["correct"])
                accuracy = correct_count / len(results) if results else 0
                
                # Restraint: how often we avoid false positives
                # When expected is empty, we should return empty (got [])
                correct_restraint = sum(
                    1 for r in results 
                    if len(r["expected"]) == 0 and len(r["got"]) == 0
                )
                restraint_cases = sum(1 for r in results if len(r["expected"]) == 0)
                restraint = correct_restraint / restraint_cases if restraint_cases > 0 else 1.0
                
                # Latency
                latencies = [r["latency_ms"] for r in results]
                avg_latency = statistics.mean(latencies)
                
                # Failed prompts
                failed = [r["prompt_id"] for r in results if not r["correct"]]
                failed_count = len(failed)
                
                metrics[model][phase_name] = {
                    "accuracy": accuracy,
                    "accuracy_pct": f"{accuracy*100:.2f}%",
                    "restraint": round(restraint, 2),
                    "avg_latency_ms": round(avg_latency, 1),
                    "avg_latency_s": round(avg_latency / 1000, 1),
                    "failed_count": failed_count,
                    "failed_prompts": failed,
                    "total_tests": len(results)
                }
        
        return metrics
    
    def generate_csv_matrix(self, metrics: Dict, output_file: str = None):
        """Generate CSV comparison matrix."""
        if output_file is None:
            output_file = str(self.bench_dir / "comparison_matrix.csv")
        
        rows = []
        for model in sorted(metrics.keys()):
            for phase in ["atomic", "extended"]:
                if phase in metrics[model]:
                    m = metrics[model][phase]
                    rows.append({
                        "Model": model,
                        "Phase": phase,
                        "Accuracy": m["accuracy_pct"],
                        "Restraint": m["restraint"],
                        "Avg Latency (s)": m["avg_latency_s"],
                        "Failed Count": m["failed_count"],
                        "Failed Prompts": ", ".join(m["failed_prompts"]) or "None"
                    })
        
        with open(output_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                "Model", "Phase", "Accuracy", "Restraint", "Avg Latency (s)", 
                "Failed Count", "Failed Prompts"
            ])
            writer.writeheader()
            writer.writerows(rows)
        
        print(f"✓ Saved {output_file}")
        return output_file
    
    def generate_phase_comparison(self, metrics: Dict, output_file: str = None):
        """Generate per-model atomic vs extended comparison."""
        if output_file is None:
            output_file = str(self.bench_dir / "phase_comparison.json")
        
        comparison = {}
        
        for model in sorted(metrics.keys()):
            if "atomic" in metrics[model] and "extended" in metrics[model]:
                atomic = metrics[model]["atomic"]
                extended = metrics[model]["extended"]
                
                comparison[model] = {
                    "atomic": {
                        "accuracy": round(atomic["accuracy"], 4),
                        "restraint": atomic["restraint"],
                        "avg_latency_s": atomic["avg_latency_s"],
                        "failed_count": atomic["failed_count"]
                    },
                    "extended": {
                        "accuracy": round(extended["accuracy"], 4),
                        "restraint": extended["restraint"],
                        "avg_latency_s": extended["avg_latency_s"],
                        "failed_count": extended["failed_count"]
                    },
                    "delta": {
                        "accuracy_change": round(extended["accuracy"] - atomic["accuracy"], 4),
                        "restraint_change": round(extended["restraint"] - atomic["restraint"], 2),
                        "latency_change_s": round(extended["avg_latency_s"] - atomic["avg_latency_s"], 1),
                        "failed_count_change": extended["failed_count"] - atomic["failed_count"]
                    }
                }
            elif "atomic" in metrics[model]:
                # Only atomic phase available
                atomic = metrics[model]["atomic"]
                comparison[model] = {
                    "atomic": {
                        "accuracy": round(atomic["accuracy"], 4),
                        "restraint": atomic["restraint"],
                        "avg_latency_s": atomic["avg_latency_s"],
                        "failed_count": atomic["failed_count"]
                    },
                    "extended": None,
                    "delta": None
                }
            elif "extended" in metrics[model]:
                # Only extended phase available
                extended = metrics[model]["extended"]
                comparison[model] = {
                    "atomic": None,
                    "extended": {
                        "accuracy": round(extended["accuracy"], 4),
                        "restraint": extended["restraint"],
                        "avg_latency_s": extended["avg_latency_s"],
                        "failed_count": extended["failed_count"]
                    },
                    "delta": None
                }
        
        with open(output_file, 'w') as f:
            json.dump(comparison, f, indent=2)
        
        print(f"✓ Saved {output_file}")
        return output_file
    
    def generate_markdown_summary(self, metrics: Dict, output_file: str = None):
        """Generate human-readable markdown table."""
        if output_file is None:
            output_file = str(self.bench_dir / "markdown_summary.md")
        
        lines = [
            "# Benchmark Results Summary\n",
            "## Comparison Matrix\n",
            "| Model | Phase | Accuracy | Restraint | Avg Latency (s) | Failed Count |\n",
            "|-------|-------|----------|-----------|-----------------|--------|"
        ]
        
        for model in sorted(metrics.keys()):
            for phase in ["atomic", "extended"]:
                if phase in metrics[model]:
                    m = metrics[model][phase]
                    failed_list = ", ".join(m["failed_prompts"]) if m["failed_prompts"] else "—"
                    lines.append(
                        f"| {model} | {phase} | {m['accuracy_pct']} | {m['restraint']} | "
                        f"{m['avg_latency_s']} | {m['failed_count']} ({failed_list}) |"
                    )
        
        lines.append("\n## Phase Comparison (Atomic vs Extended)\n")
        
        for model in sorted(metrics.keys()):
            has_atomic = "atomic" in metrics[model]
            has_extended = "extended" in metrics[model]
            
            if has_atomic and has_extended:
                atomic = metrics[model]["atomic"]
                extended = metrics[model]["extended"]
                acc_delta = extended["accuracy"] - atomic["accuracy"]
                acc_sign = "+" if acc_delta >= 0 else ""
                
                lines.append(f"\n### {model}")
                lines.append(f"- **Accuracy**: {atomic['accuracy_pct']} → {extended['accuracy_pct']} ({acc_sign}{acc_delta*100:.2f}%)")
                lines.append(f"- **Restraint**: {atomic['restraint']} → {extended['restraint']}")
                lines.append(f"- **Avg Latency**: {atomic['avg_latency_s']}s → {extended['avg_latency_s']}s")
            elif has_extended and not has_atomic:
                # Only extended phase available
                extended = metrics[model]["extended"]
                lines.append(f"\n### {model}")
                lines.append(f"- **Accuracy**: {extended['accuracy_pct']} (extended only)")
                lines.append(f"- **Restraint**: {extended['restraint']}")
                lines.append(f"- **Avg Latency**: {extended['avg_latency_s']}s")
        
        with open(output_file, 'w') as f:
            f.write("\n".join(lines) + "\n")
        
        print(f"✓ Saved {output_file}")
        return output_file
    
    def generate_prompt_analysis(self, output_file: str = None):
        """Analyze which prompts failed most across all models."""
        if output_file is None:
            output_file = str(self.bench_dir / "by_prompt_analysis.json")
        
        # Count failures per prompt across all models
        prompt_failures = defaultdict(list)
        
        for model, failed_prompts in self.all_failed_prompts.items():
            for prompt_id in failed_prompts:
                prompt_failures[prompt_id].append(model)
        
        # Sort by frequency
        analysis = {}
        for prompt_id in sorted(prompt_failures.keys()):
            models = prompt_failures[prompt_id]
            analysis[prompt_id] = {
                "failed_in_models": sorted(list(set(models))),
                "failure_count": len(models),
                "models_count": len(set(models))
            }
        
        # Sort by failure count
        sorted_analysis = dict(sorted(
            analysis.items(),
            key=lambda x: x[1]["failure_count"],
            reverse=True
        ))
        
        with open(output_file, 'w') as f:
            json.dump(sorted_analysis, f, indent=2)
        
        print(f"✓ Saved {output_file}")
        return output_file


def main():
    print("=" * 60)
    print("BENCHMARK RESULTS AGGREGATOR")
    print("=" * 60)
    
    agg = ResultsAggregator()
    agg.load_results()
    
    print("\nCalculating metrics...")
    metrics = agg.calculate_metrics()
    
    print("\nGenerating outputs...")
    agg.generate_csv_matrix(metrics)
    agg.generate_phase_comparison(metrics)
    agg.generate_markdown_summary(metrics)
    agg.generate_prompt_analysis()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    # Print summary table
    print("\n| Model | Phase | Accuracy | Restraint | Avg Latency | Failed |")
    print("|-------|-------|----------|-----------|-------------|--------|")
    
    for model in sorted(metrics.keys()):
        for phase in ["atomic", "extended"]:
            if phase in metrics[model]:
                m = metrics[model][phase]
                print(f"| {model:15} | {phase:8} | {m['accuracy_pct']:8} | {m['restraint']:9} | "
                      f"{m['avg_latency_s']:11}s | {m['failed_count']:6} |")
    
    print("\n✓ All outputs generated!")


if __name__ == "__main__":
    main()
