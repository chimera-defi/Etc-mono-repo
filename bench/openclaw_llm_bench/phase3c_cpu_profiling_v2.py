#!/usr/bin/env python3
"""
Phase 3C: CPU Utilization Profiling v2 (proc/stat-based)
==========================================================

Accurate per-core CPU metrics using /proc/stat for direct measurement.
Tests: qwen2.5:3b, llama3.2:3b, qwen3:4b, phi3:3.8b (5 prompts each)

Metrics:
- Per-core CPU usage via /proc/stat
- Peak CPU % during inference
- Single-core saturation detection (cores > 90%)
- Multi-core efficiency analysis
- Thermal throttling from sysfs

Output: CSV + Markdown report
"""

import json
import subprocess
import time
import threading
import csv
import os
import sys
import re
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path


# Models to profile
MODELS = [
    "qwen2.5:3b",
    "llama3.2:3b",
    "qwen3:4b",
    "phi3:3.8b",
]

# Simple test prompts (5 per model - fast execution)
PROMPTS = [
    "What is 2+2?",
    "Explain machine learning in one sentence.",
    "Who is the first president of the USA?",
    "What is the capital of France?",
    "Describe the water cycle.",
]

OLLAMA_ENDPOINT = "http://localhost:11434"
OUTPUT_DIR = "phase3c_results"


@dataclass
class CPUTicks:
    """Raw CPU ticks from /proc/stat."""
    user: int
    nice: int
    system: int
    idle: int
    iowait: int
    irq: int
    softirq: int
    timestamp: float


@dataclass
class CPUMetrics:
    """Calculated CPU utilization metrics."""
    timestamp: float
    overall_usage: float  # Overall system %
    per_core_usage: List[float]  # % per core
    avg_core_usage: float
    peak_core_usage: float
    cores_above_50: int
    cores_above_80: int
    cores_above_90: int


@dataclass
class InferenceSample:
    """Single inference CPU profile."""
    model: str
    prompt_idx: int
    prompt: str
    duration_ms: float
    mean_cpu_pct: float
    peak_cpu_pct: float
    cores_above_90: int
    thermal_throttle: bool
    per_core_peak: List[float]


