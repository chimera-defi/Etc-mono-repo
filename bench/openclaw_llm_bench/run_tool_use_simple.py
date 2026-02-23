#!/usr/bin/env python3
"""Simplified tool-use benchmark with better debugging."""

import json
import urllib.request
import time
import re
import sys

BASE_URL = "http://localhost:11434/api/generate"

# Single simple prompt for each model to test
SIMPLE_PROMPTS = [
    {
        "id": "E0",
        "name": "exec_free",
        "prompt": "Call tool <tool_invocation><tool>exec</tool><command>free -h</command></tool_invocation>"
    },
    {
        "id": "E1", 
        "name": "exec_du",
        "prompt": "Call tool <tool_invocation><tool>exec</tool><command>du -sh ~</command></tool_invocation>"
    },
    {
        "id": "E2",
        "name": "exec_ps",
        "prompt": "Call tool <tool_invocation><tool>exec</tool><command>ps aux</command></tool_invocation>"
    },
    {
        "id": "E3",
        "name": "exec_grep",
        "prompt": "Call tool <tool_invocation><tool>exec</tool><command>grep</command></tool_invocation>"
    },
    {
        "id": "E4",
        "name": "exec_ping",
        "prompt": "Call tool <tool_invocation><tool>exec</tool><command>ping</command></tool_invocation>"
    },
    {
        "id": "E5",
        "name": "exec_date",
        "prompt": "Call tool <tool_invocation><tool>exec</tool><command>date</command></tool_invocation>"
    },
]

MODELS = ["mistral:7b", "qwen3:8b", "qwen2.5:14b", "glm-4.7-flash:latest"]

def detect_tool_call(response):
    """Check if response contains tool invocation."""
    return "<tool_invocation>" in response and "<tool>" in response

def test_model(model, prompts):
    """Test a single model with all prompts."""
    print(f"\nTesting: {model}")
    print("-" * 60)
    
    results = []
    success_count = 0
    
    for i, prompt in enumerate(prompts, 1):
        prompt_id = prompt["id"]
        prompt_name = prompt["name"]
        prompt_text = prompt["prompt"]
        
        print(f"  [{i}/{len(prompts)}] {prompt_id:3s} {prompt_name:15s} ...", end="", flush=True)
        
        try:
            payload = {
                "model": model,
                "prompt": prompt_text,
                "stream": False,
                "temperature": 0.3,
            }
            
            start = time.time()
            print(" [calling ollama]", end="", flush=True)
            
            req = urllib.request.Request(
                BASE_URL,
                data=json.dumps(payload).encode('utf-8'),
                headers={"Content-Type": "application/json"}
            )
            
            with urllib.request.urlopen(req, timeout=120) as resp:
                response = json.loads(resp.read().decode('utf-8'))
                elapsed = (time.time() - start) * 1000
                
                text = response.get("response", "").strip()
                success = detect_tool_call(text)
                
                if success:
                    print(f" ✓ {elapsed:6.0f}ms")
                    success_count += 1
                else:
                    print(f" ✗ {elapsed:6.0f}ms")
                
                results.append({
                    "prompt_id": prompt_id,
                    "prompt_name": prompt_name,
                    "latency_ms": elapsed,
                    "success": success,
                    "text_len": len(text)
                })
                
                time.sleep(1)
        
        except urllib.error.URLError as e:
            print(f" ✗ URL_ERROR ({str(e)[:40]})")
            results.append({
                "prompt_id": prompt_id,
                "prompt_name": prompt_name,
                "latency_ms": -1,
                "success": False,
                "error": str(e)[:50]
            })
        except Exception as e:
            print(f" ✗ ERROR ({str(e)[:40]})")
            results.append({
                "prompt_id": prompt_id,
                "prompt_name": prompt_name,
                "latency_ms": -1,
                "success": False,
                "error": str(e)[:50]
            })
    
    success_pct = (success_count / len(prompts)) * 100 if prompts else 0
    print(f"\n  RESULT: {success_count}/{len(prompts)} = {success_pct:.1f}%")
    
    return results, success_pct

def main():
    print("\n" + "="*60)
    print("TOOL-USE BENCHMARK: 7B+ Models (Simplified)")
    print("="*60)
    print(f"Baseline (qwen2.5:3b): 16.7%")
    print(f"Testing {len(MODELS)} models × {len(SIMPLE_PROMPTS)} prompts")
    print("="*60)
    
    all_results = {}
    model_success_rates = {}
    
    for model in MODELS:
        results, success_pct = test_model(model, SIMPLE_PROMPTS)
        all_results[model] = results
        model_success_rates[model] = success_pct
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print("\n| Model | Success Rate | vs 3B Baseline |")
    print("|-------|--------------|----------------|")
    for model in MODELS:
        pct = model_success_rates[model]
        delta = pct - 16.7
        delta_str = f"{delta:+.1f}%" if delta != 0 else "baseline"
        print(f"| {model:25s} | {pct:10.1f}% | {delta_str:14s} |")
    
    # Hypothesis check
    best_model = max(model_success_rates.items(), key=lambda x: x[1])
    print(f"\nBest model: {best_model[0]} at {best_model[1]:.1f}%")
    
    if best_model[1] > 30:
        print("✓ HYPOTHESIS: Model size DOES help (>30%)")
    elif best_model[1] >= 20:
        print("⚠ MIXED: Some improvement but still challenging")
    else:
        print("✗ HYPOTHESIS: Tool-use fundamentally hard (<20%)")
    
    # Save results
    import csv
    with open("tool_use_simple_results.csv", "w") as f:
        f.write("model,prompt_id,prompt_name,latency_ms,success,notes\n")
        for model, results in all_results.items():
            for r in results:
                error = r.get("error", "")
                f.write(f"{model},{r['prompt_id']},{r['prompt_name']},{r['latency_ms']},{r['success']},{error}\n")
    
    print("\n✓ Results saved to tool_use_simple_results.csv")

if __name__ == "__main__":
    main()
