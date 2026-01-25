#!/usr/bin/env bash
set -euo pipefail

URL=${1:-}

if [[ -z "$URL" ]]; then
  echo "Usage: $0 <status-url>" >&2
  exit 2
fi

resp=$(curl -fsS "$URL")

if [[ -z "$resp" ]]; then
  echo "Empty response" >&2
  exit 1
fi

echo "$resp" | head -c 400
