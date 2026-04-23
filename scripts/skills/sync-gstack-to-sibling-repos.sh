#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
SIBLING_ROOT="${1:-$(dirname "$REPO_ROOT")}"
SHARED_SKILLS="${2:-$HOME/.agents/skills}"

if [[ ! -d "$SIBLING_ROOT" ]]; then
  echo "sibling root does not exist: $SIBLING_ROOT" >&2
  exit 1
fi

if [[ ! -d "$SHARED_SKILLS" ]]; then
  echo "shared skills dir does not exist: $SHARED_SKILLS" >&2
  exit 1
fi

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
  if ! git -C "$repo" rev-parse --git-dir >/dev/null 2>&1; then
    continue
  fi

  ((repos+=1))
  target_dir="$repo/.agents/skills"
  mkdir -p "$target_dir"

  for src in "${sources[@]}"; do
    name="$(basename "$src")"
    dest="$target_dir/$name"

    if [[ -L "$dest" ]]; then
      current="$(readlink "$dest")"
      if [[ "$current" != "$src" ]]; then
        ln -sfn "$src" "$dest"
        ((updated+=1))
      fi
      continue
    fi

    if [[ -e "$dest" ]]; then
      ((skipped+=1))
      continue
    fi

    ln -s "$src" "$dest"
    ((added+=1))
  done
done < <(find "$SIBLING_ROOT" -mindepth 1 -maxdepth 1 -type d -print0)

echo "repos=$repos added=$added updated=$updated skipped=$skipped"
