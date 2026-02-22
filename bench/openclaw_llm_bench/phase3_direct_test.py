#!/usr/bin/env python3
"""Phase 3 Direct Test - Call models directly and measure tool-use success."""

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
    
    detected_tools = []
    backtick_matches = re.findall(r'`([a-z0-9\-_.]+)', text, re.IGNORECASE)
    detected_tools.extend([m.split()[0] for m in backtick_matches])
    
    quoted_matches = re.findall(r'["\']([a-z0-9\-_.]+)\s', text)
    detected_tools.extend([m for m in quoted_matches])
    
    shell_matches = re.findall(r'[$#]\s+([a-z0-9\-_.]+)', text)
    detected_tools.extend([m for m in shell_matches])
    
    xml_matches = re.findall(r'<tool>([a-z0-9\-_.]+)</tool>', text, re.IGNORECASE)
    detected_tools.extend(xml_matches)
    
    bracket_matches = re.findall(r'\[(?:tool|TOOL):\s*([a-z0-9\-_.]+)\]', text)
    detected_tools.extend(bracket_matches)
    
    command_matches = re.findall(r'<command>([a-z0-9\-_.]+)', text, re.IGNORECASE)
    detected_tools.extend([m.split()[0] for m in command_matches])
    
    normalized = list(set(t.split()[0].lower() for t in detected_tools if t))
    
    if expected_tools:
        expected_set = {t.lower() for t in expected_tools}
        found_set = {t.lower() for t in normalized}
        success = bool(found_set & expected_set)
    else:
        success = len(normalized) > 0
    
    return normalized, success

def call_ollama(model, prompt, timeout_s=30):
    """Call Ollama model."""
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "temperature": 0.7
    }
    
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(f"{OLLAMA_BASE}/chat/completions", data=data, method="POST")
        req.add_header("Content-Type", "application/json")
        
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        return f"ERROR: {e}"

def main():
    print("\n" + "="*70)
    print("PHASE 3 DIRECT TEST: Tool-Use Prompting Improvements")
    print("="*70)
    print(f"\nTimestamp: {datetime.now().isoformat()}")
    print(f"Models: {', '.join(MODELS)}")
    print(f"\nHypothesis: Enhanced prompting (few-shot, XML, CoT) improves tool detection")
    print(f"{'='*70}\n")
    
    # Baseline prompt
    baseline_prompt = """Get current server memory status. Call the 'free -h' command and report the available memory in human-readable format. Your response must include the actual command output or a summary derived from it."""
    
    # Enhanced prompt with few-shot and CoT
    enhanced_prompt = """Let me think through this step by step.

Before invoking tools, I will: check the available memory using a system command that shows memory usage in human-readable format.

Available tools:
<tool>
  <name>exec</name>
  <args>command: a shell command to execute</args>
</tool>

Here is an example of a correct tool invocation:
Example 1:
Task: Check disk space
Reasoning: I need to see how much disk space is available. The 'df' command with '-h' flag shows this in human-readable format.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>df -h</command>
</tool_invocation>

Now for the actual task:
Task: Get current server memory status. Call the 'free -h' command and report the available memory in human-readable format.

Reasoning: I need to check the server's memory status. The 'free -h' command shows memory usage in human-readable format (MB, GB).

Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>free -h</command>
</tool_invocation>"""

    all_results = []
    
    for model in MODELS:
        print(f"Testing: {model}")
        print(f"{'─'*70}")
        
        model_results = {
            "model": model,
            "baseline": {"detected_tools": [], "success": False, "response": ""},
            "enhanced": {"detected_tools": [], "success": False, "response": ""}
        }
        
        # Test baseline
        print(f"  [1/2] Baseline prompt...", end=" ", flush=True)
        try:
            response = call_ollama(model, baseline_prompt, timeout_s=60)
            tools, success = detect_tool_calls(response, ["free", "exec"])
            model_results["baseline"] = {
                "detected_tools": tools,
                "success": success,
                "response": response[:100] + "..." if len(response) > 100 else response
            }
            print(f"✅ {'PASS' if success else 'FAIL'} (detected: {tools})")
        except Exception as e:
            print(f"❌ ERROR: {e}")
        
        time.sleep(1)
        
        # Test enhanced
        print(f"  [2/2] Enhanced prompt...", end=" ", flush=True)
        try:
            response = call_ollama(model, enhanced_prompt, timeout_s=60)
            tools, success = detect_tool_calls(response, ["free", "exec"])
            model_results["enhanced"] = {
                "detected_tools": tools,
                "success": success,
                "response": response[:100] + "..." if len(response) > 100 else response
            }
            print(f"✅ {'PASS' if success else 'FAIL'} (detected: {tools})")
        except Exception as e:
            print(f"❌ ERROR: {e}")
        
        all_results.append(model_results)
        print()
        time.sleep(2)
    
    # Summary
    print("="*70)
    print("RESULTS SUMMARY")
    print("="*70)
    print()
    print(f"{'Model':<18} {'Baseline':>15} {'Enhanced':>15} {'Improvement':>15}")
    print(f"{'-'*18} {'-'*15} {'-'*15} {'-'*15}")
    
    improvements = []
    for r in all_results:
        baseline_pass = r["baseline"]["success"]
        enhanced_pass = r["enhanced"]["success"]
        
        baseline_str = "✅ PASS" if baseline_pass else "❌ FAIL"
        enhanced_str = "✅ PASS" if enhanced_pass else "❌ FAIL"
        
        if not baseline_pass and enhanced_pass:
            improvement = "↑ FIXED"
        elif baseline_pass and enhanced_pass:
            improvement = "= BOTH PASS"
        elif not baseline_pass and not enhanced_pass:
            improvement = "= BOTH FAIL"
        else:
            improvement = "↓ REGRESSION"
        
        improvements.append(improvement)
        print(f"{r['model']:<18} {baseline_str:>15} {enhanced_str:>15} {improvement:>15}")
    
    # Final verdict
    fixes = sum(1 for i in improvements if "FIXED" in i)
    regressions = sum(1 for i in improvements if "REGRESSION" in i)
    
    print()
    print("="*70)
    if fixes > 0 and regressions == 0:
        print(f"✅ RESULT: Enhanced prompting improved {fixes}/{len(MODELS)} models!")
    elif regressions > 0:
        print(f"❌ RESULT: Enhanced prompting regressed {regressions} models!")
    else:
        print(f"⚠️  RESULT: No improvement detected (all models {improvements[0].split()[0]})")
    print("="*70)
    
    # Save results
    output = {
        "timestamp": datetime.now().isoformat(),
        "models_tested": MODELS,
        "results": all_results,
        "improvements": improvements,
        "hypothesis": "Enhanced prompting (few-shot, XML, CoT) improves tool-use success",
        "tested_improvements": [
            "Few-shot examples (1-2 correct invocations before actual prompt)",
            "XML structure for tool definitions and invocations",
            "Chain-of-thought reasoning before tool invocation",
            "Step-by-step task breakdown"
        ]
    }
    
    out_file = Path(__file__).parent / f"PHASE_3_DIRECT_RESULTS_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(out_file, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nResults saved: {out_file}")
    print()

if __name__ == "__main__":
    main()
