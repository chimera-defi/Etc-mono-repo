#!/usr/bin/env bash
set -euo pipefail

if ! command -v caddy >/dev/null 2>&1; then
  apt-get update
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
fi

CADDYFILE_SRC=${1:-"$(dirname "$0")/../config/Caddyfile.status.example"}
CADDYFILE_DEST=${2:-/etc/caddy/Caddyfile}

if [[ ! -f "$CADDYFILE_SRC" ]]; then
  echo "Caddyfile not found: $CADDYFILE_SRC" >&2
  exit 1
fi

cp "$CADDYFILE_SRC" "$CADDYFILE_DEST"

systemctl enable --now caddy
systemctl reload caddy

echo "Installed Caddy and applied $CADDYFILE_DEST"
