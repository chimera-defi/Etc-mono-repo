#!/bin/bash
# Ethereum Preflight Check
# Validates system before installation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/exports.sh"

echo "=== Ethereum Preflight Check ==="

# Check ports
echo "[1/4] Checking ports..."
for port in 30303 8545 8551; do
    if netstat -tuln 2>/dev/null | grep -q ":${port} "; then
        echo "ERROR: Port ${port} is already in use"
        exit 1
    fi
done

# Check dependencies  
echo "[2/4] Checking dependencies..."
command -v curl >/dev/null || { echo "ERROR: curl required"; exit 1; }
command -v jq >/dev/null || { echo "ERROR: jq required"; exit 1; }

# Check disk space
echo "[3/4] Checking disk space..."
avail=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [[ $avail -lt 100 ]]; then
    echo "ERROR: Need at least 100GB free, have ${avail}GB"
    exit 1
fi

echo "[4/4] All checks passed!"
