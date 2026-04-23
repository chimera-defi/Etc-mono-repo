#!/usr/bin/env bash
set -euo pipefail

repo_root_or_pwd() {
  git rev-parse --show-toplevel 2>/dev/null || pwd
}

is_git_repo() {
  local dir="$1"
  git -C "$dir" rev-parse --git-dir >/dev/null 2>&1
}

require_git_repo() {
  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "not inside a git repository" >&2
    return 1
  fi
}

require_dir() {
  local path="$1"
  local label="${2:-directory}"
  if [[ ! -d "$path" ]]; then
    echo "$label does not exist: $path" >&2
    return 1
  fi
}