class CPUProfiler:
    """Captures CPU metrics before, during, and after inference."""

    def __init__(self):
        self.sampling = False
        self.samples: List[CPUMetrics] = []
        self.num_cores = os.cpu_count() or 4

    def read_proc_stat(self) -> Dict[int, CPUTicks]:
        """Parse /proc/stat and return per-core CPU ticks."""
        try:
            with open('/proc/stat', 'r') as f:
                lines = f.readlines()
            
            cpus = {}
            for line in lines:
                if line.startswith('cpu '):
                    # Overall CPU line
                    parts = line.split()
                    if len(parts) >= 8:
                        cpus[-1] = CPUTicks(
                            user=int(parts[1]),
                            nice=int(parts[2]),
                            system=int(parts[3]),
                            idle=int(parts[4]),
                            iowait=int(parts[5]),
                            irq=int(parts[6]),
                            softirq=int(parts[7]),
                            timestamp=time.time()
                        )
                elif line.startswith('cpu'):
                    # Per-core CPU lines
                    parts = line.split()
                    if len(parts) >= 8:
                        cpu_id = int(parts[0][3:])
                        cpus[cpu_id] = CPUTicks(
                            user=int(parts[1]),
                            nice=int(parts[2]),
                            system=int(parts[3]),
                            idle=int(parts[4]),
                            iowait=int(parts[5]),
                            irq=int(parts[6]),
                            softirq=int(parts[7]),
                            timestamp=time.time()
                        )
            return cpus
        except Exception as e:
            print(f"Error reading /proc/stat: {e}", file=sys.stderr)
            return {}

    def calculate_usage(self, ticks_before: CPUTicks, ticks_after: CPUTicks) -> float:
        """Calculate CPU usage % from tick deltas."""
        total_before = (ticks_before.user + ticks_before.nice + ticks_before.system +
                       ticks_before.idle + ticks_before.iowait + ticks_before.irq +
                       ticks_before.softirq)
        total_after = (ticks_after.user + ticks_after.nice + ticks_after.system +
                      ticks_after.idle + ticks_after.iowait + ticks_after.irq +
                      ticks_after.softirq)
        
        total_diff = total_after - total_before
        idle_diff = ticks_after.idle - ticks_before.idle
        
        if total_diff == 0:
            return 0.0
        
        usage = 100.0 * (1.0 - (idle_diff / total_diff))
        return max(0.0, min(100.0, usage))

    def get_snapshot(self) -> CPUMetrics:
        """Get current CPU metrics snapshot."""
        cpus = self.read_proc_stat()
        
        if -1 in cpus:
            if self._last_overall_ticks is not None:
                overall = self.calculate_usage(self._last_overall_ticks, cpus[-1])
            else:
                overall = 0.0
            self._last_overall_ticks = cpus[-1]
        else:
            overall = 0.0

        per_core = []
        for i in range(self.num_cores):
            if i in cpus:
                if i in self._last_core_ticks:
                    usage = self.calculate_usage(self._last_core_ticks[i], cpus[i])
                else:
                    usage = 0.0
                per_core.append(usage)
                self._last_core_ticks[i] = cpus[i]
            else:
                per_core.append(0.0)

        avg = sum(per_core) / len(per_core) if per_core else overall
        peak = max(per_core) if per_core else overall
        cores_50 = sum(1 for u in per_core if u >= 50.0)
        cores_80 = sum(1 for u in per_core if u >= 80.0)
        cores_90 = sum(1 for u in per_core if u >= 90.0)

        return CPUMetrics(
            timestamp=time.time(),
            overall_usage=overall,
            per_core_usage=per_core,
            avg_core_usage=avg,
            peak_core_usage=peak,
            cores_above_50=cores_50,
            cores_above_80=cores_80,
            cores_above_90=cores_90,
        )

    def start_sampling(self, interval: float = 0.1):
        """Start background CPU sampling."""
        self.sampling = True
        self.samples = []
        self._last_overall_ticks = None
        self._last_core_ticks = {}
        
        # Warm up to get baseline
        time.sleep(0.05)
        _ = self.get_snapshot()
        
        def sample_loop():
            while self.sampling:
                try:
                    metrics = self.get_snapshot()
                    self.samples.append(metrics)
                    time.sleep(interval)
                except Exception as e:
                    print(f"Sampling error: {e}", file=sys.stderr)
                    time.sleep(interval)
        
        self.sampler_thread = threading.Thread(target=sample_loop, daemon=True)
        self.sampler_thread.start()

    def stop_sampling(self) -> Tuple[float, float, int, List[float]]:
        """Stop sampling and return stats: (mean_cpu, peak_cpu, cores_above_90, per_core_peaks)."""
        self.sampling = False
        if self.sampler_thread:
            self.sampler_thread.join(timeout=1.0)
        
        if not self.samples:
            return 0.0, 0.0, 0, [0.0] * self.num_cores
        
        mean_cpu = sum(s.avg_core_usage for s in self.samples) / len(self.samples)
        peak_cpu = max(s.peak_core_usage for s in self.samples)
        cores_90 = max(s.cores_above_90 for s in self.samples)
        
        # Calculate per-core peak utilization
        per_core_peaks = [0.0] * self.num_cores
        for sample in self.samples:
            for i, usage in enumerate(sample.per_core_usage):
                if i < len(per_core_peaks):
                    per_core_peaks[i] = max(per_core_peaks[i], usage)
        
        return mean_cpu, peak_cpu, cores_90, per_core_peaks

    def check_thermal_throttling(self) -> bool:
        """Check for thermal throttling in sysfs."""
        try:
            # Check for throttle events in thermal zone data
            for thermal_dir in Path('/sys/class/thermal').glob('thermal_zone*'):
                try:
                    with open(thermal_dir / 'trip_point_0_temp', 'r') as f:
                        max_temp = int(f.read().strip())
                    with open(thermal_dir / 'temp', 'r') as f:
                        current_temp = int(f.read().strip())
                    
                    # If very close to trip point, likely throttling
                    if current_temp > (max_temp * 0.95):
                        return True
                except Exception:
                    pass
            
            # Check CPU freq scaling for reduced frequency (sign of throttling)
            for cpu_dir in Path('/sys/devices/system/cpu').glob('cpu*'):
                try:
                    freq_file = cpu_dir / 'cpufreq' / 'scaling_cur_freq'
                    if freq_file.exists():
                        with open(freq_file, 'r') as f:
                            current_freq = int(f.read().strip())
                        # Check against max frequency
                        max_freq_file = cpu_dir / 'cpufreq' / 'cpuinfo_max_freq'
                        if max_freq_file.exists():
                            with open(max_freq_file, 'r') as f:
                                max_freq = int(f.read().strip())
                            # If less than 90% of max, possibly throttled
                            if current_freq < (max_freq * 0.9):
                                return True
                except Exception:
                    pass
        except Exception:
            pass
        
        return False


