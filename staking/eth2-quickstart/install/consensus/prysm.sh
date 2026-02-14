#!/bin/bash

# Prysm Consensus Client Installation Script
# Language: Go
# Prysm is a Go-based Ethereum consensus client developed by Prysmatic Labs
# Usage: ./prysm.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

log_installation_start "Prysm"


# Check system requirements
check_system_requirements 16 1000


# Setup firewall rules for Prysm
setup_firewall_rules 13000 12000 5051

# Create Prysm directory
PRYSM_DIR="$HOME/prysm"
ensure_directory "$PRYSM_DIR"

cd "$PRYSM_DIR" || exit

# Download Prysm
log_info "Downloading Prysm..."
if ! download_file "https://raw.githubusercontent.com/prysmaticlabs/prysm/master/prysm.sh" "prysm.sh"; then
    log_error "Failed to download Prysm"
    exit 1
fi

chmod +x prysm.sh

# Verify download
if [[ ! -f "prysm.sh" || ! -x "prysm.sh" ]]; then
    log_error "Prysm script not found or not executable"
    exit 1
fi

# Generate JWT secret
log_info "Generating JWT secret..."
./prysm.sh beacon-chain generate-auth-secret

# Ensure secrets directory exists
ensure_directory "$HOME/secrets"
mv ./jwt.hex "$HOME/secrets/"

# Create temporary directory for custom configuration
create_temp_config_dir

# Create custom beacon node configuration variables
# Note: graffiti is a validator-only flag, not beacon
cat > ./tmp/prysm_beacon_custom.yaml << EOF
suggested-fee-recipient: $FEE_RECIPIENT
p2p-host-ip: $(curl -s v4.ident.me)
p2p-max-peers: $MAX_PEERS
checkpoint-sync-url: $PRYSM_CPURL
genesis-beacon-api-url: $PRYSM_CPURL
jwt-secret: $HOME/secrets/jwt.hex
EOF

# Create custom validator configuration variables
cat > ./tmp/prysm_validator_custom.yaml << EOF
graffiti: $GRAFITTI
suggested-fee-recipient: $FEE_RECIPIENT
wallet-password-file: $HOME/secrets/pass.txt
EOF

# Merge base configurations with custom settings
merge_client_config "Prysm" "beacon" "$PROJECT_ROOT/configs/prysm/prysm_beacon_conf.yaml" "./tmp/prysm_beacon_custom.yaml" "$PRYSM_DIR/prysm_beacon_conf.yaml"
merge_client_config "Prysm" "validator" "$PROJECT_ROOT/configs/prysm/prysm_validator_conf.yaml" "./tmp/prysm_validator_custom.yaml" "$PRYSM_DIR/prysm_validator_conf.yaml"

# Clean up temporary files
rm -rf ./tmp/

# Create systemd service for beacon node
BEACON_EXEC_START="$PRYSM_DIR/prysm.sh beacon-chain --config-file=$PRYSM_DIR/prysm_beacon_conf.yaml"

create_systemd_service "cl" "Prysm Ethereum Consensus Client (Beacon Node)" "$BEACON_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Create systemd service for validator
VALIDATOR_EXEC_START="$PRYSM_DIR/prysm.sh validator --config-file=$PRYSM_DIR/prysm_validator_conf.yaml"

create_systemd_service "validator" "Prysm Ethereum Validator Client" "$VALIDATOR_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300" "network-online.target cl.service" "network-online.target"

# Enable and start services
enable_and_start_systemd_service "cl"
enable_and_start_systemd_service "validator"

# Show completion information
log_installation_complete "Prysm" "cl" "$PRYSM_DIR/prysm_beacon_conf.yaml" "$PRYSM_DIR"

# Display setup information
display_client_setup_info "Prysm" "cl" "$PRYSM_DIR/prysm_beacon_conf.yaml" "$PRYSM_DIR" "5051" "13000 (TCP) and 12000 (UDP)" "Useful commands:
- Check Prysm version: $PRYSM_DIR/prysm.sh beacon-chain --version
- Import validator keys: $PRYSM_DIR/prysm.sh validator accounts import --keys-dir=/path/to/keys"