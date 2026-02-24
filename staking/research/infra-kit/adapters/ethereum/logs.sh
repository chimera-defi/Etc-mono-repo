#!/bin/bash
# Ethereum Adapter - Logs
# delegates to eth2-quickstart view_logs.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ETH2_PATH="$(cat "$SCRIPT_DIR/ETH2_QUICKSTART")"

exec "$ETH2_PATH/install/utils/view_logs.sh" "$@"
