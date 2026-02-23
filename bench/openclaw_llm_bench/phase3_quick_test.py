#!/usr/bin/env python3
"""Phase 3 Quick Test - Faster evaluation of baseline vs enhanced prompts."""

import json
import re
import time
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

MODELS = ["qwen2.5:3b", "llama3.2:3b", "phi3:3.8b"]
OLLAMA_BASE = "http://localhost:11434/v1"

def detect_tool_calls(text, expected_tools=None):
    """Detect tool invocations."""
    if not text:
        return [], False
    
    detected = []
    # Check for <tool>, <command>, backticks, quotes, etc.
    for pattern, flags in [
        (r'<tool>([a-z0-9\-_.]+)</tool>', re.IGNORECASE),
        (r'<command>([a-z0-9\-_.]+)', re.IGNORECASE),
        (r'`([a-z0-9\-_.]+)', re.IGNORECASE),
        (r'["\']([a-z0-9\-_.]+)\s', 0),
        (r'[$#]\s+([a-z0-9\-_.]+)', 0),
        (r'\[(?:tool|TOOL):\s*([a-z0-9\-_.]+)\]', 0),
    ]:
        matches = re.findall(pattern, text, flags)
        detected.extend([m.split()[0].lower() for m in matches])
    
    detected = list(set(detected))
    
    if expected_tools:
        expected_set = {t.lower() for t in expected_tools}
        found_set = {t.lower() for t in detected}
        success = bool(found_set & expected_set)
    else:
        success = len(detected) > 0
    
    return detected, success

def call_ollama_stream(model, prompt, max_tokens=200, timeout_s=30):
    """Call Ollama with streaming to get faster feedback."""
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": True,
        "temperature": 0.3,  # Lower temperature for more consistent tool detection
    }
    
    response_text = ""
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(f"{OLLAMA_BASE}/chat/completions", data=data, method="POST")
        req.add_header("Content-Type", "application/json")
        
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            for line in resp:
                line_str = line.decode("utf-8").strip()
                if not line_str or line_str == "[DONE]":
                    continue
                try:
                    data_obj = json.loads(line_str)
                    chunk = data_obj.get("choices", [{}])[0].get("delta", {}).get("content", "")
                    response_text += chunk
                    
                    # Early exit if we've detected tools
                    if len(response_text) > 100 and ("<tool>" in response_text or "<command>" in response_text):
                        break
                except json.JSONDecodeError:
                    pass
    except urllib.error.URLError as e:
        response_text = f"URL_ERROR: {e}"
    except Exception as e:
        response_text = f"ERROR: {e}"
    
    return response_text

