#!/usr/bin/env bash
set -euo pipefail

CONF_PATH=${1:-/etc/sysctl.d/99-custom-monad.conf}

cat <<'CONF' > "$CONF_PATH"
# Huge Pages Configuration
vm.nr_hugepages = 2048

# UDP Buffer Sizes
net.core.rmem_max = 62500000
net.core.rmem_default = 62500000
net.core.wmem_max = 62500000
net.core.wmem_default = 62500000

# TCP Buffer Sizes
net.ipv4.tcp_rmem = 4096 62500000 62500000
net.ipv4.tcp_wmem = 4096 62500000 62500000
CONF

sysctl -p "$CONF_PATH"
