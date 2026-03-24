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
NEEDS_PATH_HINT=0
PREFER_SKILL_SCRIPTS=0
NEEDS_HOOK_FOCUS=0
PREFER_SCRIPT_CONTENT=0

if [[ "$QUERY" =~ (^|[[:space:]])(script|hook)([[:space:]]|$) || "$QUERY" == *".py"* || "$QUERY" == *".sh"* ]]; then
  NEEDS_PATH_HINT=1
fi

if [[ "$QUERY" =~ (^|[[:space:]])hook([[:space:]]|$) ]]; then
  NEEDS_HOOK_FOCUS=1
fi

if [[ "$QUERY" =~ [Tt]oken[[:space:]-]?[Rr]eduction ]]; then
  PREFER_SKILL_SCRIPTS=1
fi

if [[ "$QUERY" =~ (^|[[:space:]])(benchmark|measure|adoption)([[:space:]]|$) ]]; then
  PREFER_SCRIPT_CONTENT=1
fi

path_pattern() {
  local lowered token
  lowered="$(printf '%s' "$QUERY" | tr '[:upper:]' '[:lower:]')"
  if [[ "$lowered" == *".py"* || "$lowered" == *".sh"* || "$lowered" == *"_"* || "$lowered" == *"-"* ]]; then
    printf '%s' "$QUERY"
    return 0
  fi

  local tokens=()
  while IFS= read -r token; do
    case "$token" in
      ""|find|path|paths|repo|this|that|only|return|script|scripts|hook|python|workflow|broad|exploratory|scans|blocks|block|minimum|context|possible|the)
        continue
        ;;
    esac
    if [[ ${#token} -ge 4 ]]; then
      tokens+=("$token")
    fi
    [[ ${#tokens[@]} -ge 4 ]] && break
  done < <(printf '%s' "$lowered" | tr -cs '[:alnum:]_.-' '\n')

  if [[ ${#tokens[@]} -eq 0 ]]; then
    printf '%s' "$QUERY"
    return 0
  fi

  local pattern="${tokens[0]}"
  local i
  for ((i = 1; i < ${#tokens[@]}; i++)); do
    pattern="${pattern}|${tokens[i]}"
  done
  printf '%s' "$pattern"
}

content_pattern() {
  local lowered token
  lowered="$(printf '%s' "$QUERY" | tr '[:upper:]' '[:lower:]')"

  local tokens=()
  while IFS= read -r token; do
    case "$token" in
      ""|find|path|paths|repo|this|that|only|return|min*|context|possible|the|use|using|token|reduction|workflow)
        continue
        ;;
    esac
    if [[ ${#token} -ge 4 ]]; then
      tokens+=("$token")
    fi
    [[ ${#tokens[@]} -ge 5 ]] && break
  done < <(printf '%s' "$lowered" | tr -cs '[:alnum:]_.-' '\n')

  if [[ ${#tokens[@]} -eq 0 ]]; then
    printf '%s' "$QUERY"
    return 0
  fi

  local pattern="${tokens[0]}"
  local i
  for ((i = 1; i < ${#tokens[@]}; i++)); do
    pattern="${pattern}|${tokens[i]}"
  done
  printf '%s' "$pattern"
}

filter_candidates() {
  rg -v '(^|/)skills/token-reduce/scripts/benchmark-token-reduction-agents\.py(:|$)' || true
}

ranked_content_paths() {
  awk -F: '{count[$1]++} END {for (f in count) print count[f] "\t" f}' | sort -rn | cut -f2- | head -20
}

filter_hook_candidates() {
  if [[ "$NEEDS_HOOK_FOCUS" -eq 1 ]]; then
    rg -v '(^|/)(measure_token_reduction|benchmark-token-reduction-workflow|benchmark-token-reduction-agents|baseline-measurement|summarize_token_reduction|install-token-reduction-cron|token-reduce-(paths|search|snippet)|remind-token-reduce)\.(py|sh)(:|$)' || true
  else
    cat
  fi
}

path_hits() {
  local pattern
  pattern="$(path_pattern)"
  if [[ -n "$GLOB" ]]; then
    rg --files -g "$GLOB" . 2>/dev/null | rg -i -e "$pattern" | filter_candidates | head -20 || true
  else
    rg --files . 2>/dev/null | rg -i -e "$pattern" | filter_candidates | head -20 || true
  fi
}

content_hits() {
  local pattern="$QUERY"
  if [[ "$NEEDS_PATH_HINT" -eq 1 || "$PREFER_SCRIPT_CONTENT" -eq 1 ]]; then
    pattern="$(content_pattern)"
  fi
  if [[ -n "$GLOB" ]]; then
    rg -n -i -e "$pattern" -g "$GLOB" . | filter_candidates | filter_hook_candidates | ranked_content_paths || true
  elif [[ "$PREFER_SKILL_SCRIPTS" -eq 1 ]]; then
    rg -n -i -e "$pattern" skills/token-reduce/scripts | filter_candidates | filter_hook_candidates | ranked_content_paths || true
  elif [[ "$NEEDS_PATH_HINT" -eq 1 ]]; then
    rg -n -i -e "$pattern" -g '*.py' -g '*.sh' . | filter_candidates | filter_hook_candidates | ranked_content_paths || true
  else
    rg -n -i -e "$pattern" . | filter_candidates | filter_hook_candidates | ranked_content_paths || true
  fi
}

snippet_hits() {
  local pattern="$QUERY"
  if [[ "$NEEDS_PATH_HINT" -eq 1 || "$PREFER_SCRIPT_CONTENT" -eq 1 ]]; then
    pattern="$(content_pattern)"
  fi
  if [[ -n "$GLOB" ]]; then
    rg -n -i -e "$pattern" -g "$GLOB" . | filter_candidates | head -40 || true
  elif [[ "$PREFER_SKILL_SCRIPTS" -eq 1 ]]; then
    rg -n -i -e "$pattern" skills/token-reduce/scripts | filter_candidates | head -40 || true
  elif [[ "$NEEDS_PATH_HINT" -eq 1 ]]; then
    rg -n -i -e "$pattern" -g '*.py' -g '*.sh' . | filter_candidates | head -40 || true
  else
    rg -n -i -e "$pattern" . | filter_candidates | head -40 || true
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

PATH_HINTS=""
CONTENT_HINTS=""
if [[ "$NEEDS_PATH_HINT" -eq 1 ]]; then
  if [[ "$PREFER_SKILL_SCRIPTS" -eq 0 ]]; then
    PATH_HINTS="$(path_hits)"
  fi
  if [[ -z "$PATH_HINTS" ]]; then
    CONTENT_HINTS="$(content_hits)"
  fi
elif [[ "$PREFER_SKILL_SCRIPTS" -eq 1 && "$PREFER_SCRIPT_CONTENT" -eq 1 ]]; then
  CONTENT_HINTS="$(content_hits)"
fi

if command -v qmd >/dev/null 2>&1; then
  if [[ "$NEEDS_PATH_HINT" -eq 1 && -n "$PATH_HINTS" ]]; then
    echo "[token-reduce-search] rg path hits"
    printf '%s\n' "$PATH_HINTS"

    if [[ "$MODE" == "snippets" ]]; then
      echo
      fallback_snippets
    fi
    exit 0
  fi

  if [[ "$NEEDS_PATH_HINT" -eq 1 && -n "$CONTENT_HINTS" ]]; then
    echo "[token-reduce-search] rg content hits"
    printf '%s\n' "$CONTENT_HINTS"

    if [[ "$MODE" == "snippets" ]]; then
      echo
      fallback_snippets
    fi
    exit 0
  fi

  if [[ "$PREFER_SKILL_SCRIPTS" -eq 1 && "$PREFER_SCRIPT_CONTENT" -eq 1 && -n "$CONTENT_HINTS" ]]; then
    echo "[token-reduce-search] rg content hits"
    printf '%s\n' "$CONTENT_HINTS"

    if [[ "$MODE" == "snippets" ]]; then
      echo
      fallback_snippets
    fi
    exit 0
  fi

  if ! qmd collection list 2>/dev/null | grep -q "^${COLLECTION_NAME} "; then
    echo "[token-reduce-search] indexing repo docs for qmd collection ${COLLECTION_NAME}"
    qmd collection add "$REPO_ROOT" --name "$COLLECTION_NAME" --mask "$QMD_MASK" >/dev/null
  fi

  echo "[token-reduce-search] qmd search --files (${COLLECTION_NAME})"
  QMD_FILES_OUTPUT="$(qmd search "$QUERY" -n 8 --files -c "$COLLECTION_NAME" || true)"
  printf '%s\n' "$QMD_FILES_OUTPUT"

  if [[ -n "$QMD_FILES_OUTPUT" && "$QMD_FILES_OUTPUT" != "No results found." ]]; then
    if [[ "$NEEDS_PATH_HINT" -eq 1 ]]; then
      if [[ -n "$PATH_HINTS" ]]; then
        echo
        echo "[token-reduce-search] rg path hits"
        printf '%s\n' "$PATH_HINTS"
      fi
    fi

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
  elif [[ "$NEEDS_PATH_HINT" -eq 1 ]]; then
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
