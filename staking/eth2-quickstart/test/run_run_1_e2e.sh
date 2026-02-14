#!/bin/bash
# Wrapper to run run_1.sh E2E test in Docker with systemd
# Usage: ./run_run_1_e2e.sh [from repo root or test/]
# Builds image, starts container with systemd init, execs E2E test, cleans up
# Requires: Docker installed and running

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_NAME="${E2E_IMAGE_NAME:-eth-node-test}"
CONTAINER_NAME="run1-e2e-$$"
CONTAINER_STARTED=false

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

echo "=== run_1.sh E2E Test ==="
if [[ "${SKIP_BUILD:-false}" != "true" ]]; then
    echo "Building image..."
    docker build -t "$IMAGE_NAME" -f test/Dockerfile .
else
    echo "Skipping build (SKIP_BUILD=true)"
fi

echo "Starting container with systemd (required for SSH, fail2ban)..."
# Use systemd as init - required for configure_ssh, fail2ban, etc.
# --user root: Dockerfile defaults to testuser, but init must run as root
# systemd in Docker: tmpfs for /run, cgroupns=host for cgroup v2 (GitHub Actions)
if ! docker run -d --privileged \
    --user root \
    --cgroupns=host \
    -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
    --tmpfs /run --tmpfs /run/lock \
    --name "$CONTAINER_NAME" \
    -e DEBIAN_FRONTEND=noninteractive \
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

# Run E2E test as root
echo "Running run_1.sh E2E test..."
exit_code=0
docker exec --user root "$CONTAINER_NAME" /workspace/test/ci_test_run_1_e2e.sh || exit_code=$?

exit $exit_code
