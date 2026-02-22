#!/usr/bin/env python3
"""Final comprehensive monitoring and reporting."""

import json
import os
import time
import sys
from collections import defaultdict
from statistics import mean, median, stdev

# Runs to monitor
RUNS_TO_CHECK = [
    "focused_5models_2026_02_14",
    "target_5models_2026_02_14",  
    "untested_models_comprehensive_2026_02_14",
    "local_comprehensive_final_2026-02-13"
]

EXPECTED = 5 * 11  # 55 results

def get_results(run_dir):
    """Load results from a run."""
    results_file = os.path.join(run_dir, "results.jsonl")
    if not os.path.exists(results_file):
        return []
    
    results = []
    try:
        with open(results_file) as f:
            for line in f:
                rec = json.loads(line)
                if rec.get('record_type') == 'result':
                    results.append(rec)
    except:
        pass
    return results

def analyze_results(results):
    """Analyze benchmark results."""
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
            'latency_mean': round(mean(latencies), 1),
            'latency_median': round(median(latencies), 1),
            'latency_stdev': round(stdev(latencies), 1) if len(latencies) > 1 else 0,
            'success_rate': round(100 * success / len(data), 1),
            'obj_pass_rate': round(100 * obj_pass / len(data), 1),
        }
    
    return stats

# Monitor for up to 80 minutes
start = time.time()
timeout = 4800

while True:
    elapsed = time.time() - start
    
    print(f"\n[{elapsed/60:.1f}m] Checking benchmark status...", file=sys.stderr)
    
    best_run = None
    best_count = 0
    
    for run_name in RUNS_TO_CHECK:
        run_dir = f"runs/{run_name}"
        results = get_results(run_dir)
        
        if len(results) > best_count:
            best_run = (run_name, run_dir, results)
            best_count = len(results)
    
    if best_run:
        name, run_dir, results = best_run
        print(f"  {name}: {len(results)}/{EXPECTED}", file=sys.stderr)
        
        if len(results) >= EXPECTED:
            print(f"\n✓ COMPLETE: {len(results)} results in {name}\n", file=sys.stderr)
            
            # Generate report
            stats = analyze_results(results)
            
            print("=== COMPREHENSIVE BENCHMARK REPORT ===\n")
            print("Model Performance Summary:")
            print(f"{'Model':<25} {'N':<4} {'Latency (ms)':<25} {'Success':<10} {'ObjPass':<10}")
            print("-" * 75)
            for model in sorted(stats.keys()):
                s = stats[model]
                lat_str = f"{s['latency_mean']:.0f}±{s['latency_stdev']:.0f}"
                print(f"{model:<25} {s['count']:<4} {lat_str:<25} {s['success_rate']:<10.1f}% {s['obj_pass_rate']:<10.1f}%")
            
            # Save detailed results
            with open(f"runs/{name}/FINAL_REPORT.json", 'w') as f:
                json.dump({
                    'run_id': name,
                    'total_results': len(results),
                    'total_expected': EXPECTED,
                    'model_stats': stats,
                    'timestamp': time.time()
                }, f, indent=2)
            
            print(f"\nDetailed results saved to: runs/{name}/FINAL_REPORT.json")
            break
    
    if elapsed > timeout:
        print(f"\n✗ Timeout after {timeout}s", file=sys.stderr)
        if best_run:
            name, run_dir, results = best_run
            print(f"Best results so far: {len(results)} from {name}")
        break
    
    time.sleep(60)
