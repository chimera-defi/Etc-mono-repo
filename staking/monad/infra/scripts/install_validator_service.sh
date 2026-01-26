#!/usr/bin/env bash
set -euo pipefail

SRC=${1:-"$(dirname "$0")/../config/monad-validator.service.example"}
DEST=${2:-/etc/systemd/system/monad-validator.service}
ENV_SRC=${3:-"$(dirname "$0")/../config/validator.env.example"}
ENV_DEST=${4:-/etc/monad/validator.env}

if [[ ! -f "$SRC" ]]; then
  echo "Service file not found: $SRC" >&2
  exit 1
fi

cp "$SRC" "$DEST"
if [[ -f "$ENV_SRC" ]]; then
  mkdir -p "$(dirname "$ENV_DEST")"
  cp "$ENV_SRC" "$ENV_DEST"
fi

systemctl daemon-reload

cat <<EOFMSG
Installed: $DEST
Env file: $ENV_DEST
Enable with: systemctl enable --now monad-validator.service
EOFMSG
