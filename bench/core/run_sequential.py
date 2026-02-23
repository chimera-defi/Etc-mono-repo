#!/usr/bin/env python3
"""
Sequential Benchmark Runner

Runs benchmarks one at a time with configurable wait between runs.
Designed for automated testing without clogging the system.

Usage:
  python3 run_sequential.py [--wait-between SECONDS] [phase] [variant]

Examples:
  python3 run_sequential.py                           # Run atomic phase with defaults
  python3 run_sequential.py --wait-between 30        # 30 sec wait between benchmarks
  python3 run_sequential.py extended atomic           # Run extended phase

Arguments:
  phase     : atomic|extended|phase2 (default: atomic)
  variant   : atomic|extended (default: atomic)

Options:
  --wait-between SECONDS  Seconds to wait between each benchmark (default: 10)
  --model MODEL          Model to use (default: lfm2.5-thinking:1.2b)
  --verbose              Enable verbose output
"""

import sys
import os
import json
import time
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

# Configuration
DEFAULT_MODEL = "lfm2.5-thinking:1.2b"
DEFAULT_WAIT = 10  # seconds
WORKSPACE = Path("/root/.openclaw/workspace/bench")
LOG_DIR = WORKSPACE / "sequential_logs"
RESULTS_FILE = LOG_DIR / "results.jsonl"

# Ensure log directory exists
LOG_DIR.mkdir(parents=True, exist_ok=True)


def log_message(message: str, verbose: bool = False):
    """Print timestamped message."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")
    if verbose:
        sys.stdout.flush()


def log_result(result: Dict):
    """Append result to JSONL log file."""
    with open(RESULTS_FILE, "a") as f:
        f.write(json.dumps(result) + "\n")


def run_benchmark(model: str, phase: str, variant: str, verbose: bool = False) -> Dict:
    """
    Run a single benchmark and return the result.
    """
    cmd = [
        sys.executable,
        str(WORKSPACE / "run_benchmark.py"),
        model,
        phase,
        variant,
        "--output", "json"
    ]
    
    log_message(f"Running: {' '.join(cmd)}", verbose)
    
    start_time = time.time()
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,  # 2 minute timeout per benchmark
            cwd=str(WORKSPACE)
        )
        elapsed = time.time() - start_time
        
        # Parse output for summary
        output = result.stdout
        success = result.returncode == 0
        
        # Try to extract score from output
        score = None
        try:
            # Look for JSON in output
            if "score" in output.lower():
                for line in output.split('\n'):
                    if '{' in line:
                        try:
                            data = json.loads(line)
                            if 'score' in data:
                                score = data['score']
                                break
                        except:
                            pass
        except Exception as e:
            log_message(f"Warning: Could not parse score: {e}", verbose)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "model": model,
            "phase": phase,
            "variant": variant,
            "success": success,
            "returncode": result.returncode,
            "elapsed_seconds": round(elapsed, 2),
            "score": score,
            "stdout": output[:500] if output else "",  # Truncate long output
            "stderr": result.stderr[:500] if result.stderr else ""
        }
        
    except subprocess.TimeoutExpired:
        elapsed = time.time() - start_time
        log_message(f"TIMEOUT after {elapsed:.1f}s", verbose)
        return {
            "timestamp": datetime.now().isoformat(),
            "model": model,
            "phase": phase,
            "variant": variant,
            "success": False,
            "returncode": -1,
            "elapsed_seconds": round(elapsed, 2),
            "score": None,
            "stdout": "",
            "stderr": "Timeout"
        }
    except Exception as e:
        elapsed = time.time() - start_time
        log_message(f"ERROR: {e}", verbose)
        return {
            "timestamp": datetime.now().isoformat(),
            "model": model,
            "phase": phase,
            "variant": variant,
            "success": False,
            "returncode": -1,
            "elapsed_seconds": round(elapsed, 2),
            "score": None,
            "stdout": "",
            "stderr": str(e)
        }


def run_sequential(model: str, phase: str, variant: str, wait_between: int, verbose: bool = False):
    """
    Run benchmarks sequentially with wait between each.
    """
    log_message(f"=== Sequential Benchmark Runner ===", verbose)
    log_message(f"Model: {model}", verbose)
    log_message(f"Phase: {phase}, Variant: {variant}", verbose)
    log_message(f"Wait between runs: {wait_between}s", verbose)
    log_message(f"Log file: {RESULTS_FILE}", verbose)
    log_message("=" * 40, verbose)
    
    # Run the benchmark
    log_message(f"Starting benchmark...", verbose)
    
    result = run_benchmark(model, phase, variant, verbose)
    
    # Log result
    log_result(result)
    
    # Print summary
    status = "✓ SUCCESS" if result["success"] else "✗ FAILED"
    score_info = f", Score: {result['score']}" if result.get("score") else ""
    log_message(f"Result: {status} (elapsed: {result['elapsed_seconds']}s{score_info})", verbose)
    
    if result.get("stderr"):
        log_message(f"Stderr: {result['stderr'][:200]}", verbose)
    
    log_message("=" * 40, verbose)
    log_message("Sequential run complete!", verbose)
    
    return result


def main():
    parser = argparse.ArgumentParser(
        description="Sequential Benchmark Runner - Run one benchmark at a time"
    )
    parser.add_argument(
        "--wait-between",
        type=int,
        default=DEFAULT_WAIT,
        help=f"Seconds to wait between each benchmark (default: {DEFAULT_WAIT})"
    )
    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"Model to use (default: {DEFAULT_MODEL})"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output"
    )
    parser.add_argument(
        "phase",
        nargs="?",
        default="atomic",
        help="Phase: atomic|extended|phase2 (default: atomic)"
    )
    parser.add_argument(
        "variant",
        nargs="?",
        default="atomic",
        help="Variant: atomic|extended (default: atomic)"
    )
    
    args = parser.parse_args()
    
    # Validate phase
    valid_phases = ["atomic", "extended", "phase2"]
    if args.phase not in valid_phases:
        print(f"Error: Invalid phase '{args.phase}'. Must be one of: {valid_phases}")
        sys.exit(1)
    
    # Run sequential benchmarks
    run_sequential(
        model=args.model,
        phase=args.phase,
        variant=args.variant,
        wait_between=args.wait_between,
        verbose=args.verbose
    )


if __name__ == "__main__":
    main()
