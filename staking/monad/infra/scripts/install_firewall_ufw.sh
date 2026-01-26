#!/usr/bin/env bash
set -euo pipefail

if ! command -v ufw >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ufw
fi

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 8787/tcp

ufw --force enable
ufw status verbose
