#!/usr/bin/env bash
# SpecForge Desktop Launcher
# Starts web + collab server, waits for health checks, then keeps running.
# Usage: bash desktop/scripts/launch.sh [--dev]
#   --dev  Uses 'bun run dev' instead of 'bun run start'

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$DESKTOP_DIR")"
WEB_DIR="$ROOT_DIR/web"
COLLAB_DIR="$ROOT_DIR/collab-server"

WEB_PORT=3000
COLLAB_PORT=4321
COLLAB_HEALTH_PORT=4322
TIMEOUT=30

MODE="start"
if [ "${1:-}" = "--dev" ]; then
  MODE="dev"
fi

WEB_PID=""
COLLAB_PID=""

cleanup() {
  echo ""
  echo "Shutting down SpecForge services..."
  if [ -n "$WEB_PID" ]; then
    kill "$WEB_PID" 2>/dev/null || true
    wait "$WEB_PID" 2>/dev/null || true
  fi
  if [ -n "$COLLAB_PID" ]; then
    kill "$COLLAB_PID" 2>/dev/null || true
    wait "$COLLAB_PID" 2>/dev/null || true
  fi
  echo "All services stopped."
}
trap cleanup EXIT INT TERM

# Start collab server
if [ -d "$COLLAB_DIR" ]; then
  echo "Starting collab server (mode: $MODE)..."
  (cd "$COLLAB_DIR" && bun run "$MODE") &
  COLLAB_PID=$!
else
  echo "WARNING: Collab server directory not found at $COLLAB_DIR" >&2
fi

# Start web app
if [ -d "$WEB_DIR" ]; then
  echo "Starting web application (mode: $MODE)..."
  (cd "$WEB_DIR" && bun run "$MODE") &
  WEB_PID=$!
else
  echo "WARNING: Web directory not found at $WEB_DIR" >&2
fi

# Health polling
echo "Waiting for services to be healthy (timeout: ${TIMEOUT}s)..."
elapsed=0
web_ok=0
collab_ok=0

while [ $elapsed -lt $TIMEOUT ]; do
  if [ "$web_ok" -eq 0 ]; then
    if curl -sf "http://localhost:$WEB_PORT/api/health" > /dev/null 2>&1; then
      web_ok=1
      echo "  [OK] Web application is healthy"
    fi
  fi

  if [ "$collab_ok" -eq 0 ]; then
    if curl -sf "http://127.0.0.1:$COLLAB_HEALTH_PORT/health" > /dev/null 2>&1; then
      collab_ok=1
      echo "  [OK] Collab server is healthy"
    fi
  fi

  if [ "$web_ok" -eq 1 ] && [ "$collab_ok" -eq 1 ]; then
    echo ""
    echo "SpecForge is ready at http://localhost:$WEB_PORT"
    echo "Press Ctrl+C to stop all services."
    wait
    exit 0
  fi

  sleep 1
  elapsed=$((elapsed + 1))

  # Check if child processes died
  if [ -n "$WEB_PID" ] && ! kill -0 "$WEB_PID" 2>/dev/null; then
    echo "ERROR: Web application process exited unexpectedly" >&2
    exit 1
  fi
  if [ -n "$COLLAB_PID" ] && ! kill -0 "$COLLAB_PID" 2>/dev/null; then
    echo "ERROR: Collab server process exited unexpectedly" >&2
    exit 1
  fi
done

# Timeout
echo ""
echo "ERROR: Services did not become healthy within ${TIMEOUT}s" >&2
[ "$web_ok" -eq 0 ] && echo "  FAILED: Web application (http://localhost:$WEB_PORT/api/health)" >&2
[ "$collab_ok" -eq 0 ] && echo "  FAILED: Collab server (http://127.0.0.1:$COLLAB_HEALTH_PORT/health)" >&2
exit 1
