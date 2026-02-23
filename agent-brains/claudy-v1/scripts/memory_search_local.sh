#!/usr/bin/env bash
set -euo pipefail

q="${*:-}"
if [[ -z "$q" ]]; then
  echo "usage: memory_search_local.sh <query>" >&2
  exit 2
fi

export PATH=/root/.bun/bin:$PATH

# BM25-only local search over OpenClaw workspace collection, then filter to memory files.
qmd search "$q" -n 30 --files -c openclaw-workspace \
  | grep -E '(^|\s)(memory/|MEMORY\.md)' \
  | sed -n '1,15p'
