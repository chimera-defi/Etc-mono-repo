#!/usr/bin/env bash
set -euo pipefail

BIN_SRC=${1:-}
CONFIG_SRC=${2:-}
BIN_DEST=${3:-/usr/local/bin/monad-bft}
CONFIG_DEST=${4:-/etc/monad/config.toml}
FORCE=${FORCE:-}

usage() {
  cat <<EOFMSG
Usage: $0 <binary-src> [config-src] [bin-dest] [config-dest]

binary-src/config-src can be a local file path or an https URL.
Set FORCE=1 to overwrite existing destinations.
EOFMSG
}

if [[ -z "$BIN_SRC" || "$BIN_SRC" == "--help" ]]; then
  usage
  exit 2
fi

fetch_to() {
  local src="$1"
  local dest="$2"

  if [[ -e "$dest" && -z "$FORCE" ]]; then
    echo "Refusing to overwrite existing: $dest (set FORCE=1 to overwrite)" >&2
    exit 1
  fi

  if [[ "$src" =~ ^https?:// ]]; then
    curl -fsSL "$src" -o "$dest"
  else
    if [[ ! -f "$src" ]]; then
      echo "Source not found: $src" >&2
      exit 1
    fi
    cp "$src" "$dest"
  fi
}

mkdir -p "$(dirname "$BIN_DEST")" /etc/monad
fetch_to "$BIN_SRC" "$BIN_DEST"
chmod +x "$BIN_DEST"

if [[ -n "$CONFIG_SRC" ]]; then
  mkdir -p "$(dirname "$CONFIG_DEST")"
  fetch_to "$CONFIG_SRC" "$CONFIG_DEST"
else
  echo "No config source provided; skipping config install."
fi

echo "Installed binary: $BIN_DEST"
if [[ -n "$CONFIG_SRC" ]]; then
  echo "Installed config: $CONFIG_DEST"
fi