def main():
    print("\n" + "="*70)
    print("PHASE 3 QUICK TEST: Prompting Improvement Evaluation")
    print("="*70)
    print(f"\nTest Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Models: {', '.join(MODELS)}\n")
    
    # Simpler, more direct prompts
    prompts = [
        {
            "name": "Simple Memory Check",
            "baseline": "Check memory using 'free -h'",
            "enhanced": "Let me think step-by-step. I need to check memory.\nTool: <tool>exec</tool>\nCommand: <command>free -h</command>",
            "expected": ["free", "exec"]
        },
        {
            "name": "System Status",
            "baseline": "Show system uptime with 'uptime' command",
            "enhanced": "Let me break this down:\n<tool_invocation>\n<tool>exec</tool>\n<command>uptime</command>\n</tool_invocation>",
            "expected": ["uptime", "exec"]
        },
        {
            "name": "Disk Usage",
            "baseline": "Use 'du -sh ~' to check disk usage",
            "enhanced": "Before invoking the tool, I will check disk usage.\nExample: <tool>exec</tool> with <command>du -sh ~</command>",
            "expected": ["du", "exec"]
        }
    ]
    
    results_by_model = {}
    
    for model in MODELS:
        print(f"\nTesting: {model}")
        print(f"{'─'*70}")
        
        model_data = {"baseline_pass": 0, "enhanced_pass": 0, "tests": []}
        
        for test in prompts:
            baseline_response = call_ollama_stream(model, test["baseline"], timeout_s=20)
            baseline_tools, baseline_success = detect_tool_calls(baseline_response, test["expected"])
            
            enhanced_response = call_ollama_stream(model, test["enhanced"], timeout_s=20)
            enhanced_tools, enhanced_success = detect_tool_calls(enhanced_response, test["expected"])
            
            if baseline_success:
                model_data["baseline_pass"] += 1
            if enhanced_success:
                model_data["enhanced_pass"] += 1
            
            status_b = "✅" if baseline_success else "❌"
            status_e = "✅" if enhanced_success else "❌"
            
            print(f"  {test['name']:<25} Baseline: {status_b}  Enhanced: {status_e}")
            
            model_data["tests"].append({
                "name": test["name"],
                "baseline_success": baseline_success,
                "enhanced_success": enhanced_success,
                "baseline_tools": baseline_tools,
                "enhanced_tools": enhanced_tools
            })
            
            time.sleep(0.5)  # Brief pause between tests
        
        results_by_model[model] = model_data
    
    # Summary
    print(f"\n{'='*70}")
    print("RESULTS SUMMARY")
    print(f"{'='*70}\n")
    
    print(f"{'Model':<20} {'Baseline':>15} {'Enhanced':>15} {'Improvement':>15}")
    print(f"{'-'*20} {'-'*15} {'-'*15} {'-'*15}")
    
    total_improvements = 0
    total_tests = len(MODELS) * len(prompts)
    
    for model, data in results_by_model.items():
        baseline_pct = (data["baseline_pass"] / len(prompts) * 100) if prompts else 0
        enhanced_pct = (data["enhanced_pass"] / len(prompts) * 100) if prompts else 0
        improvement = enhanced_pct - baseline_pct
        
        if improvement > 0:
            improvement_str = f"+{improvement:.0f}%"
            total_improvements += (data["enhanced_pass"] - data["baseline_pass"])
        else:
            improvement_str = f"{improvement:.0f}%"
        
        print(f"{model:<20} {baseline_pct:>14.0f}% {enhanced_pct:>14.0f}% {improvement_str:>14}")
    
    # Calculate averages
    avg_baseline = sum(d["baseline_pass"] for d in results_by_model.values()) / len(MODELS) / len(prompts) * 100
    avg_enhanced = sum(d["enhanced_pass"] for d in results_by_model.values()) / len(MODELS) / len(prompts) * 100
    avg_improvement = avg_enhanced - avg_baseline
    
    print(f"{'-'*20} {'-'*15} {'-'*15} {'-'*15}")
    print(f"{'AVERAGE':<20} {avg_baseline:>14.0f}% {avg_enhanced:>14.0f}% {avg_improvement:>+14.0f}%")
    
    # Verdict
    print(f"\n{'='*70}")
    if avg_improvement > 5:
        print(f"✅ HYPOTHESIS SUPPORTED: Enhanced prompting improved tool-use by {avg_improvement:.0f}%")
    elif avg_improvement > 0:
        print(f"✅ PARTIAL IMPROVEMENT: Enhanced prompting improved tool-use by {avg_improvement:.0f}%")
    elif avg_improvement == 0:
        print(f"⚠️  NO SIGNIFICANT DIFFERENCE: Both approaches had same success rate")
    else:
        print(f"❌ REGRESSION: Enhanced prompting decreased success by {abs(avg_improvement):.0f}%")
    print(f"{'='*70}\n")
    
    # Save results
    output = {
        "timestamp": datetime.now().isoformat(),
        "models": MODELS,
        "prompts_tested": len(prompts),
        "results_by_model": results_by_model,
        "summary": {
            "avg_baseline_pct": round(avg_baseline, 1),
            "avg_enhanced_pct": round(avg_enhanced, 1),
            "avg_improvement_pct": round(avg_improvement, 1),
            "total_improvements": total_improvements
        },
        "hypothesis": "Enhanced prompting (few-shot, XML, step-by-step) improves tool-use success",
        "tested_improvements": [
            "Few-shot examples with correct tool invocation patterns",
            "XML/structured format for tool and command tags",
            "Step-by-step reasoning before tool invocation",
            "Explicit <tool_invocation> markers"
        ]
    }
    
    out_file = Path(__file__).parent / f"PHASE_3_RESULTS_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(out_file, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"Results saved: {out_file}\n")

if __name__ == "__main__":
    main()
