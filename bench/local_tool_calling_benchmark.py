#!/usr/bin/env python3
"""
Local tool-calling benchmark using MikeVeerman's methodology.
Tests LFM2.5-1.2B vs Qwen2.5:3B with their prompt suite + scoring.
LOCAL MODELS ONLY.
"""

import json
import re
import subprocess
import time
from typing import Optional

import ollama

# =============================================================================
# Test Prompts (from MikeVeerman's suite)
# =============================================================================

TEST_PROMPTS = [
    # Easy (P1-P3): Direct tool calls
    {"id": "P1", "text": "What's the weather in Antwerp?", "expected_tool": "get_weather", "category": "easy"},
    {"id": "P2", "text": "Search for all Python files in the project.", "expected_tool": "search_files", "category": "easy"},
    {"id": "P3", "text": "Schedule a meeting with John at 3 PM tomorrow.", "expected_tool": "schedule_meeting", "category": "easy"},
    
    # Ambiguous (P4): Judgment call
    {"id": "P4", "text": "I'm heading to Brussels tomorrow, anything I should know?", "expected_tool": "get_weather", "category": "ambiguous"},
    
    # Restraint (P5, P9): Should NOT call
    {"id": "P5", "text": "What tools do you have access to?", "expected_tool": None, "category": "restraint"},
    {"id": "P9", "text": "Can you write a Python script that checks the weather using an API?", "expected_tool": None, "category": "restraint"},
    
    # Complex (P6-P8)
    {"id": "P6", "text": "What's the weather in the city where we have our next sprint review?", "expected_tool": None, "category": "hard", "reason": "Missing context"},
    {"id": "P7", "text": "Next Tuesday at 2pm, I need a meeting with the team about Q1 planning and a quick weather check for the outdoor venue.", "expected_tool": "schedule_meeting", "category": "hard"},
    {"id": "P8", "text": "Search for the budget files and also tell me the weather in Amsterdam.", "expected_tool": ["search_files", "get_weather"], "category": "hard"},
    
    # Hard judgment (P10-P12): Implicit reasoning
    {"id": "P10", "text": "I have a meeting with a client in Bruges next Thursday. Should I take the train or cycle?", "expected_tool": "get_weather", "category": "judgment", "reason": "Transport depends on weather"},
    {"id": "P11", "text": "Don't check the weather in Antwerp, just find me the quarterly report.", "expected_tool": "search_files", "category": "judgment", "reason": "Must ignore keyword 'weather'"},
    {"id": "P12", "text": "The weather in Antwerp is 8°C and rainy. Should I schedule an indoor meeting with Jan?", "expected_tool": "schedule_meeting", "category": "judgment", "reason": "Weather already provided, don't call get_weather"},
]

RESTRAINT_INDICES = [4, 8]  # P5, P9
HARD_JUDGMENT_INDICES = [9, 10, 11]  # P10, P11, P12
WRONG_TOOL_MAP = {
    9: "schedule_meeting",  # P10: wrong to call schedule_meeting
    10: "get_weather",      # P11: wrong to call get_weather
    11: "get_weather",      # P12: wrong to call get_weather
}

# =============================================================================
# Multi-Format Parser (from MikeVeerman)
# =============================================================================

def parse_bracket_notation(content: str) -> Optional[dict]:
    """Parse LFM2.5 bracket notation: [get_weather(city="Antwerp")]"""
    match = re.search(r'\[(\w+)\((.*?)\)\]', content)
    if match:
        tool_name = match.group(1)
        args_str = match.group(2)
        # Simple parsing of key="value" pairs
        args = {}
        for pair in re.findall(r'(\w+)=["\']?([^",\']+)["\']?', args_str):
            args[pair[0]] = pair[1]
        return {"name": tool_name, "arguments": args}
    return None

