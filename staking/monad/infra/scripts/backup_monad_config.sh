#!/usr/bin/env bash
set -euo pipefail

SRC=${SRC:-/etc/monad}
DEST_DIR=${DEST_DIR:-/var/backups/monad}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
ARCHIVE="$DEST_DIR/monad-config-$STAMP.tar.gz"

mkdir -p "$DEST_DIR"
if [[ ! -d "$SRC" ]]; then
  echo "Missing source directory: $SRC" >&2
  exit 1
fi

tar -czf "$ARCHIVE" -C "$SRC" .

chmod 600 "$ARCHIVE"

echo "Backup created: $ARCHIVE"
