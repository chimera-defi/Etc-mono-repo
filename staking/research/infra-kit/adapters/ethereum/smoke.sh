#!/bin/bash
# Ethereum Adapter - Smoke Test
# Quick health check via RPC

set -e

echo "=== Ethereum Smoke Test ==="

# Check EL RPC
echo "Checking EL RPC..."
curl -s -X POST localhost:8545 \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    | jq -e '.result' >/dev/null

# Check CL RPC
echo "Checking CL RPC..."
curl -s localhost:5052/eth/v1/node/syncing \
    | jq -e '.data' >/dev/null

# Check services
echo "Checking services..."
systemctl is-active eth1 beacon-chain

echo "=== Smoke Test Passed ==="
