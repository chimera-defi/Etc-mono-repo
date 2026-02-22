#!/usr/bin/env python3 -u
"""
Phase 3C: CPU Utilization Profiling (Simplified)
===============================================

Simple, direct CPU profiling using psutil for accurate measurements.
Tests: qwen2.5:3b, llama3.2:3b, qwen3:4b, phi3:3.8b (5 prompts each)

Metrics:
- Mean CPU usage during inference
- Peak CPU usage during inference
- Per-core saturation (cores > 90%)
- Thermal events

Output: CSV + Markdown report
"""

import json
import subprocess
import time
import csv
import os
import sys
from typing import List, Tuple
from pathlib import Path
from datetime import datetime

try:
    import psutil
except ImportError:
    print("Installing psutil...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "psutil"], check=False)
    import psutil


# Configuration
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


def run_inference_with_profiling(model: str, prompt: str) -> Tuple[float, float, int, List[float], bool]:
    """
    Run inference and profile CPU usage.
    Returns: (duration_ms, mean_cpu_pct, peak_cpu_pct, cores_above_90, per_core_peaks, thermal_event)
    """
    print(f"    Running inference...", end='', flush=True)
    
    # Prepare curl command
    url = f"{OLLAMA_ENDPOINT}/api/generate"
    payload = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": False,
    })
    
    # Start CPU sampling with high frequency
    cpu_samples = []
    per_core_peaks = [0.0] * NUM_CORES
    
    try:
        # Get baseline CPU percent
        psutil.cpu_percent(interval=0.05, percpu=False)
        psutil.cpu_percent(interval=0.05, percpu=True)
        
        start_time = time.time()
        
        # Run inference with curl
        process = subprocess.Popen(
            ["curl", "-s", "-X", "POST", url,
             "-H", "Content-Type: application/json",
             "-d", payload],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Monitor CPU during inference
        while process.poll() is None:
            try:
                # Overall CPU usage
                cpu_pct = psutil.cpu_percent(interval=0.1, percpu=False)
                cpu_samples.append(cpu_pct)
                
                # Per-core usage
                per_core = psutil.cpu_percent(interval=0.01, percpu=True)
                for i, usage in enumerate(per_core):
                    if i < len(per_core_peaks):
                        per_core_peaks[i] = max(per_core_peaks[i], usage)
            except Exception as e:
                print(f"(sample error: {e})", end='', flush=True)
        
        # Get final result
        process.wait(timeout=5)
        duration_ms = (time.time() - start_time) * 1000
        
        # Calculate statistics
        if cpu_samples:
            mean_cpu = sum(cpu_samples) / len(cpu_samples)
            peak_cpu = max(cpu_samples)
        else:
            mean_cpu = 0.0
            peak_cpu = 0.0
        
        cores_above_90 = sum(1 for u in per_core_peaks if u >= 90.0)
        
        # Check thermal throttling
        thermal = check_thermal_throttling()
        
        print(f" OK ({duration_ms:.0f}ms)", flush=True)
        return duration_ms, mean_cpu, peak_cpu, cores_above_90, per_core_peaks, thermal
        
    except Exception as e:
        print(f" ERROR: {e}", flush=True)
        return 0.0, 0.0, 0.0, 0, [0.0] * NUM_CORES, False


def check_thermal_throttling() -> bool:
    """Check for thermal throttling in sysfs."""
    try:
        # Check thermal zones
        for thermal_dir in Path('/sys/class/thermal').glob('thermal_zone*'):
            try:
                with open(thermal_dir / 'temp', 'r') as f:
                    temp_str = f.read().strip()
                    if temp_str:
                        current_temp = int(temp_str)
                        # Check if close to trip point
                        with open(thermal_dir / 'trip_point_0_temp', 'r') as tf:
                            max_temp = int(tf.read().strip())
                        if current_temp > (max_temp * 0.95):
                            return True
            except Exception:
                pass
        
        # Check CPU frequency scaling
        for cpu_dir in Path('/sys/devices/system/cpu').glob('cpu*'):
            try:
                freq_file = cpu_dir / 'cpufreq' / 'scaling_cur_freq'
                max_freq_file = cpu_dir / 'cpufreq' / 'cpuinfo_max_freq'
                if freq_file.exists() and max_freq_file.exists():
                    with open(freq_file, 'r') as f:
                        current_freq = int(f.read().strip())
                    with open(max_freq_file, 'r') as f:
                        max_freq = int(f.read().strip())
                    if current_freq < (max_freq * 0.90):
                        return True
            except Exception:
                pass
    except Exception:
        pass
    
    return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=" * 80)
    print("Phase 3C: CPU Utilization Profiling (Simplified with psutil)")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"System: {NUM_CORES} cores")
    print(f"Endpoint: {OLLAMA_ENDPOINT}")
    print(f"Output dir: {OUTPUT_DIR}")
    print()
    
    results = []
    
    for model_idx, model in enumerate(MODELS, 1):
        print(f"[{model_idx}/{len(MODELS)}] Testing model: {model}")
        
        for prompt_idx, prompt in enumerate(PROMPTS, 1):
            print(f"  [{prompt_idx}/{len(PROMPTS)}] {prompt[:60]}")
            
            duration_ms, mean_cpu, peak_cpu, cores_90, per_core_peaks, thermal = \
                run_inference_with_profiling(model, prompt)
            
            if duration_ms > 0:
                results.append({
                    'model': model,
                    'prompt_idx': prompt_idx,
                    'prompt': prompt,
                    'duration_ms': f"{duration_ms:.0f}",
                    'mean_cpu_pct': f"{mean_cpu:.1f}",
                    'peak_cpu_pct': f"{peak_cpu:.1f}",
                    'cores_above_90': cores_90,
                    'thermal_throttle': thermal,
                    'per_core_peak_min': f"{min(per_core_peaks):.1f}",
                    'per_core_peak_max': f"{max(per_core_peaks):.1f}",
                    'per_core_peak_mean': f"{sum(per_core_peaks)/len(per_core_peaks):.1f}",
                })
            
            time.sleep(0.5)  # Brief cooldown
        
        print()
    
    # Write CSV
    csv_path = Path(OUTPUT_DIR) / "cpu_profile.csv"
    if results:
        with open(csv_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)
        print(f"✓ CSV written to {csv_path}")
    else:
        print("! No results to write")
    
    # Generate report
    generate_report(results, Path(OUTPUT_DIR) / "CPU_PROFILE_REPORT.md")


