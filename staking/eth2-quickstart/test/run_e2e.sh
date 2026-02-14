#!/bin/bash
# Wrapper to run run_1.sh or run_2.sh E2E test in Docker with systemd
# Usage: ./run_e2e.sh --phase=1|2 [from repo root or test/]
# Builds image, starts container with systemd init, execs E2E test, cleans up
# Requires: Docker installed and running

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_NAME="${E2E_IMAGE_NAME:-eth-node-test}"
CONTAINER_NAME="run-e2e-$$"
CONTAINER_STARTED=false

PHASE=""
for arg in "$@"; do
    case "$arg" in
        --phase=1) PHASE=1 ;;
        --phase=2) PHASE=2 ;;
    esac
done

if [[ -z "$PHASE" ]] || [[ "$PHASE" != "1" && "$PHASE" != "2" ]]; then
    echo "Usage: $0 --phase=1|2"
    echo "  --phase=1  run_1.sh E2E (system setup, root)"
    echo "  --phase=2  run_2.sh E2E (client installation, testuser)"
    exit 1
fi

cleanup() {
    if [[ "$CONTAINER_STARTED" == "true" ]]; then
        echo "Cleaning up container..."
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
    fi
}
trap cleanup EXIT

cd "$PROJECT_ROOT"

# Verify Docker is available
if ! command -v docker &>/dev/null; then
    echo "Error: Docker is required but not found. Install Docker and try again."
    exit 1
fi

echo "=== run_${PHASE}.sh E2E Test ==="
if [[ "${SKIP_BUILD:-false}" != "true" ]]; then
    echo "Building image..."
    docker build -t "$IMAGE_NAME" -f test/Dockerfile .
else
    echo "Skipping build (SKIP_BUILD=true)"
fi

echo "Starting container with systemd (required for SSH, fail2ban)..."
if ! docker run -d --privileged \
    --user root \
    --cgroupns=host \
    -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
    --tmpfs /run --tmpfs /run/lock \
    --name "$CONTAINER_NAME" \
    -e DEBIAN_FRONTEND=noninteractive \
    -e DEBIAN_PRIORITY=critical \
    -e PHASE="$PHASE" \
    -e CI_E2E=true \
    "$IMAGE_NAME" \
    /sbin/init; then
    echo "Error: Failed to start container"
    exit 1
fi
CONTAINER_STARTED=true

# Verify container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Error: Container failed to start"
    docker logs "$CONTAINER_NAME" 2>/dev/null || true
    exit 1
fi

# Wait for systemd to be ready
echo "Waiting for systemd to initialize..."
sleep 5
for _ in $(seq 1 30); do
    if docker exec "$CONTAINER_NAME" systemctl is-system-running --wait 2>/dev/null | grep -qE "running|degraded"; then
        break
    fi
    sleep 2
done

# Phase 2 runs as testuser
if [[ "$PHASE" == "2" ]]; then
    echo "Running run_2.sh E2E test (as testuser)..."
    exit_code=0
    docker exec -e PHASE=2 -e CI_E2E=true -e DEBIAN_FRONTEND=noninteractive -e DEBIAN_PRIORITY=critical \
        --user testuser "$CONTAINER_NAME" /workspace/test/ci_test_e2e.sh || exit_code=$?
else
    echo "Running run_1.sh E2E test (as root)..."
    exit_code=0
    docker exec -e PHASE=1 -e DEBIAN_FRONTEND=noninteractive -e DEBIAN_PRIORITY=critical \
        --user root "$CONTAINER_NAME" /workspace/test/ci_test_e2e.sh || exit_code=$?
fi

exit $exit_code
