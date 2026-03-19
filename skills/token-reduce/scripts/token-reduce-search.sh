#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: ./.claude/token-reduce-search.sh [--paths-only|--snippets] <query> [glob]" >&2
  exit 2
fi

MODE="paths-only"
if [[ "${1:-}" == "--paths-only" ]]; then
  MODE="paths-only"
  shift
elif [[ "${1:-}" == "--snippets" ]]; then
  MODE="snippets"
  shift
fi

if [[ $# -lt 1 ]]; then
  echo "usage: ./.claude/token-reduce-search.sh [--paths-only|--snippets] <query> [glob]" >&2
  exit 2
fi

QUERY="$1"
GLOB="${2:-*.md}"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
COLLECTION_NAME="repo-$(printf '%s' "$REPO_ROOT" | sha1sum | cut -c1-12)"
QMD_MASK="**/*.md"

if command -v qmd >/dev/null 2>&1; then
  if ! qmd collection list 2>/dev/null | grep -q "^${COLLECTION_NAME} "; then
    echo "[token-reduce-search] indexing repo docs for qmd collection ${COLLECTION_NAME}"
    qmd collection add "$REPO_ROOT" --name "$COLLECTION_NAME" --mask "$QMD_MASK" >/dev/null
  fi

  echo "[token-reduce-search] qmd search --files (${COLLECTION_NAME})"
  qmd search "$QUERY" -n 8 --files -c "$COLLECTION_NAME" || true

  if [[ "$MODE" == "snippets" ]]; then
    echo
    echo "[token-reduce-search] qmd search snippet (${COLLECTION_NAME})"
    qmd search "$QUERY" -n 1 -c "$COLLECTION_NAME" || true
  fi
  exit 0
fi

echo "[token-reduce-search] qmd unavailable, falling back to scoped rg"
cd "$REPO_ROOT"
if [[ "$MODE" == "snippets" ]]; then
  rg -n -S -g "$GLOB" "$QUERY" . | head -40 || true
else
  rg -l -S -g "$GLOB" "$QUERY" . | head -20 || true
fi
