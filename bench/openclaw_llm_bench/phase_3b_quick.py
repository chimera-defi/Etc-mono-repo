#!/usr/bin/env python3
"""Phase 3B: Quick latency scaling test (simplified for speed)."""

import json
import time
import urllib.request
import urllib.error
import statistics
import os
from typing import List, Tuple
import sys

# Test with real prompts from the benchmark suite
PROMPTS = [
    {
        "id": "P1_short",
        "name": "router_json",
        "base": 'Return ONLY JSON: {"route":"local|premium", "reason":"..."} for:',
        "payload": "Debug intermittent nginx 502 with TLS upstream checks.",
        "type": "json"
    },
    {
        "id": "P2_short",
        "name": "nested_json",
        "base": 'Return JSON: {"config": {"service": {...}, "status": {...}}} for:',
        "payload": "Parse and validate service configuration.",
        "type": "json"
    },
    {
        "id": "P3_short",
        "name": "commands",
        "base": "Generate exactly 5 shell commands (no explanations) to:",
        "payload": "Check disk usage and memory stats.",
        "type": "text"
    },
    {
        "id": "P4_short",
        "name": "bullet_list",
        "base": "Provide 4 bullet points (use '-') for:",
        "payload": "Monitoring checklist for systems.",
        "type": "text"
    },
]

MODELS = ["qwen2.5:3b", "llama3.2:3b"]

# Different padding sizes (in characters, roughly ~1.3 chars per token)
PADDING_SIZES = [
    (100, "100char"),    # ~77 tokens
    (500, "500char"),    # ~385 tokens
    (1000, "1kchar"),    # ~770 tokens
    (2000, "2kchar"),    # ~1.5k tokens
]

def call_ollama(model: str, prompt: str, timeout: int = 45) -> Tuple[str, int, bool]:
    """Call Ollama API."""
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "temperature": 0.5,
    }
    
    try:
        start = time.perf_counter_ns()
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"},
        )
        
        with urllib.request.urlopen(req, timeout=timeout) as response:
            result = json.loads(response.read().decode('utf-8'))
            elapsed_ms = (time.perf_counter_ns() - start) // 1_000_000
            text = result.get("response", "").strip()
            return text, elapsed_ms, True
    except Exception as e:
        return f"Error: {str(e)}", -1, False


def validate_response(response: str, prompt_type: str) -> bool:
    """Quick validation."""
    if not response or len(response) < 5:
        return False
    
    if prompt_type == "json":
        try:
            json.loads(response)
            return True
        except:
            return False
    elif prompt_type == "text":
        # Just check it has some length
        return len(response) > 10
    
    return True