def run_inference(model: str, prompt: str, endpoint: str) -> Tuple[float, bool]:
    """Run single inference and return duration in ms, success flag."""
    try:
        url = f"{endpoint}/api/generate"
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
        }
        
        start = time.time()
        response = subprocess.run(
            ["curl", "-s", "-X", "POST", url, 
             "-H", "Content-Type: application/json",
             "-d", json.dumps(payload)],
            capture_output=True,
            text=True,
            timeout=300
        )
        duration = (time.time() - start) * 1000
        
        success = response.returncode == 0
        return duration, success
    except Exception as e:
        print(f"Inference error: {e}", file=sys.stderr)
        return 0.0, False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"================================================================================")
    print(f"Phase 3C: CPU Utilization Profiling (v2 - /proc/stat based)")
    print(f"================================================================================")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"System: {os.cpu_count()} cores")
    print(f"Endpoint: {OLLAMA_ENDPOINT}")
    print(f"Output dir: {OUTPUT_DIR}")
    print()
    
    profiler = CPUProfiler()
    results: List[InferenceSample] = []
    
    for model in MODELS:
        print(f"Testing model: {model}")
        
        for prompt_idx, prompt in enumerate(PROMPTS, 1):
            print(f"  [{model}] Prompt {prompt_idx}/{len(PROMPTS)}: {prompt[:50]}...")
            
            # Start CPU sampling
            profiler.start_sampling(interval=0.1)
            
            # Run inference
            start_time = time.time()
            duration_ms, success = run_inference(model, prompt, OLLAMA_ENDPOINT)
            
            # Stop sampling and collect metrics
            mean_cpu, peak_cpu, cores_90, per_core_peaks = profiler.stop_sampling()
            
            # Check thermal throttling
            thermal = profiler.check_thermal_throttling()
            
            if success:
                result = InferenceSample(
                    model=model,
                    prompt_idx=prompt_idx,
                    prompt=prompt,
                    duration_ms=duration_ms,
                    mean_cpu_pct=mean_cpu,
                    peak_cpu_pct=peak_cpu,
                    cores_above_90=cores_90,
                    thermal_throttle=thermal,
                    per_core_peak=per_core_peaks,
                )
                results.append(result)
                print(f"    Duration: {duration_ms:.0f}ms | Mean CPU: {mean_cpu:.1f}% | Peak CPU: {peak_cpu:.1f}% | Thermal: {thermal}")
            else:
                print(f"    FAILED to run inference")
            
            time.sleep(0.5)  # Brief cooldown
    
    # Write CSV
    csv_path = Path(OUTPUT_DIR) / "cpu_profile.csv"
    with open(csv_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'model', 'prompt_id', 'prompt', 'duration_ms', 'mean_cpu_pct',
            'peak_cpu_pct', 'cores_above_90', 'thermal_throttle',
            'per_core_peak_min', 'per_core_peak_max', 'per_core_peak_mean'
        ])
        writer.writeheader()
        for r in results:
            per_core_peaks = r.per_core_peak
            writer.writerow({
                'model': r.model,
                'prompt_id': r.prompt_idx,
                'prompt': r.prompt,
                'duration_ms': f"{r.duration_ms:.0f}",
                'mean_cpu_pct': f"{r.mean_cpu_pct:.1f}",
                'peak_cpu_pct': f"{r.peak_cpu_pct:.1f}",
                'cores_above_90': r.cores_above_90,
                'thermal_throttle': r.thermal_throttle,
                'per_core_peak_min': f"{min(per_core_peaks):.1f}",
                'per_core_peak_max': f"{max(per_core_peaks):.1f}",
                'per_core_peak_mean': f"{sum(per_core_peaks)/len(per_core_peaks):.1f}",
            })
    
    print(f"\n✓ CSV written to {csv_path}")
    
    # Generate markdown report
    generate_report(results, Path(OUTPUT_DIR) / "CPU_PROFILE_REPORT.md")


