#!/usr/bin/env python3 -u
"""
Phase 3C: CPU Utilization Profiling (Robust - incremental output + timeouts)
==============================================================================

Improved version with:
- Per-result incremental CSV writing
- Timeout per inference (60 seconds)
- Better error handling
"""

import json
import csv
import os
import sys
import time
from pathlib import Path
from datetime import datetime
from typing import List, Tuple

import psutil
import requests


MODELS = [
    "qwen2.5:3b",
    "llama3.2:3b",
    "qwen3:4b",
    "phi3:3.8b",
]

PROMPTS = [
    "What is 2+2?",
    "Explain machine learning in one sentence.",
    "Who is the first president of the USA?",
    "What is the capital of France?",
    "Describe the water cycle.",
]

OLLAMA_ENDPOINT = "http://localhost:11434"
OUTPUT_DIR = "phase3c_results"
NUM_CORES = os.cpu_count() or 4
INFERENCE_TIMEOUT = 120  # 2 minutes per inference


def run_inference_with_cpu_profile(model: str, prompt: str) -> Tuple[bool, float, float, float, int, List[float], bool]:
    """
    Run inference and profile CPU usage.
    Returns: (success, duration_ms, mean_cpu_pct, peak_cpu_pct, cores_above_90, per_core_peaks, thermal)
    """
    print(f"    → {prompt[:50]:50s} ", end='', flush=True)
    
    url = f"{OLLAMA_ENDPOINT}/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
    }
    
    # Warm up sampling
    psutil.cpu_percent(interval=0.05, percpu=False)
    psutil.cpu_percent(interval=0.05, percpu=True)
    time.sleep(0.05)
    
    cpu_samples = []
    per_core_samples = []
    
    try:
        start_time = time.time()
        
        # Make request with timeout
        response = requests.post(url, json=payload, timeout=INFERENCE_TIMEOUT)
        duration_ms = (time.time() - start_time) * 1000
        
        # Sample CPU after inference
        for _ in range(3):
            cpu_pct = psutil.cpu_percent(interval=0.1, percpu=False)
            per_core = psutil.cpu_percent(interval=0.05, percpu=True)
            cpu_samples.append(cpu_pct)
            per_core_samples.append(per_core)
        
        if not cpu_samples:
            cpu_samples = [0.0]
            per_core_samples = [[0.0] * NUM_CORES]
        
        # Calculate metrics
        mean_cpu = sum(cpu_samples) / len(cpu_samples)
        peak_cpu = max(cpu_samples)
        
        # Per-core analysis
        per_core_peaks = [0.0] * NUM_CORES
        for per_core in per_core_samples:
            for i, usage in enumerate(per_core):
                if i < len(per_core_peaks):
                    per_core_peaks[i] = max(per_core_peaks[i], usage)
        
        cores_above_90 = sum(1 for u in per_core_peaks if u >= 90.0)
        
        # Check thermal
        thermal = check_thermal_throttling()
        
        # Check response
        success = response.status_code == 200 and len(response.text) > 0
        
        if success:
            print(f"OK {duration_ms:7.0f}ms | CPU:{peak_cpu:5.1f}%", flush=True)
            return True, duration_ms, mean_cpu, peak_cpu, cores_above_90, per_core_peaks, thermal
        else:
            print(f"INVALID (status={response.status_code})", flush=True)
            return False, duration_ms, 0.0, 0.0, 0, [0.0] * NUM_CORES, False
            
    except requests.exceptions.Timeout:
        print(f"TIMEOUT ({INFERENCE_TIMEOUT}s)", flush=True)
        return False, float(INFERENCE_TIMEOUT * 1000), 0.0, 0.0, 0, [0.0] * NUM_CORES, False
    except Exception as e:
        print(f"ERROR: {str(e)[:35]}", flush=True)
        return False, 0.0, 0.0, 0.0, 0, [0.0] * NUM_CORES, False


