#!/bin/bash
# Ethereum Logs - View service logs
# Usage: ./logs.sh [service] [lines]
# Default: show last 100 lines from all services

LINES="${2:-100}"
SERVICE="${1:-}"

if [[ -z "$SERVICE" ]]; then
    journalctl -n ${LINES} -u eth1 -u beacon-chain -u validator --no-pager
else
    journalctl -n ${LINES} -u ${SERVICE} --no-pager
fi
