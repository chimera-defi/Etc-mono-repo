#!/usr/bin/env bash
set -euo pipefail

MODEL_PATH="${LLAMA_MODEL_PATH:-}"
HOST="${LLAMA_HOST:-127.0.0.1}"
PORT="${LLAMA_PORT:-8081}"
CTX="${LLAMA_CTX:-8192}"
THREADS="${LLAMA_THREADS:-8}"
GPU_LAYERS="${LLAMA_GPU_LAYERS:-0}"

if [[ -z "${MODEL_PATH}" ]]; then
  echo "LLAMA_MODEL_PATH is required (absolute path to GGUF model)." >&2
  exit 1
fi

exec /usr/local/bin/llama-server \
  --model "${MODEL_PATH}" \
  --host "${HOST}" \
  --port "${PORT}" \
  --ctx-size "${CTX}" \
  --threads "${THREADS}" \
  --n-gpu-layers "${GPU_LAYERS}"
