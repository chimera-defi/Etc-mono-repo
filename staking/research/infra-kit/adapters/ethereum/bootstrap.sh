#!/bin/bash
# Ethereum Adapter - Bootstrap
# Respects ENV_CONTRACT for multi-tenant setups

set -e

# Load environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/exports.sh"

# Get stack name from ENV_CONTRACT or default
STACK_NAME="${ENV_CONTRACT:-ethereum}"
USER_NAME="eth-${STACK_NAME}"

echo "=== Ethereum Bootstrap for ${STACK_NAME} ==="

# Phase 1: System setup (requires root)
if [[ $EUID -eq 0 ]]; then
    echo "[1/2] Setting up system user: ${USER_NAME}"
    
    # Create user if not exists
    if ! id "${USER_NAME}" &>/dev/null; then
        useradd -m -s /bin/bash "${USER_NAME}"
    fi
    
    # Setup firewall ports
    echo "[1/2] Configuring firewall..."
    for port in 30303 30304 8551 8545; do
        ufw allow ${port}/tcp 2>/dev/null || true
    done
    
    echo "[1/2] System setup complete. Run as ${USER_NAME} to install clients."
else
    echo "[2/2] Installing clients..."
    source "${SCRIPT_DIR}/run_2.sh"
fi

echo "=== Bootstrap Complete ==="
