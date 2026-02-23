#!/usr/bin/env python3
"""
Consolidated Benchmark Runner - Phase 1 (Atomic + Extended) & Phase 2
Single CLI for all benchmark phases, models, and variants

Usage:
  python3 run_benchmark.py <model> [phase] [variant] [--output json|csv]

Examples:
  python3 run_benchmark.py lfm2.5-thinking:1.2b atomic atomic
  python3 run_benchmark.py mistral:7b extended atomic --output csv
  python3 run_benchmark.py gpt-oss:latest phase2 atomic

Phases:
  - atomic     : P1-P12 (core tool-calling validation)
  - extended   : P13-P30 (multi-turn, state tracking, restraint)
  - phase2     : alias for atomic (phase 2 harness focus)

Variants:
  - atomic     : baseline for atomic prompts
  - extended   : multi-turn context aware
  - other      : model-specific (check phase2_config.json)
"""

import sys
import json
import time
import signal
import csv
import argparse
import inspect
import socket
import subprocess
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import ollama

from parsers.tool_call_parsers import parse_all_tool_calls
from config_manager import ConfigManager
from routing_log import log_routing_decision

# Constants
TIMEOUT_SECONDS = 60
WORKSPACE = Path("/root/.openclaw/workspace/bench")
CONFIG_PATH = WORKSPACE / "harness" / "phase2_config.json"
SUITE_PATH = WORKSPACE / "extended_benchmark_suite.json"

# =============================================================================
# ATOMIC PHASE PROMPTS (P1-P12)
# =============================================================================

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

# =============================================================================
# TOOLS DEFINITION
# =============================================================================

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

# =============================================================================
# TIMEOUT HANDLING
# =============================================================================

class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError(f"Prompt exceeded {TIMEOUT_SECONDS}s")


def _coerce_message(response: Any) -> Dict[str, Any]:
    """Handle dict- and object-style Ollama responses."""
    if response is None:
        return {}

    if isinstance(response, dict):
        msg = response.get("message")
    else:
        msg = getattr(response, "message", None)

    if isinstance(msg, dict):
        return msg

    if msg is not None:
        return {
            "content": getattr(msg, "content", None),
            "tool_calls": getattr(msg, "tool_calls", None),
        }
    return {}


def extract_tool_names(message: Any) -> list[str]:
    """Extract tool names from native tool_calls; fallback to content parsing."""
    if message is None:
        return []

    # dict-like path
    if isinstance(message, dict):
        tool_calls = message.get("tool_calls")
        content = message.get("content")
    else:
        tool_calls = getattr(message, "tool_calls", None)
        content = getattr(message, "content", None)

    names: list[str] = []

    # Native API extraction
    if isinstance(tool_calls, (list, tuple)):
        for tc in tool_calls:
            if isinstance(tc, dict):
                fn = tc.get("function")
                if isinstance(fn, dict):
                    name = fn.get("name")
                else:
                    name = getattr(fn, "name", None)
            else:
                fn = getattr(tc, "function", None)
                name = getattr(fn, "name", None)

            if isinstance(name, str) and name:
                names.append(name)

    # Text fallback extraction for bracket/tag/bare formats
    if isinstance(content, str) and content.strip():
        for call in parse_all_tool_calls(content):
            name = call.get("name") if isinstance(call, dict) else None
            if isinstance(name, str) and name:
                names.append(name)

    # De-duplicate while preserving order
    return list(dict.fromkeys(names))


def _is_retryable_error(exc: Exception) -> bool:
    """Best-effort classification for transient network/service errors."""
    if isinstance(exc, (socket.timeout, TimeoutError, ConnectionError)):
        return True

    msg = str(exc).lower()
    transient_tokens = [
        "timed out", "timeout", "connection reset", "connection refused",
        "temporarily unavailable", "unavailable", "service unavailable",
        "econnreset", "econnrefused", "broken pipe", "eof",
    ]
    return any(token in msg for token in transient_tokens)


