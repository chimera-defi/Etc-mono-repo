#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: ./skills/token-reduce/scripts/token-reduce-paths.sh <query words...>" >&2
  exit 2
fi

QUERY="$*"
exec "$(dirname "$0")/token-reduce-search.sh" --paths-only "$QUERY"
