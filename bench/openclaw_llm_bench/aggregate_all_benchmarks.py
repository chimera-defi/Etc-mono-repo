#!/usr/bin/env python3
"""Aggregate and analyze all benchmark data."""

import json
import os
from collections import defaultdict
from statistics import mean, median, stdev

def load_results(run_dir):
    """Load result records from a run."""
    results_file = os.path.join(run_dir, "results.jsonl")
    if not os.path.exists(results_file):
        return []
    
    results = []
    with open(results_file) as f:
        for line in f:
            rec = json.loads(line)
            if rec.get('record_type') == 'result':
                results.append(rec)
    return results

def analyze_results(results):
    """Analyze benchmark results."""
    if not results:
        return None
    
    by_model = defaultdict(list)
    for r in results:
        by_model[r['model']].append(r)
    
    stats = {}
    for model, data in sorted(by_model.items()):
        latencies = [r['e2e_ms'] for r in data]
        success = sum(1 for r in data if r['success'])
        obj_pass = sum(1 for r in data if r['objective_pass'])
        
        stats[model] = {
            'count': len(data),
            'prompts': sorted(set(r['prompt_id'] for r in data)),
            'latency_min': min(latencies),
            'latency_max': max(latencies),
            'latency_mean': round(mean(latencies), 1),
            'latency_median': round(median(latencies), 1),
            'latency_stdev': round(stdev(latencies), 1) if len(latencies) > 1 else 0,
            'success_rate': round(100 * success / len(data), 1),
            'obj_pass_rate': round(100 * obj_pass / len(data), 1),
            'success_count': success,
        }
    
    return stats, len(results), by_model

# Check all runs
print("=== AGGREGATING BENCHMARK DATA ===\n")

target_models = {"qwen2.5:14b", "gemma2:9b", "phi:latest", "mistral:7b", "qwen3:4b"}
all_data = {}
total_results = 0

for run_name in sorted(os.listdir("runs")):
    run_dir = os.path.join("runs", run_name)
    if not os.path.isdir(run_dir):
        continue
    
    results = load_results(run_dir)
    if not results:
        continue
    
    models_in_run = set(r['model'] for r in results)
    
    # Check if this run has useful target models
    has_target = len(target_models & models_in_run) > 0
    
    if has_target:
        print(f"{run_name}: {len(results)} results")
        print(f"  Models: {sorted(models_in_run)}")
        print(f"  Target models in run: {sorted(target_models & models_in_run)}")
        
        stats, count, by_model = analyze_results(results)
        
        for model in sorted(target_models & models_in_run):
            if model not in all_data:
                all_data[model] = []
            all_data[model].extend(by_model[model])
        
        total_results += count
        print()

print("\n=== TARGET MODELS DATA COVERAGE ===\n")
for model in sorted(target_models):
    if model in all_data:
        results = all_data[model]
        print(f"{model}: {len(results)} results")
        if results:
            latencies = [r['e2e_ms'] for r in results]
            success = sum(1 for r in results if r['success'])
            obj_pass = sum(1 for r in results if r['objective_pass'])
            print(f"  Latency: {mean(latencies):.0f}ms (±{stdev(latencies):.0f})")
            print(f"  Success: {100*success/len(results):.1f}%")
            print(f"  Obj.Pass: {100*obj_pass/len(results):.1f}%")
    else:
        print(f"{model}: NO DATA YET")
    print()

# Save aggregate
agg_file = "AGGREGATE_SUMMARY.md"
print(f"\nSaving to {agg_file}...")
