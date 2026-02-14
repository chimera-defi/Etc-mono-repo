#!/bin/bash

# Lighthouse Consensus Client Installation Script
# Language: Rust
# Lighthouse is a Rust-based Ethereum consensus client developed by Sigma Prime
# Usage: ./lighthouse.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

# Note: This script uses sudo internally for privileged operations

# Start installation
log_installation_start "Lighthouse"


# Check system requirements
check_system_requirements 16 1000


# Setup firewall rules for Lighthouse
setup_firewall_rules 9000 5052

# Create Lighthouse directory
LIGHTHOUSE_DIR="$HOME/lighthouse"
ensure_directory "$LIGHTHOUSE_DIR"

cd "$LIGHTHOUSE_DIR" || exit

# Download Lighthouse
log_info "Downloading Lighthouse..."
if ! download_file "https://github.com/sigp/lighthouse/releases/download/v4.5.0/lighthouse-v4.5.0-x86_64-unknown-linux-gnu.tar.gz" "lighthouse-v4.5.0-x86_64-unknown-linux-gnu.tar.gz"; then
    log_error "Failed to download Lighthouse"
    exit 1
fi

tar -xvf lighthouse-v4.5.0-x86_64-unknown-linux-gnu.tar.gz

# Generate JWT secret
log_info "Generating JWT secret..."
if ! openssl rand -hex 32 > "$HOME/secrets/jwt.hex"; then
    log_error "Failed to generate JWT secret"
    exit 1
fi

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create systemd service for beacon node
BEACON_EXEC_START="RUST_LOG=info $LIGHTHOUSE_DIR/lighthouse bn --checkpoint-sync-url $LIGHTHOUSE_CHECKPOINT_URL --execution-endpoint http://$LH:$ENGINE_PORT --execution-jwt $HOME/secrets/jwt.hex --disable-deposit-contract-sync"

create_systemd_service "cl" "Lighthouse Ethereum Consensus Client (Beacon Node)" "$BEACON_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Create systemd service for validator
VALIDATOR_EXEC_START="RUST_LOG=info $LIGHTHOUSE_DIR/lighthouse vc --beacon-nodes http://$CONSENSUS_HOST:5052"

create_systemd_service "validator" "Lighthouse Ethereum Validator Client" "$VALIDATOR_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300" "network-online.target cl.service" "network-online.target"

# Enable and start services
enable_and_start_systemd_service "cl"
enable_and_start_systemd_service "validator"

# Show completion information
log_installation_complete "Lighthouse" "cl"

# Display setup information
cat << EOF

=== Lighthouse Setup Information ===
Lighthouse has been installed with the following components:
1. Beacon Node (cl service) - Connects to execution client and other beacon nodes
2. Validator Client (validator service) - Manages validator keys and duties

Next Steps:
1. Import your validator keys into: $LIGHTHOUSE_DIR/
2. Create keystore password files in: $HOME/secrets/
3. Wait for beacon node to sync (validator will start automatically)

Key features:
- REST API available on port 5052
- P2P networking on ports 9000 (TCP) and 9000 (UDP)
- Checkpoint sync enabled for faster initial sync
- MEV-Boost integration ready

Service Management:
- Check status: sudo systemctl status cl && sudo systemctl status validator
- View logs: journalctl -fu cl && journalctl -fu validator
- Restart: sudo systemctl restart cl && sudo systemctl restart validator

For more information, visit: https://lighthouse.sigmaprime.io/
EOF
