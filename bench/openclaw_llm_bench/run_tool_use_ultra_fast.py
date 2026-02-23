#!/usr/bin/env python3
"""Ultra-fast tool-use benchmark - 3 quick prompts per model."""

import json
import urllib.request
import time
import re

BASE_URL = "http://localhost:11434/api/generate"

# Ultra-minimal prompts - expect tool invocation in response
ULTRA_PROMPTS = [
    {
        "id": "1",
        "name": "invoke_tool",
        "prompt": "Please invoke a tool:\n<tool_invocation>\n<tool>exec</tool>\n<command>free -h</command>\n</tool_invocation>",
    },
    {
        "id": "2",
        "name": "detect_tool",
        "prompt": "Detect tool:\n<tool>\n<name>exec</name>\n<args>du -sh</args>\n</tool>",
    },
    {
        "id": "3",
        "name": "format_check",
        "prompt": "Check format: <tool_invocation><tool>ps</tool></tool_invocation>",
    },
]

MODELS = [
    "mistral:7b",
    "qwen3:8b",
    "qwen2.5:14b",
    "glm-4.7-flash:latest",
]

def test_one(model, prompt):
    """Test single model/prompt, return (success, latency_ms)."""
    try:
        payload = {
            "model": model,
            "prompt": prompt["prompt"],
            "stream": False,
            "temperature": 0.2,
        }
        
        start = time.time()
        req = urllib.request.Request(
            BASE_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        
        with urllib.request.urlopen(req, timeout=90) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            elapsed_ms = (time.time() - start) * 1000
            
            response = result.get("response", "")
            # Check if response contains expected tool patterns
            has_invocation = "<tool_invocation>" in response or "<tool>" in response
            
            return has_invocation, elapsed_ms
    except Exception as e:
        return False, -1

def main():
    print("\n" + "="*70)
    print("ULTRA-FAST TOOL-USE BENCHMARK: 7B+ Models")
    print("="*70)
    print(f"Baseline (qwen2.5:3b): 16.7% (1/6 prompts detected)")
    print(f"Testing: {len(MODELS)} models × {len(ULTRA_PROMPTS)} ultra-fast prompts")
    print("="*70 + "\n")
    
    results = {}
    
    for model in MODELS:
        print(f"Model: {model}")
        print("-" * 70)
        
        model_successes = 0
        model_times = []
        
        for i, prompt in enumerate(ULTRA_PROMPTS, 1):
            print(f"  [{i}/{len(ULTRA_PROMPTS)}] {prompt['name']:15s} ... ", end="", flush=True)
            
            success, latency_ms = test_one(model, prompt)
            
            if latency_ms > 0:
                model_times.append(latency_ms)
                if success:
                    print(f"✓ {latency_ms:7.0f}ms")
                    model_successes += 1
                else:
                    print(f"✗ {latency_ms:7.0f}ms")
            else:
                print(f"✗ ERROR")
            
            time.sleep(0.5)
        
        success_rate = (model_successes / len(ULTRA_PROMPTS)) * 100 if ULTRA_PROMPTS else 0
        avg_time = sum(model_times) / len(model_times) if model_times else 0
        
        results[model] = {
            "successes": model_successes,
            "total": len(ULTRA_PROMPTS),
            "success_rate": success_rate,
            "avg_latency_ms": avg_time
        }
        
        improvement = success_rate - 16.7
        delta_str = f"{improvement:+.1f}%" if improvement != 0 else "0.0%"
        print(f"\n  Result: {model_successes}/{len(ULTRA_PROMPTS)} = {success_rate:.1f}% (Δ {delta_str})\n")
    
    # Final summary
    print("\n" + "="*70)
    print("FINAL RESULTS")
    print("="*70)
    print("\n| Model | Success Rate | vs 3B | Status |")
    print("|-------|--------------|-------|--------|")
    
    for model in MODELS:
        r = results[model]
        pct = r["success_rate"]
        delta = pct - 16.7
        delta_str = f"{delta:+.1f}%"
        
        if pct > 30:
            status = "GOOD (>30%)"
        elif pct >= 20:
            status = "OK (20-30%)"
        elif pct > 16.7:
            status = "slight improve"
        else:
            status = "worse/same"
        
        print(f"| {model:25s} | {pct:10.1f}% | {delta_str:6s} | {status:8s} |")
    
    # Analysis
    best_model = max(results.items(), key=lambda x: x[1]["success_rate"])
    best_rate = best_model[1]["success_rate"]
    
    print("\n" + "="*70)
    print("HYPOTHESIS CHECK")
    print("="*70)
    print(f"Best model: {best_model[0]} at {best_rate:.1f}%")
    
    if best_rate > 30:
        conclusion = "✓ SUPPORTED: Larger models DO improve tool-use detection"
    elif best_rate >= 20:
        conclusion = "⚠ MIXED: Minor improvement over baseline"
    else:
        conclusion = "✗ NOT SUPPORTED: Tool-use remains fundamentally challenging"
    
    print(conclusion)
    print(f"Improvement margin: {best_rate - 16.7:.1f}% over 3B baseline")
    
    # Save results
    with open("tool_use_ultra_fast_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("\n✓ Results saved to tool_use_ultra_fast_results.json")

if __name__ == "__main__":
    main()
