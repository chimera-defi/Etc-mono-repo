#!/usr/bin/env python3
"""Phase 3 Benchmark: Improved Tool-Use Testing with Better Prompting.

Tests baseline vs enhanced prompts (few-shot, XML, CoT) on 3 local models:
- qwen2.5:3b
- llama3.2:3b
- phi3:3.8b

Creates two test suites and measures success rate improvement.
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# Configuration
MODELS_TO_TEST = [
    "qwen2.5:3b",
    "llama3.2:3b", 
    "phi3:3.8b"
]

PROMPT_VARIANTS = [
    ("baseline", "prompts_tool_use_v1.json"),
    ("enhanced", "prompts_tool_use_enhanced.json")
]

OLLAMA_BASE = "http://localhost:11434/v1"
BENCHMARK_DIR = Path(__file__).parent
RUN_DIR = BENCHMARK_DIR / "runs"


def run_ollama_benchmark(model: str, prompt_file: str, variant: str, run_id: str) -> dict:
    """Run benchmark against Ollama model with given prompts."""
    cmd = [
        "python3",
        str(BENCHMARK_DIR / "run_bench.py"),
        "--run-id", run_id,
        "--targets", "ollama",
        "--ollama-model", model,
        "--timeout-s", "120"
    ]
    
    # Override prompts
    env = os.environ.copy()
    env["TOOL_USE_PROMPTS"] = str(BENCHMARK_DIR / prompt_file)
    
    print(f"  Running: {' '.join(cmd)}", file=sys.stderr)
    result = subprocess.run(cmd, cwd=BENCHMARK_DIR, env=env, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"  ❌ Failed: {result.stderr}", file=sys.stderr)
        return {"status": "failed", "error": result.stderr}
    
    # Parse results
    results_file = RUN_DIR / run_id / "results.jsonl"
    summary_file = RUN_DIR / run_id / "summary.json"
    
    if not results_file.exists() or not summary_file.exists():
        return {"status": "failed", "error": "Results files not found"}
    
    with open(summary_file) as f:
        summary = json.load(f)
    
    # Count successful tool invocations
    success_count = 0
    total_count = 0
    failures = []
    
    with open(results_file) as f:
        for line in f:
            result_obj = json.loads(line)
            total_count += 1
            
            # Check if tool was invoked correctly
            if result_obj.get("tool_invoked"):
                success_count += 1
            else:
                failures.append({
                    "prompt_id": result_obj.get("prompt_id"),
                    "status": result_obj.get("status"),
                    "error": result_obj.get("error")
                })
    
    success_rate = (success_count / total_count * 100) if total_count > 0 else 0
    
    return {
        "status": "success",
        "model": model,
        "variant": variant,
        "prompt_file": prompt_file,
        "run_id": run_id,
        "success_count": success_count,
        "total_count": total_count,
        "success_rate": round(success_rate, 1),
        "failures": failures,
        "summary": {
            "avg_latency_ms": summary.get("avg_latency_ms"),
            "p95_latency_ms": summary.get("p95_latency_ms"),
            "completion_time_s": summary.get("completion_time_s")
        }
    }


def main():
    """Main benchmark coordinator."""
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    phase3_run_id = f"phase3_tool_use_improved_{timestamp}"
    
    print(f"\n{'='*70}")
    print(f"PHASE 3: IMPROVED TOOL-USE TESTING WITH BETTER PROMPTING")
    print(f"{'='*70}")
    print(f"Run ID: {phase3_run_id}")
    print(f"Timestamp: {timestamp}")
    print(f"\nModels: {', '.join(MODELS_TO_TEST)}")
    print(f"Variants: {', '.join([v[0] for v in PROMPT_VARIANTS])}")
    print(f"\nExpected tests: {len(MODELS_TO_TEST)} models × {len(PROMPT_VARIANTS)} variants = {len(MODELS_TO_TEST) * len(PROMPT_VARIANTS)} benchmark runs")
    print(f"{'='*70}\n")
    
    # Check if Ollama is available
    try:
        result = subprocess.run(
            ["curl", "-s", f"{OLLAMA_BASE}/models"],
            capture_output=True,
            timeout=5
        )
        if result.returncode != 0:
            print("❌ Ollama endpoint not available at", OLLAMA_BASE)
            sys.exit(1)
    except Exception as e:
        print(f"❌ Cannot reach Ollama: {e}")
        sys.exit(1)
    
    print("✅ Ollama endpoint is available\n")
    
    # Run all combinations
    all_results = []
    
    for model in MODELS_TO_TEST:
        print(f"\n{'─'*70}")
        print(f"Testing Model: {model}")
        print(f"{'─'*70}")
        
        for variant_name, prompt_file in PROMPT_VARIANTS:
            run_id = f"{phase3_run_id}_{model.replace(':', '-')}_{variant_name}"
            
            print(f"\n  Variant: {variant_name}")
            print(f"  Prompts: {prompt_file}")
            print(f"  Run ID: {run_id}")
            
            start = time.time()
            result = run_ollama_benchmark(model, prompt_file, variant_name, run_id)
            elapsed = time.time() - start
            
            if result["status"] == "success":
                print(f"  ✅ Success!")
                print(f"     Success rate: {result['success_rate']}% ({result['success_count']}/{result['total_count']})")
                print(f"     Avg latency: {result['summary'].get('avg_latency_ms')}ms")
                print(f"     Time: {elapsed:.1f}s")
            else:
                print(f"  ❌ Failed: {result.get('error')}")
            
            all_results.append(result)
            time.sleep(2)  # Brief pause between runs
    
    # Generate comparison report
    print(f"\n\n{'='*70}")
    print("PHASE 3 RESULTS SUMMARY")
    print(f"{'='*70}\n")
    
    # Group results by model
    by_model = {}
    for r in all_results:
        if r["status"] == "success":
            model = r["model"]
            if model not in by_model:
                by_model[model] = {}
            by_model[model][r["variant"]] = r
    
    improvements = []
    
    for model in MODELS_TO_TEST:
        if model in by_model and "baseline" in by_model[model] and "enhanced" in by_model[model]:
            baseline = by_model[model]["baseline"]
            enhanced = by_model[model]["enhanced"]
            
            baseline_rate = baseline["success_rate"]
            enhanced_rate = enhanced["success_rate"]
            delta = enhanced_rate - baseline_rate
            
            improvements.append({
                "model": model,
                "baseline": baseline_rate,
                "enhanced": enhanced_rate,
                "delta": delta,
                "delta_pct": round((delta / baseline_rate * 100) if baseline_rate > 0 else 0, 1)
            })
            
            print(f"Model: {model}")
            print(f"  Baseline: {baseline_rate}% ({baseline['success_count']}/{baseline['total_count']})")
            print(f"  Enhanced: {enhanced_rate}% ({enhanced['success_count']}/{enhanced['total_count']})")
            print(f"  Delta:    {delta:+.1f}% ({delta/enhanced_rate*100 if enhanced_rate > 0 else 0:+.1f}% relative)")
            print()
    
    # Summary table
    print(f"\n{'─'*70}")
    print("IMPROVEMENT SUMMARY (Baseline → Enhanced)")
    print(f"{'─'*70}")
    print(f"{'Model':<20} {'Baseline':>12} {'Enhanced':>12} {'Delta':>12}")
    print(f"{'-'*20} {'-'*12} {'-'*12} {'-'*12}")
    
    for imp in improvements:
        print(f"{imp['model']:<20} {imp['baseline']:>11.1f}% {imp['enhanced']:>11.1f}% {imp['delta']:>+11.1f}%")
    
    # Write results
    results_output = {
        "run_id": phase3_run_id,
        "timestamp": timestamp,
        "models": MODELS_TO_TEST,
        "variants": [v[0] for v in PROMPT_VARIANTS],
        "all_results": all_results,
        "improvements": improvements,
        "hypothesis": "Prompting improvements (few-shot, XML, CoT) can improve local model tool-use success",
        "tested_improvements": [
            "Few-shot examples (2-3 correct invocations before actual prompt)",
            "XML structure for tool definitions",
            "Step-by-step reasoning requirements",
            "Chain-of-thought prompting"
        ]
    }
    
    # Save JSON results
    output_file = BENCHMARK_DIR / f"PHASE_3_RESULTS_{timestamp}.json"
    with open(output_file, "w") as f:
        json.dump(results_output, f, indent=2)
    
    print(f"\n✅ Results saved to: {output_file}")
    print(f"\n{'='*70}\n")
    
    # Print final verdict
    avg_baseline = sum(i["baseline"] for i in improvements) / len(improvements) if improvements else 0
    avg_enhanced = sum(i["enhanced"] for i in improvements) / len(improvements) if improvements else 0
    avg_delta = avg_enhanced - avg_baseline
    
    print(f"HYPOTHESIS TEST RESULT:")
    print(f"  Average baseline success rate: {avg_baseline:.1f}%")
    print(f"  Average enhanced success rate: {avg_enhanced:.1f}%")
    print(f"  Average improvement: {avg_delta:+.1f}%")
    
    if avg_delta > 0:
        print(f"\n  ✅ HYPOTHESIS SUPPORTED: Enhanced prompting improves tool-use success!")
    elif avg_delta == 0:
        print(f"\n  ⚠️  INCONCLUSIVE: No measurable improvement detected")
    else:
        print(f"\n  ❌ HYPOTHESIS CONTRADICTED: Enhanced prompting decreased success rate")
    
    print(f"\n{'='*70}\n")


if __name__ == "__main__":
    main()
