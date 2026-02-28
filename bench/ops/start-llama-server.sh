#!/usr/bin/env bash
# Managed llama-server launcher for Qwen3.5-35B-A3B (Q3_K_S GGUF)
# Key flags:
#   --ctx-size 65536         Max context (RAM-dependent, 64GB host)
#   --reasoning-budget 0     Disable thinking mode (Qwen3.5 defaults to think)
#   --temp 0                 Deterministic output
#   --threads 4              CPU threads (adjust to host)
set -euo pipefail

MODEL_PATH="${LLAMA_MODEL_PATH:-}"
HOST="${LLAMA_HOST:-127.0.0.1}"
PORT="${LLAMA_PORT:-8081}"
CTX="${LLAMA_CTX:-65536}"
THREADS="${LLAMA_THREADS:-4}"
GPU_LAYERS="${LLAMA_GPU_LAYERS:-0}"
REASONING_BUDGET="${LLAMA_REASONING_BUDGET:-0}"
TEMP="${LLAMA_TEMP:-0}"

if [[ -z "${MODEL_PATH}" ]]; then
  echo "LLAMA_MODEL_PATH is required (absolute path to GGUF model)." >&2
  exit 1
fi

LLAMA_SERVER="${LLAMA_SERVER_BIN:-/root/llama.cpp/build/bin/llama-server}"

exec "${LLAMA_SERVER}" \
  --model "${MODEL_PATH}" \
  --host "${HOST}" \
  --port "${PORT}" \
  --ctx-size "${CTX}" \
  --threads "${THREADS}" \
  --n-gpu-layers "${GPU_LAYERS}" \
  --reasoning-budget "${REASONING_BUDGET}" \
  --temp "${TEMP}"
