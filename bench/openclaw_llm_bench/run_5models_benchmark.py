#!/usr/bin/env python3
"""Run benchmark for exactly 5 target models."""

import subprocess
import sys

models = ["qwen2.5:14b", "gemma2:9b", "phi:latest", "mistral:7b", "qwen3:4b"]
models_arg = ",".join(models)

cmd = [
    "python3",
    "run_bench.py",
    "--targets", "ollama",
    "--ollama-models", models_arg,
    "--run-id", "target_5models_2026_02_14",
    "--resume"
]

print(f"Running benchmark for models: {models}")
print(f"Command: {' '.join(cmd)}")
print()

result = subprocess.run(cmd, cwd="/root/.openclaw/workspace/dev/Etc-mono-repo/bench/openclaw_llm_bench")
sys.exit(result.returncode)
