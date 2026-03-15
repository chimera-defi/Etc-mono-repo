#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

MANIFEST_DIR="bench/repro/manifests"
CHECKSUM_DIR="bench/repro/checksums"
ENV_MANIFEST="${MANIFEST_DIR}/env_manifest.json"
RUN_MANIFEST="${MANIFEST_DIR}/run_manifest_pr245.json"
MODEL_INVENTORY="${MANIFEST_DIR}/model_inventory_pr245.json"
GIT_STATUS_FILE="${MANIFEST_DIR}/git_status_pr245.txt"
GIT_DIFFSTAT_FILE="${MANIFEST_DIR}/git_diff_stat_pr245.txt"
CHECKSUM_FILE="${CHECKSUM_DIR}/sha256sums.txt"

SMOKE=false
for arg in "$@"; do
  case "$arg" in
    --smoke) SMOKE=true ;;
    -h|--help)
      cat <<'EOF'
Usage: bench/ops/reproduce_pr245.sh [--smoke]

Options:
  --smoke   Run a minimal smoke benchmark after manifests/checksums are captured.
EOF
      exit 0
      ;;
    *)
      echo "ERROR: Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: Missing required command: $1" >&2
    exit 1
  fi
}

json_escape() {
  if command -v python3 >/dev/null 2>&1; then
    printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'
  else
    # Basic fallback escaping for environments without python3.
    printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e ':a;N;$!ba;s/\n/\\n/g' | awk '{print "\"" $0 "\""}'
  fi
}

version_line() {
  local cmd="$1"
  if command -v "$cmd" >/dev/null 2>&1; then
    local out
    out="$("$cmd" --version 2>/dev/null | head -n 1 || true)"
    if [ -z "$out" ]; then
      out="$("$cmd" -v 2>/dev/null | head -n 1 || true)"
    fi
    if [ -z "$out" ]; then
      out="$("$cmd" version 2>/dev/null | head -n 1 || true)"
    fi
    printf '%s' "$out"
  else
    printf '%s' "not_installed"
  fi
}

require_cmd bash
require_cmd git
require_cmd sha256sum

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: Not inside a git work tree." >&2
  exit 1
fi

mkdir -p "${MANIFEST_DIR}" "${CHECKSUM_DIR}"

TS_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
EPOCH="$(date -u +%s)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
SHA="$(git rev-parse HEAD)"
SHORT_SHA="$(git rev-parse --short HEAD)"

git status --porcelain > "${GIT_STATUS_FILE}"
git diff --stat > "${GIT_DIFFSTAT_FILE}" || true

DIRTY="false"
if [ -s "${GIT_STATUS_FILE}" ]; then
  DIRTY="true"
fi

HOSTNAME_VAL="$(hostname 2>/dev/null || echo unknown)"
UNAME_VAL="$(uname -a 2>/dev/null || true)"
BASH_VER="$(bash --version | head -n 1)"
GIT_VER="$(version_line git)"
PYTHON_VER="$(version_line python3)"
OLLAMA_VER="$(version_line ollama)"
CURL_VER="$(version_line curl)"
SHELL_VAL="${SHELL:-unknown}"

cat > "${ENV_MANIFEST}" <<EOF
{
  "captured_at_utc": $(json_escape "${TS_UTC}"),
  "epoch_utc": ${EPOCH},
  "repo_root": $(json_escape "."),
  "branch": $(json_escape "${BRANCH}"),
  "git_sha": $(json_escape "${SHA}"),
  "git_short_sha": $(json_escape "${SHORT_SHA}"),
  "git_dirty": ${DIRTY},
  "host": {
    "hostname": $(json_escape "${HOSTNAME_VAL}"),
    "uname": $(json_escape "${UNAME_VAL}"),
    "shell": $(json_escape "${SHELL_VAL}")
  },
  "tool_versions": {
    "bash": $(json_escape "${BASH_VER}"),
    "git": $(json_escape "${GIT_VER}"),
    "python3": $(json_escape "${PYTHON_VER}"),
    "ollama": $(json_escape "${OLLAMA_VER}"),
    "curl": $(json_escape "${CURL_VER}")
  },
  "env": {
    "OLLAMA_HOST": $(json_escape "${OLLAMA_HOST:-}"),
    "LLAMA_SERVER_URL": $(json_escape "${LLAMA_SERVER_URL:-}")
  }
}
EOF

MODEL_METHOD=""
MODEL_DATA=""
SMOKE_MODEL="${REPRO_SMOKE_MODEL:-}"

if command -v ollama >/dev/null 2>&1; then
  if MODEL_DATA="$(ollama list 2>/dev/null)"; then
    MODEL_METHOD="ollama_list_cli"
    if [ -z "${SMOKE_MODEL}" ]; then
      SMOKE_MODEL="$(printf '%s\n' "${MODEL_DATA}" | awk 'NR>1 && NF>0 {print $1; exit}')"
    fi
  fi
fi

