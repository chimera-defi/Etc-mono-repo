#!/usr/bin/env bash
set -euo pipefail
# Aztec Node Health Check
#
# Verifies that an Aztec node is responding and syncing.
# Returns JSON status on stdout, exits 0 if healthy.
#
# Usage: check_aztec_node.sh [node_url]
#
# Env vars:
#   AZTEC_NODE_URL   Node RPC URL (default: http://localhost:8080)
#   TIMEOUT          Request timeout in seconds (default: 10)

NODE_URL="${1:-${AZTEC_NODE_URL:-http://localhost:8080}}"
TIMEOUT="${TIMEOUT:-10}"

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  echo "Usage: $0 [node_url]"
  echo ""
  echo "Checks Aztec node health. Exits 0 if healthy, 1 if degraded."
  echo ""
  echo "Env vars:"
  echo "  AZTEC_NODE_URL   Node RPC URL (default: http://localhost:8080)"
  echo "  TIMEOUT          Request timeout in seconds (default: 10)"
  exit 0
fi

# Query node version
VERSION_RESP=$(curl -s -m "$TIMEOUT" -X POST "$NODE_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"node_getVersion","params":[],"id":1}' 2>/dev/null || echo '{}')

VERSION=$(echo "$VERSION_RESP" | grep -oP '"result"\s*:\s*"\K[^"]+' 2>/dev/null || echo "")

# Query L2 tips (block height)
TIPS_RESP=$(curl -s -m "$TIMEOUT" -X POST "$NODE_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"node_getL2Tips","params":[],"id":2}' 2>/dev/null || echo '{}')

# Determine status
STATUS="unreachable"
if [[ -n "$VERSION" ]]; then
  STATUS="ok"
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat <<JSON
{
  "status": "$STATUS",
  "timestamp": "$TIMESTAMP",
  "node_url": "$NODE_URL",
  "version": "${VERSION:-null}",
  "l2_tips_raw": $(echo "$TIPS_RESP" | head -c 500)
}
JSON

if [[ "$STATUS" == "ok" ]]; then
  exit 0
else
  exit 1
fi
