#!/bin/bash

# Lodestar Consensus Client Installation Script
# Language: TypeScript
# Lodestar is a TypeScript Ethereum consensus client developed by ChainSafe
# Usage: ./lodestar.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

# Start installation
log_installation_start "Lodestar"


# Check system requirements
check_system_requirements 16 1000

# Node.js and build tools are already available

# Setup firewall rules for Lodestar
setup_firewall_rules 9000 9596

# Create Lodestar directory
LODESTAR_DIR="$HOME/lodestar"
ensure_directory "$LODESTAR_DIR"

cd "$LODESTAR_DIR" || exit

# Install Lodestar globally using npm
log_info "Installing Lodestar via npm..."
if ! npm install -g @chainsafe/lodestar; then
    log_error "Failed to install Lodestar via npm. Please check your Node.js installation and try again."
    exit 1
fi

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create Lodestar data directory
LODESTAR_DATA_DIR="$HOME/.local/share/lodestar"
ensure_directory "$LODESTAR_DATA_DIR"

# Create validator data directory
VALIDATOR_DATA_DIR="$LODESTAR_DATA_DIR/validators"
ensure_directory "$VALIDATOR_DATA_DIR"

# Create temporary directory for custom configuration
create_temp_config_dir

# Create custom beacon node configuration variables
cat > ./tmp/lodestar_beacon_custom.json << EOF
{
  "dataDir": "$LODESTAR_DATA_DIR/beacon",
  "targetPeers": $MAX_PEERS,
  "execution": {
    "urls": ["http://$LH:$ENGINE_PORT"],
    "jwtSecretFile": "$HOME/secrets/jwt.hex"
  },
  "rest": {
    "port": ${LODESTAR_REST_PORT}
  },
  "metrics": {
    "port": 8008
  },
  "checkpointSyncUrl": "$LODESTAR_CHECKPOINT_URL",
  "suggestedFeeRecipient": "$FEE_RECIPIENT",
  "graffiti": "$GRAFITTI",
  "logFile": "$LODESTAR_DATA_DIR/beacon.log"
}
EOF

# Create custom validator configuration variables  
cat > ./tmp/lodestar_validator_custom.json << EOF
{
  "dataDir": "$LODESTAR_DATA_DIR/validator",
  "keystoresDir": "$VALIDATOR_DATA_DIR/keystores",
  "secretsDir": "$VALIDATOR_DATA_DIR/secrets",
  "beaconNodes": ["http://$CONSENSUS_HOST:${LODESTAR_REST_PORT}"],
  "suggestedFeeRecipient": "$FEE_RECIPIENT",
  "graffiti": "$GRAFITTI",
  "metrics": {
    "port": 8009
  },
  "logFile": "$LODESTAR_DATA_DIR/validator.log"
}
EOF

# Merge base configurations with custom settings using jq (if available) or simple concatenation
if command -v jq &> /dev/null; then
    jq -s '.[0] * .[1]' "$PROJECT_ROOT/configs/lodestar/lodestar_beacon_base.json" ./tmp/lodestar_beacon_custom.json > "$LODESTAR_DIR/beacon.config.json"
    jq -s '.[0] * .[1]' "$PROJECT_ROOT/configs/lodestar/lodestar_validator_base.json" ./tmp/lodestar_validator_custom.json > "$LODESTAR_DIR/validator.config.json"
else
    # Fallback: use merge_client_config for proper JSON merging
    log_warn "jq not found, using fallback JSON merging"
    merge_client_config "Lodestar" "beacon" "$PROJECT_ROOT/configs/lodestar/lodestar_beacon_base.json" "./tmp/lodestar_beacon_custom.json" "$LODESTAR_DIR/beacon.config.json"
    merge_client_config "Lodestar" "validator" "$PROJECT_ROOT/configs/lodestar/lodestar_validator_base.json" "./tmp/lodestar_validator_custom.json" "$LODESTAR_DIR/validator.config.json"
fi

# Clean up temporary files
rm -rf ./tmp/

# Create systemd service for beacon node
BEACON_EXEC_START="lodestar beacon --paramsFile $LODESTAR_DIR/beacon.config.json"

create_systemd_service "cl" "Lodestar Ethereum Consensus Client (Beacon Node)" "$BEACON_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Create systemd service for validator
VALIDATOR_EXEC_START="lodestar validator --paramsFile $LODESTAR_DIR/validator.config.json"

create_systemd_service "validator" "Lodestar Ethereum Validator Client" "$VALIDATOR_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300" "network-online.target cl.service" "network-online.target"

# Enable and start services
enable_and_start_systemd_service "cl"
enable_and_start_systemd_service "validator"

log_installation_complete "Lodestar" "lodestar"
log_info "Beacon node configuration: $LODESTAR_DIR/beacon.config.json"
log_info "Validator configuration: $LODESTAR_DIR/validator.config.json"
log_info "Data directory: $LODESTAR_DATA_DIR"
log_info "Validator directory: $VALIDATOR_DATA_DIR"
log_info ""
log_info "Validator will start automatically with the beacon node"
log_info "To check status: sudo systemctl status cl && sudo systemctl status validator"
log_info "To view logs: journalctl -fu cl && journalctl -fu validator"

# Display setup information
cat << EOF

=== Lodestar Setup Information ===
Lodestar has been installed with the following components:
1. Beacon Node (cl service) - TypeScript-based consensus client
2. Validator Client (validator service) - Manages validator keys and duties

Next Steps:
1. Import your validator keys into: $VALIDATOR_DATA_DIR/keystores/
2. Create keystore password files in: $VALIDATOR_DATA_DIR/secrets/
3. Wait for beacon node to sync (validator will start automatically)

Key features:
- Written in TypeScript for developer accessibility
- REST API available on port 9596
- P2P networking on port 9000
- Metrics available on ports 8008 (beacon) and 8009 (validator)
- Checkpoint sync enabled for faster initial sync
- MEV-Boost integration ready
- Doppelganger protection for validator safety
- Comprehensive logging and monitoring

Node.js version: $(node --version)
NPM version: $(npm --version)

Useful commands:
- Check Lodestar version: lodestar --version
- Import validator keys: lodestar validator import --keystoresDir $VALIDATOR_DATA_DIR/keystores --secretsDir $VALIDATOR_DATA_DIR/secrets

EOF