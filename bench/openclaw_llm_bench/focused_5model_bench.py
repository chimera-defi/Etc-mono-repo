#!/usr/bin/env python3
"""Direct benchmark run for 5 specific models, waiting for completion."""

import subprocess
import json
import time
import os
import sys

# The 5 exact target models
MODELS = ["qwen2.5:14b", "gemma2:9b", "phi:latest", "mistral:7b", "qwen3:4b"]
PROMPTS = 11  # P0-P10
EXPECTED_RESULTS = len(MODELS) * PROMPTS
RUN_ID = "focused_5models_2026_02_14"
RUN_DIR = f"runs/{RUN_ID}"

print(f"Target: {len(MODELS)} models × {PROMPTS} prompts = {EXPECTED_RESULTS} total results\n")
print(f"Models: {MODELS}\n")

# Start benchmark
cmd = [
    "python3", "run_bench.py",
    "--targets", "ollama",
    "--run-id", RUN_ID,
    "--resume"
]

# Build the models argument carefully to pass them directly
models_csv = ",".join(MODELS)
cmd.extend(["--ollama-models", models_csv])

print(f"Starting: {' '.join(cmd)}\n")

# Start as subprocess
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

# Monitor progress
start_time = time.time()
timeout_sec = 4800  # 80 minutes
check_interval = 60  # Check every minute

last_count = 0
while True:
    elapsed = time.time() - start_time
    
    # Check results
    results_file = os.path.join(RUN_DIR, "results.jsonl")
    if os.path.exists(results_file):
        with open(results_file) as f:
            results = [json.loads(line) for line in f if json.loads(line).get('record_type') == 'result']
        
        count = len(results)
        if count != last_count:
            print(f"[{elapsed/60:5.1f}m] Progress: {count}/{EXPECTED_RESULTS}")
            last_count = count
            
            if count >= EXPECTED_RESULTS:
                print(f"\n✓ Complete! All {count} results recorded.")
                break
    
    if elapsed > timeout_sec:
        print(f"\n✗ Timeout after {timeout_sec}s")
        proc.terminate()
        break
    
    time.sleep(check_interval)

# Wait for process to finish
try:
    proc.wait(timeout=30)
except subprocess.TimeoutExpired:
    proc.kill()

print("Benchmark run finished.")
