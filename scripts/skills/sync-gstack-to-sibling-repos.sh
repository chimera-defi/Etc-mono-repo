#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"
source "$SCRIPT_DIR/../lib/symlink-sync.sh"

REPO_ROOT="$(repo_root_or_pwd)"
SIBLING_ROOT="${1:-$(dirname "$REPO_ROOT")}"
SHARED_SKILLS="${2:-$HOME/.agents/skills}"

require_dir "$SIBLING_ROOT" "sibling root" || exit 1
require_dir "$SHARED_SKILLS" "shared skills dir" || exit 1

mapfile -d '' sources < <(find "$SHARED_SKILLS" -mindepth 1 -maxdepth 1 \( -name "gstack" -o -name "gstack-*" \) -print0 | sort -z)
if [[ "${#sources[@]}" -eq 0 ]]; then
  echo "no gstack skills found in $SHARED_SKILLS" >&2
  exit 1
fi

repos=0
added=0
updated=0
skipped=0

while IFS= read -r -d '' repo; do
  [[ -d "$repo" ]] || continue
  [[ -L "$repo" ]] && continue
  if ! is_git_repo "$repo"; then
    continue
  fi

  ((repos+=1))
  target_dir="$repo/.agents/skills"
  mkdir -p "$target_dir"

  for src in "${sources[@]}"; do
    name="$(basename "$src")"
    dest="$target_dir/$name"
    sync_symlink_with_counters "$src" "$dest" added updated skipped
  done
done < <(find "$SIBLING_ROOT" -mindepth 1 -maxdepth 1 -type d -print0)

echo "repos=$repos added=$added updated=$updated skipped=$skipped"
