#!/usr/bin/env bash
# Non-canonical local operator helper for the qwen/glm multipart experiment.
# Keep for ad hoc reruns/debugging, but prefer documented supervisor/repro flows
# for current benchmark work.
set -euo pipefail

ROOT="/root/.openclaw/workspace"
LOG_DIR="$ROOT/bench/results"
mkdir -p "$LOG_DIR"

TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOG_DIR/qwen_glm_multipart_${TS}.log"

{
  echo "[$(date -Is)] START local one-shot multipart benchmark"
  echo "[$(date -Is)] cmd: python3 bench/selfopt/qwen_glm_multipart_resume_runner.py"
  cd "$ROOT"
  python3 bench/selfopt/qwen_glm_multipart_resume_runner.py
  echo "[$(date -Is)] DONE"
} | tee "$LOG_FILE"
