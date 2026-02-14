#!/bin/bash

# Nimbus Consensus Client Installation Script
# Language: Nim
# Nimbus is a Nim-based Ethereum consensus client designed for resource efficiency
# Usage: ./nimbus.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

log_installation_start "Nimbus"


# Check system requirements (Nimbus is lightweight)
check_system_requirements 4 500


# Setup firewall rules for Nimbus
setup_firewall_rules 9000 5052

# Create Nimbus directory
NIMBUS_DIR="$HOME/nimbus"
ensure_directory "$NIMBUS_DIR"

cd "$NIMBUS_DIR" || exit

# Get latest release version
log_info "Fetching latest Nimbus release..."
LATEST_VERSION=$(get_latest_release "status-im/nimbus-eth2")
if [[ -z "$LATEST_VERSION" ]]; then
    LATEST_VERSION="v23.11.0"  # Fallback version
    log_warn "Could not fetch latest version, using fallback: $LATEST_VERSION"
fi

# Download Nimbus
DOWNLOAD_URL="https://github.com/status-im/nimbus-eth2/releases/download/${LATEST_VERSION}/nimbus-eth2_Linux_amd64_${LATEST_VERSION}.tar.gz"
ARCHIVE_FILE="nimbus-eth2_Linux_amd64_${LATEST_VERSION}.tar.gz"

log_info "Downloading Nimbus ${LATEST_VERSION}..."
if download_file "$DOWNLOAD_URL" "$ARCHIVE_FILE"; then
    if ! extract_archive "$ARCHIVE_FILE" "$NIMBUS_DIR" 1; then
        log_error "Failed to extract Nimbus archive"
        exit 1
    fi
    rm -f "$ARCHIVE_FILE"
else
    log_error "Failed to download Nimbus"
    exit 1
fi

# Find the extracted directory and move contents to nimbus directory
EXTRACTED_DIR=$(find "$NIMBUS_DIR" -maxdepth 1 -type d -name "nimbus-eth2_Linux_amd64_*" | head -1)
if [[ -n "$EXTRACTED_DIR" && "$EXTRACTED_DIR" != "$NIMBUS_DIR" ]]; then
    mv "$EXTRACTED_DIR"/* "$NIMBUS_DIR/"
    rmdir "$EXTRACTED_DIR"
fi

# Make Nimbus executables executable
chmod +x "$NIMBUS_DIR/build/nimbus_beacon_node"
chmod +x "$NIMBUS_DIR/build/nimbus_validator_client"

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create Nimbus data directory
NIMBUS_DATA_DIR="$HOME/.local/share/nimbus"
ensure_directory "$NIMBUS_DATA_DIR"

# Create validator data directory
VALIDATOR_DATA_DIR="$NIMBUS_DATA_DIR/validators"
ensure_directory "$VALIDATOR_DATA_DIR"

# Create temporary directory for custom configuration
create_temp_config_dir

# Create custom configuration variables file
cat > ./tmp/nimbus_custom.toml << EOF
# Nimbus Custom Configuration Variables

# Network settings
max-peers = $MAX_PEERS

# Data directory
data-dir = "$NIMBUS_DATA_DIR"

# Execution layer
jwt-secret = "$HOME/secrets/jwt.hex"

# REST API
rest-port = ${NIMBUS_REST_PORT}

# Checkpoint sync
trusted-node-url = "$NIMBUS_CHECKPOINT_URL"

# Metrics
metrics-port = 8008

# Logging
log-file = "$NIMBUS_DATA_DIR/beacon_node.log"

# Performance
suggested-fee-recipient = "$FEE_RECIPIENT"
graffiti = "$GRAFITTI"
EOF

# Merge base configuration with custom settings
merge_client_config "Nimbus" "main" "$PROJECT_ROOT/configs/nimbus/nimbus_base.toml" "./tmp/nimbus_custom.toml" "$NIMBUS_DIR/nimbus.toml"

# Clean up temporary files
rm -rf ./tmp/

# Create validator client configuration
cat > "$NIMBUS_DIR/validator.toml" << EOF
# Nimbus Validator Client Configuration

# Beacon node connection
beacon-node = "http://$CONSENSUS_HOST:5052"

# Validator settings
validators-dir = "$VALIDATOR_DATA_DIR"
secrets-dir = "$VALIDATOR_DATA_DIR/secrets"
suggested-fee-recipient = "$FEE_RECIPIENT"
graffiti = "$GRAFITTI"

# Metrics
metrics = true
metrics-port = 8009
metrics-address = "$CONSENSUS_HOST"

# Logging
log-level = "INFO"
log-file = "$NIMBUS_DATA_DIR/validator_client.log"

# Performance
doppelganger-detection = true
EOF

# Create systemd service for beacon node
BEACON_EXEC_START="$NIMBUS_DIR/build/nimbus_beacon_node --config-file=$NIMBUS_DIR/nimbus.toml"

create_systemd_service "cl" "Nimbus Ethereum Consensus Client (Beacon Node)" "$BEACON_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Create systemd service for validator
VALIDATOR_EXEC_START="$NIMBUS_DIR/build/nimbus_validator_client --config-file=$NIMBUS_DIR/validator.toml"

create_systemd_service "validator" "Nimbus Ethereum Validator Client" "$VALIDATOR_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300" "network-online.target cl.service" "network-online.target"

# Enable and start services
enable_and_start_systemd_service "cl"
enable_and_start_systemd_service "validator"

log_installation_complete "Nimbus" "nimbus"
log_info "Beacon node configuration: $NIMBUS_DIR/nimbus.toml"
log_info "Validator configuration: $NIMBUS_DIR/validator.toml"
log_info "Data directory: $NIMBUS_DATA_DIR"
log_info "Validator directory: $VALIDATOR_DATA_DIR"
log_info ""
log_info "Validator will start automatically with the beacon node"
log_info "To check status: sudo systemctl status cl && sudo systemctl status validator"
log_info "To view logs: journalctl -fu cl && journalctl -fu validator"

# Display setup information
cat << EOF

=== Nimbus Setup Information ===
Nimbus has been installed with the following components:
1. Beacon Node (cl service) - Lightweight consensus client
2. Validator Client (validator service) - Manages validator keys and duties

Next Steps:
1. Import your validator keys into: $VALIDATOR_DATA_DIR/
2. Create keystore password files in: $VALIDATOR_DATA_DIR/secrets/
3. Wait for beacon node to sync (validator will start automatically)

Key features:
- Resource efficient design (low memory and CPU usage)
- REST API available on port 5052
- P2P networking on port 9000
- Metrics available on ports 8008 (beacon) and 8009 (validator)
- Checkpoint sync enabled for faster initial sync
- MEV-Boost integration ready
- Doppelganger detection for validator safety

Nimbus is particularly suitable for:
- Raspberry Pi and other ARM devices
- VPS instances with limited resources
- Home stakers with bandwidth constraints

EOF