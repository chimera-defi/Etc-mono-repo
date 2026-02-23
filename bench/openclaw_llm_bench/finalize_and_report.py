#!/usr/bin/env python3
"""
Complete finalization script for comprehensive benchmark.
- Waits for benchmark to finish
- Generates all reports
- Updates aggregate
- Prints final summary
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path

def wait_for_completion(results_jsonl, target_tests=209, check_interval=30, timeout=14400):
    """Wait for benchmark to reach completion."""
    start = time.time()
    last_count = 0
    
    print("Waiting for benchmark completion...")
    while True:
        if not os.path.exists(results_jsonl):
            print(f"  Waiting for {results_jsonl}...")
            time.sleep(check_interval)
            continue
        
        # Count results
        count = 0
        with open(results_jsonl, 'r') as f:
            for line in f:
                if '"record_type": "result"' in line:
                    count += 1
        
        if count != last_count:
            elapsed = time.time() - start
            pct = 100 * count / target_tests
            rate = count / (elapsed / 60) if elapsed > 0 else 0  # tests per minute
            print(f"  {count}/{target_tests} tests ({pct:.1f}%) | {rate:.1f} tests/min | Elapsed: {elapsed/60:.1f}m")
            last_count = count
        
        if count >= target_tests:
            print(f"✅ Benchmark complete! {count} tests recorded.")
            break
        
        if time.time() - start > timeout:
            print(f"⚠️  Timeout reached ({timeout}s). Proceeding with {count}/{target_tests} tests.")
            break
        
        time.sleep(check_interval)

def run_analysis(run_folder):
    """Run comprehensive analysis."""
    script = os.path.join(os.path.dirname(__file__), 'analyze_comprehensive.py')
    result = subprocess.run(['python3', script, run_folder], capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"Error: {result.stderr}", file=sys.stderr)
        return False
    return True

def run_aggregate():
    """Run aggregate summary."""
    script = os.path.join(os.path.dirname(__file__), 'aggregate_runs.py')
    result = subprocess.run(['python3', script], cwd=os.path.dirname(__file__), capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"Error: {result.stderr}", file=sys.stderr)
        return False
    return True

def print_final_summary(run_folder):
    """Print final summary from metrics."""
    metrics_json = os.path.join(run_folder, 'metrics_comprehensive.json')
    if not os.path.exists(metrics_json):
        print("⚠️  metrics_comprehensive.json not found")
        return
    
    with open(metrics_json, 'r') as f:
        metrics = json.load(f)
    
    print("\n" + "="*70)
    print("FINAL SUMMARY - TOP 5 MODELS BY SUCCESS RATE")
    print("="*70)
    
    # Sort by success rate
    ranked = sorted(metrics.items(), key=lambda x: x[1]['success_rate_percent'], reverse=True)
    
    for rank, (model, m) in enumerate(ranked[:5], 1):
        print(f"\n{rank}. {model}")
        print(f"   Success Rate: {m['success_rate_percent']:.1f}%")
        print(f"   Objective Pass: {m['objective_pass_rate_percent']:.1f}%")
        print(f"   Latency: p50={m['latency']['p50_ms']:.0f}ms, p95={m['latency']['p95_ms']:.0f}ms, p99={m['latency']['p99_ms']:.0f}ms")
        print(f"   Avg Output: {m['avg_output_length']:.0f} chars")
        if m['error_taxonomy']:
            errors = ', '.join(f"{k}:{v}" for k, v in sorted(m['error_taxonomy'].items()))
            print(f"   Errors: {errors}")

def main():
    if len(sys.argv) < 2:
        run_folder = '/root/.openclaw/workspace/dev/Etc-mono-repo/bench/openclaw_llm_bench/runs/untested_models_comprehensive_2026_02_14'
    else:
        run_folder = sys.argv[1]
    
    results_jsonl = os.path.join(run_folder, 'results.jsonl')
    
    print(f"Run folder: {run_folder}")
    print()
    
    # Wait for completion
    wait_for_completion(results_jsonl)
    print()
    
    # Run analysis
    print("Generating comprehensive analysis...")
    if not run_analysis(run_folder):
        sys.exit(1)
    print()
    
    # Update aggregate
    print("Updating aggregate summary...")
    if not run_aggregate():
        sys.exit(1)
    print()
    
    # Print summary
    print_final_summary(run_folder)
    
    print("\n" + "="*70)
    print("✅ FINALIZATION COMPLETE")
    print("="*70)
    print(f"Output files:")
    print(f"  - {run_folder}/results_comprehensive.csv")
    print(f"  - {run_folder}/metrics_comprehensive.json")
    print(f"  - {run_folder}/COMPREHENSIVE_RESULTS.md")
    print(f"  - {os.path.dirname(__file__)}/runs/AGGREGATE_SUMMARY.md")

if __name__ == '__main__':
    main()
