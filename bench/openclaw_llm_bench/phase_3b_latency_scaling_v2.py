#!/usr/bin/env python3
"""Phase 3B: Long-context latency scaling benchmark (optimized).

Tests how latency scales with prompt length using:
- 4 prompt types (router JSON, nested JSON, command-only, bullet list)
- 3 context lengths (1k, 4k, 8k tokens) - adjusted for stability
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
    base_text = (
        "The quick brown fox jumps over the lazy dog. "
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "
    )
    filler = (base_text * ((token_count // 50) + 1))[:token_count * 13 // 10]
    return filler


def create_prompt_variants() -> List[Dict[str, Any]]:
    """Create 4 prompt types with 3 context length variants each."""
    
    prompts = []
    
    # Prompt 1: Router JSON
    base_prompt_1 = 'Return ONLY JSON: {"route":"local|premium", "reason":"..."} for:'
    payload_1 = "Debug intermittent nginx 502 with TLS upstream checks."
    
    prompts.extend([
        {
            "id": "P1_1k",
            "name": "router_json_1k",
            "model_input": generate_filler(800) + "\n\n" + base_prompt_1 + " " + payload_1,
            "base_prompt": base_prompt_1,
            "context_tokens": 1000,
            "type": "router_json"
        },
        {
            "id": "P1_4k",
            "name": "router_json_4k",
            "model_input": generate_filler(3600) + "\n\n" + base_prompt_1 + " " + payload_1,
            "base_prompt": base_prompt_1,
            "context_tokens": 4000,
            "type": "router_json"
        },
        {
            "id": "P1_8k",
            "name": "router_json_8k",
            "model_input": generate_filler(7300) + "\n\n" + base_prompt_1 + " " + payload_1,
            "base_prompt": base_prompt_1,
            "context_tokens": 8000,
            "type": "router_json"
        },
    ])
    
    # Prompt 2: Nested JSON
    base_prompt_2 = 'Return JSON: {"config": {"service": {...}, "status": {...}}} for:'
    payload_2 = "Parse and validate service configuration settings."
    
    prompts.extend([
        {
            "id": "P2_1k",
            "name": "nested_json_1k",
            "model_input": generate_filler(800) + "\n\n" + base_prompt_2 + " " + payload_2,
            "base_prompt": base_prompt_2,
            "context_tokens": 1000,
            "type": "nested_json"
        },
        {
            "id": "P2_4k",
            "name": "nested_json_4k",
            "model_input": generate_filler(3600) + "\n\n" + base_prompt_2 + " " + payload_2,
            "base_prompt": base_prompt_2,
            "context_tokens": 4000,
            "type": "nested_json"
        },
        {
            "id": "P2_8k",
            "name": "nested_json_8k",
            "model_input": generate_filler(7300) + "\n\n" + base_prompt_2 + " " + payload_2,
            "base_prompt": base_prompt_2,
            "context_tokens": 8000,
            "type": "nested_json"
        },
    ])
    
    # Prompt 3: Command-only
    base_prompt_3 = "Generate exactly 5 shell commands (Ubuntu, no explanations) to:"
    payload_3 = "Check disk usage, memory stats, and network connectivity."
    
    prompts.extend([
        {
            "id": "P3_1k",
            "name": "command_only_1k",
            "model_input": generate_filler(800) + "\n\n" + base_prompt_3 + " " + payload_3,
            "base_prompt": base_prompt_3,
            "context_tokens": 1000,
            "type": "command_only"
        },
        {
            "id": "P3_4k",
            "name": "command_only_4k",
            "model_input": generate_filler(3600) + "\n\n" + base_prompt_3 + " " + payload_3,
            "base_prompt": base_prompt_3,
            "context_tokens": 4000,
            "type": "command_only"
        },
        {
            "id": "P3_8k",
            "name": "command_only_8k",
            "model_input": generate_filler(7300) + "\n\n" + base_prompt_3 + " " + payload_3,
            "base_prompt": base_prompt_3,
            "context_tokens": 8000,
            "type": "command_only"
        },
    ])
    
    # Prompt 4: Bullet list
    base_prompt_4 = "Provide exactly 4 bullet points (use '-' bullets) for:"
    payload_4 = "Monitoring checklist for production systems."
    
    prompts.extend([
        {
            "id": "P4_1k",
            "name": "bullet_list_1k",
            "model_input": generate_filler(800) + "\n\n" + base_prompt_4 + " " + payload_4,
            "base_prompt": base_prompt_4,
            "context_tokens": 1000,
            "type": "bullet_list"
        },
        {
            "id": "P4_4k",
            "name": "bullet_list_4k",
            "model_input": generate_filler(3600) + "\n\n" + base_prompt_4 + " " + payload_4,
            "base_prompt": base_prompt_4,
            "context_tokens": 4000,
            "type": "bullet_list"
        },
        {
            "id": "P4_8k",
            "name": "bullet_list_8k",
            "model_input": generate_filler(7300) + "\n\n" + base_prompt_4 + " " + payload_4,
            "base_prompt": base_prompt_4,
            "context_tokens": 8000,
            "type": "bullet_list"
        },
    ])
    
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
                return False, "Invalid route value"
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
        # Check for shell commands
        lines = response_clean.split('\n')
        cmd_count = 0
        for line in lines:
            line = line.strip()
            if line and (line.startswith(('ls', 'df', 'free', 'ps', 'ss', 'cat', 'grep', 'sed', 'awk', 'curl', 'ping', 'ifconfig', 'netstat', 'sudo')) or 
                        '|' in line or '&&' in line or line.startswith('$')):
                cmd_count += 1
        if cmd_count < 2:
            return False, f"Too few commands ({cmd_count})"
        return True, ""
    
    elif prompt_type == "bullet_list":
        # Check for bullet points
        bullet_count = response_clean.count('-')
        if bullet_count < 2:
            return False, f"Too few bullets ({bullet_count})"
        return True, ""
    
    return True, ""


def call_ollama(model: str, prompt: str, timeout: int = 60) -> Tuple[str, int, bool]:
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
    
    except urllib.error.URLError as e:
        return f"Connection error: {str(e)}", -1, False
    except json.JSONDecodeError:
        return f"Invalid JSON response", -1, False
    except Exception as e:
        return f"Error: {str(e)}", -1, False


def run_benchmark():
    """Run the full Phase 3B benchmark."""
    
    print("\n" + "="*80)
    print("PHASE 3B: Long-Context Latency Scaling Benchmark (v2)")
    print("Context sizes: 1k, 4k, 8k tokens")
    print("="*80 + "\n")
    
    prompts = create_prompt_variants()
    models = ["qwen2.5:3b", "llama3.2:3b"]
    
    results: List[Result] = []
    
    total_tests = len(prompts) * len(models)
    current = 0
    
    for prompt_spec in prompts:
        for model in models:
            current += 1
            prompt_name = prompt_spec['name']
            print(f"[{current}/{total_tests}] {prompt_name:30s} on {model:15s}...", end=" ", flush=True)
            
            response, latency_ms, success = call_ollama(model, prompt_spec["model_input"], timeout=60)
            
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
                print(f"✓ {latency_ms:6d} ms")
            else:
                print(f"✗ {latency_ms:6d} ms")
            
            # Pause between requests to let Ollama stabilize
            time.sleep(1.0)
    
    print("\n" + "="*80)
    print("PROCESSING RESULTS")
    print("="*80 + "\n")
    
    # Generate CSV
    csv_path = "phase_3b_results.csv"
    with open(csv_path, "w") as f:
        f.write("prompt_id,prompt_name,model,context_tokens,latency_ms,success,error\n")
        for r in results:
            error_escaped = r.error.replace(",", ";").replace("\n", " ")
            f.write(f"{r.prompt_id},{r.prompt_name},{r.model},{r.context_tokens},{r.latency_ms},{r.success},{error_escaped}\n")
    
    print(f"✓ Results saved to {csv_path}\n")
    
    # Generate markdown report
    markdown_path = "phase_3b_report.md"
    
    with open(markdown_path, "w") as f:
        f.write("# Phase 3B: Long-Context Latency Scaling Test\n\n")
        f.write(f"**Date:** {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Context sizes tested:** 1k, 4k, 8k tokens\n\n")
        
        # Summary by prompt type
        f.write("## Latency by Prompt Type\n\n")
        
        prompt_types = sorted(set(p["type"] for p in prompts))
        for ptype in prompt_types:
            f.write(f"### {ptype.replace('_', ' ').title()}\n\n")
            f.write("| Model | 1k Tokens (ms) | 4k Tokens (ms) | 8k Tokens (ms) | 4k vs 1k | 8k vs 4k |\n")
            f.write("|-------|---|---|---|---|---|\n")
            
            for model in models:
                latencies = {}
                for ctx_size in [1000, 4000, 8000]:
                    matching = [r for r in results if r.model == model and r.context_tokens == ctx_size and r.success
                               and any(p["type"] == ptype and p["id"] in r.prompt_id for p in prompts)]
                    if matching:
                        avg_latency = statistics.mean(r.latency_ms for r in matching)
                        latencies[ctx_size] = avg_latency
                
                if latencies:
                    lat_1k = latencies.get(1000, 0)
                    lat_4k = latencies.get(4000, 0)
                    lat_8k = latencies.get(8000, 0)
                    
                    if lat_1k > 0:
                        ratio_4k = (lat_4k / lat_1k * 100) if lat_4k > 0 else 0
                        ratio_8k = (lat_8k / lat_4k * 100) if lat_4k > 0 else 0
                    else:
                        ratio_4k = ratio_8k = 0
                    
                    f.write(f"| {model} | {lat_1k:.0f} | {lat_4k:.0f} | {lat_8k:.0f} | {ratio_4k:.0f}% | {ratio_8k:.0f}% |\n")
            
            f.write("\n")
        
        # Overall statistics
        f.write("## Model Performance Summary\n\n")
        
        for model in models:
            f.write(f"### {model}\n\n")
            model_results = [r for r in results if r.model == model]
            success_count = sum(1 for r in model_results if r.success)
            success_rate = (success_count / len(model_results)) * 100 if model_results else 0
            
            f.write(f"- **Success Rate:** {success_rate:.1f}% ({success_count}/{len(model_results)})\n")
            
            # Latency stats per context length
            for ctx_size in [1000, 4000, 8000]:
                ctx_results = [r.latency_ms for r in model_results if r.context_tokens == ctx_size and r.success and r.latency_ms > 0]
                if ctx_results:
                    p50 = statistics.median(ctx_results)
                    p95 = sorted(ctx_results)[int(len(ctx_results) * 0.95)] if len(ctx_results) > 1 else ctx_results[0]
                    avg = statistics.mean(ctx_results)
                    f.write(f"- **{ctx_size} tokens:** p50={p50:.0f}ms, p95={p95:.0f}ms, avg={avg:.0f}ms\n")
            
            f.write("\n")
        
        # Scaling analysis
        f.write("## Latency Scaling Factor\n\n")
        f.write("*Scaling factor = (latency at larger context) / (latency at smaller context) * 100%*\n\n")
        f.write("| Prompt Type | Model | 1k→4k | 4k→8k | 1k→8k |\n")
        f.write("|---|---|---|---|---|\n")
        
        for ptype in prompt_types:
            for model in models:
                type_results = [r for r in results if r.model == model and r.success
                               and any(p["type"] == ptype and p["id"] in r.prompt_id for p in prompts)]
                
                if type_results:
                    by_ctx = {}
                    for r in type_results:
                        if r.latency_ms > 0:
                            by_ctx.setdefault(r.context_tokens, []).append(r.latency_ms)
                    
                    avgs = {ctx: statistics.mean(lats) for ctx, lats in by_ctx.items()}
                    
                    if 1000 in avgs and 4000 in avgs and 8000 in avgs:
                        scale_4k = (avgs[4000] / avgs[1000] * 100)
                        scale_8k = (avgs[8000] / avgs[4000] * 100)
                        scale_total = (avgs[8000] / avgs[1000] * 100)
                        
                        f.write(f"| {ptype} | {model} | {scale_4k:.0f}% | {scale_8k:.0f}% | {scale_total:.0f}% |\n")
        
        f.write("\n")
        
        # Failures
        failures = [r for r in results if not r.success]
        if failures:
            f.write("## Validation Failures\n\n")
            for r in failures:
                f.write(f"- **{r.prompt_name}** ({r.model}): {r.error}\n")
            f.write("\n")
        
        f.write("---\n")
        f.write(f"*Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}*\n")
    
    print(f"✓ Report saved to {markdown_path}\n")
    
    # Print summary
    print("BENCHMARK COMPLETE\n")
    print(f"Total tests: {len(results)}")
    print(f"Successful: {sum(1 for r in results if r.success)}/{len(results)}")
    print(f"\nOutput files:")
    print(f"  - {csv_path}")
    print(f"  - {markdown_path}")
    
    # Print scaling summary
    print("\n" + "="*80)
    print("LATENCY SCALING SUMMARY (% increase for larger context)")
    print("="*80 + "\n")
    
    for ptype in prompt_types:
        print(f"\n{ptype.replace('_', ' ').title()}:")
        print("-" * 50)
        for model in models:
            type_results = [r for r in results if r.model == model and r.success
                           and any(p["type"] == ptype and p["id"] in r.prompt_id for p in prompts)]
            
            if type_results:
                by_ctx = {}
                for r in type_results:
                    if r.latency_ms > 0:
                        by_ctx.setdefault(r.context_tokens, []).append(r.latency_ms)
                
                avgs = {ctx: statistics.mean(lats) for ctx, lats in by_ctx.items()}
                
                if avgs.get(1000) and avgs.get(4000) and avgs.get(8000):
                    scale_4k = (avgs[4000] / avgs[1000] - 1) * 100
                    scale_8k = (avgs[8000] / avgs[4000] - 1) * 100
                    scale_total = (avgs[8000] / avgs[1000] - 1) * 100
                    print(f"  {model:15s}: 1k→4k {scale_4k:+6.1f}%  |  4k→8k {scale_8k:+6.1f}%  |  1k→8k {scale_total:+6.1f}%")
                else:
                    print(f"  {model:15s}: (incomplete data)")


if __name__ == "__main__":
    os.chdir("/root/.openclaw/workspace/dev/Etc-mono-repo/bench/openclaw_llm_bench")
    run_benchmark()
