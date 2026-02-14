#!/usr/bin/env bash
set -euo pipefail

RPC_URL=${1:-}
METHOD=${2:-eth_blockNumber}

if [[ -z "$RPC_URL" ]]; then
  echo "Usage: $0 <rpc-url> [method]" >&2
  exit 2
fi

payload=$(cat <<JSON
{"jsonrpc":"2.0","id":1,"method":"${METHOD}","params":[]}
JSON
)

resp=$(curl -fsS -H "Content-Type: application/json" --data "$payload" "$RPC_URL")

if echo "$resp" | grep -q '"error"'; then
  echo "RPC error: $resp" >&2
  exit 1
fi

echo "$resp" | head -c 400
