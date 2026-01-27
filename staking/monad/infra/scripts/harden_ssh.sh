#!/usr/bin/env bash
set -euo pipefail

SSHD_CONFIG=${SSHD_CONFIG:-/etc/ssh/sshd_config}
SSH_PORT=${SSH_PORT:-22}

if [[ ! -f "$SSHD_CONFIG" ]]; then
  echo "Missing sshd_config: $SSHD_CONFIG" >&2
  exit 1
fi

cp "$SSHD_CONFIG" "${SSHD_CONFIG}.bak"

# Ensure directives are present/updated
apply_setting() {
  local key="$1"
  local value="$2"
  if rg -q "^${key}\\b" "$SSHD_CONFIG"; then
    sed -i "s/^${key}.*/${key} ${value}/" "$SSHD_CONFIG"
  else
    echo "${key} ${value}" >> "$SSHD_CONFIG"
  fi
}

apply_setting "PasswordAuthentication" "no"
apply_setting "PermitRootLogin" "no"
apply_setting "PubkeyAuthentication" "yes"
apply_setting "ChallengeResponseAuthentication" "no"
apply_setting "UsePAM" "yes"
apply_setting "Port" "$SSH_PORT"

sshd -t
systemctl reload sshd

echo "SSH hardened. Backup: ${SSHD_CONFIG}.bak"