def _ollama_chat_isolated(max_retries: int = 1, retry_backoff_s: float = 1.0, **kwargs):
    """Run ollama.chat in a subprocess to guarantee hard timeout boundaries."""
    worker = r'''
import json, time, inspect, ollama, socket, sys
payload = json.loads(sys.argv[1])
max_retries = int(payload.pop("_max_retries", 1))
retry_backoff_s = float(payload.pop("_retry_backoff_s", 1.0))
timeout_seconds = int(payload.pop("_timeout_seconds", 60))

if "timeout" in inspect.signature(ollama.chat).parameters:
    payload["timeout"] = timeout_seconds

last_exc = None
for attempt in range(1, max(1, max_retries) + 1):
    try:
        resp = ollama.chat(**payload)
        msg = resp.get("message") if isinstance(resp, dict) else getattr(resp, "message", None)
        if not isinstance(msg, dict):
            msg = {
                "content": getattr(msg, "content", None),
                "tool_calls": getattr(msg, "tool_calls", None),
            }
        norm_calls = []
        raw_calls = msg.get("tool_calls")
        if isinstance(raw_calls, (list, tuple)):
            for tc in raw_calls:
                if isinstance(tc, dict):
                    fn = tc.get("function")
                    if isinstance(fn, dict):
                        name = fn.get("name")
                    else:
                        name = getattr(fn, "name", None)
                else:
                    fn = getattr(tc, "function", None)
                    name = getattr(fn, "name", None)
                if isinstance(name, str) and name:
                    norm_calls.append({"function": {"name": name}})
        out = {"message": {"content": msg.get("content"), "tool_calls": norm_calls}}
        print(json.dumps(out))
        sys.exit(0)
    except Exception as exc:
        last_exc = exc
        msg = str(exc).lower()
        retryable = any(t in msg for t in ["timed out","timeout","connection reset","connection refused","unavailable","econnreset","econnrefused","broken pipe","eof"])
        if attempt >= max(1, max_retries) or not retryable:
            raise
        time.sleep(retry_backoff_s * attempt)
'''

    payload = dict(kwargs)
    payload["_max_retries"] = max_retries
    payload["_retry_backoff_s"] = retry_backoff_s
    payload["_timeout_seconds"] = TIMEOUT_SECONDS

    cp = subprocess.run(
        ["python3", "-c", worker, json.dumps(payload)],
        capture_output=True,
        text=True,
        timeout=TIMEOUT_SECONDS + 5,
        check=False,
    )
    if cp.returncode != 0:
        stderr = (cp.stderr or cp.stdout or "").strip()
        raise RuntimeError(stderr[:300] or "isolated ollama chat failed")

    lines = [ln for ln in cp.stdout.splitlines() if ln.strip()]
    if not lines:
        raise RuntimeError("isolated ollama chat produced no output")
    return json.loads(lines[-1])


def ollama_chat_with_optional_timeout(
    max_retries: int = 1,
    retry_backoff_s: float = 1.0,
    isolate_call: bool = False,
    **kwargs,
):
    """Pass timeout when supported and retry transient network/service errors."""
    if isolate_call:
        return _ollama_chat_isolated(
            max_retries=max_retries,
            retry_backoff_s=retry_backoff_s,
            **kwargs,
        )

    if "timeout" in inspect.signature(ollama.chat).parameters:
        kwargs["timeout"] = TIMEOUT_SECONDS

    attempts = max(1, max_retries)
    last_exc: Optional[Exception] = None

    for attempt in range(1, attempts + 1):
        try:
            return ollama.chat(**kwargs)
        except Exception as exc:
            last_exc = exc
            if attempt >= attempts or not _is_retryable_error(exc):
                raise
            time.sleep(retry_backoff_s * attempt)

    if last_exc:
        raise last_exc
    raise RuntimeError("ollama.chat failed without a concrete exception")

# =============================================================================
# CONFIG LOADING
# =============================================================================

def load_harness_config() -> Dict:
    """Load phase2_config.json with models and variants"""
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Config not found: {CONFIG_PATH}")
    return json.loads(CONFIG_PATH.read_text())

def load_extended_suite(suite_path: Optional[Path] = None) -> Dict:
    """Load extended suite (P13-P30), optionally from a custom path."""
    path = suite_path or SUITE_PATH
    if not path.exists():
        raise FileNotFoundError(f"Extended suite not found: {path}")
    return json.loads(path.read_text())