def parse_tag_notation(content: str) -> Optional[dict]:
    """Parse tag notation: <tool_call>{"name": "...", "arguments": {...}}</tool_call>"""
    match = re.search(r'<tool_call>(.*?)</tool_call>', content, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    return None

def parse_bare_json(content: str) -> Optional[dict]:
    """Parse bare JSON: {"name": "...", "arguments": {...}}"""
    match = re.search(r'\{[^{}]*"name"[^{}]*"arguments"[^{}]*\}', content)
    if match:
        try:
            obj = json.loads(match.group(0))
            if "name" in obj and "arguments" in obj:
                return obj
        except json.JSONDecodeError:
            pass
    return None

def extract_tool_calls(content: str) -> list[dict]:
    """Try all parsers and return list of tool calls found."""
    results = []
    
    # Try bracket notation (LFM2.5)
    bracket = parse_bracket_notation(content)
    if bracket:
        results.append(bracket)
    
    # Try tag notation
    tag = parse_tag_notation(content)
    if tag:
        results.append(tag)
    
    # Try bare JSON
    if not results:
        bare = parse_bare_json(content)
        if bare:
            results.append(bare)
    
    return results

# =============================================================================
# Benchmark Runner
# =============================================================================

def run_prompt(model: str, prompt: str) -> dict:
    """Run a single prompt and extract tool calls."""
    t0 = time.perf_counter()
    try:
        response = ollama.generate(model=model, prompt=prompt, stream=False)
        latency_ms = (time.perf_counter() - t0) * 1000
        
        tool_calls = extract_tool_calls(response.get("response", ""))
        
        return {
            "success": True,
            "latency_ms": latency_ms,
            "raw_response": response.get("response", "")[:200],
            "tool_calls": tool_calls,
            "tool_count": len(tool_calls),
        }
    except Exception as e:
        latency_ms = (time.perf_counter() - t0) * 1000
        return {
            "success": False,
            "error": str(e),
            "latency_ms": latency_ms,
            "tool_calls": [],
            "tool_count": 0,
        }

def score_result(result: dict, prompt_idx: int, prompt: dict) -> dict:
    """Score a single result."""
    score = {
        "tool_called": len(result["tool_calls"]) > 0,
        "tool_names": [tc.get("name") for tc in result["tool_calls"]],
        "correct_tool": False,
        "wrong_tool": False,
        "action_score": 0,
        "restraint_score": 0,
    }
    
    expected = prompt.get("expected_tool")
    
    if prompt_idx in RESTRAINT_INDICES:
        # Should NOT call
        if not score["tool_called"]:
            score["restraint_score"] = 1.0
        else:
            score["restraint_score"] = 0.0
            if prompt_idx in WRONG_TOOL_MAP:
                wrong_tool = WRONG_TOOL_MAP[prompt_idx]
                if wrong_tool in score["tool_names"]:
                    score["wrong_tool"] = True
    else:
        # Should call a tool
        if expected and isinstance(expected, list):
            # Multi-tool
            if all(e in score["tool_names"] for e in expected):
                score["correct_tool"] = True
                score["action_score"] = 1.0
        elif expected:
            # Single tool
            if expected in score["tool_names"]:
                score["correct_tool"] = True
                score["action_score"] = 1.0
            elif score["tool_called"] and expected is None:
                # Called tool when shouldn't
                pass
        
        # Check for wrong tool on hard judgment
        if prompt_idx in HARD_JUDGMENT_INDICES and prompt_idx in WRONG_TOOL_MAP:
            wrong_tool = WRONG_TOOL_MAP[prompt_idx]
            if wrong_tool in score["tool_names"]:
                score["wrong_tool"] = True
    
    return score

def run_benchmark(models: list[str]) -> dict:
    """Run full benchmark on specified models."""
    results = {}
    
    for model in models:
        print(f"\n{'='*60}")
        print(f"Testing: {model}")
        print('='*60)
        
        model_results = {
            "runs": [],
            "aggregate": {},
        }
        
        # 3 runs
        for run_num in range(3):
            print(f"\nRun {run_num + 1}/3...")
            run_data = {
                "prompts": [],
                "action_score": 0,
                "restraint_score": 0,
                "wrong_tools": 0,
            }
            
            for prompt_idx, prompt in enumerate(TEST_PROMPTS):
                result = run_prompt(model, prompt["text"])
                score = score_result(result, prompt_idx, prompt)
                
                run_data["prompts"].append({
                    "id": prompt["id"],
                    "result": result,
                    "score": score,
                })
                
                run_data["action_score"] += score.get("action_score", 0)
                run_data["restraint_score"] += score.get("restraint_score", 0)
                run_data["wrong_tools"] += (1 if score.get("wrong_tool") else 0)
                
                status = "✅" if score.get("correct_tool") or score.get("restraint_score") > 0 else "❌"
                print(f"  {status} {prompt['id']}: {result['latency_ms']:.0f}ms")
                time.sleep(0.5)
            
            model_results["runs"].append(run_data)
        
        # Aggregate (majority voting)
        action_passes = sum(1 for run in model_results["runs"] if run["action_score"] >= 5)
        restraint_passes = sum(1 for run in model_results["runs"] if run["restraint_score"] >= 1)
        wrong_tool_avg = sum(run["wrong_tools"] for run in model_results["runs"]) / 3
        
        action_score = action_passes / 3
        restraint_score = restraint_passes / 3
        wrong_tool_avoidance = (3 - wrong_tool_avg) / 3
        
        agent_score = (
            action_score * 0.4 +
            restraint_score * 0.3 +
            wrong_tool_avoidance * 0.3
        )
        
        avg_latency = sum(
            r["prompts"][i]["result"]["latency_ms"]
            for run in model_results["runs"]
            for i, r in enumerate(run["prompts"])
        ) / (3 * len(TEST_PROMPTS))
        
        model_results["aggregate"] = {
            "action_score": action_score,
            "restraint_score": restraint_score,
            "wrong_tool_avoidance": wrong_tool_avoidance,
            "agent_score": agent_score,
            "avg_latency_ms": avg_latency,
        }
        
        results[model] = model_results
        
        print(f"\nAggregate Results for {model}:")
        print(f"  Action Score:    {action_score:.3f}")
        print(f"  Restraint Score: {restraint_score:.3f}")
        print(f"  Wrong-Tool Avoid: {wrong_tool_avoidance:.3f}")
        print(f"  Agent Score:     {agent_score:.3f} ⭐")
        print(f"  Avg Latency:     {avg_latency:.0f}ms")
    
    return results

# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    models_to_test = [
        "lfm2.5-thinking:1.2b",
        "qwen2.5:3b",
    ]
    
    print("Local Tool-Calling Benchmark (MikeVeerman Methodology)")
    print("LOCAL MODELS ONLY")
    print(f"Testing: {', '.join(models_to_test)}")
    
    results = run_benchmark(models_to_test)
    
    # Save results
    with open("/root/.openclaw/workspace/bench/local_tool_calling_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n{'='*60}")
    print("FINAL RESULTS")
    print('='*60)
    
    for model, data in results.items():
        agg = data["aggregate"]
        print(f"\n{model}:")
        print(f"  Agent Score: {agg['agent_score']:.3f}")
        print(f"  Action:      {agg['action_score']:.3f}")
        print(f"  Restraint:   {agg['restraint_score']:.3f}")
        print(f"  Latency:     {agg['avg_latency_ms']:.0f}ms")
