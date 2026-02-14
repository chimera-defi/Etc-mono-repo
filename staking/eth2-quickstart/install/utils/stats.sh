#!/bin/bash

# System Statistics Script
# Displays comprehensive system and client statistics
# Usage: ./stats.sh
# Shows: Error logs, client versions, service status

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/lib/common_functions.sh"

echo "=== Error Scan ==="
journalctl -u cl -n 200 | grep error
journalctl -u eth1 -n 200 | grep error
journalctl -u validator -n 200 | grep error
journalctl -u mev -n 200 | grep error
echo "End error scan output --"

echo "=== Time Till Duty Check ==="
journalctl -u validator -n 1000 | grep timeTillDuty
echo ''

echo "=== Client Versions ==="
if command -v mev-boost >/dev/null 2>&1; then
    mev-boost -version
fi
if [[ -f "../prysm/prysm.sh" ]]; then
    ../prysm/prysm.sh beacon-chain -version
    ../prysm/prysm.sh validator -version
fi
if command -v geth >/dev/null 2>&1; then
    geth version
fi
echo "End version output --"
echo ''

echo "=== Service Status ==="
show_service_status
