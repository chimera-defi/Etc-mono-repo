#!/usr/bin/env python3
"""Monitor benchmark progress in real-time."""

import json
import os
import sys
from collections import defaultdict
from datetime import datetime

def count_tests(results_path):
    if not os.path.exists(results_path):
        return 0, {}
    
    model_tests = defaultdict(int)
    total = 0
    with open(results_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                if obj.get('record_type') == 'result':
                    total += 1
                    model_tests[obj.get('model', 'unknown')] += 1
            except:
                pass
    
    return total, model_tests

def main():
    run_folder = sys.argv[1] if len(sys.argv) > 1 else '/root/.openclaw/workspace/dev/Etc-mono-repo/bench/openclaw_llm_bench/runs/untested_models_comprehensive_2026_02_14'
    results_path = os.path.join(run_folder, 'results.jsonl')
    
    total, by_model = count_tests(results_path)
    models_started = len(by_model)
    
    print(f"\n=== Benchmark Progress Report ===")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Run: {os.path.basename(run_folder)}")
    print()
    print(f"SUMMARY:")
    print(f"  Total tests completed: {total} / 209 ({100*total/209:.1f}%)")
    print(f"  Models started: {models_started} / 19")
    print(f"  Estimated completion models: {total / 11:.1f}")
    print()
    
    if by_model:
        print(f"PER-MODEL PROGRESS:")
        for model in sorted(by_model.keys()):
            count = by_model[model]
            pct = 100 * count / 11
            print(f"  {model}: {count}/11 prompts ({pct:.0f}%)")
    
    # ETA estimate
    if total > 0:
        # Assume avg ~10-20 sec per test based on earlier runs
        remaining = 209 - total
        avg_ms_per_test = 15000  # Conservative estimate
        remaining_sec = remaining * (avg_ms_per_test / 1000)
        print()
        print(f"ESTIMATE:")
        print(f"  Remaining: {remaining} tests")
        print(f"  Est. time: {remaining_sec/60:.0f} minutes ({remaining_sec/3600:.1f} hours)")

if __name__ == '__main__':
    main()
