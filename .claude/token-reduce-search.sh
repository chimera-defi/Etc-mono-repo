#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: ./.claude/token-reduce-search.sh <query> [glob]" >&2
  exit 2
fi

QUERY="$1"
GLOB="${2:-*.md}"

if command -v qmd >/dev/null 2>&1 && qmd collection list >/dev/null 2>&1; then
  echo "[token-reduce-search] qmd search --files"
  qmd search "$QUERY" -n 8 --files || true
  echo
  echo "[token-reduce-search] qmd search snippets"
  qmd search "$QUERY" -n 5 || true
  exit 0
fi

echo "[token-reduce-search] qmd unavailable, falling back to scoped rg"
rg -n -S -g "$GLOB" "$QUERY" . | head -40 || true
