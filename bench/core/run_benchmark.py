#!/usr/bin/env python3
"""
Consolidated Benchmark Runner - Phase 1 (Atomic + Extended) & Phase 2
Single CLI for all benchmark phases, models, and variants

Attribution:
  - Current Model: lfm2.5-thinking:1.2b (OpenClaw agent)
  - Human: Owner/operator of this OpenClaw instance
  - Date: 2026-02-25

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
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
import time
import signal
import csv
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import ollama

# Import cache module
from utils.result_cache import ResultCache, get_cache, get_prompts_for_phase

# Import error recovery module
from utils.error_recovery import (
    Checkpoint, RetryConfig, retry_with_backoff, is_retryable_error,
    load_checkpoint, save_checkpoint, clear_checkpoint,
    save_partial_results, load_partial_results, register_crash_handler,
    add_resume_parser, get_resume_info, TimeoutHandler
)

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

# =============================================================================
# CONFIG LOADING
# =============================================================================

def load_harness_config() -> Dict:
    """Load phase2_config.json with models and variants"""
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Config not found: {CONFIG_PATH}")
    return json.loads(CONFIG_PATH.read_text())

def load_extended_suite() -> Dict:
    """Load extended_benchmark_suite.json (P13-P30)"""
    if not SUITE_PATH.exists():
        raise FileNotFoundError(f"Extended suite not found: {SUITE_PATH}")
    return json.loads(SUITE_PATH.read_text())

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


def extract_ollama_metrics(response: Dict) -> Dict:
    """Extract Ollama-native token/timing metrics from chat response.

    Durations from Ollama are in nanoseconds.
    """
    eval_count = response.get("eval_count")
    eval_duration_ns = response.get("eval_duration")
    prompt_eval_count = response.get("prompt_eval_count")
    prompt_eval_duration_ns = response.get("prompt_eval_duration")
    total_duration_ns = response.get("total_duration")

    tokens_per_second = None
    if isinstance(eval_count, int) and eval_count >= 0 and isinstance(eval_duration_ns, (int, float)) and eval_duration_ns > 0:
        tokens_per_second = eval_count / (eval_duration_ns / 1e9)

    return {
        "tokens_generated": eval_count if isinstance(eval_count, int) else None,
        "prompt_tokens": prompt_eval_count if isinstance(prompt_eval_count, int) else None,
        "tokens_per_second": tokens_per_second,
        "ttft_ms": (prompt_eval_duration_ns / 1e6) if isinstance(prompt_eval_duration_ns, (int, float)) else None,
        "eval_duration_ms": (eval_duration_ns / 1e6) if isinstance(eval_duration_ns, (int, float)) else None,
        "prompt_eval_duration_ms": (prompt_eval_duration_ns / 1e6) if isinstance(prompt_eval_duration_ns, (int, float)) else None,
        "total_duration_ms": (total_duration_ns / 1e6) if isinstance(total_duration_ns, (int, float)) else None,
    }


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
    # Ollama-native token/timing metrics (when available)
    tokens_generated: Optional[int] = None
    prompt_tokens: Optional[int] = None
    tokens_per_second: Optional[float] = None
    ttft_ms: Optional[float] = None
    eval_duration_ms: Optional[float] = None
    prompt_eval_duration_ms: Optional[float] = None
    total_duration_ms: Optional[float] = None

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
    avg_latency_ms: Optional[float] = None  # Average latency across prompts
    median_latency_ms: Optional[float] = None  # Median latency
    max_latency_ms: Optional[float] = None  # Max latency
    min_latency_ms: Optional[float] = None  # Min latency
    avg_tps: Optional[float] = None
    median_tps: Optional[float] = None
    max_tps: Optional[float] = None
    min_tps: Optional[float] = None
    total_tokens_generated: Optional[int] = None
    total_prompt_tokens: Optional[int] = None
    notes: str = ""

# =============================================================================
# PHASE IMPLEMENTATIONS
# =============================================================================

def run_atomic_phase(
    model: str, variant: str, config: Dict,
    start_index: int = 0,
    checkpoint: Optional[Checkpoint] = None,
    run_dir: Optional[Path] = None,
    timeout_s: int = TIMEOUT_SECONDS,
    max_retries: int = 1
) -> PhaseResult:
    """Run atomic phase (P1-P12)
    
    Args:
        model: Model name
        variant: Variant config
        config: Full config dict
        start_index: Prompt index to start from (for resume)
        checkpoint: Checkpoint object for state tracking
        run_dir: Directory for saving checkpoints
        timeout_s: Timeout per prompt in seconds
        max_retries: Max retries per prompt
    """
    
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
    
    # Track current prompt index for checkpointing
    prompt_idx = 0
    
    for prompt_id, prompt_text, expected in ATOMIC_PROMPTS:
        # Skip already completed prompts if resuming
        if prompt_idx < start_index:
            prompt_idx += 1
            continue
        
        latency_ms = 0
        got = []
        err = None
        timed_out = False
        txt = None
        metrics = {
            "tokens_generated": None,
            "prompt_tokens": None,
            "tokens_per_second": None,
            "ttft_ms": None,
            "eval_duration_ms": None,
            "prompt_eval_duration_ms": None,
            "total_duration_ms": None,
        }
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                start = time.time()
                
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(TIMEOUT_SECONDS)
                
                try:
                    response = ollama.chat(
                        model=model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt_text}
                        ],
                        tools=TOOLS,
                        stream=False,
                        options={"temperature": 0.0}
                    )
                    
                    msg = response.get("message", {})
                    txt = msg.get("content")
                    tool_calls = msg.get("tool_calls", [])
                    if not isinstance(tool_calls, list):
                        tool_calls = []
                    got = [tc["function"]["name"] for tc in tool_calls if "function" in tc]
                    metrics = extract_ollama_metrics(response)
                    
                except TimeoutError:
                    err = f"TIMEOUT({TIMEOUT_SECONDS}s)"
                    timed_out = True
                except Exception as e:
                    err = str(e)[:100]
                finally:
                    signal.alarm(0)
                
                latency_ms = (time.time() - start) * 1000
                break  # Success, exit retry loop
                
            except Exception as e:
                retry_count += 1
                if retry_count >= max_retries:
                    err = f"Failed after {max_retries} retries: {str(e)[:80]}"
        
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
        tps = metrics.get("tokens_per_second")
        tps_str = f" | {tps:5.2f} tok/s" if isinstance(tps, (int, float)) else ""
        print(f"{status} {prompt_id}: {latency_ms:6.0f}ms{tps_str} | {exp_str:30s} {got_str}")
        
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
            assistant_content=txt,
            tokens_generated=metrics.get("tokens_generated"),
            prompt_tokens=metrics.get("prompt_tokens"),
            tokens_per_second=metrics.get("tokens_per_second"),
            ttft_ms=metrics.get("ttft_ms"),
            eval_duration_ms=metrics.get("eval_duration_ms"),
            prompt_eval_duration_ms=metrics.get("prompt_eval_duration_ms"),
            total_duration_ms=metrics.get("total_duration_ms"),
        ))
        
        # Save checkpoint after each prompt
        if checkpoint and run_dir:
            checkpoint.prompt_index = prompt_idx + 1
            checkpoint.completed_prompts.append(prompt_id)
            checkpoint.partial_results.append(asdict(results[-1]))
            save_checkpoint(run_dir, checkpoint)
        
        prompt_idx += 1
    
    # Clear checkpoint on successful completion
    if checkpoint and run_dir:
        clear_checkpoint(run_dir)
    total = len(ATOMIC_PROMPTS)
    accuracy = passed / total if total else 0
    restraint_score = restraint_passed / restraint_total if restraint_total else 0
    
    # Calculate latency statistics
    latencies = [r.latency_ms for r in results if r.latency_ms > 0]
    if latencies:
        latencies_sorted = sorted(latencies)
        avg_latency_ms = sum(latencies) / len(latencies)
        median_latency_ms = latencies_sorted[len(latencies_sorted) // 2]
        max_latency_ms = max(latencies)
        min_latency_ms = min(latencies)
    else:
        avg_latency_ms = median_latency_ms = max_latency_ms = min_latency_ms = 0

    # Calculate throughput statistics
    tps_values = [r.tokens_per_second for r in results if isinstance(r.tokens_per_second, (int, float)) and r.tokens_per_second > 0]
    if tps_values:
        tps_sorted = sorted(tps_values)
        avg_tps = sum(tps_values) / len(tps_values)
        median_tps = tps_sorted[len(tps_sorted) // 2]
        max_tps = max(tps_values)
        min_tps = min(tps_values)
    else:
        avg_tps = median_tps = max_tps = min_tps = None

    total_tokens_generated = sum(r.tokens_generated for r in results if isinstance(r.tokens_generated, int))
    total_prompt_tokens = sum(r.prompt_tokens for r in results if isinstance(r.prompt_tokens, int))

    print("=" * 80)
    print(f"RESULT: {passed}/{total} passed ({accuracy*100:.1f}%) | Restraint: {restraint_score:.2f} | Latency: avg={avg_latency_ms:.0f}ms med={median_latency_ms:.0f}ms max={max_latency_ms:.0f}ms")
    if avg_tps is not None:
        print(f"THROUGHPUT: avg={avg_tps:.2f} tok/s med={median_tps:.2f} max={max_tps:.2f} | tokens={total_tokens_generated}")
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
        restraint_score=restraint_score,
        avg_latency_ms=avg_latency_ms,
        median_latency_ms=median_latency_ms,
        max_latency_ms=max_latency_ms,
        min_latency_ms=min_latency_ms,
        avg_tps=avg_tps,
        median_tps=median_tps,
        max_tps=max_tps,
        min_tps=min_tps,
        total_tokens_generated=total_tokens_generated,
        total_prompt_tokens=total_prompt_tokens,
    )

def run_extended_phase(
    model: str, variant: str, config: Dict, suite: Dict,
    start_index: int = 0,
    checkpoint: Optional[Checkpoint] = None,
    run_dir: Optional[Path] = None,
    timeout_s: int = TIMEOUT_SECONDS,
    max_retries: int = 1
) -> PhaseResult:
    """Run extended phase (P13-P30, multi-turn)
    
    Args:
        model: Model name
        variant: Variant config
        config: Full config dict
        suite: Extended benchmark suite
        start_index: Prompt index to start from (for resume)
        checkpoint: Checkpoint object for state tracking
        run_dir: Directory for saving checkpoints
        timeout_s: Timeout per prompt in seconds
        max_retries: Max retries per prompt
    """
    
    model_cfg = get_model_config(model, config)
    variant_cfg = get_variant_config(model, variant, config)
    system_prompt = variant_cfg.get("system", model_cfg.get("system_prompt"))
    
    results = []
    by_category = {}
    passed = 0
    total = 0
    failed = []
    
    print(f"\n🔄 EXTENDED PHASE: {model_cfg['name']} ({variant} variant)")
    print("=" * 80)
    
    # Track current prompt index for checkpointing
    prompt_idx = 0
    
    for category, items in suite.items():
        cat_passed = 0
        cat_total = len(items)
        
        cat_name = category.replace("_", " ").title()
        print(f"\n  📚 {cat_name}")
        
        for item in items:
            # Skip already completed prompts if resuming
            if prompt_idx < start_index:
                prompt_idx += 1
                continue
            
            prompt_id = item["id"]
            total += 1
            
            # Build multi-turn message list
            messages = [{"role": msg["role"], "content": msg["content"]} for msg in item["turns"]]
            messages.insert(0, {"role": "system", "content": system_prompt})
            
            start = time.time()
            got = []
            err = None
            txt = None
            timed_out = False
            metrics = {
                "tokens_generated": None,
                "prompt_tokens": None,
                "tokens_per_second": None,
                "ttft_ms": None,
                "eval_duration_ms": None,
                "prompt_eval_duration_ms": None,
                "total_duration_ms": None,
            }
            
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(TIMEOUT_SECONDS)
            
            try:
                response = ollama.chat(
                    model=model,
                    messages=messages,
                    tools=TOOLS,
                    stream=False,
                    options={"temperature": 0.0}
                )
                
                msg = response.get("message", {})
                txt = msg.get("content")
                tool_calls = msg.get("tool_calls", [])
                if not isinstance(tool_calls, list):
                    tool_calls = []
                got = [tc["function"]["name"] for tc in tool_calls if "function" in tc]
                metrics = extract_ollama_metrics(response)
                
            except TimeoutError:
                err = f"TIMEOUT({TIMEOUT_SECONDS}s)"
                timed_out = True
            except Exception as e:
                err = str(e)[:100]
            finally:
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
            tps = metrics.get("tokens_per_second")
            tps_str = f" | {tps:5.2f} tok/s" if isinstance(tps, (int, float)) else ""
            print(f"    {status} {prompt_id}: {latency_ms:6.0f}ms{tps_str} | {exp_str:30s} {got_str}")
            
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
                assistant_content=txt,
                tokens_generated=metrics.get("tokens_generated"),
                prompt_tokens=metrics.get("prompt_tokens"),
                tokens_per_second=metrics.get("tokens_per_second"),
                ttft_ms=metrics.get("ttft_ms"),
                eval_duration_ms=metrics.get("eval_duration_ms"),
                prompt_eval_duration_ms=metrics.get("prompt_eval_duration_ms"),
                total_duration_ms=metrics.get("total_duration_ms"),
            ))
            
            # Save checkpoint after each prompt
            if checkpoint and run_dir:
                checkpoint.prompt_index = prompt_idx + 1
                checkpoint.completed_prompts.append(prompt_id)
                checkpoint.partial_results.append(asdict(results[-1]))
                save_checkpoint(run_dir, checkpoint)
            
            prompt_idx += 1
        
        # Category summary
        cat_acc = cat_passed / cat_total if cat_total else 0
        by_category[category] = {
            "passed": cat_passed,
            "total": cat_total,
            "accuracy": cat_acc
        }
        print(f"    └─ Category: {cat_passed}/{cat_total} ({cat_acc*100:.1f}%)")
    
    # Overall
    total_accuracy = passed / total if total else 0
    
    # Calculate latency statistics for extended phase
    latencies = [r.latency_ms for r in results if r.latency_ms > 0]
    if latencies:
        latencies_sorted = sorted(latencies)
        avg_latency_ms = sum(latencies) / len(latencies)
        median_latency_ms = latencies_sorted[len(latencies_sorted) // 2]
        max_latency_ms = max(latencies)
        min_latency_ms = min(latencies)
    else:
        avg_latency_ms = median_latency_ms = max_latency_ms = min_latency_ms = 0

    # Calculate throughput statistics
    tps_values = [r.tokens_per_second for r in results if isinstance(r.tokens_per_second, (int, float)) and r.tokens_per_second > 0]
    if tps_values:
        tps_sorted = sorted(tps_values)
        avg_tps = sum(tps_values) / len(tps_values)
        median_tps = tps_sorted[len(tps_sorted) // 2]
        max_tps = max(tps_values)
        min_tps = min(tps_values)
    else:
        avg_tps = median_tps = max_tps = min_tps = None

    total_tokens_generated = sum(r.tokens_generated for r in results if isinstance(r.tokens_generated, int))
    total_prompt_tokens = sum(r.prompt_tokens for r in results if isinstance(r.prompt_tokens, int))

    print("\n" + "=" * 80)
    print(f"RESULT: {passed}/{total} passed ({total_accuracy*100:.1f}%) | Latency: avg={avg_latency_ms:.0f}ms med={median_latency_ms:.0f}ms max={max_latency_ms:.0f}ms")
    if avg_tps is not None:
        print(f"THROUGHPUT: avg={avg_tps:.2f} tok/s med={median_tps:.2f} max={max_tps:.2f} | tokens={total_tokens_generated}")
    print("=" * 80)
    
    # Clear checkpoint on successful completion
    if checkpoint and run_dir:
        clear_checkpoint(run_dir)
    
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
        by_category=by_category,
        avg_latency_ms=avg_latency_ms,
        median_latency_ms=median_latency_ms,
        max_latency_ms=max_latency_ms,
        min_latency_ms=min_latency_ms,
        avg_tps=avg_tps,
        median_tps=median_tps,
        max_tps=max_tps,
        min_tps=min_tps,
        total_tokens_generated=total_tokens_generated,
        total_prompt_tokens=total_prompt_tokens,
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
            "restraint_score": result.restraint_score,
            "avg_latency_ms": result.avg_latency_ms,
            "median_latency_ms": result.median_latency_ms,
            "max_latency_ms": result.max_latency_ms,
            "min_latency_ms": result.min_latency_ms,
            "avg_tps": result.avg_tps,
            "median_tps": result.median_tps,
            "max_tps": result.max_tps,
            "min_tps": result.min_tps,
            "total_tokens_generated": result.total_tokens_generated,
            "total_prompt_tokens": result.total_prompt_tokens,
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
            "Avg Latency (ms)",
            "Avg TPS",
            "Total Tokens",
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
            f"{result.avg_latency_ms:.0f}" if result.avg_latency_ms is not None else "N/A",
            f"{result.avg_tps:.2f}" if result.avg_tps is not None else "N/A",
            result.total_tokens_generated if result.total_tokens_generated is not None else "N/A",
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
            "Tokens Generated",
            "Prompt Tokens",
            "TPS",
            "TTFT (ms)",
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
                r.tokens_generated if r.tokens_generated is not None else "",
                r.prompt_tokens if r.prompt_tokens is not None else "",
                f"{r.tokens_per_second:.2f}" if r.tokens_per_second is not None else "",
                f"{r.ttft_ms:.2f}" if r.ttft_ms is not None else "",
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
    
    if result.avg_tps is not None:
        print(f"║ Throughput:         avg={result.avg_tps:>6.2f} tok/s (med={result.median_tps:>6.2f}, max={result.max_tps:>6.2f}){' '*11}║")
        print(f"║ Tokens:             gen={result.total_tokens_generated or 0}, prompt={result.total_prompt_tokens or 0}{' '*31}║")

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
        "--no-cache",
        action="store_true",
        help="Disable result cache (always run benchmark)"
    )
    parser.add_argument(
        "--clear-cache",
        action="store_true",
        help="Clear all cached results before running"
    )
    parser.add_argument(
        "--resume",
        type=str,
        default='',
        help="Resume an interrupted run from the specified run directory"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=TIMEOUT_SECONDS,
        help=f"Timeout per prompt in seconds (default: {TIMEOUT_SECONDS})"
    )
    parser.add_argument(
        "--max-retries",
        type=int,
        default=1,
        help="Maximum retries per failed prompt (default: 1)"
    )
    
    parser.add_argument(
        "--isolate-call",
        action="store_true",
        help="Execute each tool call in isolation (default: False)"
    )
    
    args, extra = parser.parse_known_args()
    
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
        
        # Initialize cache
        cache = get_cache()
        
        # Handle cache clearing
        if args.clear_cache:
            cache.clear()
        
        # Get prompts for caching
        prompts = get_prompts_for_phase(phase)
        
        # Check cache (unless disabled)
        cached_result = None
        if not args.no_cache:
            is_cached, cached_result, time_saved = cache.check(
                args.model, phase, args.variant, prompts
            )
            
            if cached_result:
                # Reconstruct Phase is_cached andResult from cache
                from dataclasses import dataclass
                
                result = PhaseResult(
                    model=cached_result["model"],
                    phase=cached_result["phase"],
                    variant=cached_result["variant"],
                    timestamp=cached_result.get("timestamp", time.time()),
                    config_name=cached_result.get("config_name", args.model),
                    system_prompt="",  # Not stored in cache
                    passed=cached_result.get("summary", {}).get("passed", 0),
                    total=cached_result.get("summary", {}).get("total", 0),
                    accuracy=cached_result.get("summary", {}).get("accuracy", 0.0),
                    results=[],  # Not needed for summary
                    failed_prompts=cached_result.get("failed_prompts", []),
                    restraint_score=cached_result.get("summary", {}).get("restraint_score"),
                    by_category=cached_result.get("by_category")
                )
                
                print_summary(result)
                cache.print_stats()
                
                if not args.no_save:
                    if args.output == "json":
                        output_path = WORKSPACE / f"{phase}_result_{args.model.split(':')[0]}_{args.variant}.json"
                    else:
                        output_path = WORKSPACE / f"{phase}_result_{args.model.split(':')[0]}_{args.variant}.csv"
                    
                    if args.output == "json":
                        save_json_output(result, output_path)
                    else:
                        save_csv_output(result, output_path)
                    
                    print(f"💾 Saved: {output_path}")
                
                return  # Exit early with cached result
        
        # Run benchmark
        print(f"\n🚀 Starting {phase.upper()} phase benchmark...")
        
        # Handle resume from checkpoint
        resume_from = 0
        run_dir = None
        checkpoint = None
        
        if args.resume:
            run_dir = Path(args.resume)
            if not run_dir.exists():
                print(f"❌ Resume directory not found: {run_dir}", file=sys.stderr)
                sys.exit(1)
            
            checkpoint = load_checkpoint(run_dir)
            if checkpoint:
                resume_from = checkpoint.prompt_index
                print(f"🔄 Resuming from prompt index {resume_from}")
                print(f"   Completed prompts: {len(checkpoint.completed_prompts)}")
            else:
                print(f"⚠️ No checkpoint found in {run_dir}, starting fresh")
        
        # Create run directory for checkpointing
        if not run_dir:
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            run_dir = WORKSPACE / f"run_{args.model.split(':')[0]}_{phase}_{timestamp}"
            run_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize checkpoint for new runs
        if not checkpoint:
            checkpoint = Checkpoint(
                run_id=str(run_dir.name),
                prompt_index=0,
                completed_prompts=[],
                partial_results=[],
                metadata={
                    "model": args.model,
                    "phase": phase,
                    "variant": args.variant
                }
            )
        
        # Register crash handler
        register_crash_handler(run_dir, checkpoint)
        
        if phase == "atomic":
            result = run_atomic_phase(
                args.model, args.variant, config,
                start_index=resume_from,
                checkpoint=checkpoint,
                run_dir=run_dir,
                timeout_s=args.timeout,
                max_retries=args.max_retries
            )
        else:  # extended
            suite = load_extended_suite()
            print(f"   ✅ Loaded extended suite ({len(suite)} categories)")
            result = run_extended_phase(
                args.model, args.variant, config, suite,
                start_index=resume_from,
                checkpoint=checkpoint,
                run_dir=run_dir,
                timeout_s=args.timeout,
                max_retries=args.max_retries
            )
        
        # Save to cache (unless disabled)
        if not args.no_cache:
            # Build result dict for cache
            result_dict = {
                "summary": {
                    "passed": result.passed,
                    "total": result.total,
                    "accuracy": result.accuracy,
                    "restraint_score": result.restraint_score
                },
                "results": [asdict(r) for r in result.results],
                "failed_prompts": result.failed_prompts,
                "by_category": result.by_category,
            }
            cache.save(args.model, phase, args.variant, prompts, result_dict)
        
        # Print summary
        print_summary(result)
        
        # Print cache stats (if cache was used)
        if not args.no_cache:
            cache.print_stats()
        
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

if __name__ == "__main__":
    main()
