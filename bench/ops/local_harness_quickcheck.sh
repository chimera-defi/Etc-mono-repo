#!/usr/bin/env bash
set -euo pipefail

# Canonical local sanity check for harness wiring against local Ollama models.
# Not benchmark truth; this is smoke/preflight only.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BENCH_ROOT="$REPO_ROOT/bench"
cd "$BENCH_ROOT"

MODELS=("lfm2.5-thinking:1.2b" "glm-4.7-flash:latest")

cleanup() {
  echo
  echo "[cleanup] stopping model runners..."
  for m in "${MODELS[@]}"; do
    ollama stop "$m" >/dev/null 2>&1 || true
  done
  echo "[cleanup] ollama ps after stop:"
  ollama ps || true
}
trap cleanup EXIT

echo "[info] bench root: $BENCH_ROOT"
echo "[info] local quickcheck = smoke/preflight only (not canonical benchmark evidence)"

echo "[check] required models"
for m in "${MODELS[@]}"; do
  if ! ollama list | awk '{print $1}' | grep -Fxq "$m"; then
    echo "[error] missing model: $m"
    exit 2
  fi
  echo "  - found $m"
done

echo
for m in "${MODELS[@]}"; do
  echo "[run] $m atomic/atomic (no-cache, no-save)"
  python3 core/run_benchmark.py "$m" atomic atomic \
    --no-cache --no-save --timeout 45 --max-retries 0
  echo
  sleep 1
done

echo "[done] local harness quickcheck complete"
