#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="${1:-$HOME/.agents/skills}"
shift || true

if [[ "$#" -gt 0 ]]; then
  DESTINATIONS=("$@")
else
  DESTINATIONS=("$HOME/.claude/skills" "$HOME/.codex/skills")
fi

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "source does not exist: $SOURCE_DIR" >&2
  exit 1
fi

added=0
updated=0
skipped=0

for dest in "${DESTINATIONS[@]}"; do
  mkdir -p "$dest"
  echo "syncing -> $dest"

  while IFS= read -r -d '' src_path; do
    name="$(basename "$src_path")"
    dest_path="$dest/$name"

    if [[ -L "$dest_path" ]]; then
      current_target="$(readlink "$dest_path")"
      if [[ "$current_target" != "$src_path" ]]; then
        ln -sfn "$src_path" "$dest_path"
        ((updated+=1))
        echo "  updated symlink: $name"
      fi
      continue
    fi

    if [[ -e "$dest_path" ]]; then
      ((skipped+=1))
      echo "  skipped existing non-symlink: $name"
      continue
    fi

    ln -s "$src_path" "$dest_path"
    ((added+=1))
    echo "  added: $name"
  done < <(find "$SOURCE_DIR" -mindepth 1 -maxdepth 1 -print0 | sort -z)
done

echo
echo "summary: added=$added updated=$updated skipped=$skipped"
