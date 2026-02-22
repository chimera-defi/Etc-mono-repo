#!/usr/bin/env bash
set -euo pipefail
# Aztec Node Logs Script
#
# Tail service logs from systemd journal.
#
# Usage: logs_aztec.sh [--tail=N] [--follow] [--since=TIME] [--help]
#
# Options:
#   --tail=N      Show last N lines (default 50)
#   --follow      Stream new lines until interrupted
#   --since=TIME  Show logs since TIME (e.g., "10 minutes ago" or ISO 8601)
#   --help        Show this help

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

TAIL_LINES=50
FOLLOW=false
SINCE=""

usage() {
  cat <<EOF
Usage: $(basename "$0") [--tail=N] [--follow] [--since=TIME] [--help]

Tail Aztec node service logs from systemd journal.

Options:
  --tail=N      Show last N lines (default 50)
  --follow      Stream new lines (like 'tail -f')
  --since=TIME  Show logs since TIME (e.g., "10 minutes ago", "2026-02-21 10:00", ISO 8601)
  --help        Show this help

Environment:
  STACK_SERVICE_NAME   Override default service name (default: aztec-node)

Exit codes:
  0 = success
  1 = permission denied or service not found

Examples:
  $(basename "$0") --tail=100
  $(basename "$0") --follow
  $(basename "$0") --since="5 minutes ago"
  $(basename "$0") --tail=20 --since="2026-02-21 10:00:00"
EOF
}

for arg in "$@"; do
  case "$arg" in
    --help|-h)    usage; exit 0 ;;
    --follow|-f)  FOLLOW=true ;;
    --tail=*)     TAIL_LINES="${arg#--tail=}" ;;
    --since=*)    SINCE="${arg#--since=}" ;;
    *) log_error "Unknown argument: $arg"; usage; exit 2 ;;
  esac
done

if ! [[ "$TAIL_LINES" =~ ^[0-9]+$ ]]; then
  log_error "Invalid tail value: $TAIL_LINES (must be positive integer)"
  exit 2
fi

SERVICE_NAME="${STACK_SERVICE_NAME:-aztec-node}"

# Verify service exists
if ! systemctl list-unit-files 2>/dev/null | grep -q "${SERVICE_NAME}.service"; then
  log_error "Service $SERVICE_NAME not found"
  exit 1
fi

# Build journalctl command
declare -a JC_ARGS=()

JC_ARGS+=("-u" "$SERVICE_NAME")
JC_ARGS+=("-n" "$TAIL_LINES")

if [[ "$FOLLOW" == "true" ]]; then
  JC_ARGS+=("-f")
fi

if [[ -n "$SINCE" ]]; then
  JC_ARGS+=("--since" "$SINCE")
fi

# Default to human-readable output with timestamps
JC_ARGS+=("-o" "short-iso")

# Execute
journalctl "${JC_ARGS[@]}" || {
  log_error "Failed to read logs (check permissions or service name)"
  exit 1
}
