#!/bin/bash
# Ethereum Status - Check service status

services="eth1 beacon-chain validator mev-boost"

echo "=== Ethereum Service Status ==="
for svc in $services; do
    if systemctl is-active --quiet ${svc} 2>/dev/null; then
        echo "${svc}: RUNNING"
    else
        echo "${svc}: STOPPED"
    fi
done