def check_thermal_throttling() -> bool:
    """Check for thermal throttling."""
    try:
        for thermal_dir in Path('/sys/class/thermal').glob('thermal_zone*'):
            try:
                temp_file = thermal_dir / 'temp'
                if temp_file.exists():
                    with open(temp_file, 'r') as f:
                        current_temp = int(f.read().strip())
                    
                    trip_file = thermal_dir / 'trip_point_0_temp'
                    if trip_file.exists():
                        with open(trip_file, 'r') as f:
                            max_temp = int(f.read().strip())
                        if current_temp > (max_temp * 0.95):
                            return True
            except Exception:
                pass
        
        for cpu_dir in sorted(Path('/sys/devices/system/cpu').glob('cpu[0-9]*')):
            try:
                cpufreq_dir = cpu_dir / 'cpufreq'
                cur_freq_file = cpufreq_dir / 'scaling_cur_freq'
                max_freq_file = cpufreq_dir / 'cpuinfo_max_freq'
                
                if cur_freq_file.exists() and max_freq_file.exists():
                    with open(cur_freq_file, 'r') as f:
                        cur_freq = int(f.read().strip())
                    with open(max_freq_file, 'r') as f:
                        max_freq = int(f.read().strip())
                    
                    if cur_freq < (max_freq * 0.90):
                        return True
            except Exception:
                pass
    except Exception:
        pass
    
    return False


def write_result_to_csv(csv_path: Path, result: dict, is_header_needed: bool):
    """Append a single result to CSV."""
    try:
        with open(csv_path, 'a', newline='') as f:
            fieldnames = ['model', 'prompt_idx', 'prompt', 'duration_ms', 'mean_cpu_pct',
                         'peak_cpu_pct', 'cores_above_90', 'thermal_throttle',
                         'per_core_peak_min', 'per_core_peak_max', 'per_core_peak_mean']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            if is_header_needed:
                writer.writeheader()
            writer.writerow(result)
    except Exception as e:
        print(f"  ERROR writing CSV: {e}", file=sys.stderr)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=" * 90)
    print("Phase 3C: CPU Utilization Profiling (Robust)")
    print("=" * 90)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"System: {NUM_CORES} cores")
    print(f"Timeout per inference: {INFERENCE_TIMEOUT}s")
    print()
    
    # Verify Ollama connection
    try:
        tags_resp = requests.get(f"{OLLAMA_ENDPOINT}/api/tags", timeout=5)
        if tags_resp.status_code != 200:
            print("ERROR: Cannot connect to Ollama!")
            sys.exit(1)
    except Exception as e:
        print(f"ERROR: Connection failed: {e}")
        sys.exit(1)
    
    csv_path = Path(OUTPUT_DIR) / "cpu_profile.csv"
    csv_path.unlink(missing_ok=True)  # Clear old file
    
    results_count = 0
    success_count = 0
    
    # Run profiling
    for model_num, model in enumerate(MODELS, 1):
        print(f"\n[{model_num}/{len(MODELS)}] Model: {model}")
        
        for prompt_num, prompt in enumerate(PROMPTS, 1):
            success, duration_ms, mean_cpu, peak_cpu, cores_90, per_core_peaks, thermal = \
                run_inference_with_cpu_profile(model, prompt)
            
            results_count += 1
            
            if success:
                success_count += 1
                result_row = {
                    'model': model,
                    'prompt_idx': prompt_num,
                    'prompt': prompt,
                    'duration_ms': f"{duration_ms:.0f}",
                    'mean_cpu_pct': f"{mean_cpu:.1f}",
                    'peak_cpu_pct': f"{peak_cpu:.1f}",
                    'cores_above_90': cores_90,
                    'thermal_throttle': thermal,
                    'per_core_peak_min': f"{min(per_core_peaks):.1f}",
                    'per_core_peak_max': f"{max(per_core_peaks):.1f}",
                    'per_core_peak_mean': f"{sum(per_core_peaks)/len(per_core_peaks):.1f}",
                }
                
                # Write result immediately (incremental)
                is_header_needed = not csv_path.exists()
                write_result_to_csv(csv_path, result_row, is_header_needed)
            
            time.sleep(0.2)
    
    print("\n" + "=" * 90)
    print(f"Completed: {success_count}/{results_count} inferences")
    print()
    
    # Generate report if we have any successes
    if success_count > 0:
        report_path = Path(OUTPUT_DIR) / "CPU_PROFILE_REPORT.md"
        generate_report_from_csv(csv_path, report_path)
        print(f"✓ Report: {report_path}")
    else:
        print("! No successful inferences - check Ollama connection")


