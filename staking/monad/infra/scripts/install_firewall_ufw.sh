#!/usr/bin/env bash
set -euo pipefail

if ! command -v ufw >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ufw
fi

SSH_PORT=${SSH_PORT:-22}
ALLOW_PORTS=${ALLOW_PORTS:-}

ufw allow "${SSH_PORT}/tcp"
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 8787/tcp

if [[ -n "$ALLOW_PORTS" ]]; then
  IFS=',' read -r -a ports <<< "$ALLOW_PORTS"
  for port in "${ports[@]}"; do
    if [[ -n "$port" ]]; then
      ufw allow "${port}/tcp"
    fi
  done
fi

ufw --force enable
ufw status verbose
