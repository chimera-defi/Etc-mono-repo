#!/usr/bin/env bash
set -euo pipefail

SRC=${1:-"$(dirname "$0")/../config/status-server.service.example"}
DEST=${2:-/etc/systemd/system/monad-status.service}
TARGET_DIR=${3:-/opt/monad-status}
ENV_SRC=${4:-"$(dirname "$0")/../config/status.env.example"}
ENV_DEST=${5:-/etc/monad/status.env}

if [[ ! -f "$SRC" ]]; then
  echo "Service file not found: $SRC" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"
cp "$(dirname "$0")/status_server.py" "$TARGET_DIR/status_server.py"
chmod +x "$TARGET_DIR/status_server.py"

cp "$SRC" "$DEST"
if [[ -f "$ENV_SRC" ]]; then
  mkdir -p "$(dirname "$ENV_DEST")"
  cp "$ENV_SRC" "$ENV_DEST"
fi
systemctl daemon-reload

cat <<EOFMSG
Installed: $DEST
Env file: $ENV_DEST
Enable with: systemctl enable --now monad-status.service
EOFMSG
