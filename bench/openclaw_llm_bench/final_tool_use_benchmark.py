#!/usr/bin/env python3
"""Final optimized tool-use benchmark."""

import json
import urllib.request
import time
import sys

BASE_URL = "http://localhost:11434/api/generate"

# 6 standard tool-use prompts (from original set, simplified)
PROMPTS = [
    ("E0", "free -h command", "Invoke this tool: <tool_invocation><tool>exec</tool><command>free -h</command></tool_invocation>"),
    ("E1", "du -sh command", "Invoke this tool: <tool_invocation><tool>exec</tool><command>du -sh ~</command></tool_invocation>"),
    ("E2", "ps aux command", "Invoke this tool: <tool_invocation><tool>exec</tool><command>ps aux</command></tool_invocation>"),
    ("E3", "grep command", "Invoke this tool: <tool_invocation><tool>exec</tool><command>grep openssh /etc</command></tool_invocation>"),
    ("E4", "ping command", "Invoke this tool: <tool_invocation><tool>exec</tool><command>ping -c 3 google.com</command></tool_invocation>"),
    ("E5", "date command", "Invoke this tool: <tool_invocation><tool>exec</tool><command>date</command></tool_invocation>"),
]

MODELS = ["mistral:7b", "qwen3:8b", "qwen2.5:14b", "glm-4.7-flash:latest"]

def test_model_with_prompt(model, prompt_id, desc, prompt, timeout=60):
    """Test single combination. Returns (latency_ms, success)."""
    try:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "temperature": 0.1,
        }
        
        start = time.perf_counter()
        req = urllib.request.Request(
            BASE_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            response = json.loads(resp.read().decode('utf-8')).get("response", "")
            elapsed = (time.perf_counter() - start) * 1000
            
            # Simple tool detection: must have both opening and closing tags
            success = "<tool_invocation>" in response and "</tool_invocation>" in response
            return elapsed, success
    except urllib.error.URLError:
        return -1, False
    except Exception as e:
        return -1, False

def main():
    print("\n" + "="*80)
    print("FINAL TOOL-USE BENCHMARK: 7B+ Model Comparison")
    print("="*80)
    print(f"Baseline (qwen2.5:3b): 16.7%")
    print(f"Test matrix: {len(MODELS)} models × {len(PROMPTS)} prompts = {len(MODELS)*len(PROMPTS)} total tests")
    print("="*80 + "\n")
    
    model_stats = {}
    
    for model in MODELS:
        print(f"\n[{model}]")
        print("-" * 80)
        
        successes = 0
        valid_latencies = []
        
        for prompt_id, desc, prompt_text in PROMPTS:
            sys.stdout.write(f"  {prompt_id} {desc:20s} ... ")
            sys.stdout.flush()
            
            latency, success = test_model_with_prompt(model, prompt_id, desc, prompt_text, timeout=60)
            
            if latency > 0:
                print(f"{'✓' if success else '✗'} {latency:7.0f}ms")
                if success:
                    successes += 1
                valid_latencies.append(latency)
            else:
                print("✗ TIMEOUT/ERROR")
            
            time.sleep(0.3)  # Small pause between requests
        
        success_rate = (successes / len(PROMPTS)) * 100 if PROMPTS else 0
        avg_latency = sum(valid_latencies) / len(valid_latencies) if valid_latencies else 0
        
        model_stats[model] = {
            "successes": successes,
            "total_prompts": len(PROMPTS),
            "success_rate": success_rate,
            "avg_latency_ms": avg_latency,
            "valid_tests": len(valid_latencies)
        }
        
        print(f"\n  → {successes}/{len(PROMPTS)} successful = {success_rate:.1f}% (avg latency: {avg_latency:.0f}ms)")
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    print("\n| Model | Success % | vs 3B Baseline | Avg Latency (ms) |")
    print("|-------|-----------|----------------|------------------|")
    
    best_success = 0
    best_model = None
    
    for model in MODELS:
        stats = model_stats[model]
        pct = stats["success_rate"]
        delta = pct - 16.7
        delta_str = f"{delta:+.1f}%" if delta != 0 else "0.0%"
        
        print(f"| {model:25s} | {pct:8.1f}% | {delta_str:14s} | {stats['avg_latency_ms']:16.0f} |")
        
        if pct > best_success:
            best_success = pct
            best_model = model
    
    # Hypothesis
    print("\n" + "="*80)
    print("ANALYSIS & CONCLUSION")
    print("="*80)
    print(f"\nBest performing model: {best_model} at {best_success:.1f}% success rate")
    print(f"Improvement over 3B baseline: {best_success - 16.7:.1f} percentage points")
    
    if best_success > 30:
        print("\n✓ HYPOTHESIS SUPPORTED: Larger models (7B+) DO improve tool-use detection")
        print("  Evidence: >30% success rate achieved")
    elif best_success >= 20:
        print("\n⚠ MIXED RESULTS: Marginal improvement over baseline")
        print(f"  Evidence: {best_success:.1f}% vs 16.7% baseline (~{((best_success/16.7)-1)*100:.0f}% relative improvement)")
    else:
        print("\n✗ HYPOTHESIS NOT SUPPORTED: Tool-use remains fundamentally difficult")
        print(f"  Evidence: Best rate {best_success:.1f}% shows no meaningful improvement over 16.7%")
    
    print("\nFull model performance:")
    for model in MODELS:
        stats = model_stats[model]
        print(f"  {model:25s}: {stats['successes']}/{stats['total_prompts']} ({stats['success_rate']:5.1f}%)")
    
    # Save to file
    output = {
        "baseline_3b": 16.7,
        "models_tested": list(model_stats.keys()),
        "per_model_results": model_stats,
        "best_model": best_model,
        "best_success_rate": best_success,
        "improvement_over_baseline": best_success - 16.7
    }
    
    with open("final_tool_use_results.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✓ Complete results saved to: final_tool_use_results.json")

if __name__ == "__main__":
    main()
