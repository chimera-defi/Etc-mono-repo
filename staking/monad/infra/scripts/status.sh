#!/usr/bin/env bash
set -euo pipefail
# Monad Validator Status Script
#
# Report current service state (running, stopped, error, metrics).
#
# Usage: status.sh [--json] [--tail=N] [--help]
#
# Options:
#   --json        Output JSON instead of human-readable format
#   --tail=N      Include last N log lines (default 10)
#   --help        Show this help

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

JSON_OUTPUT=false
TAIL_LINES=10

usage() {
  cat <<EOF
Usage: $(basename "$0") [--json] [--tail=N] [--help]

Report Monad validator service state and health.

Options:
  --json        Output structured JSON for tooling
  --tail=N      Include last N log lines in output (default 10)
  --help        Show this help

Environment:
  STACK_SERVICE_NAME   Override default service name (default: monad-validator)
  RPC_URL              Override RPC URL (default: http://localhost:8080)
  STATUS_PORT          Override status port (default: 8787)

Exit codes:
  0 = service running and healthy
  1 = service stopped or degraded

Examples:
  $(basename "$0")
  $(basename "$0") --json
  $(basename "$0") --tail=20
EOF
}

for arg in "$@"; do
  case "$arg" in
    --help|-h)  usage; exit 0 ;;
    --json)     JSON_OUTPUT=true ;;
    --tail=*)   TAIL_LINES="${arg#--tail=}" ;;
    *) log_error "Unknown argument: $arg"; usage; exit 2 ;;
  esac
done

SERVICE_NAME="${STACK_SERVICE_NAME:-monad-validator}"
RPC_URL="${RPC_URL:-http://localhost:8080}"
STATUS_PORT="${STATUS_PORT:-8787}"

# Get service status
if ! systemctl list-unit-files 2>/dev/null | grep -q "${SERVICE_NAME}.service"; then
  if [[ "$JSON_OUTPUT" == "true" ]]; then
    jq -n '{service_name: $name, status: "not_found", message: "Service not installed"}' \
      --arg name "$SERVICE_NAME"
  else
    log_error "Service $SERVICE_NAME not found"
  fi
  exit 1
fi

SERVICE_STATUS=$(systemctl is-active "$SERVICE_NAME" 2>/dev/null || echo "unknown")
SERVICE_ENABLED=$(systemctl is-enabled "$SERVICE_NAME" 2>/dev/null || echo "unknown")

# Get uptime if running
UPTIME_SECONDS=0
if [[ "$SERVICE_STATUS" == "active" ]]; then
  # Try to get uptime from systemd
  UPTIME_LINE=$(systemctl show "$SERVICE_NAME" -p StateChangeTimestamp --value 2>/dev/null || echo "")
  if [[ -n "$UPTIME_LINE" ]]; then
    STARTED_EPOCH=$(date -d "$UPTIME_LINE" +%s 2>/dev/null || echo 0)
    CURRENT_EPOCH=$(date +%s)
    UPTIME_SECONDS=$((CURRENT_EPOCH - STARTED_EPOCH))
  fi
fi

# Check node health via RPC
RPC_HEALTHY=false
if [[ "$SERVICE_STATUS" == "active" ]]; then
  HEALTH_RESP=$(curl -s -m 5 "http://localhost:${STATUS_PORT}/health" 2>/dev/null || echo '{"status":"error"}')
  if echo "$HEALTH_RESP" | grep -q "ok\|healthy" 2>/dev/null; then
    RPC_HEALTHY=true
  fi
fi

# Get recent logs
RECENT_LOGS=()
if command -v journalctl >/dev/null; then
  RECENT_LOGS=($(journalctl -u "$SERVICE_NAME" -n "$TAIL_LINES" -o cat 2>/dev/null || true))
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [[ "$JSON_OUTPUT" == "true" ]]; then
  # Output JSON
  if command -v jq >/dev/null; then
    jq -n \
      --arg timestamp "$TIMESTAMP" \
      --arg service_name "$SERVICE_NAME" \
      --arg status "$SERVICE_STATUS" \
      --arg enabled "$SERVICE_ENABLED" \
      --argjson uptime_seconds "$UPTIME_SECONDS" \
      --arg rpc_url "$RPC_URL" \
      --argjson rpc_healthy "$RPC_HEALTHY" \
      --arg status_port "$STATUS_PORT" \
      --argjson recent_logs "$(printf '%s\n' "${RECENT_LOGS[@]}" | jq -R . | jq -s .)" \
      '{
        timestamp: $timestamp,
        service_name: $service_name,
        status: $status,
        enabled: $enabled,
        uptime_seconds: $uptime_seconds,
        rpc_healthy: $rpc_healthy,
        rpc_url: $rpc_url,
        status_port: $status_port,
        recent_logs: $recent_logs
      }'
  else
    # Fallback without jq
    cat <<JSON
{
  "timestamp": "$TIMESTAMP",
  "service_name": "$SERVICE_NAME",
  "status": "$SERVICE_STATUS",
  "enabled": "$SERVICE_ENABLED",
  "uptime_seconds": $UPTIME_SECONDS,
  "rpc_healthy": $RPC_HEALTHY,
  "rpc_url": "$RPC_URL",
  "status_port": $STATUS_PORT,
  "note": "JSON output without jq may be incomplete"
}
JSON
  fi
else
  # Human-readable output
  echo ""
  echo "=== Monad Validator Status ==="
  echo "Service:      $SERVICE_NAME"
  echo "Status:       $SERVICE_STATUS"
  echo "Enabled:      $SERVICE_ENABLED"
  echo "Uptime:       ${UPTIME_SECONDS}s"
  echo "RPC URL:      $RPC_URL"
  echo "RPC Healthy:  $RPC_HEALTHY"
  echo "Status Port:  $STATUS_PORT"
  echo ""
  if [[ ${#RECENT_LOGS[@]} -gt 0 ]]; then
    echo "Recent logs (last $TAIL_LINES lines):"
    printf '%s\n' "${RECENT_LOGS[@]}" | head -n "$TAIL_LINES"
  fi
  echo ""
fi

# Exit code based on health
if [[ "$SERVICE_STATUS" == "active" ]] && [[ "$RPC_HEALTHY" == "true" ]]; then
  exit 0
else
  exit 1
fi
