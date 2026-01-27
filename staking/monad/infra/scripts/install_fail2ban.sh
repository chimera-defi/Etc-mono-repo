#!/usr/bin/env bash
set -euo pipefail

apt-get update
apt-get install -y fail2ban

cat <<'CONF' > /etc/fail2ban/jail.d/monad-sshd.local
[sshd]
enabled = true
maxretry = 5
findtime = 10m
bantime = 1h
CONF

systemctl enable --now fail2ban
systemctl restart fail2ban
systemctl status fail2ban --no-pager