if [ -z "${MODEL_METHOD}" ] && command -v curl >/dev/null 2>&1; then
  if MODEL_DATA="$(curl -fsS http://127.0.0.1:11434/api/tags 2>/dev/null)"; then
    MODEL_METHOD="ollama_api_tags"
  elif MODEL_DATA="$(curl -fsS http://127.0.0.1:11434/v1/models 2>/dev/null)"; then
    MODEL_METHOD="ollama_openai_models"
  fi
fi

if [ -z "${MODEL_METHOD}" ]; then
  echo "ERROR: Could not capture model inventory (ollama list or local Ollama API)." >&2
  exit 1
fi

cat > "${MODEL_INVENTORY}" <<EOF
{
  "captured_at_utc": $(json_escape "${TS_UTC}"),
  "method": $(json_escape "${MODEL_METHOD}"),
  "raw": $(json_escape "${MODEL_DATA}")
}
EOF

FALLBACK_TRACE=""
while IFS= read -r candidate; do
  FALLBACK_TRACE="${candidate}"
  break
done < <(find bench -type f \( -iname '*fallback*trace*' -o -iname '*fallback*.log' -o -iname '*trace*fallback*' \) | sort)

SMOKE_STATUS="not_requested"
SMOKE_COMMAND=""
SMOKE_LOG=""

if [ "${SMOKE}" = true ]; then
  require_cmd python3
  if [ -z "${SMOKE_MODEL}" ]; then
    echo "ERROR: --smoke requested but no local Ollama model detected. Set REPRO_SMOKE_MODEL." >&2
    exit 1
  fi

  SMOKE_RUN_ID="pr245_repro_smoke_$(date -u +%Y%m%d_%H%M%S)"
  SMOKE_LOG="${MANIFEST_DIR}/smoke_${SMOKE_RUN_ID}.log"
  SMOKE_COMMAND="python3 bench/openclaw_llm_bench/run_bench.py --run-id ${SMOKE_RUN_ID} --targets ollama --ollama-models ${SMOKE_MODEL} --prompt-ids P0 --timeout-s 120"

  if ${SMOKE_COMMAND} > "${SMOKE_LOG}" 2>&1; then
    SMOKE_STATUS="passed"
  else
    SMOKE_STATUS="failed"
    echo "ERROR: Smoke benchmark failed. See ${SMOKE_LOG}" >&2
    exit 1
  fi
fi

cat > "${RUN_MANIFEST}" <<EOF
{
  "run_id": "pr245-repro-${EPOCH}",
  "pr": 245,
  "captured_at_utc": $(json_escape "${TS_UTC}"),
  "repo_root": ".",
  "branch": $(json_escape "${BRANCH}"),
  "git_sha": $(json_escape "${SHA}"),
  "git_short_sha": $(json_escape "${SHORT_SHA}"),
  "git_dirty": ${DIRTY},
  "git_status_porcelain_file": $(json_escape "${GIT_STATUS_FILE}"),
  "git_diff_stat_file": $(json_escape "${GIT_DIFFSTAT_FILE}"),
  "env_manifest_file": $(json_escape "${ENV_MANIFEST}"),
  "model_inventory_file": $(json_escape "${MODEL_INVENTORY}"),
  "checksums_file": $(json_escape "${CHECKSUM_FILE}"),
  "fallback_trace_file": $(json_escape "${FALLBACK_TRACE}"),
  "smoke": {
    "requested": ${SMOKE},
    "status": $(json_escape "${SMOKE_STATUS}"),
    "command": $(json_escape "${SMOKE_COMMAND}"),
    "log_file": $(json_escape "${SMOKE_LOG}")
  }
}
EOF

{
  printf '# PR245 reproducibility checksums\n'
  printf '# captured_at_utc=%s\n' "${TS_UTC}"
} > "${CHECKSUM_FILE}"

FILES_FOR_HASH="
bench/REPRODUCE.md
bench/README.md
bench/ops/reproduce_pr245.sh
bench/core/run_benchmark.py
bench/harness/phase2_config.json
bench/results/qwen35_backend_comparison.json
bench/lfm_native_api_results.json
bench/atomic_result_qwen3.5_atomic_FULL.json
openclaw.json
${ENV_MANIFEST}
${RUN_MANIFEST}
${MODEL_INVENTORY}
${GIT_STATUS_FILE}
${GIT_DIFFSTAT_FILE}
"

for f in ${FILES_FOR_HASH}; do
  if [ -f "${f}" ]; then
    sha256sum "${f}" >> "${CHECKSUM_FILE}"
  else
    printf 'MISSING\t%s\n' "${f}" >> "${CHECKSUM_FILE}"
  fi
done

if [ -n "${FALLBACK_TRACE}" ] && [ -f "${FALLBACK_TRACE}" ]; then
  sha256sum "${FALLBACK_TRACE}" >> "${CHECKSUM_FILE}"
fi

echo "Wrote ${ENV_MANIFEST}"
echo "Wrote ${MODEL_INVENTORY}"
echo "Wrote ${RUN_MANIFEST}"
echo "Wrote ${CHECKSUM_FILE}"
if [ -n "${FALLBACK_TRACE}" ]; then
  echo "Included fallback trace: ${FALLBACK_TRACE}"
else
  echo "No fallback trace artifact found under bench/."
fi
