#!/bin/bash
# Ethereum Start - Start services
for svc in eth1 beacon-chain validator mev-boost; do
    systemctl start ${svc} 2>/dev/null && echo "Started: ${svc}" || echo "Failed: ${svc}"
done
