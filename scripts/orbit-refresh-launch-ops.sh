#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  orbit-refresh-launch-ops.sh [--log-file <file>] [--note-prefix <text>] [--append-only]

Examples:
  ./scripts/orbit-refresh-launch-ops.sh
  ./scripts/orbit-refresh-launch-ops.sh --note-prefix "daily-sync"
EOF
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$ROOT_DIR/ideas/orbit-pilot/LAUNCH_OPS_LOG.md"
NOTE_PREFIX="auto-sync"
APPEND_ONLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --log-file)
      LOG_FILE="$2"
      shift 2
      ;;
    --note-prefix)
      NOTE_PREFIX="$2"
      shift 2
      ;;
    --append-only)
      APPEND_ONLY=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "$LOG_FILE" != /* ]]; then
  LOG_FILE="$ROOT_DIR/$LOG_FILE"
fi
if [[ ! -f "$LOG_FILE" ]]; then
  echo "error: log file not found: $LOG_FILE" >&2
  exit 1
fi

CLOSE_SCRIPT="$ROOT_DIR/scripts/orbit-close-run.sh"
if [[ ! -x "$CLOSE_SCRIPT" ]]; then
  echo "error: close script missing or not executable: $CLOSE_SCRIPT" >&2
  exit 1
fi

declare -a CAMPAIGNS=(
  "WalletRadar|walletradar-wave1|$HOME/launches/walletradar-wave1/evidence"
  "Idea Validation Bot|idea-validation-bot-wave2|$HOME/launches/idea-validation-bot-wave2/evidence"
  "Clawdbot Launchpad|clawdbot-launchpad-wave2|$HOME/launches/clawdbot-launchpad-wave2/evidence"
)

missing=0
for entry in "${CAMPAIGNS[@]}"; do
  IFS='|' read -r project campaign evidence_dir <<<"$entry"
  run_dir_file="$evidence_dir/run_dir.txt"
  if [[ ! -f "$run_dir_file" ]]; then
    echo "warning: missing run_dir file for $campaign: $run_dir_file" >&2
    missing=$((missing + 1))
    continue
  fi

  run_dir="$(tr -d '\r' < "$run_dir_file" | sed -e 's/[[:space:]]*$//')"
  if [[ -z "$run_dir" ]]; then
    echo "warning: empty run_dir for $campaign: $run_dir_file" >&2
    missing=$((missing + 1))
    continue
  fi

  echo "Refreshing campaign: $campaign"
  args=(
    --project "$project"
    --campaign "$campaign"
    --run-dir "$run_dir"
    --evidence-dir "$evidence_dir"
    --log-file "$LOG_FILE"
    --note "$NOTE_PREFIX"
  )
  if $APPEND_ONLY; then
    args+=(--append-only)
  fi

  "$CLOSE_SCRIPT" "${args[@]}"
done

if [[ $missing -gt 0 ]]; then
  echo "warning: completed with $missing missing campaign run_dir entries" >&2
  exit 1
fi

echo "Launch ops refresh complete."
