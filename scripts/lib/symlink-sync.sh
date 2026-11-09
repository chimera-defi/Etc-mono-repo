#!/usr/bin/env bash
set -euo pipefail

# Exposes SYNC_ACTION: added|updated|skipped|unchanged
SYNC_ACTION=""

force_symlink() {
  local src="$1"
  local dest="$2"
  ln -sfn "$src" "$dest"
}

sync_symlink_with_counters() {
  local src="$1"
  local dest="$2"
  local -n added_ref="$3"
  local -n updated_ref="$4"
  local -n skipped_ref="$5"

  if [[ -L "$dest" ]]; then
    local current_target
    current_target="$(readlink "$dest")"
    if [[ "$current_target" != "$src" ]]; then
      ln -sfn "$src" "$dest"
      ((updated_ref+=1))
      SYNC_ACTION="updated"
    else
      SYNC_ACTION="unchanged"
    fi
    return 0
  fi

  if [[ -e "$dest" ]]; then
    ((skipped_ref+=1))
    SYNC_ACTION="skipped"
    return 0
  fi

  ln -s "$src" "$dest"
  ((added_ref+=1))
  SYNC_ACTION="added"
}
