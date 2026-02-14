#!/bin/bash

# Geth Installation Script
# Language: Go
# Installs and configures Geth Ethereum execution client
# Usage: ./geth.sh
# Requirements: Ubuntu 20.04+, 16GB+ RAM, 2TB+ storage

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

log_installation_start "Geth"


# Installs and sets up geth as a systemctl service according to :
# https://www.coincashew.com/coins/overview-eth/guide-or-how-to-setup-a-validator-on-eth2-mainnet/part-i-installation/installing-execution-client


# Check system requirements
check_system_requirements 16 2000

# Setup firewall rules for Geth
setup_firewall_rules 30303 8545 8546 8551

# Add Ethereum PPA and install
log_info "Adding Ethereum PPA repository..."
if ! add_ppa_repository "ppa:ethereum/ethereum"; then
    log_error "Failed to add Ethereum PPA repository"
    exit 1
fi

log_info "Installing Geth..."
if ! sudo apt-get install -y geth; then
    log_error "Failed to install Geth (apt-get install geth)"
    exit 1
fi

if ! command -v geth &>/dev/null; then
    log_error "Geth binary not found after install (expected at /usr/bin/geth)"
    exit 1
fi

export GETH_CMD="/usr/bin/geth --cache=$GETH_CACHE --syncmode snap \
--http --http.addr $LH --http.corsdomain \"*\" --http.vhosts=* --http.api=\"admin, eth, net, web3, engine\" \
--ws --ws.addr $LH --ws.origins \"*\" --ws.api=\"web3, eth, net, engine\" \
--authrpc.addr $LH --authrpc.port $ENGINE_PORT --authrpc.jwtsecret=$HOME/secrets/jwt.hex \
--miner.etherbase=$FEE_RECIPIENT --miner.extradata=$GRAFITTI \
--maxpeers 50 --txpool.globalslots 10000 --txpool.globalqueue 5000 \
--metrics --metrics.addr $LH --metrics.port $METRICS_PORT"


ensure_directory "$HOME/secrets"
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create systemd service using common function
create_systemd_service "eth1" "Geth Ethereum Execution Client" "$GETH_CMD" "$(whoami)" "on-failure" "600" "5" "300"

# Enable and start the service
enable_and_start_systemd_service "eth1"

# Show completion information
log_installation_complete "Geth" "eth1"
