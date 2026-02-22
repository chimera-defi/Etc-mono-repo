#!/usr/bin/env python3
"""Phase 3 Benchmark - Simple Runner.

Compares baseline vs enhanced prompts on 3 fast models.
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

MODELS = ["qwen2.5:3b", "llama3.2:3b", "phi3:3.8b"]
BENCHMARK_DIR = Path(__file__).parent
RUN_DIR = BENCHMARK_DIR / "runs"

def run_test(model, prompt_file, variant, timestamp):
    """Run one benchmark test."""
    run_id = f"phase3_{model.replace(':', '-')}_{variant}_{timestamp}"
    
    print(f"\n  Testing: {model} with {variant} prompts...")
    
    cmd = [
        sys.executable,
        str(BENCHMARK_DIR / "run_bench.py"),
        "--run-id", run_id,
        "--targets", "ollama",
        "--ollama-base", "http://localhost:11434/v1",
        "--ollama-model", model,
        "--prompts", str(BENCHMARK_DIR / prompt_file),
        "--timeout-s", "60"
    ]
    
    result = subprocess.run(cmd, cwd=BENCHMARK_DIR, capture_output=True, text=True, timeout=600)
    
    if result.returncode != 0:
        print(f"    ❌ Failed: {result.stderr[:200]}")
        return None
    
    # Parse results
    summary_file = RUN_DIR / run_id / "summary.json"
    if not summary_file.exists():
        print(f"    ❌ No summary file found")
        return None
    
    try:
        with open(summary_file) as f:
            summary = json.load(f)
        
        return {
            "model": model,
            "variant": variant,
            "run_id": run_id,
            "objective_pass": summary.get("objective_pass_count", 0),
            "total": summary.get("total_prompts", 0),
            "success_rate": summary.get("success_rate", 0),
            "tool_use_success": summary.get("tool_use_success_count", 0),
            "avg_latency": summary.get("avg_latency_ms", 0)
        }
    except Exception as e:
        print(f"    ❌ Parse error: {e}")
        return None

def main():
    print("\n" + "="*70)
    print("PHASE 3: IMPROVED TOOL-USE TESTING")
    print("="*70)
    print("\nHypothesis: Enhanced prompting (few-shot, XML, CoT) improves tool-use")
    print("Models:", ", ".join(MODELS))
    print("Variants: baseline, enhanced")
    print()
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results = []
    
    for model in MODELS:
        print(f"\n{'─'*70}")
        print(f"Model: {model}")
        print(f"{'─'*70}")
        
        # Baseline
        r1 = run_test(model, "prompts_tool_use_v1.json", "baseline", timestamp)
        if r1:
            results.append(r1)
            print(f"    ✅ Baseline: {r1['tool_use_success']}/{r1['total']} tool calls ({r1['success_rate']:.1f}%)")
        
        time.sleep(1)
        
        # Enhanced
        r2 = run_test(model, "prompts_tool_use_enhanced.json", "enhanced", timestamp)
        if r2:
            results.append(r2)
            print(f"    ✅ Enhanced: {r2['tool_use_success']}/{r2['total']} tool calls ({r2['success_rate']:.1f}%)")
            
            if r1 and r2:
                delta = r2['success_rate'] - r1['success_rate']
                pct = (delta / r1['success_rate'] * 100) if r1['success_rate'] > 0 else 0
                arrow = "↑" if delta > 0 else "↓" if delta < 0 else "="
                print(f"    {arrow} Delta: {delta:+.1f}% ({pct:+.1f}% relative)")
        
        time.sleep(2)
    
    # Summary
    print(f"\n\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}\n")
    
    by_model = {}
    for r in results:
        if r['model'] not in by_model:
            by_model[r['model']] = {}
        by_model[r['model']][r['variant']] = r
    
    improvements = []
    for model in MODELS:
        if model in by_model and 'baseline' in by_model[model] and 'enhanced' in by_model[model]:
            b = by_model[model]['baseline']
            e = by_model[model]['enhanced']
            delta = e['success_rate'] - b['success_rate']
            improvements.append({
                'model': model,
                'baseline': b['success_rate'],
                'enhanced': e['success_rate'],
                'delta': delta
            })
    
    if improvements:
        print(f"{'Model':<18} {'Baseline':>10} {'Enhanced':>10} {'Delta':>10}")
        print(f"{'-'*18} {'-'*10} {'-'*10} {'-'*10}")
        
        for imp in improvements:
            print(f"{imp['model']:<18} {imp['baseline']:>9.1f}% {imp['enhanced']:>9.1f}% {imp['delta']:>+9.1f}%")
        
        avg_baseline = sum(i['baseline'] for i in improvements) / len(improvements)
        avg_enhanced = sum(i['enhanced'] for i in improvements) / len(improvements)
        avg_delta = avg_enhanced - avg_baseline
        
        print(f"{'-'*18} {'-'*10} {'-'*10} {'-'*10}")
        print(f"{'AVERAGE':<18} {avg_baseline:>9.1f}% {avg_enhanced:>9.1f}% {avg_delta:>+9.1f}%")
        
        print()
        if avg_delta > 0:
            print(f"✅ RESULT: Enhanced prompting improved tool-use by {avg_delta:+.1f}%")
        else:
            print(f"⚠️  RESULT: No improvement detected (delta: {avg_delta:+.1f}%)")
    
    # Save results
    output = {
        "timestamp": timestamp,
        "results": results,
        "improvements": improvements,
        "hypothesis": "Enhanced prompting (few-shot, XML, CoT) improves tool-use success",
        "tested_variants": [
            "Baseline: Original simple prompts",
            "Enhanced: Few-shot examples + XML structure + step-by-step reasoning + CoT"
        ]
    }
    
    out_file = BENCHMARK_DIR / f"PHASE_3_RESULTS_{timestamp}.json"
    with open(out_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nResults saved to: {out_file}")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    main()
