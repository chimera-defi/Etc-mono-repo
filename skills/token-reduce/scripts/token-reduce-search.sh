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
GLOB="${2:-}"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
COLLECTION_NAME="repo-$(printf '%s' "$REPO_ROOT" | sha1sum | cut -c1-12)"
QMD_MASK="**/*.md"

path_hits() {
  if [[ -n "$GLOB" ]]; then
    rg --files -g "$GLOB" . 2>/dev/null | rg -i -F "$QUERY" | head -20 || true
  else
    rg --files . 2>/dev/null | rg -i -F "$QUERY" | head -20 || true
  fi
}

content_hits() {
  if [[ -n "$GLOB" ]]; then
    rg -l -S -g "$GLOB" "$QUERY" . | head -20 || true
  else
    rg -l -S "$QUERY" . | head -20 || true
  fi
}

snippet_hits() {
  if [[ -n "$GLOB" ]]; then
    rg -n -S -g "$GLOB" "$QUERY" . | head -40 || true
  else
    rg -n -S "$QUERY" . | head -40 || true
  fi
}

fallback_paths() {
  local paths contents
  paths="$(path_hits)"
  contents="$(content_hits)"

  if [[ -n "$paths" ]]; then
    printf '%s\n' "$paths"
    return 0
  fi

  if [[ -n "$contents" ]]; then
    printf '%s\n' "$contents"
    return 0
  fi

  echo "No results found."
}

fallback_snippets() {
  local paths snippets
  paths="$(path_hits)"
  snippets="$(snippet_hits)"

  if [[ -n "$paths" ]]; then
    printf '%s\n' "$paths"
  fi

  if [[ -n "$snippets" ]]; then
    [[ -n "$paths" ]] && echo
    printf '%s\n' "$snippets"
    return 0
  fi

  if [[ -z "$paths" ]]; then
    echo "No results found."
  fi
}

if command -v qmd >/dev/null 2>&1; then
  if ! qmd collection list 2>/dev/null | grep -q "^${COLLECTION_NAME} "; then
    echo "[token-reduce-search] indexing repo docs for qmd collection ${COLLECTION_NAME}"
    qmd collection add "$REPO_ROOT" --name "$COLLECTION_NAME" --mask "$QMD_MASK" >/dev/null
  fi

  echo "[token-reduce-search] qmd search --files (${COLLECTION_NAME})"
  QMD_FILES_OUTPUT="$(qmd search "$QUERY" -n 8 --files -c "$COLLECTION_NAME" || true)"
  printf '%s\n' "$QMD_FILES_OUTPUT"

  if [[ -n "$QMD_FILES_OUTPUT" && "$QMD_FILES_OUTPUT" != "No results found." ]]; then
    if [[ "$MODE" == "snippets" ]]; then
      echo
      echo "[token-reduce-search] qmd search snippet (${COLLECTION_NAME})"
      qmd search "$QUERY" -n 1 -c "$COLLECTION_NAME" || true
    fi
    exit 0
  fi

  echo "[token-reduce-search] qmd had no hits, falling back to rg"
  if [[ "$MODE" == "snippets" ]]; then
    echo
    fallback_snippets
  else
    fallback_paths
  fi
  exit 0
fi

echo "[token-reduce-search] qmd unavailable, falling back to scoped rg"
cd "$REPO_ROOT"
if [[ "$MODE" == "snippets" ]]; then
  fallback_snippets
else
  fallback_paths
fi
