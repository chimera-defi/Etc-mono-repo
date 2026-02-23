#!/usr/bin/env python3
"""Generate comprehensive final reports in multiple formats."""

import json
import os
import csv
from collections import defaultdict
from statistics import mean, median, stdev
from datetime import datetime

# Configuration
TARGET_MODELS = {"qwen2.5:14b", "gemma2:9b", "phi:latest", "mistral:7b", "qwen3:4b"}
TIMESTAMP = datetime.now().isoformat()

# Collect all data
model_data = {m: [] for m in TARGET_MODELS}

for run_name in sorted(os.listdir("runs")):
    run_dir = os.path.join("runs", run_name)
    results_file = os.path.join(run_dir, "results.jsonl")
    
    if not os.path.exists(results_file):
        continue
    
    try:
        with open(results_file) as f:
            for line in f:
                rec = json.loads(line)
                if rec.get('record_type') == 'result' and rec.get('model') in TARGET_MODELS:
                    model_data[rec['model']].append(rec)
    except:
        pass

# Generate CSV export
csv_file = "benchmark_results_2026_02_14.csv"
with open(csv_file, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=[
        'model', 'prompt_id', 'e2e_ms', 'success', 'objective_pass', 
        'input_tokens', 'output_tokens', 'failure_type'
    ])
    writer.writeheader()
    
    for model in sorted(TARGET_MODELS):
        for result in model_data[model]:
            writer.writerow({
                'model': result['model'],
                'prompt_id': result['prompt_id'],
                'e2e_ms': result['e2e_ms'],
                'success': result['success'],
                'objective_pass': result['objective_pass'],
                'input_tokens': result.get('input_tokens', 0),
                'output_tokens': result.get('output_tokens', 0),
                'failure_type': result.get('failure_type', '')
            })

print(f"✓ CSV export: {csv_file}")

# Generate JSON export
json_file = "benchmark_results_2026_02_14.json"
json_data = {
    'timestamp': TIMESTAMP,
    'total_results': sum(len(model_data[m]) for m in TARGET_MODELS),
    'expected_results': 55,
    'models': {}
}

for model in sorted(TARGET_MODELS):
    results = model_data[model]
    if not results:
        json_data['models'][model] = {'count': 0, 'status': 'NO_DATA'}
        continue
    
    latencies = [r['e2e_ms'] for r in results]
    successes = sum(1 for r in results if r['success'])
    obj_passes = sum(1 for r in results if r['objective_pass'])
    
    json_data['models'][model] = {
        'count': len(results),
        'coverage_pct': round(100 * len(results) / 11, 1),
        'latency_ms': {
            'min': min(latencies),
            'max': max(latencies),
            'mean': round(mean(latencies), 1),
            'median': round(median(latencies), 1),
            'stdev': round(stdev(latencies), 1) if len(latencies) > 1 else 0
        },
        'success_rate': round(100 * successes / len(results), 1),
        'objective_pass_rate': round(100 * obj_passes / len(results), 1),
        'prompts_tested': sorted(set(r['prompt_id'] for r in results))
    }

with open(json_file, 'w') as f:
    json.dump(json_data, f, indent=2)

print(f"✓ JSON export: {json_file}")

# Print summary
print("\n=== FINAL BENCHMARK SUMMARY ===\n")
print(f"{'Model':<20} {'Count':<10} {'Coverage':<12} {'Latency (ms)':<20} {'Success':<12} {'ObjPass':<12}")
print("-" * 87)

total = 0
for model in sorted(TARGET_MODELS):
    results = model_data[model]
    if not results:
        print(f"{model:<20} {'0':<10} {'0%':<12} {'-':<20} {'-':<12} {'-':<12}")
        continue
    
    total += len(results)
    latencies = [r['e2e_ms'] for r in results]
    successes = sum(1 for r in results if r['success'])
    obj_passes = sum(1 for r in results if r['objective_pass'])
    
    lat_str = f"{mean(latencies):.0f}±{stdev(latencies):.0f}" if len(latencies) > 1 else f"{latencies[0]:.0f}"
    coverage = f"{100*len(results)/11:.0f}%"
    success_pct = f"{100*successes/len(results):.1f}%"
    objpass_pct = f"{100*obj_passes/len(results):.1f}%"
    
    print(f"{model:<20} {len(results):<10} {coverage:<12} {lat_str:<20} {success_pct:<12} {objpass_pct:<12}")

print(f"\n{'TOTAL':<20} {total:<10} {f'{100*total/55:.1f}%':<12}")

print(f"\n✓ Data export complete - {total}/55 results ({100*total/55:.1f}% coverage)")
