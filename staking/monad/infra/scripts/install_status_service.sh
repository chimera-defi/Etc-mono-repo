#!/usr/bin/env bash
set -euo pipefail

SRC=${1:-"$(dirname "$0")/../config/status-server.service.example"}
DEST=${2:-/etc/systemd/system/monad-status.service}
TARGET_DIR=${3:-/opt/monad-status}

if [[ ! -f "$SRC" ]]; then
  echo "Service file not found: $SRC" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"
cp "$(dirname "$0")/status_server.py" "$TARGET_DIR/status_server.py"
chmod +x "$TARGET_DIR/status_server.py"

cp "$SRC" "$DEST"
systemctl daemon-reload

cat <<EOFMSG
Installed: $DEST
Enable with: systemctl enable --now monad-status.service
EOFMSG
