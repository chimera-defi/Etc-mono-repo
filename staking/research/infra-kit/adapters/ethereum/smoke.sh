#!/bin/bash
# Ethereum Smoke Test - Verify installation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/exports.sh"

echo "=== Ethereum Smoke Test ==="

RPC_URL="${RPC_URL:-http://localhost:8545}"

# Check execution client
echo "[1/2] Testing execution client..."
if curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    "${RPC_URL}" | jq -e '.result' >/dev/null 2>&1; then
    echo "[1/2] Execution client: OK"
else
    echo "[1/2] Execution client: FAILED"
    exit 1
fi

# Check consensus client
echo "[2/2] Testing consensus client..."
if curl -s "${EL_RPC_URL:-http://localhost:5052}/eth/v1/node/syncing" | jq -e '.data' >/dev/null 2>&1; then
    echo "[2/2] Consensus client: OK"
else
    echo "[2/2] Consensus client: FAILED"
    exit 1
fi

echo "=== All smoke tests passed ==="
