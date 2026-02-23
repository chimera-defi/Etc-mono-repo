#!/bin/bash
# Ethereum Stop - Stop services
for svc in validator mev-boost beacon-chain eth1; do
    systemctl stop ${svc} 2>/dev/null && echo "Stopped: ${svc}" || echo "Failed: ${svc}"
done