def get_model_config(model: str, config: Dict) -> Dict:
    """Get configuration for a specific model"""
    if model not in config["models"]:
        raise ValueError(f"Model '{model}' not found in config. Available: {list(config['models'].keys())}")
    return config["models"][model]

def get_variant_config(model: str, variant: str, config: Dict) -> Dict:
    """Get variant-specific configuration"""
    model_cfg = get_model_config(model, config)
    if variant not in model_cfg.get("variants", {}):
        available = list(model_cfg.get("variants", {}).keys())
        raise ValueError(f"Variant '{variant}' not found for {model}. Available: {available}")
    return model_cfg["variants"][variant]

# =============================================================================
# DATA MODELS
# =============================================================================

@dataclass
class PromptResult:
    """Result for a single prompt"""
    prompt_id: str
    expected: List[str]
    got: List[str]
    correct: bool
    latency_ms: float
    error: Optional[str] = None
    timeout: bool = False
    assistant_content: Optional[str] = None

@dataclass
class PhaseResult:
    """Result for a phase run"""
    model: str
    phase: str
    variant: str
    timestamp: float
    config_name: str
    system_prompt: str
    passed: int
    total: int
    accuracy: float
    results: List[PromptResult]
    failed_prompts: List[str]
    restraint_score: Optional[float] = None  # For atomic phase
    by_category: Optional[Dict] = None  # For extended phase
    notes: str = ""

# =============================================================================
# PHASE IMPLEMENTATIONS
# =============================================================================

def _load_completed_prompt_ids(debug_log_path: Optional[Path], phase: str, model: str, variant: str) -> set[str]:
    done: set[str] = set()
    if not debug_log_path or not debug_log_path.exists():
        return done
    try:
        for line in debug_log_path.read_text().splitlines():
            if not line.strip():
                continue
            row = json.loads(line)
            if row.get('phase') == phase and row.get('model') == model and row.get('variant') == variant:
                pid = row.get('prompt_id')
                if isinstance(pid, str) and pid:
                    done.add(pid)
    except Exception:
        return done
    return done


def run_atomic_phase(model: str, variant: str, config: Dict, max_retries: int = 1, isolate_call: bool = False, fail_fast: bool = False, early_exit_failures: int = 0, debug_log_path: Optional[Path] = None, resume_debug: bool = False) -> PhaseResult:
    """Run atomic phase (P1-P12)"""
    
    model_cfg = get_model_config(model, config)
    variant_cfg = get_variant_config(model, variant, config)
    system_prompt = variant_cfg.get("system", model_cfg.get("system_prompt"))
    
    results = []
    passed = 0
    restraint_passed = 0
    restraint_total = 0
    failed = []
    
    print(f"\n🔄 ATOMIC PHASE: {model_cfg['name']} ({variant} variant)")
    print("=" * 80)
    
    failure_count = 0
    completed_ids = _load_completed_prompt_ids(debug_log_path, 'atomic', model, variant) if resume_debug else set()

    for prompt_id, prompt_text, expected in ATOMIC_PROMPTS:
        if prompt_id in completed_ids:
            print(f"↩️  SKIP {prompt_id}: already present in debug log")
            continue
        latency_ms = 0
        got = []
        err = None
        timed_out = False
        txt = None
        start = time.time()

        use_signal_timeout = not isolate_call
        if use_signal_timeout:
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(TIMEOUT_SECONDS)

        try:
            response = ollama_chat_with_optional_timeout(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt_text}
                ],
                tools=TOOLS,
                stream=False,
                options={"temperature": 0.0},
                max_retries=max_retries,
                isolate_call=isolate_call,
            )

            msg = _coerce_message(response)
            txt = msg.get("content")
            got = extract_tool_names(msg)

        except TimeoutError:
            err = f"TIMEOUT({TIMEOUT_SECONDS}s)"
            timed_out = True
        except Exception as e:
            err = str(e)[:100]
        finally:
            if use_signal_timeout:
                signal.alarm(0)

        latency_ms = (time.time() - start) * 1000
        
        # Evaluate
        correct = (set(got) == set(expected)) if not err else False
        if correct:
            passed += 1
        
        # Track restraint (no-tool cases)
        if expected == []:
            restraint_total += 1
            if correct:
                restraint_passed += 1
        
        if not correct:
            failed.append(prompt_id)
        
        status = "✅" if correct else "❌"
        exp_str = f"exp={expected}" if expected else "exp=[]"
        got_str = f"got={got}" if got else "got=[]"
        print(f"{status} {prompt_id}: {latency_ms:6.0f}ms | {exp_str:30s} {got_str}")
        
        if err:
            print(f"   └─ ERROR: {err}")
        
        results.append(PromptResult(
            prompt_id=prompt_id,
            expected=expected,
            got=got,
            correct=correct,
            latency_ms=latency_ms,
            error=err,
            timeout=timed_out,
            assistant_content=txt
        ))

        if not correct:
            failure_count += 1

        if debug_log_path is not None:
            debug_log_path.parent.mkdir(parents=True, exist_ok=True)
            with debug_log_path.open('a') as f:
                f.write(json.dumps({
                    'phase': 'atomic',
                    'model': model,
                    'variant': variant,
                    'prompt_id': prompt_id,
                    'expected': expected,
                    'got': got,
                    'correct': correct,
                    'latency_ms': round(latency_ms, 2),
                    'error': err,
                    'timeout': timed_out,
                    'assistant_content': txt,
                    'timestamp': time.time(),
                }) + '\n')

        if fail_fast and not correct:
            print(f"⛔ Fail-fast triggered at {prompt_id}")
            break
        if early_exit_failures > 0 and failure_count >= early_exit_failures:
            print(f"⛔ Early-exit: reached {failure_count} failures")
            break
    
    # Calculate scores
    total = len(results)
    accuracy = passed / total if total else 0
    restraint_score = restraint_passed / restraint_total if restraint_total else 0
    
    print("=" * 80)
    print(f"RESULT: {passed}/{total} passed ({accuracy*100:.1f}%) | Restraint: {restraint_score:.2f}")
    print("=" * 80)
    
    return PhaseResult(
        model=model,
        phase="atomic",
        variant=variant,
        timestamp=time.time(),
        config_name=model_cfg["name"],
        system_prompt=system_prompt,
        passed=passed,
        total=total,
        accuracy=accuracy,
        results=results,
        failed_prompts=failed,
        restraint_score=restraint_score
    )

