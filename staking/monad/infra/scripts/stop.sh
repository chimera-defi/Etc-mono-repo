#!/usr/bin/env bash
set -euo pipefail
# Monad Validator Stop Script
#
# Gracefully stop the Monad validator service.
#
# Usage: stop.sh [--force] [--timeout=N] [--help]
#
# Options:
#   --force         Do not wait; kill service immediately
#   --timeout=N     Max wait for graceful shutdown (default 30)
#   --help          Show this help

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $*" >&2; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

FORCE=false
TIMEOUT=30

usage() {
  cat <<EOF
Usage: $(basename "$0") [--force] [--timeout=N] [--help]

Gracefully stop the Monad validator service.

Options:
  --force         Kill immediately (skip graceful shutdown)
  --timeout=N     Max wait for graceful shutdown in seconds (default 30)
  --help          Show this help

Environment:
  STACK_SERVICE_NAME   Override default service name (default: monad-validator)

Exit codes:
  0 = service stopped
  1 = timeout or error

Examples:
  sudo $(basename "$0")
  sudo $(basename "$0") --force --timeout=10
EOF
}

for arg in "$@"; do
  case "$arg" in
    --help|-h)   usage; exit 0 ;;
    --force)     FORCE=true ;;
    --timeout=*) TIMEOUT="${arg#--timeout=}" ;;
    *) log_error "Unknown argument: $arg"; usage; exit 2 ;;
  esac
done

SERVICE_NAME="${STACK_SERVICE_NAME:-monad-validator}"

log_info "Stopping service: $SERVICE_NAME"

# Check if service exists
if ! systemctl list-unit-files 2>/dev/null | grep -q "${SERVICE_NAME}.service"; then
  log_warn "Service $SERVICE_NAME not found"
  exit 0
fi

# Check if already stopped
STATUS=$(systemctl is-active "$SERVICE_NAME" 2>/dev/null || echo "inactive")
if [[ "$STATUS" == "inactive" ]]; then
  log_info "Service already inactive"
  exit 0
fi

# Stop service
if [[ "$FORCE" == "true" ]]; then
  log_info "Force-killing service..."
  sudo systemctl kill --kill-who=all --signal=SIGKILL "$SERVICE_NAME" 2>/dev/null || true
else
  log_info "Stopping service gracefully (timeout: ${TIMEOUT}s)..."
  sudo systemctl stop "$SERVICE_NAME" &
  local PID=$!
  
  # Wait with timeout
  local elapsed=0
  while kill -0 "$PID" 2>/dev/null; do
    if [[ $elapsed -ge $TIMEOUT ]]; then
      log_warn "Graceful shutdown timeout, force-killing..."
      sudo systemctl kill --kill-who=all --signal=SIGKILL "$SERVICE_NAME" 2>/dev/null || true
      break
    fi
    sleep 1
    ((elapsed++))
  done
fi

# Verify stopped
sleep 2
STATUS=$(systemctl is-active "$SERVICE_NAME" 2>/dev/null || echo "inactive")
if [[ "$STATUS" == "inactive" ]]; then
  log_info "Service stopped successfully"
  exit 0
else
  log_error "Service failed to stop (status: $STATUS)"
  exit 1
fi