def generate_report(results: List[InferenceSample], report_path: Path):
    """Generate markdown report with analysis."""
    
    # Aggregate by model
    by_model = {}
    for r in results:
        if r.model not in by_model:
            by_model[r.model] = []
        by_model[r.model].append(r)
    
    report = []
    report.append("# Phase 3C: CPU Utilization Profiling Report")
    report.append(f"\n**Generated:** {datetime.now().isoformat()}")
    report.append(f"**System:** {os.cpu_count()} cores")
    report.append(f"**Samples:** {len(results)} inferences across {len(MODELS)} models")
    report.append("")
    
    # Summary table
    report.append("## Summary by Model\n")
    report.append("| Model | Mean CPU % | Peak CPU % | Cores >90% | Thermal Events |")
    report.append("|-------|-----------|-----------|-----------|---|")
    
    for model in MODELS:
        if model in by_model:
            samples = by_model[model]
            mean_cpu = sum(s.mean_cpu_pct for s in samples) / len(samples)
            peak_cpu = max(s.peak_cpu_pct for s in samples)
            cores_90 = max(s.cores_above_90 for s in samples)
            thermal_count = sum(1 for s in samples if s.thermal_throttle)
            
            report.append(f"| {model} | {mean_cpu:.1f} | {peak_cpu:.1f} | {cores_90} | {thermal_count}/{len(samples)} |")
    
    report.append("")
    
    # Per-core utilization analysis
    report.append("## Per-Core Peak Utilization\n")
    for model in MODELS:
        if model in by_model:
            samples = by_model[model]
            all_per_core_peaks = {}
            for s in samples:
                for core_idx, usage in enumerate(s.per_core_peak):
                    if core_idx not in all_per_core_peaks:
                        all_per_core_peaks[core_idx] = []
                    all_per_core_peaks[core_idx].append(usage)
            
            if all_per_core_peaks:
                report.append(f"### {model}\n")
                core_avgs = []
                for core_idx in sorted(all_per_core_peaks.keys()):
                    usages = all_per_core_peaks[core_idx]
                    avg = sum(usages) / len(usages)
                    core_avgs.append(avg)
                    report.append(f"  Core {core_idx}: {avg:.1f}% (max: {max(usages):.1f}%)")
                
                imbalance = max(core_avgs) - min(core_avgs) if core_avgs else 0
                report.append(f"  Load imbalance: {imbalance:.1f}% (max - min)\n")
    
    # Thermal throttling summary
    thermal_samples = [r for r in results if r.thermal_throttle]
    if thermal_samples:
        report.append("## Thermal Throttling Events\n")
        report.append(f"**Total events:** {len(thermal_samples)} / {len(results)}")
        for r in thermal_samples:
            report.append(f"  - {r.model}: prompt {r.prompt_idx} (peak CPU: {r.peak_cpu_pct:.1f}%)")
        report.append("")
    
    # Bottleneck analysis
    report.append("## Bottleneck Analysis\n")
    peak_overall = max((r.peak_cpu_pct for r in results), default=0)
    saturation_events = sum(1 for r in results if r.peak_cpu_pct > 85)
    
    report.append(f"**Peak system CPU:** {peak_overall:.1f}%")
    report.append(f"**High-load events (>85%):** {saturation_events} / {len(results)}")
    report.append(f"**Thermal throttling:** {len(thermal_samples)} events")
    report.append("")
    
    if peak_overall > 85:
        report.append("### Conclusion: CPU IS Likely the Bottleneck")
        report.append("- Peak CPU utilization >85% indicates high contention")
        if saturation_events > len(results) * 0.3:
            report.append("- Frequent high-load events (>30% of samples)")
        if thermal_samples:
            report.append("- Thermal throttling detected (system protecting itself)")
    else:
        report.append("### Conclusion: CPU NOT the Bottleneck")
        report.append("- Peak CPU utilization <85% indicates spare capacity")
        report.append("- Consider I/O, memory, or GPU as limiting factor")
    
    report.append("")
    report.append(f"**Scaling efficiency:** Observe correlation between model size and CPU utilization")
    report.append("  - Linear scaling: CPU-bound work")
    report.append("  - Sub-linear: I/O or other bottleneck masking CPU usage")
    
    with open(report_path, 'w') as f:
        f.write('\n'.join(report))
    
    print(f"✓ Report written to {report_path}")
    print("\n" + '\n'.join(report[:30]))  # Print first 30 lines


if __name__ == "__main__":
    main()