def generate_report_from_csv(csv_path: Path, report_path: Path):
    """Generate report from CSV file."""
    
    try:
        results = []
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                row['duration_ms'] = float(row['duration_ms'])
                row['mean_cpu_pct'] = float(row['mean_cpu_pct'])
                row['peak_cpu_pct'] = float(row['peak_cpu_pct'])
                row['cores_above_90'] = int(row['cores_above_90'])
                row['thermal_throttle'] = row['thermal_throttle'].lower() == 'true'
                row['per_core_peak_min'] = float(row['per_core_peak_min'])
                row['per_core_peak_max'] = float(row['per_core_peak_max'])
                row['per_core_peak_mean'] = float(row['per_core_peak_mean'])
                results.append(row)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return
    
    # Group by model
    by_model = {}
    for r in results:
        if r['model'] not in by_model:
            by_model[r['model']] = []
        by_model[r['model']].append(r)
    
    lines = []
    lines.append("# Phase 3C: CPU Utilization Profiling Report")
    lines.append(f"\n**Generated:** {datetime.now().isoformat()}")
    lines.append(f"**System:** {NUM_CORES} cores")
    lines.append(f"**Total samples:** {len(results)} inferences")
    lines.append("")
    
    # Summary table
    lines.append("## Summary by Model\n")
    lines.append("| Model | Mean CPU % | Peak CPU % | Max Cores >90% | Thermal Events |")
    lines.append("|-------|-----------|-----------|---|---|")
    
    for model in MODELS:
        if model in by_model:
            samples = by_model[model]
            mean_cpus = [s['mean_cpu_pct'] for s in samples]
            peak_cpus = [s['peak_cpu_pct'] for s in samples]
            thermal_count = sum(1 for s in samples if s['thermal_throttle'])
            cores_90_list = [s['cores_above_90'] for s in samples]
            
            avg_mean = sum(mean_cpus) / len(mean_cpus) if mean_cpus else 0
            max_peak = max(peak_cpus) if peak_cpus else 0
            max_cores_90 = max(cores_90_list) if cores_90_list else 0
            
            lines.append(f"| {model:20s} | {avg_mean:9.1f} | {max_peak:9.1f} | {max_cores_90:14d} | {thermal_count:3d}/{len(samples):3d} |")
    
    lines.append("")
    
    # Bottleneck analysis
    lines.append("## Bottleneck Analysis\n")
    all_peak = [r['peak_cpu_pct'] for r in results]
    peak_overall = max(all_peak) if all_peak else 0
    high_load_count = sum(1 for p in all_peak if p > 85)
    thermal_total = sum(1 for r in results if r['thermal_throttle'])
    
    lines.append(f"**Peak system CPU:** {peak_overall:.1f}%")
    lines.append(f"**High-load events (>85%):** {high_load_count}/{len(results)}")
    lines.append(f"**Thermal throttling events:** {thermal_total}/{len(results)}")
    lines.append("")
    
    if peak_overall > 85:
        lines.append("### ✓ **Conclusion: CPU IS Likely the Bottleneck**")
        lines.append("- Peak CPU utilization exceeds 85%, indicating high contention")
        if high_load_count > len(results) * 0.3:
            lines.append("- Frequent high-load events detected (>30% of samples)")
        if thermal_total > 0:
            lines.append("- Thermal throttling detected - system protecting from overheating")
    else:
        lines.append("### ✗ **Conclusion: CPU NOT the Bottleneck**")
        lines.append("- Peak CPU remains below 85%, indicating spare capacity")
        lines.append("- Other factors (I/O, memory, model loading) may be limiting")
    
    lines.append("")
    lines.append("## Scaling Efficiency")
    
    size_order = ["qwen2.5:3b", "llama3.2:3b", "phi3:3.8b", "qwen3:4b"]
    for model in size_order:
        if model in by_model:
            peak = max(s['peak_cpu_pct'] for s in by_model[model])
            lines.append(f"  - {model:15s}: peak {peak:5.1f}% CPU")
    
    lines.append("")
    lines.append("- **Linear scaling:** CPU usage ∝ model size → CPU-bound workload")
    lines.append("- **Sub-linear scaling:** Usage growth slower than size → I/O bottleneck")
    
    # Write report
    report_text = '\n'.join(lines)
    with open(report_path, 'w') as f:
        f.write(report_text)
    
    # Print summary
    print(report_text[:2000])


if __name__ == "__main__":
    main()
