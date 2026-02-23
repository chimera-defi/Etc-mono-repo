#!/bin/bash
set -euo pipefail

RPC_URL="${RPC_URL:-http://127.0.0.1:26657}"
TIMEOUT="${TIMEOUT:-5}"

curl -s --max-time "$TIMEOUT" "$RPC_URL" | head -c 200
