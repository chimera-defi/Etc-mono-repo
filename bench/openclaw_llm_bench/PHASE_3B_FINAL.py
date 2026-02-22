#!/usr/bin/env python3
"""Phase 3B: Final latency scaling test - MINIMAL AND RELIABLE."""

import json
import urllib.request
import time
import sys

BASE_URL = "http://localhost:11434/api/generate"

PROMPTS = {
    "router_json": {
        "short": 'Return ONLY JSON: {"route":"local|premium", "reason":"brief"}. Task: nginx 502 debug',
        "medium": 'Return ONLY JSON: {"route":"local|premium", "reason":"explanation"}. Context: Production microservice with intermittent 502 errors and TLS failures during peak load. Decision: escalate or handle locally?',
        "long": 'Return ONLY JSON: {"route":"local|premium", "reason":"explanation"}. DETAILED CONTEXT: We operate a mission-critical production microservice architecture with multiple upstream services distributed across different availability zones. Recently, we have been experiencing intermittent 502 Bad Gateway errors from our nginx reverse proxy with TLS upstream checks failing periodically. The issue manifests with varying frequency during peak load (10,000+ req/s) but also sporadically during off-peak hours. TCP connection timeouts are increasing, and certificate validation failures are being logged. We recently updated TLS certificates and made configuration changes. Error rate is approximately 0.5-2% over the past 48 hours. QUESTION: Is this a local configuration issue or does it require premium support escalation for infrastructure analysis and TLS certificate management?'
    },
    "nested_json": {
        "short": 'Return JSON: {"config": {...}, "status": {...}}. Parse: memory 45%, disk 78%, load 2.1',
        "medium": 'Return JSON: {"config": {...}, "status": {...}}. System monitoring data: Memory 45% of 63GB, Disk 78% of 2.8TB, Load average 2.1, CPU 35%, DB connections 85% capacity, Cache hit ratio 92%.',
        "long": 'Return JSON: {"config": {...}, "status": {...}}. COMPREHENSIVE DATA: Current system metrics from production nodes: Memory usage 45% (28.5GB of 63GB), Disk utilization 78% (2.2TB of 2.8TB), System load 2.1 per minute with peak of 3.5 in last hour, CPU usage 35% across 8 cores, Network throughput 450 Mbps ingress / 320 Mbps egress, Database connections 85% (425 of 500), Cache hit ratio 92%, Garbage collection pauses 150ms average, Request error rate 0.05%, TLS certificate validity 45 days remaining. Organize into nested config and status structure.'
    },
    "commands": {
        "short": "Generate 4 commands: check memory, disk, processes, network",
        "medium": "Generate 5 Ubuntu shell commands (one per line, no explanations): check memory with swap breakdown, disk space with inodes, top processes, network stats, load average",
        "long": "Generate 5 Ubuntu shell commands (one per line, no explanations or markdown): 1) detailed memory including swap, 2) disk space with inodes, 3) top resource consuming processes, 4) network interface statistics, 5) system load and CPU metrics. Output commands only."
    },
    "bullets": {
        "short": "3 bullet points (-): monitoring checks",
        "medium": "4 bullet points (use '-'): production monitoring checks. Include resource usage, service health, and performance.",
        "long": "4 bullet points (use '-' only): specific monitoring tasks for production systems. Include: 1) system resource checks, 2) service availability, 3) performance metrics, 4) security/compliance. Each should be actionable in 5-10 minutes."
    }
}

MODELS = ["qwen2.5:3b", "llama3.2:3b"]

def test_model_prompt(model, prompt_text, prompt_name, context_label, timeout=60):
    """Test one model with one prompt."""
    try:
        payload = {
            "model": model,
            "prompt": prompt_text,
            "stream": False,
            "temperature": 0.5,
        }
        req = urllib.request.Request(
            BASE_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"},
        )
        
        start = time.perf_counter()
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            elapsed = (time.perf_counter() - start) * 1000  # ms
            
            response_text = result.get("response", "").strip()
            success = len(response_text) > 10
            
            return elapsed, success, response_text[:100] if success else "FAILED"
    
    except Exception as e:
        return -1, False, str(e)[:50]

