#!/usr/bin/env python3
"""
DEPRECATED: Use bench/core/run_benchmark.py instead.

Equivalent command:
  cd bench/core && python3 run_benchmark.py qwen3.5:35b --mode compare --backends ollama,llama-server
"""

import subprocess
import sys
from pathlib import Path


def main() -> int:
    print("⚠️  DEPRECATED: qwen35_backend_comparison.py")
    print("    Use core runner compare mode instead.")

    core_dir = Path(__file__).resolve().parent / "core"
    cmd = [
        sys.executable,
        "run_benchmark.py",
        "qwen3.5:35b",
        "--mode",
        "compare",
        "--backends",
        "ollama,llama-server",
    ]

    proc = subprocess.run(cmd, cwd=str(core_dir))
    return proc.returncode


if __name__ == "__main__":
    raise SystemExit(main())
