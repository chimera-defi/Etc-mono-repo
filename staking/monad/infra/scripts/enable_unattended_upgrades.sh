#!/usr/bin/env bash
set -euo pipefail

apt-get update
apt-get install -y unattended-upgrades

cat <<'CONF' > /etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
CONF

systemctl enable --now unattended-upgrades
systemctl restart unattended-upgrades
systemctl status unattended-upgrades --no-pager