def run_test():
    print("\n" + "="*80)
    print("PHASE 3B: Quick Latency Scaling Test")
    print("="*80 + "\n")
    
    results = []
    total = len(PROMPTS) * len(MODELS) * len(PADDING_SIZES)
    current = 0
    
    for prompt_spec in PROMPTS:
        for model in MODELS:
            for pad_size, pad_label in PADDING_SIZES:
                current += 1
                
                # Create padded prompt
                padding = "x" * pad_size
                full_prompt = f"{padding}\n\n{prompt_spec['base']} {prompt_spec['payload']}"
                
                name = f"{prompt_spec['name']}_{pad_label}_{model}"
                print(f"[{current}/{total}] {name:50s}...", end=" ", flush=True)
                
                response, latency_ms, success = call_ollama(model, full_prompt)
                
                is_valid = False
                if success:
                    is_valid = validate_response(response, prompt_spec['type'])
                
                result = {
                    "prompt": prompt_spec['id'],
                    "model": model,
                    "padding_chars": pad_size,
                    "padding_label": pad_label,
                    "latency_ms": latency_ms,
                    "success": success and is_valid,
                }
                results.append(result)
                
                if success and is_valid:
                    print(f"✓ {latency_ms:6d} ms")
                else:
                    print(f"✗ {latency_ms:6d} ms")
                
                time.sleep(0.5)
    
    # Save results
    csv_path = "phase_3b_quick_results.csv"
    with open(csv_path, "w") as f:
        f.write("prompt,model,padding_chars,padding_label,latency_ms,success\n")
        for r in results:
            f.write(f"{r['prompt']},{r['model']},{r['padding_chars']},{r['padding_label']},{r['latency_ms']},{r['success']}\n")
    
    print(f"\n✓ Results saved to {csv_path}\n")
    
    # Generate markdown report
    md_path = "phase_3b_quick_report.md"
    with open(md_path, "w") as f:
        f.write("# Phase 3B: Quick Latency Scaling Test\n\n")
        f.write(f"**Date:** {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("## Latency by Model and Padding Size\n\n")
        
        for model in MODELS:
            f.write(f"### {model}\n\n")
            f.write("| Prompt Type | 100char (ms) | 500char (ms) | 1kchar (ms) | 2kchar (ms) |\n")
            f.write("|---|---|---|---|---|\n")
            
            for prompt_spec in PROMPTS:
                latencies = {}
                for pad_size, pad_label in PADDING_SIZES:
                    matching = [r for r in results if r['model'] == model and r['prompt'] == prompt_spec['id'] 
                               and r['padding_chars'] == pad_size and r['success']]
                    if matching:
                        avg = statistics.mean(r['latency_ms'] for r in matching)
                        latencies[pad_label] = f"{avg:.0f}"
                
                row = f"| {prompt_spec['name']} | "
                for _, label in PADDING_SIZES:
                    row += f"{latencies.get(label, 'N/A')} | "
                f.write(row + "\n")
            
            f.write("\n")
        
        # Scaling analysis
        f.write("## Scaling Analysis\n\n")
        f.write("*Scaling factor: latency at larger padding / latency at smaller padding*\n\n")
        
        for model in MODELS:
            f.write(f"### {model}\n\n")
            f.write("| Prompt Type | 100→500 | 500→1k | 1k→2k |\n")
            f.write("|---|---|---|---|\n")
            
            for prompt_spec in PROMPTS:
                lats = {}
                for pad_size, pad_label in PADDING_SIZES:
                    matching = [r for r in results if r['model'] == model and r['prompt'] == prompt_spec['id'] 
                               and r['padding_chars'] == pad_size and r['success']
                               and r['latency_ms'] > 0]
                    if matching:
                        lats[pad_size] = statistics.mean(r['latency_ms'] for r in matching)
                
                if 100 in lats and 500 in lats and 1000 in lats and 2000 in lats:
                    s1 = (lats[500] / lats[100] * 100) if lats[100] > 0 else 0
                    s2 = (lats[1000] / lats[500] * 100) if lats[500] > 0 else 0
                    s3 = (lats[2000] / lats[1000] * 100) if lats[1000] > 0 else 0
                    f.write(f"| {prompt_spec['name']} | {s1:.0f}% | {s2:.0f}% | {s3:.0f}% |\n")
            
            f.write("\n")
        
        # Summary stats
        f.write("## Performance Summary\n\n")
        
        for model in MODELS:
            model_results = [r for r in results if r['model'] == model]
            success_count = sum(1 for r in model_results if r['success'])
            success_pct = (success_count / len(model_results) * 100) if model_results else 0
            
            f.write(f"**{model}**\n")
            f.write(f"- Success Rate: {success_pct:.0f}% ({success_count}/{len(model_results)})\n")
            
            for pad_size, pad_label in PADDING_SIZES:
                matching = [r for r in model_results if r['padding_chars'] == pad_size and r['success'] 
                           and r['latency_ms'] > 0]
                if matching:
                    lats = [r['latency_ms'] for r in matching]
                    f.write(f"- **{pad_label}**: p50={statistics.median(lats):.0f}ms, avg={statistics.mean(lats):.0f}ms\n")
            
            f.write("\n")
        
        f.write(f"---\nGenerated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    print(f"✓ Report saved to {md_path}\n")
    
    # Print summary
    print("="*80)
    print("SUMMARY")
    print("="*80)
    print(f"\nTotal tests: {len(results)}")
    print(f"Successful: {sum(1 for r in results if r['success'])}/{len(results)}")
    
    for model in MODELS:
        print(f"\n{model}:")
        model_results = [r for r in results if r['model'] == model and r['success'] and r['latency_ms'] > 0]
        by_size = {}
        for r in model_results:
            by_size.setdefault(r['padding_chars'], []).append(r['latency_ms'])
        
        for pad_size, pad_label in PADDING_SIZES:
            if pad_size in by_size:
                lats = by_size[pad_size]
                print(f"  {pad_label:10s}: avg={statistics.mean(lats):6.0f}ms p50={statistics.median(lats):6.0f}ms")


if __name__ == "__main__":
    os.chdir("/root/.openclaw/workspace/dev/Etc-mono-repo/bench/openclaw_llm_bench")
    run_test()