def run_extended_phase(model: str, variant: str, config: Dict, suite: Dict, max_retries: int = 1, isolate_call: bool = False, fail_fast: bool = False, early_exit_failures: int = 0, debug_log_path: Optional[Path] = None, resume_debug: bool = False) -> PhaseResult:
    """Run extended phase (P13-P30, multi-turn)"""
    
    model_cfg = get_model_config(model, config)
    variant_cfg = get_variant_config(model, variant, config)
    system_prompt = variant_cfg.get("system", model_cfg.get("system_prompt"))
    
    results = []
    by_category = {}
    passed = 0
    total = 0
    failed = []
    failure_count = 0
    
    print(f"\n🔄 EXTENDED PHASE: {model_cfg['name']} ({variant} variant)")
    print("=" * 80)

    stop_run = False
    completed_ids = _load_completed_prompt_ids(debug_log_path, 'extended', model, variant) if resume_debug else set()
    for category, items in suite.items():
        cat_passed = 0
        cat_total = 0
        
        cat_name = category.replace("_", " ").title()
        print(f"\n  📚 {cat_name}")
        
        for item in items:
            prompt_id = item["id"]
            if prompt_id in completed_ids:
                print(f"    ↩️  SKIP {prompt_id}: already present in debug log")
                continue
            total += 1
            cat_total += 1
            
            # Build multi-turn message list
            messages = [{"role": msg["role"], "content": msg["content"]} for msg in item["turns"]]
            messages.insert(0, {"role": "system", "content": system_prompt})
            
            start = time.time()
            got = []
            err = None
            txt = None
            timed_out = False
            
            use_signal_timeout = not isolate_call
            if use_signal_timeout:
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(TIMEOUT_SECONDS)

            try:
                response = ollama_chat_with_optional_timeout(
                    model=model,
                    messages=messages,
                    tools=TOOLS,
                    stream=False,
                    options={"temperature": 0.0},
                    max_retries=max_retries,
                    isolate_call=isolate_call,
                )

                msg = _coerce_message(response)
                txt = msg.get("content")
                got = extract_tool_names(msg)
                
            except TimeoutError:
                err = f"TIMEOUT({TIMEOUT_SECONDS}s)"
                timed_out = True
            except Exception as e:
                err = str(e)[:100]
            finally:
                if use_signal_timeout:
                    signal.alarm(0)
            
            latency_ms = (time.time() - start) * 1000
            expected = item["expected"]
            correct = (set(got) == set(expected)) if not err else False
            
            if correct:
                passed += 1
                cat_passed += 1
            else:
                failed.append(prompt_id)
            
            status = "✅" if correct else "❌"
            exp_str = f"exp={expected}" if expected else "exp=[]"
            got_str = f"got={got}" if got else "got=[]"
            print(f"    {status} {prompt_id}: {latency_ms:6.0f}ms | {exp_str:30s} {got_str}")
            
            if err:
                print(f"       └─ ERROR: {err}")
            
            results.append(PromptResult(
                prompt_id=prompt_id,
                expected=expected,
                got=got,
                correct=correct,
                latency_ms=latency_ms,
                error=err,
                timeout=timed_out,
                assistant_content=txt
            ))

            if not correct:
                failure_count += 1

            if debug_log_path is not None:
                debug_log_path.parent.mkdir(parents=True, exist_ok=True)
                with debug_log_path.open('a') as f:
                    f.write(json.dumps({
                        'phase': 'extended',
                        'category': category,
                        'model': model,
                        'variant': variant,
                        'prompt_id': prompt_id,
                        'expected': expected,
                        'got': got,
                        'correct': correct,
                        'latency_ms': round(latency_ms, 2),
                        'error': err,
                        'timeout': timed_out,
                        'assistant_content': txt,
                        'timestamp': time.time(),
                    }) + '\n')

            if fail_fast and not correct:
                print(f"⛔ Fail-fast triggered at {prompt_id}")
                stop_run = True
                break
            if early_exit_failures > 0 and failure_count >= early_exit_failures:
                print(f"⛔ Early-exit: reached {failure_count} failures")
                stop_run = True
                break
        
        # Category summary
        cat_acc = cat_passed / cat_total if cat_total else 0
        by_category[category] = {
            "passed": cat_passed,
            "total": cat_total,
            "accuracy": cat_acc
        }
        print(f"    └─ Category: {cat_passed}/{cat_total} ({cat_acc*100:.1f}%)")

        if stop_run:
            break
    
    # Overall
    total_accuracy = passed / total if total else 0
    
    print("\n" + "=" * 80)
    print(f"RESULT: {passed}/{total} passed ({total_accuracy*100:.1f}%)")
    print("=" * 80)
    
    return PhaseResult(
        model=model,
        phase="extended",
        variant=variant,
        timestamp=time.time(),
        config_name=model_cfg["name"],
        system_prompt=system_prompt,
        passed=passed,
        total=total,
        accuracy=total_accuracy,
        results=results,
        failed_prompts=failed,
        by_category=by_category
    )