def main():
    print("\n" + "="*90)
    print("PHASE 3B: Long-Context Latency Scaling Test")
    print("Testing: 4 prompt types × 3 context levels × 2 models = 24 tests")
    print("="*90 + "\n")
    
    results = []
    test_count = 0
    total = len(PROMPTS) * len(["short", "medium", "long"]) * len(MODELS)
    
    # Run all tests
    for prompt_type, variants in sorted(PROMPTS.items()):
        for context_label in ["short", "medium", "long"]:
            for model in MODELS:
                test_count += 1
                name = f"{prompt_type:15s} {context_label:8s} {model:15s}"
                print(f"[{test_count:2d}/{total}] {name}... ", end="", flush=True)
                
                latency_ms, success, detail = test_model_prompt(
                    model,
                    variants[context_label],
                    prompt_type,
                    context_label,
                    timeout=60
                )
                
                results.append({
                    "prompt_type": prompt_type,
                    "context": context_label,
                    "model": model,
                    "latency_ms": latency_ms,
                    "success": success
                })
                
                if success:
                    print(f"✓ {latency_ms:7.0f} ms")
                else:
                    print(f"✗ {latency_ms:7.0f} ms - {detail}")
                
                time.sleep(0.5)  # Pause between tests
    
    # Save CSV
    csv_file = "phase_3b_results.csv"
    with open(csv_file, "w") as f:
        f.write("prompt_type,context,model,latency_ms,success\n")
        for r in results:
            f.write(f"{r['prompt_type']},{r['context']},{r['model']},{r['latency_ms']},{r['success']}\n")
    
    print(f"\n✓ Results saved to {csv_file}")
    
    # Generate markdown report
    md_file = "phase_3b_results.md"
    with open(md_file, "w") as f:
        f.write("# Phase 3B: Long-Context Latency Scaling Test Results\n\n")
        f.write(f"**Date:** {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        # Results table
        f.write("## Latency Results (milliseconds)\n\n")
        f.write("| Prompt Type | Model | Short | Medium | Long | Scale Factor (Long/Short) |\n")
        f.write("|---|---|---|---|---|---|\n")
        
        prompt_types = list(PROMPTS.keys())
        for ptype in prompt_types:
            for model in MODELS:
                lats = {}
                for ctx in ["short", "medium", "long"]:
                    r = [r for r in results if r["prompt_type"]==ptype and r["context"]==ctx and r["model"]==model and r["success"]]
                    if r:
                        lats[ctx] = r[0]["latency_ms"]
                
                if "short" in lats and "long" in lats:
                    scale = (lats["long"] / lats["short"] * 100) if lats.get("short", 0) > 0 else 0
                    f.write(f"| {ptype} | {model} | {lats.get('short', 'N/A'):.0f} | {lats.get('medium', 'N/A'):.0f} | {lats.get('long', 'N/A'):.0f} | {scale:.0f}% |\n")
        
        f.write("\n## Summary\n\n")
        
        for model in MODELS:
            model_res = [r for r in results if r["model"]==model]
            success_count = sum(1 for r in model_res if r["success"])
            success_pct = (success_count / len(model_res) * 100) if model_res else 0
            
            f.write(f"**{model}**\n")
            f.write(f"- Success Rate: {success_pct:.0f}% ({success_count}/{len(model_res)})\n")
            
            for ctx in ["short", "medium", "long"]:
                lats = [r["latency_ms"] for r in model_res if r["context"]==ctx and r["success"] and r["latency_ms"] > 0]
                if lats:
                    avg = sum(lats) / len(lats)
                    f.write(f"- **{ctx}**: {avg:.0f} ms\n")
            
            f.write("\n")
        
        f.write(f"---\nGenerated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    print(f"✓ Report saved to {md_file}\n")
    
    # Print summary
    print("\n" + "="*90)
    print("SUMMARY")
    print("="*90)
    
    success_total = sum(1 for r in results if r["success"])
    print(f"\nTotal tests: {len(results)}")
    print(f"Successful: {success_total}/{len(results)}\n")
    
    # Latency scaling by prompt type
    print("Latency Scaling (Long context / Short context):\n")
    for ptype in prompt_types:
        print(f"{ptype.upper()}:")
        for model in MODELS:
            short_res = [r for r in results if r["prompt_type"]==ptype and r["context"]=="short" and r["model"]==model and r["success"]]
            long_res = [r for r in results if r["prompt_type"]==ptype and r["context"]=="long" and r["model"]==model and r["success"]]
            
            if short_res and long_res:
                short_lat = short_res[0]["latency_ms"]
                long_lat = long_res[0]["latency_ms"]
                scale_factor = (long_lat / short_lat * 100) if short_lat > 0 else 0
                print(f"  {model}: {scale_factor:.0f}% ({short_lat:.0f}ms → {long_lat:.0f}ms)")
        print()

if __name__ == "__main__":
    import os
    os.chdir("/root/.openclaw/workspace/dev/Etc-mono-repo/bench/openclaw_llm_bench")
    main()
