#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"
source "$SCRIPT_DIR/../lib/symlink-sync.sh"

SOURCE_DIR="${1:-$HOME/.agents/skills}"
shift || true

if [[ "$#" -gt 0 ]]; then
  DESTINATIONS=("$@")
else
  DESTINATIONS=("$HOME/.claude/skills" "$HOME/.codex/skills")
fi

require_dir "$SOURCE_DIR" "source" || exit 1

added=0
updated=0
skipped=0

for dest in "${DESTINATIONS[@]}"; do
  mkdir -p "$dest"
  echo "syncing -> $dest"

  while IFS= read -r -d '' src_path; do
    name="$(basename "$src_path")"
    dest_path="$dest/$name"
    sync_symlink_with_counters "$src_path" "$dest_path" added updated skipped
    case "$SYNC_ACTION" in
      added) echo "  added: $name" ;;
      updated) echo "  updated symlink: $name" ;;
      skipped) echo "  skipped existing non-symlink: $name" ;;
    esac
  done < <(find "$SOURCE_DIR" -mindepth 1 -maxdepth 1 -print0 | sort -z)
done

echo
echo "summary: added=$added updated=$updated skipped=$skipped"
