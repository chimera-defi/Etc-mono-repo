#!/usr/bin/env python3
"""Phase 3B: Long-context latency scaling benchmark.

Tests how latency scales with prompt length using:
- 4 prompt types (router JSON, nested JSON, command-only, bullet list)
- 3 context lengths (2k, 8k, 32k tokens)
- 2 baseline models (qwen2.5:3b, llama3.2:3b)

Outputs: CSV + markdown table with scaling curves
"""

import json
import time
import urllib.request
import urllib.error
import statistics
import os
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Tuple
import re


@dataclass
class Result:
    prompt_id: str
    prompt_name: str
    model: str
    context_tokens: int
    latency_ms: int
    success: bool
    error: str = ""


def now_ms() -> int:
    return int(time.time() * 1000)


def generate_filler(token_count: int) -> str:
    """Generate neutral filler text (~1.3 chars per token)."""
    text = "The quick brown fox jumps over the lazy dog. "
    filler = (text * ((token_count // 10) + 1))[:token_count * 13 // 10]
    return filler


def create_prompt_variants() -> List[Dict[str, Any]]:
    """Create 4 prompt types with 3 context length variants each."""
    
    prompts = []
    
    # Prompt 1: Router JSON
    base_prompt_1 = "Return ONLY JSON: {\"route\":\"local|premium\", \"reason\":\"...\"} for:"
    payload_1 = "Debug intermittent nginx 502 with TLS upstream checks."
    prompts.append({
        "id": "P1_2k",
        "name": "router_json_2k",
        "model_input": generate_filler(1800) + "\n\n" + base_prompt_1 + " " + payload_1,
        "base_prompt": base_prompt_1,
        "context_tokens": 2000,
        "type": "router_json"
    })
    prompts.append({
        "id": "P1_8k",
        "name": "router_json_8k",
        "model_input": generate_filler(7600) + "\n\n" + base_prompt_1 + " " + payload_1,
        "base_prompt": base_prompt_1,
        "context_tokens": 8000,
        "type": "router_json"
    })
    prompts.append({
        "id": "P1_32k",
        "name": "router_json_32k",
        "model_input": generate_filler(31500) + "\n\n" + base_prompt_1 + " " + payload_1,
        "base_prompt": base_prompt_1,
        "context_tokens": 32000,
        "type": "router_json"
    })
    
    # Prompt 2: Nested JSON
    base_prompt_2 = "Return ONLY JSON with nested structure: {\"config\": {\"service\": {...}, \"status\": {...}}} for:"
    payload_2 = "Parse and validate the following service configuration settings."
    prompts.append({
        "id": "P2_2k",
        "name": "nested_json_2k",
        "model_input": generate_filler(1800) + "\n\n" + base_prompt_2 + " " + payload_2,
        "base_prompt": base_prompt_2,
        "context_tokens": 2000,
        "type": "nested_json"
    })
    prompts.append({
        "id": "P2_8k",
        "name": "nested_json_8k",
        "model_input": generate_filler(7600) + "\n\n" + base_prompt_2 + " " + payload_2,
        "base_prompt": base_prompt_2,
        "context_tokens": 8000,
        "type": "nested_json"
    })
    prompts.append({
        "id": "P2_32k",
        "name": "nested_json_32k",
        "model_input": generate_filler(31500) + "\n\n" + base_prompt_2 + " " + payload_2,
        "base_prompt": base_prompt_2,
        "context_tokens": 32000,
        "type": "nested_json"
    })
    
    # Prompt 3: Command-only (list of shell commands)
    base_prompt_3 = "Generate exactly 5 shell commands (Ubuntu, no explanations) to:"
    payload_3 = "Check disk usage, memory stats, and network connectivity."
    prompts.append({
        "id": "P3_2k",
        "name": "command_only_2k",
        "model_input": generate_filler(1800) + "\n\n" + base_prompt_3 + " " + payload_3,
        "base_prompt": base_prompt_3,
        "context_tokens": 2000,
        "type": "command_only"
    })
    prompts.append({
        "id": "P3_8k",
        "name": "command_only_8k",
        "model_input": generate_filler(7600) + "\n\n" + base_prompt_3 + " " + payload_3,
        "base_prompt": base_prompt_3,
        "context_tokens": 8000,
        "type": "command_only"
    })
    prompts.append({
        "id": "P3_32k",
        "name": "command_only_32k",
        "model_input": generate_filler(31500) + "\n\n" + base_prompt_3 + " " + payload_3,
        "base_prompt": base_prompt_3,
        "context_tokens": 32000,
        "type": "command_only"
    })
    
    # Prompt 4: Bullet list
    base_prompt_4 = "Provide exactly 4 bullet points (use '-' bullets) for:"
    payload_4 = "Monitoring checklist for production systems."
    prompts.append({
        "id": "P4_2k",
        "name": "bullet_list_2k",
        "model_input": generate_filler(1800) + "\n\n" + base_prompt_4 + " " + payload_4,
        "base_prompt": base_prompt_4,
        "context_tokens": 2000,
        "type": "bullet_list"
    })
    prompts.append({
        "id": "P4_8k",
        "name": "bullet_list_8k",
        "model_input": generate_filler(7600) + "\n\n" + base_prompt_4 + " " + payload_4,
        "base_prompt": base_prompt_4,
        "context_tokens": 8000,
        "type": "bullet_list"
    })
    prompts.append({
        "id": "P4_32k",
        "name": "bullet_list_32k",
        "model_input": generate_filler(31500) + "\n\n" + base_prompt_4 + " " + payload_4,
        "base_prompt": base_prompt_4,
        "context_tokens": 32000,
        "type": "bullet_list"
    })
    
    return prompts


def validate_response(response: str, prompt_type: str) -> Tuple[bool, str]:
    """Validate response format based on prompt type."""
    
    if not response or len(response.strip()) == 0:
        return False, "Empty response"
    
    response_clean = response.strip()
    
    if prompt_type == "router_json":
        try:
            data = json.loads(response_clean)
            if "route" not in data or "reason" not in data:
                return False, "Missing required JSON keys"
            if data["route"] not in ["local", "premium"]:
                return False, "Invalid route value (must be 'local' or 'premium')"
            return True, ""
        except json.JSONDecodeError:
            return False, "Invalid JSON"
    
    elif prompt_type == "nested_json":
        try:
            data = json.loads(response_clean)
            if "config" not in data:
                return False, "Missing 'config' key"
            return True, ""
        except json.JSONDecodeError:
            return False, "Invalid JSON"
    
    elif prompt_type == "command_only":
        # Check for roughly 5 shell commands
        lines = response_clean.split('\n')
        cmd_count = 0
        for line in lines:
            line = line.strip()
            if line and (line.startswith(('ls', 'df', 'free', 'ps', 'ss', 'cat', 'grep', 'sed', 'awk', 'curl', 'ping')) or 
                        '|' in line or line.startswith('$')):
                cmd_count += 1
        if cmd_count < 3:
            return False, f"Too few shell commands detected ({cmd_count})"
        return True, ""
    
    elif prompt_type == "bullet_list":
        # Check for bullet points
        bullet_count = response_clean.count('-')
        if bullet_count < 3:
            return False, f"Too few bullet points ({bullet_count})"
        return True, ""
    
    return True, ""


def call_ollama(model: str, prompt: str, timeout: int = 120) -> Tuple[str, int, bool]:
    """Call Ollama API and return (response, latency_ms, success)."""
    
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "temperature": 0.7,
        "top_p": 0.9,
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


def run_benchmark():
    """Run the full Phase 3B benchmark."""
    
    print("\n" + "="*80)
    print("PHASE 3B: Long-Context Latency Scaling Benchmark")
    print("="*80 + "\n")
    
    prompts = create_prompt_variants()
    models = ["qwen2.5:3b", "llama3.2:3b"]
    
    results: List[Result] = []
    
    total_tests = len(prompts) * len(models)
    current = 0
    
    for prompt_spec in prompts:
        for model in models:
            current += 1
            print(f"[{current}/{total_tests}] Testing {prompt_spec['name']} on {model}...")
            
            response, latency_ms, success = call_ollama(model, prompt_spec["model_input"])
            
            is_valid, error_msg = False, ""
            if success:
                is_valid, error_msg = validate_response(response, prompt_spec["type"])
            else:
                error_msg = response
            
            result = Result(
                prompt_id=prompt_spec["id"],
                prompt_name=prompt_spec["name"],
                model=model,
                context_tokens=prompt_spec["context_tokens"],
                latency_ms=latency_ms,
                success=success and is_valid,
                error=error_msg if not (success and is_valid) else ""
            )
            results.append(result)
            
            if success and is_valid:
                print(f"  ✓ {latency_ms} ms")
            else:
                print(f"  ✗ {latency_ms} ms - {error_msg}")
            
            # Small delay between requests
            time.sleep(0.5)
    
    print("\n" + "="*80)
    print("PROCESSING RESULTS")
    print("="*80 + "\n")
    
    # Generate CSV
    csv_path = "phase_3b_results.csv"
    with open(csv_path, "w") as f:
        f.write("prompt_id,prompt_name,model,context_tokens,latency_ms,success,error\n")
        for r in results:
            f.write(f"{r.prompt_id},{r.prompt_name},{r.model},{r.context_tokens},{r.latency_ms},{r.success},{r.error}\n")
    
    print(f"✓ Results saved to {csv_path}\n")
    
    # Generate markdown report
    markdown_path = "phase_3b_report.md"
    
    with open(markdown_path, "w") as f:
        f.write("# Phase 3B: Long-Context Latency Scaling Test\n\n")
        f.write(f"**Date:** {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        # Summary by prompt type
        f.write("## Summary by Prompt Type\n\n")
        
        prompt_types = set(p["type"] for p in prompts)
        for ptype in sorted(prompt_types):
            f.write(f"### {ptype.replace('_', ' ').title()}\n\n")
            f.write("| Model | 2k Tokens (ms) | 8k Tokens (ms) | 32k Tokens (ms) | 8k vs 2k | 32k vs 2k |\n")
            f.write("|-------|---|---|---|---|---|\n")
            
            for model in models:
                latencies = {}
                for ctx_size in [2000, 8000, 32000]:
                    matching = [r for r in results if r.model == model and r.context_tokens == ctx_size 
                               and any(p["type"] == ptype and p["id"] in r.prompt_id for p in prompts)]
                    if matching:
                        avg_latency = statistics.mean(r.latency_ms for r in matching if r.latency_ms > 0)
                        latencies[ctx_size] = avg_latency
                
                if latencies:
                    lat_2k = latencies.get(2000, 0)
                    lat_8k = latencies.get(8000, 0)
                    lat_32k = latencies.get(32000, 0)
                    
                    ratio_8k = (lat_8k / lat_2k * 100) if lat_2k > 0 else 0
                    ratio_32k = (lat_32k / lat_2k * 100) if lat_2k > 0 else 0
                    
                    f.write(f"| {model} | {lat_2k:.0f} | {lat_8k:.0f} | {lat_32k:.0f} | {ratio_8k:.0f}% | {ratio_32k:.0f}% |\n")
            
            f.write("\n")
        
        # Overall statistics
        f.write("## Overall Statistics\n\n")
        
        for model in models:
            f.write(f"### {model}\n\n")
            model_results = [r for r in results if r.model == model]
            success_count = sum(1 for r in model_results if r.success)
            success_rate = (success_count / len(model_results)) * 100 if model_results else 0
            
            f.write(f"- **Success Rate:** {success_rate:.1f}% ({success_count}/{len(model_results)})\n")
            
            # Latency stats per context length
            for ctx_size in [2000, 8000, 32000]:
                ctx_results = [r.latency_ms for r in model_results if r.context_tokens == ctx_size and r.latency_ms > 0]
                if ctx_results:
                    p50 = statistics.median(ctx_results)
                    p95 = sorted(ctx_results)[int(len(ctx_results) * 0.95)] if len(ctx_results) > 1 else ctx_results[0]
                    avg = statistics.mean(ctx_results)
                    f.write(f"- **{ctx_size} tokens:** p50={p50:.0f}ms, p95={p95:.0f}ms, avg={avg:.0f}ms\n")
            
            f.write("\n")
        
        # Scaling analysis
        f.write("## Latency Scaling Analysis\n\n")
        f.write("| Prompt Type | Model | 2k→8k | 8k→32k | 2k→32k |\n")
        f.write("|---|---|---|---|---|\n")
        
        for ptype in sorted(prompt_types):
            for model in models:
                type_results = [r for r in results if r.model == model 
                               and any(p["type"] == ptype and p["id"] in r.prompt_id for p in prompts)]
                
                if type_results:
                    by_ctx = {}
                    for r in type_results:
                        if r.latency_ms > 0:
                            by_ctx.setdefault(r.context_tokens, []).append(r.latency_ms)
                    
                    avgs = {ctx: statistics.mean(lats) for ctx, lats in by_ctx.items()}
                    
                    scale_8k = (avgs.get(8000, 0) / avgs.get(2000, 1) * 100) if avgs.get(2000, 0) > 0 else 0
                    scale_32k_8k = (avgs.get(32000, 0) / avgs.get(8000, 1) * 100) if avgs.get(8000, 0) > 0 else 0
                    scale_32k_2k = (avgs.get(32000, 0) / avgs.get(2000, 1) * 100) if avgs.get(2000, 0) > 0 else 0
                    
                    f.write(f"| {ptype} | {model} | {scale_8k:.0f}% | {scale_32k_8k:.0f}% | {scale_32k_2k:.0f}% |\n")
        
        f.write("\n")
        
        # Failures
        failures = [r for r in results if not r.success]
        if failures:
            f.write("## Validation Failures\n\n")
            for r in failures:
                f.write(f"- {r.prompt_name} ({r.model}): {r.error}\n")
            f.write("\n")
        
        f.write("---\n")
        f.write(f"*Generated at {time.strftime('%Y-%m-%d %H:%M:%S')}*\n")
    
    print(f"✓ Report saved to {markdown_path}\n")
    
    # Print summary
    print("BENCHMARK COMPLETE")
    print(f"Total tests: {len(results)}")
    print(f"Successful: {sum(1 for r in results if r.success)}/{len(results)}")
    print(f"\nFiles generated:")
    print(f"  - {csv_path}")
    print(f"  - {markdown_path}")
    
    # Print scaling summary
    print("\n" + "="*80)
    print("LATENCY SCALING SUMMARY (% slower at larger context)")
    print("="*80 + "\n")
    
    for ptype in sorted(prompt_types):
        print(f"{ptype.replace('_', ' ').title()}:")
        for model in models:
            type_results = [r for r in results if r.model == model 
                           and any(p["type"] == ptype and p["id"] in r.prompt_id for p in prompts)]
            
            if type_results:
                by_ctx = {}
                for r in type_results:
                    if r.latency_ms > 0:
                        by_ctx.setdefault(r.context_tokens, []).append(r.latency_ms)
                
                avgs = {ctx: statistics.mean(lats) for ctx, lats in by_ctx.items()}
                
                if 2000 in avgs and 8000 in avgs and 32000 in avgs:
                    scale_8k = (avgs[8000] / avgs[2000] * 100) - 100
                    scale_32k = (avgs[32000] / avgs[2000] * 100) - 100
                    print(f"  {model}: 8k {scale_8k:+.1f}% | 32k {scale_32k:+.1f}%")
        print()


if __name__ == "__main__":
    os.chdir("/root/.openclaw/workspace/dev/Etc-mono-repo/bench/openclaw_llm_bench")
    run_benchmark()