# =============================================================================
# OUTPUT FORMATTING
# =============================================================================

def save_json_output(result: PhaseResult, output_path: Path) -> None:
    """Save results as JSON"""
    data = {
        "model": result.model,
        "phase": result.phase,
        "variant": result.variant,
        "timestamp": result.timestamp,
        "config_name": result.config_name,
        "system_prompt": result.system_prompt,
        "summary": {
            "passed": result.passed,
            "total": result.total,
            "accuracy": result.accuracy,
            "restraint_score": result.restraint_score
        },
        "by_category": result.by_category,
        "failed_prompts": result.failed_prompts,
        "results": [asdict(r) for r in result.results]
    }
    
    output_path.write_text(json.dumps(data, indent=2))

def save_csv_output(result: PhaseResult, output_path: Path) -> None:
    """Save results as CSV (summary + detail rows)"""
    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        
        # Summary row
        writer.writerow([
            "Phase",
            "Model",
            "Variant",
            "Passed",
            "Total",
            "Accuracy %",
            "Restraint Score",
            "Failed Prompts"
        ])
        
        restraint = f"{result.restraint_score:.2f}" if result.restraint_score is not None else "N/A"
        writer.writerow([
            result.phase.upper(),
            result.model,
            result.variant,
            result.passed,
            result.total,
            f"{result.accuracy*100:.1f}",
            restraint,
            ",".join(result.failed_prompts) if result.failed_prompts else "None"
        ])
        
        # Detail rows (one per prompt)
        writer.writerow([])  # Blank line
        writer.writerow([
            "Prompt ID",
            "Expected",
            "Got",
            "Correct",
            "Latency (ms)",
            "Error",
            "Timeout"
        ])
        
        for r in result.results:
            writer.writerow([
                r.prompt_id,
                ",".join(r.expected) if r.expected else "[]",
                ",".join(r.got) if r.got else "[]",
                "YES" if r.correct else "NO",
                f"{r.latency_ms:.0f}",
                r.error or "",
                "YES" if r.timeout else "NO"
            ])

