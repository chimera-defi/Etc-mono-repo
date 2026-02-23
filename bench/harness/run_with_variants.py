#!/usr/bin/env python3
"""
Phase 2 Test Runner: Atomic benchmarks with per-model harness variants
Usage: python3 run_with_variants.py [model] [variant]
Example: python3 run_with_variants.py lfm2.5-thinking:1.2b atomic
"""

import sys
import json
import time
import signal
import ollama
from pathlib import Path

TIMEOUT_SECONDS = 60

class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError(f"Prompt exceeded {TIMEOUT_SECONDS}s")

# Import harness config
harness_config = json.loads(
    Path("/root/.openclaw/workspace/bench/harness/phase2_config.json").read_text()
)

MODELS_CONFIG = harness_config["models"]
EARLY_EXIT = harness_config["early_exit"]

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a given city.",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string", "description": "City name"}},
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_files",
            "description": "Search for files matching a pattern.",
            "parameters": {
                "type": "object",
                "properties": {"pattern": {"type": "string", "description": "Glob pattern"}},
                "required": ["pattern"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_meeting",
            "description": "Schedule a meeting.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Meeting title"},
                    "time": {"type": "string", "description": "Meeting time"},
                },
                "required": ["title", "time"],
            },
        },
    },
]

ATOMIC_PROMPTS = [
    ("P1", "What's the weather in Antwerp?", ["get_weather"]),
    ("P2", "Search for all Python files in the project.", ["search_files"]),
    ("P3", "Schedule a meeting with John at 3 PM tomorrow.", ["schedule_meeting"]),
    ("P4", "I'm heading to Brussels tomorrow, anything I should know?", ["get_weather"]),
    ("P5", "What tools do you have access to?", []),
    ("P6", "What's the weather in the city where we have our next sprint review?", []),
    ("P7", "Next Tuesday at 2pm, I need a meeting about Q1 planning and weather for outdoor venue.", ["schedule_meeting"]),
    ("P8", "Search for budget files and tell me weather in Amsterdam.", ["search_files", "get_weather"]),
    ("P9", "Can you write a Python script that checks the weather using an API?", []),
    ("P10", "I have meeting with client in Bruges next Thursday. Take train or cycle?", ["get_weather"]),
    ("P11", "Don't check weather in Antwerp, find quarterly report.", ["search_files"]),
    ("P12", "Weather is 8°C and rainy. Can you schedule a meeting with John tomorrow at 2pm?", ["schedule_meeting"]),
]

def run_atomic(model: str, variant: str = "atomic") -> dict:
    """Run atomic suite on a model with variant harness"""
    
    config = MODELS_CONFIG.get(model)
    if not config:
        return {"error": f"Model {model} not in config"}
    
    variant_config = config["variants"].get(variant, {})
    system_prompt = variant_config.get("system")
    
    results = {
        "model": model,
        "variant": variant,
        "timestamp": time.time(),
        "config_name": config["name"],
        "arch": config["arch"],
        "system_prompt": system_prompt,
        "results": [],
        "failed_prompts": []
    }
    
    passed = 0
    total = 0
    restraint_passed = 0
    restraint_total = 0
    
    print(f"🔄 {config['name']} ({variant} variant)")
    print("=" * 70)
    
    for prompt_id, prompt_text, expected in ATOMIC_PROMPTS:
        total += 1
        messages = [{"role": "user", "content": prompt_text}]
        
        start = time.time()
        got = []
        err = None
        timed_out = False
        
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(TIMEOUT_SECONDS)
        
        try:
            response = ollama.chat(
                model=model,
                messages=[{"role": "system", "content": system_prompt}] + messages,
                tools=TOOLS,
                stream=False,
                options={"temperature": 0.0}
            )
            
            msg = response.get("message", {})
            got = [tc["function"]["name"] for tc in msg.get("tool_calls", []) if "function" in tc]
            
        except TimeoutError:
            err = f"TIMEOUT({TIMEOUT_SECONDS}s)"
            timed_out = True
        except Exception as e:
            err = str(e)[:100]
        finally:
            signal.alarm(0)
        
        latency_ms = (time.time() - start) * 1000
        correct = (set(got) == set(expected)) if not err else False
        
        if correct:
            passed += 1
        
        # Track restraint (no-tool cases)
        if expected == []:
            restraint_total += 1
            if correct:
                restraint_passed += 1
        
        status = "✅" if correct else "❌"
        print(f"{status} {prompt_id}: {latency_ms:.0f}ms")
        
        results["results"].append({
            "prompt_id": prompt_id,
            "expected": expected,
            "got": got,
            "correct": correct,
            "latency_ms": latency_ms,
            "error": err,
            "timeout": timed_out
        })
        
        if not correct:
            results["failed_prompts"].append(prompt_id)
    
    # Calculate scores
    results["passed"] = passed
    results["total"] = total
    results["accuracy"] = passed / total if total else 0
    results["restraint_score"] = restraint_passed / restraint_total if restraint_total else 0
    
    print("=" * 70)
    print(f"FINAL: {passed}/{total} ({results['accuracy']*100:.1f}%) | Restraint: {results['restraint_score']:.2f}")
    
    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 run_with_variants.py <model> [variant]")
        print("Example: python3 run_with_variants.py lfm2.5-thinking:1.2b atomic")
        sys.exit(1)
    
    model = sys.argv[1]
    variant = sys.argv[2] if len(sys.argv) > 2 else "atomic"
    
    results = run_atomic(model, variant)
    
    # Save
    model_name = model.split(":")[0]
    output_path = f"/root/.openclaw/workspace/bench/phase2_results_{model_name}_{variant}.json"
    Path(output_path).write_text(json.dumps(results, indent=2))
    
    print(f"\n✅ Saved: {output_path}")
