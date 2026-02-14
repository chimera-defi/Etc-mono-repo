#!/bin/bash

# Erigon Execution Client Installation Script
# Language: Go
# Erigon is a Go-based Ethereum client focused on efficiency and performance
# Usage: ./erigon.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Resolve script and project directories
get_script_directories

# Note: This script uses sudo internally for privileged operations

# Start installation
log_installation_start "Erigon"


# Check system requirements (Erigon recommends >=32GB RAM)
check_system_requirements 32 2000


# Setup firewall rules for Erigon (align with README)
# Public: 30303/30304 TCP+UDP (peering), 42069 TCP+UDP (snap), Caplin 4000/udp, 4001/tcp
# Private (NOT opened here): 8551, 8545, 9090, 9091, 6060, 6061
setup_firewall_rules 30303/tcp 30303/udp 30304/tcp 30304/udp 42069/tcp 42069/udp 4000/udp 4001/tcp

# Clone and build Erigon
log_info "Cloning Erigon repository..."
if ! git clone --recurse-submodules https://github.com/erigontech/erigon.git; then
    log_error "Failed to clone Erigon repository"
    exit 1
fi

cd erigon || exit
git pull

log_info "Building Erigon..."
if ! make erigon; then
    log_error "Failed to build Erigon"
    exit 1
fi

if ! make rpcdaemon; then
    log_error "Failed to build RPC daemon"
    exit 1
fi

if ! make integration; then
    log_error "Failed to build integration tools"
    exit 1
fi

# Create Erigon directory
ERIGON_DIR="$HOME/erigon"
if [[ -d "$ERIGON_DIR" ]]; then
    rm -rf "${ERIGON_DIR:?}"/*
else
    ensure_directory "$ERIGON_DIR"
fi

# Create Erigon configuration
log_info "Creating Erigon configuration..."
cat > "$ERIGON_DIR/config.yaml" << EOF
chain : "mainnet"
http : true
http.api : ["admin","engine","eth","erigon","web3","net","debug","db","trace","txpool","personal"]
authrpc.jwtsecret: '$HOME/secrets/jwt.hex'
externalcl: true
snapshots: true
nat: any
rpc.batch.limit: 1000
torrent.download.rate: 512mb
prune: hrtc
EOF

# Copy Erigon binary
cp ./build/bin/erigon "$ERIGON_DIR/"

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create systemd service
EXEC_START="$ERIGON_DIR/erigon --config $ERIGON_DIR/config.yaml --externalcl"

create_systemd_service "eth1" "Erigon Ethereum Execution Client" "$EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Enable and start the service
enable_and_start_systemd_service "eth1"

# Show completion information
log_installation_complete "Erigon" "eth1"

# Print integration stages
log_info "Erigon integration stages:"
./build/bin/integration print_stages --chain mainnet --datadir ~/.local/share/erigon