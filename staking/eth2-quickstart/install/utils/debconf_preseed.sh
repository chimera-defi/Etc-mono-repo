#!/bin/bash
# Debconf pre-seeding - single source for non-interactive apt/dpkg
# Used by: test/Dockerfile (build), test/ci_test_run_1_e2e.sh (run_1 apt upgrade)
# Prevents hangs on postfix, cron, tzdata, needrestart during install/upgrade

set -Eeuo pipefail

# postfix - mail server config
echo "postfix postfix/mailname string localhost" | debconf-set-selections 2>/dev/null || true
echo "postfix postfix/main_mailer_type string 'Local only'" | debconf-set-selections 2>/dev/null || true

# cron - whether to mail cron output
echo "cron cron/upgrade_available boolean false" | debconf-set-selections 2>/dev/null || true
echo "cron cron/upgrade_available_seen boolean true" | debconf-set-selections 2>/dev/null || true

# tzdata - timezone
echo "tzdata tzdata/Areas select Etc" | debconf-set-selections 2>/dev/null || true
echo "tzdata tzdata/Zones/Etc select UTC" | debconf-set-selections 2>/dev/null || true

# needrestart - which services to restart
echo "needrestart needrestart/restart-services string" | debconf-set-selections 2>/dev/null || true

# dpkg: use defaults, never prompt for config file changes
mkdir -p /etc/apt/apt.conf.d
printf '%s\n' 'DPkg::options { "--force-confdef"; "--force-confold"; };' > /etc/apt/apt.conf.d/99local-noninteractive