def print_summary(result: PhaseResult) -> None:
    """Print a text summary of results"""
    print(f"""
╔════════════════════════════════════════════════════════════════════════════╗
║ BENCHMARK COMPLETE                                                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Model:              {result.model:<60s} ║
║ Phase:              {result.phase.upper():<60s} ║
║ Variant:            {result.variant:<60s} ║
║ Config:             {result.config_name:<60s} ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Results:            {result.passed}/{result.total} passed ({result.accuracy*100:>5.1f}%)       ║
""", end="")
    
    if result.restraint_score is not None:
        print(f"║ Restraint Score:    {result.restraint_score:.2f}                        {' '*38}║")
    
    if result.by_category:
        print("║ By Category:                                                           ║")
        for category, stats in result.by_category.items():
            cat_name = category.replace("_", " ").title()
            print(f"║   {cat_name:<25s}: {stats['passed']}/{stats['total']} ({stats['accuracy']*100:>5.1f}%)     {' '*29}║")
    
    print(f"""║ Failed:             {",".join(result.failed_prompts) if result.failed_prompts else "None":<60s} ║
╚════════════════════════════════════════════════════════════════════════════╝
""")

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Consolidated Benchmark Runner",
        epilog="""
Examples:
  python3 run_benchmark.py lfm2.5-thinking:1.2b atomic atomic
  python3 run_benchmark.py mistral:7b extended atomic --output csv
  python3 run_benchmark.py gpt-oss:latest phase2 atomic --output json
        """
    )
    
    parser.add_argument("model", help="Model name (e.g., lfm2.5-thinking:1.2b)")
    parser.add_argument(
        "phase",
        nargs='?',
        default=None,
        help="Phase: atomic|extended|phase2 (default: atomic)"
    )
    parser.add_argument(
        "variant",
        nargs='?',
        default="atomic",
        help="Variant: atomic|extended (default: atomic)"
    )
    parser.add_argument(
        "--output",
        choices=["json", "csv"],
        default="json",
        help="Output format (default: json)"
    )
    parser.add_argument(
        "--no-save",
        action="store_true",
        help="Don't save output file (only print)"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=TIMEOUT_SECONDS,
        help=f"Per-prompt timeout in seconds (default: {TIMEOUT_SECONDS})"
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=1,
        help="Max attempts per prompt for transient failures (default: 1)"
    )
    parser.add_argument(
        "--isolate-call",
        action="store_true",
        help="Run each ollama.chat call in a subprocess for hard timeout enforcement"
    )
    parser.add_argument(
        "--fail-fast",
        action="store_true",
        help="Stop immediately on first failed prompt"
    )
    parser.add_argument(
        "--early-exit-failures",
        type=int,
        default=0,
        help="Stop run after this many failed prompts (0 disables)"
    )
    parser.add_argument(
        "--debug-log",
        default="",
        help="Optional JSONL path for per-prompt debug events"
    )
    parser.add_argument(
        "--suite",
        default="",
        help="Optional custom extended suite JSON path (extended phase only)"
    )
    parser.add_argument(
        "--no-lock",
        action="store_true",
        help="Disable single-run lock (not recommended)"
    )
    parser.add_argument(
        "--resume-debug",
        action="store_true",
        help="Skip prompt_ids already present in debug log for this model/phase/variant"
    )
    parser.add_argument(
        "--enable-warmup",
        action="store_true",
        help="Enable model warm-up before running benchmarks"
    )
    
    args = parser.parse_args()

    # Load routing config and apply rules
    config = ConfigManager()
    original_model = args.model
    args = config.apply_routing(args)
    if args.model != original_model:
        log_routing_decision(original_model, args.model, args.phase, "routing enforcer applied")
        print(f"🔀 Routing: {original_model} → {args.model}")

    # Warm-up phase if configured
    if hasattr(args, 'enable_warmup') and args.enable_warmup:
        print("🔥 Warming up model...")
        try:
            import time
            ollama.generate(model=args.model, prompt="What is 2+2?", stream=False)
            time.sleep(1)
            print("✅ Warm-up complete")
        except Exception as e:
            print(f"⚠️  Warm-up failed (non-fatal): {e}")

    # Hard guard: local-only benchmarking policy
    disallowed_models = {
        "openai-codex/gpt-5.3-codex-spark",
        "gpt-5.3-codex-spark",
    }
    if args.model in disallowed_models:
        print(f"❌ Unsupported model for this harness environment: {args.model}.", file=sys.stderr)
        sys.exit(1)

    if args.model.startswith("openai") or args.model.startswith("anthropic") or args.model.startswith("claude"):
        print(
            f"❌ Online model blocked by policy: {args.model}. Use local Ollama models only.",
            file=sys.stderr,
        )
        sys.exit(1)

    if args.retries < 1:
        print("❌ --retries must be >= 1", file=sys.stderr)
        sys.exit(1)

    lock_path = Path('/tmp/openclaw_bench.lock')
    lock_acquired = False
    if not args.no_lock:
        if lock_path.exists():
            print(f"❌ Benchmark lock active: {lock_path}. Another run is in progress (or stale lock).", file=sys.stderr)
            sys.exit(1)
        lock_path.write_text(f"pid={os.getpid()} model={args.model} phase={args.phase or 'atomic'}\n")
        lock_acquired = True

    # Update module-level timeout used by benchmark execution
    globals()["TIMEOUT_SECONDS"] = args.timeout
    
    # Normalize phase
    phase = (args.phase or "atomic").lower()
    if phase == "phase2":
        phase = "atomic"
    
    if phase not in ["atomic", "extended"]:
        print(f"❌ Invalid phase: {phase}. Use: atomic|extended|phase2", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Load configuration
        print("📋 Loading configuration...")
        config = load_harness_config()
        print(f"   ✅ Loaded {len(config['models'])} models")
        
        # Run benchmark
        print(f"\n🚀 Starting {phase.upper()} phase benchmark...")
        
        debug_log_path = Path(args.debug_log) if args.debug_log else None

        if phase == "atomic":
            result = run_atomic_phase(
                args.model,
                args.variant,
                config,
                max_retries=args.retries,
                isolate_call=args.isolate_call,
                fail_fast=args.fail_fast,
                early_exit_failures=args.early_exit_failures,
                debug_log_path=debug_log_path,
                resume_debug=args.resume_debug,
            )
        else:  # extended
            suite_path = Path(args.suite) if args.suite else None
            suite = load_extended_suite(suite_path)
            loaded_from = suite_path or SUITE_PATH
            print(f"   ✅ Loaded extended suite ({len(suite)} categories) from {loaded_from}")
            result = run_extended_phase(
                args.model,
                args.variant,
                config,
                suite,
                max_retries=args.retries,
                isolate_call=args.isolate_call,
                fail_fast=args.fail_fast,
                early_exit_failures=args.early_exit_failures,
                debug_log_path=debug_log_path,
                resume_debug=args.resume_debug,
            )
        
        # Print summary
        print_summary(result)
        
        # Save output
        if not args.no_save:
            if args.output == "json":
                output_path = WORKSPACE / f"{phase}_result_{args.model.split(':')[0]}_{args.variant}.json"
            else:  # csv
                output_path = WORKSPACE / f"{phase}_result_{args.model.split(':')[0]}_{args.variant}.csv"
            
            if args.output == "json":
                save_json_output(result, output_path)
            else:
                save_csv_output(result, output_path)
            
            print(f"💾 Saved: {output_path}")
    
    except FileNotFoundError as e:
        print(f"❌ Configuration error: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"❌ Invalid argument: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        if lock_acquired and lock_path.exists():
            try:
                lock_path.unlink()
            except Exception:
                pass

if __name__ == "__main__":
    main()
