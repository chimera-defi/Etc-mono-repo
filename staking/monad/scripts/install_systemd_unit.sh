#!/usr/bin/env bash
set -euo pipefail

SRC=${1:-"$(dirname "$0")/../config/monad-validator.service.example"}
DEST=${2:-/etc/systemd/system/monad-validator.service}

if [[ ! -f "$SRC" ]]; then
  echo "Service file not found: $SRC" >&2
  exit 1
fi

cp "$SRC" "$DEST"
systemctl daemon-reload

cat <<EOFMSG
Installed: $DEST
Enable with: systemctl enable --now monad-validator.service
EOFMSG
