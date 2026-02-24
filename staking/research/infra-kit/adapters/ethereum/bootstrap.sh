#!/bin/bash
# Ethereum Adapter - Bootstrap
# Delegates to eth2-quickstart run_1.sh + run_2.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ETH2_PATH="$(cat "$SCRIPT_DIR/ETH2_QUICKSTART")"

echo "=== Ethereum Bootstrap ==="
echo "eth2-quickstart: $ETH2_PATH"

if [[ $EUID -eq 0 ]]; then
    echo "[Phase 1] System setup..."
    "$ETH2_PATH/run_1.sh"
else
    echo "[Phase 2] Client installation..."
    "$ETH2_PATH/run_2.sh" "$@"
fi

echo "=== Bootstrap Complete ==="
