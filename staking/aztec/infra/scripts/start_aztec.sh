#!/usr/bin/env bash
set -euo pipefail
# Aztec Node Start Script
#
# Start the Aztec node service and optionally wait for it to be active.
#
# Usage: start_aztec.sh [--no-wait] [--timeout=N] [--help]
#
# Options:
#   --no-wait       Start asynchronously, do not wait for active state
#   --timeout=N     Max time to wait for active state (default 60)
#   --help          Show this help

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $*" >&2; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

NO_WAIT=false
TIMEOUT=60

usage() {
  cat <<EOF
Usage: $(basename "$0") [--no-wait] [--timeout=N] [--help]

Start the Aztec node service.

Options:
  --no-wait       Start asynchronously; do not wait for active state
  --timeout=N     Max time to wait for active state in seconds (default 60)
  --help          Show this help

Environment:
  STACK_SERVICE_NAME   Override default service name (default: aztec-node)

Exit codes:
  0 = service active
  1 = failed to start or timeout

Examples:
  sudo $(basename "$0")
  sudo $(basename "$0") --no-wait
  sudo $(basename "$0") --timeout=30
EOF
}

for arg in "$@"; do
  case "$arg" in
    --help|-h)   usage; exit 0 ;;
    --no-wait)   NO_WAIT=true ;;
    --timeout=*) TIMEOUT="${arg#--timeout=}" ;;
    *) log_error "Unknown argument: $arg"; usage; exit 2 ;;
  esac
done

SERVICE_NAME="${STACK_SERVICE_NAME:-aztec-node}"

log_info "Starting service: $SERVICE_NAME"

# Start service
sudo systemctl start "$SERVICE_NAME" || {
  log_error "Failed to start service"
  exit 1
}

if [[ "$NO_WAIT" == "true" ]]; then
  log_info "Service start initiated (not waiting for active state)"
  exit 0
fi

# Wait for service to become active
log_info "Waiting for service to become active (timeout: ${TIMEOUT}s)..."
local elapsed=0
while true; do
  STATUS=$(systemctl is-active "$SERVICE_NAME" 2>/dev/null || echo "inactive")
  
  if [[ "$STATUS" == "active" ]]; then
    log_info "Service is now active"
    exit 0
  fi
  
  if [[ "$STATUS" == "failed" ]]; then
    log_error "Service failed to start"
    systemctl status "$SERVICE_NAME" >&2 || true
    exit 1
  fi
  
  if [[ $elapsed -ge $TIMEOUT ]]; then
    log_error "Timeout waiting for service to become active (status: $STATUS)"
    systemctl status "$SERVICE_NAME" >&2 || true
    exit 1
  fi
  
  sleep 1
  ((elapsed++))
done
