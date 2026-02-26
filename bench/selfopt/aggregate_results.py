#!/usr/bin/env python3
"""
Aggregate benchmark results from supervisor runs into canonical.json
"""

import json
import os
import statistics
from pathlib import Path
from datetime import date

SCRIPT_DIR = Path(__file__).parent
SUPERVISOR_RUNS_DIR = SCRIPT_DIR.parent / "supervisor_runs"
RESULTS_DIR = SCRIPT_DIR.parent / "results"
CANONICAL_FILE = RESULTS_DIR / "canonical.json"

ATTRIBUTION = {
    "model": "anthropic/claude-haiku-4-5-20251001",
    "human": "workspace owner",
    "date": "2026-02-26"
}


def load_canonical():
    """Load existing canonical results."""
    if CANONICAL_FILE.exists():
        with open(CANONICAL_FILE, "r") as f:
            return json.load(f)
    return {"_attribution": ATTRIBUTION}


def save_canonical(data):
    """Save canonical results."""
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    with open(CANONICAL_FILE, "w") as f:
        json.dump(data, f, indent=2)


def find_run_json_files():
    """Find all JSON result files in supervisor runs."""
    json_files = []
    if SUPERVISOR_RUNS_DIR.exists():
        for run_dir in SUPERVISOR_RUNS_DIR.iterdir():
            if run_dir.is_dir():
                for json_file in run_dir.glob("*.json"):
                    json_files.append(json_file)
    return json_files


def extract_results(json_file):
    """
    Extract benchmark results from a run JSON file.
    Expected structure: metadata.json with model results or direct result files.
    """
    with open(json_file, "r") as f:
        data = json.load(f)

    results = []

    # If data has 'results' key with model data
    if "results" in data:
        for model_name, model_data in data["results"].items():
            results.append({
                "model": model_name,
                "accuracy": model_data.get("accuracy", 0.0),
                "restraint_score": model_data.get("restraint", model_data.get("restraint_score", 0.0)),
                "latencies": model_data.get("latencies", []),
                "variant": model_data.get("variant", "atomic"),
                "status": "canonical"
            })

    # If data is a dict with model keys directly
    elif isinstance(data, dict) and "run_id" not in data:
        for model_name, model_data in data.items():
            if isinstance(model_data, dict) and "accuracy" in model_data:
                results.append({
                    "model": model_name,
                    "accuracy": model_data.get("accuracy", 0.0),
                    "restraint_score": model_data.get("restraint", model_data.get("restraint_score", 0.0)),
                    "latencies": model_data.get("latencies", []),
                    "variant": model_data.get("variant", "atomic"),
                    "status": "canonical"
                })

    return results


def compute_latency_stats(latencies):
    """Compute avg, median, max from latency list."""
    if not latencies:
        return {"avg": 0, "median": 0, "max": 0}
    return {
        "avg": round(statistics.mean(latencies), 2),
        "median": round(statistics.median(latencies), 2),
        "max": max(latencies)
    }


def main():
    print(f"Loading canonical results from {CANONICAL_FILE}")
    canonical = load_canonical()

    # Ensure attribution exists
    if "_attribution" not in canonical:
        canonical["_attribution"] = ATTRIBUTION

    # Find and process run files
    run_files = find_run_json_files()
    print(f"Found {len(run_files)} JSON files in supervisor_runs")

    new_entries = 0
    skipped_entries = 0

    for json_file in run_files:
        print(f"Processing {json_file.name}...")
        results = extract_results(json_file)

        for result in results:
            model_name = result["model"]

            # Skip if already in canonical
            if model_name in canonical:
                print(f"  Skipping {model_name} (already in canonical)")
                skipped_entries += 1
                continue

            # Compute latency stats
            latency_stats = compute_latency_stats(result.get("latencies", []))

            # Build canonical entry
            canonical[model_name] = {
                "accuracy": result["accuracy"],
                "restraint_score": result["restraint_score"],
                "latency_avg": latency_stats["avg"],
                "latency_median": latency_stats["median"],
                "latency_max": latency_stats["max"],
                "variant": result.get("variant", "atomic"),
                "status": "canonical"
            }

            print(f"  Added {model_name}: accuracy={result['accuracy']}, restraint={result['restraint_score']}")
            new_entries += 1

    # Save updated canonical
    save_canonical(canonical)

    print(f"\nDone: {new_entries} new entries added, {skipped_entries} skipped")
    print(f"Canonical saved to {CANONICAL_FILE}")


if __name__ == "__main__":
    main()
