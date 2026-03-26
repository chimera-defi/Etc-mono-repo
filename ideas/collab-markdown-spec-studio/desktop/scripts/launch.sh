#!/usr/bin/env bash
# SpecForge Desktop Launcher
# Starts web + collab server then waits for both to be healthy

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
WEB_DIR="$ROOT_DIR/web"
COLLAB_DIR="$ROOT_DIR/collab-server"

WEB_PORT=3000
COLLAB_PORT=4321
COLLAB_HEALTH_PORT=4322
TIMEOUT=30

cleanup() {
  echo "Shutting down SpecForge services..."
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true
  [ -n "$COLLAB_PID" ] && kill "$COLLAB_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting SpecForge collab server..."
cd "$COLLAB_DIR" && bun run start &
COLLAB_PID=$!

echo "Starting SpecForge web app..."
cd "$WEB_DIR" && bun run start &
WEB_PID=$!

echo "Waiting for services to be healthy..."
elapsed=0
while [ $elapsed -lt $TIMEOUT ]; do
  WEB_OK=$(curl -sf "http://localhost:$WEB_PORT/api/health" > /dev/null 2>&1 && echo 1 || echo 0)
  COLLAB_OK=$(curl -sf "http://127.0.0.1:$COLLAB_HEALTH_PORT/health" > /dev/null 2>&1 && echo 1 || echo 0)
  if [ "$WEB_OK" = "1" ] && [ "$COLLAB_OK" = "1" ]; then
    echo "SpecForge is ready at http://localhost:$WEB_PORT"
    wait
    exit 0
  fi
  sleep 1
  elapsed=$((elapsed + 1))
done

echo "ERROR: Services did not start within ${TIMEOUT}s" >&2
exit 1
