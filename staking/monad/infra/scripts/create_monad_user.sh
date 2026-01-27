#!/usr/bin/env bash
set -euo pipefail

USER_NAME=${1:-monad}
GROUP_NAME=${2:-monad}
HOME_DIR=${3:-/home/monad}

if ! getent group "$GROUP_NAME" >/dev/null 2>&1; then
  groupadd --system "$GROUP_NAME"
fi

if ! id "$USER_NAME" >/dev/null 2>&1; then
  useradd --system --gid "$GROUP_NAME" --home-dir "$HOME_DIR" --shell /usr/sbin/nologin "$USER_NAME"
fi

mkdir -p /etc/monad /opt/monad-status
chown -R "$USER_NAME:$GROUP_NAME" /etc/monad /opt/monad-status

echo "Ensured system user/group: $USER_NAME:$GROUP_NAME"