def generate_report(results: List[dict], report_path: Path):
    """Generate markdown report with analysis."""
    
    # Aggregate by model
    by_model = {}
    for r in results:
        if r['model'] not in by_model:
            by_model[r['model']] = []
        by_model[r['model']].append(r)
    
    report = []
    report.append("# Phase 3C: CPU Utilization Profiling Report")
    report.append(f"\n**Generated:** {datetime.now().isoformat()}")
    report.append(f"**System:** {NUM_CORES} cores")
    report.append(f"**Samples:** {len(results)} inferences")
    report.append("")
    
    # Summary table
    report.append("## Summary by Model\n")
    report.append("| Model | Mean CPU % | Peak CPU % | Cores >90% | Thermal Events |")
    report.append("|-------|-----------|-----------|-----------|---|")
    
    for model in MODELS:
        if model in by_model:
            samples = by_model[model]
            mean_cpus = [float(s['mean_cpu_pct']) for s in samples]
            peak_cpus = [float(s['peak_cpu_pct']) for s in samples]
            cores_90s = [int(s['cores_above_90']) for s in samples]
            thermal_count = sum(1 for s in samples if s['thermal_throttle'])
            
            mean_cpu = sum(mean_cpus) / len(mean_cpus)
            peak_cpu = max(peak_cpus)
            max_cores_90 = max(cores_90s)
            
            report.append(f"| {model} | {mean_cpu:.1f} | {peak_cpu:.1f} | {max_cores_90} | {thermal_count}/{len(samples)} |")
    
    report.append("")
    
    # Per-core analysis
    report.append("## Per-Core Peak Utilization\n")
    for model in MODELS:
        if model in by_model:
            samples = by_model[model]
            per_core_maxes = {}
            for s in samples:
                # Parse per-core data (simplified - would need more parsing)
                pass
            
            max_per_core = [float(s['per_core_peak_max']) for s in samples]
            mean_per_core = [float(s['per_core_peak_mean']) for s in samples]
            
            report.append(f"### {model}")
            report.append(f"  Max per-core peak: {max(max_per_core):.1f}%")
            report.append(f"  Mean per-core utilization: {sum(mean_per_core)/len(mean_per_core):.1f}%\n")
    
    # Bottleneck analysis
    report.append("## Bottleneck Analysis\n")
    all_peak_cpus = [float(r['peak_cpu_pct']) for r in results]
    all_mean_cpus = [float(r['mean_cpu_pct']) for r in results]
    peak_overall = max(all_peak_cpus) if all_peak_cpus else 0
    mean_overall = sum(all_mean_cpus) / len(all_mean_cpus) if all_mean_cpus else 0
    thermal_count = sum(1 for r in results if r['thermal_throttle'])
    saturation_events = sum(1 for r in results if float(r['peak_cpu_pct']) > 85)
    
    report.append(f"**Peak system CPU:** {peak_overall:.1f}%")
    report.append(f"**Mean system CPU:** {mean_overall:.1f}%")
    report.append(f"**High-load events (>85%):** {saturation_events} / {len(results)}")
    report.append(f"**Thermal throttling:** {thermal_count} events")
    report.append("")
    
    if peak_overall > 85:
        report.append("### **Conclusion: CPU IS Likely the Bottleneck**")
        report.append("- Peak CPU utilization >85% indicates high contention")
        if saturation_events > len(results) * 0.3:
            report.append("- Frequent high-load events (>30% of samples)")
        if thermal_count > 0:
            report.append("- Thermal throttling detected (system protecting itself)")
    else:
        report.append("### **Conclusion: CPU NOT the Bottleneck**")
        report.append("- Peak CPU utilization <85% indicates spare capacity")
        report.append("- Consider I/O, memory, or GPU as limiting factor")
    
    report.append("")
    report.append("## Scaling Efficiency")
    report.append("- Observe correlation between model size and CPU utilization")
    report.append("- Linear scaling: CPU-bound work")
    report.append("- Sub-linear: I/O or other bottleneck masking CPU usage")
    
    report_text = '\n'.join(report)
    with open(report_path, 'w') as f:
        f.write(report_text)
    
    print(f"✓ Report written to {report_path}\n")
    print(report_text[:1500])  # Print first part


if __name__ == "__main__":
    main()
