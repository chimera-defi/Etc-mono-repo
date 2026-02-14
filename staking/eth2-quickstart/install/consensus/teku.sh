#!/bin/bash

# Teku Consensus Client Installation Script
# Language: Java
# Teku is a Java-based Ethereum consensus client developed by ConsenSys
# Usage: ./teku.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

log_installation_start "Teku"


# Check system requirements
check_system_requirements 16 1000


# Setup firewall rules for Teku
setup_firewall_rules 9000 5051

# Create Teku directory
TEKU_DIR="$HOME/teku"
ensure_directory "$TEKU_DIR"

cd "$TEKU_DIR" || exit

# Get latest release version
log_info "Fetching latest Teku release..."
LATEST_VERSION=$(get_latest_release "ConsenSys/teku")
if [[ -z "$LATEST_VERSION" ]]; then
    LATEST_VERSION="23.12.0"  # Fallback version
    log_warn "Could not fetch latest version, using fallback: $LATEST_VERSION"
fi

# Download Teku
DOWNLOAD_URL="https://github.com/ConsenSys/teku/releases/download/${LATEST_VERSION}/teku-${LATEST_VERSION}.tar.gz"
ARCHIVE_FILE="teku-${LATEST_VERSION}.tar.gz"

log_info "Downloading Teku ${LATEST_VERSION}..."
if download_file "$DOWNLOAD_URL" "$ARCHIVE_FILE"; then
    extract_archive "$ARCHIVE_FILE" "$TEKU_DIR" 1
    rm -f "$ARCHIVE_FILE"
else
    log_error "Failed to download Teku"
    exit 1
fi

# Find the extracted directory and move contents to teku directory
EXTRACTED_DIR=$(find "$TEKU_DIR" -maxdepth 1 -type d -name "teku-*" | head -1)
if [[ -n "$EXTRACTED_DIR" && "$EXTRACTED_DIR" != "$TEKU_DIR" ]]; then
    mv "$EXTRACTED_DIR"/* "$TEKU_DIR/"
    rmdir "$EXTRACTED_DIR"
fi

# Make Teku executable
chmod +x "$TEKU_DIR/bin/teku"

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create Teku data directory
TEKU_DATA_DIR="$HOME/.local/share/teku"
ensure_directory "$TEKU_DATA_DIR"

# Create validator data directory
VALIDATOR_DATA_DIR="$HOME/.local/share/teku/validator"
ensure_directory "$VALIDATOR_DATA_DIR"

# Create temporary directory for custom configuration
create_temp_config_dir

# Create custom beacon node configuration variables
cat > ./tmp/teku_beacon_custom.yaml << EOF
# Teku Beacon Node Custom Configuration

# Network
p2p-peer-upper-bound: $MAX_PEERS

# Data storage
data-path: "$TEKU_DATA_DIR"

# Execution layer connection
ee-endpoint: "http://$LH:8551"
ee-jwt-secret-file: "$HOME/secrets/jwt.hex"

# REST API
rest-api-port: ${TEKU_REST_PORT}

# Checkpoint sync
initial-state-url: "$TEKU_CHECKPOINT_URL/eth/v2/debug/beacon/states/finalized"
checkpoint-sync-url: "$TEKU_CHECKPOINT_URL"

# Metrics and monitoring
metrics-port: 8008

# Validator settings
validators-graffiti: "$GRAFITTI"
validators-proposer-default-fee-recipient: "$FEE_RECIPIENT"
EOF

# Create custom validator configuration variables
cat > ./tmp/teku_validator_custom.yaml << EOF
# Teku Validator Custom Configuration

# Beacon node connection
beacon-node-api-endpoint: "http://$CONSENSUS_HOST:${TEKU_REST_PORT}"

# Validator settings
validator-keys: "$VALIDATOR_DATA_DIR/keys:$VALIDATOR_DATA_DIR/passwords"
validators-graffiti: "$GRAFITTI"
validators-proposer-default-fee-recipient: "$FEE_RECIPIENT"

# Data storage
data-path: "$VALIDATOR_DATA_DIR"

# Metrics
metrics-port: 8009
EOF

# Merge base configurations with custom settings
merge_client_config "Teku" "beacon" "$PROJECT_ROOT/configs/teku/teku_beacon_base.yaml" "./tmp/teku_beacon_custom.yaml" "$TEKU_DIR/beacon.yaml"
merge_client_config "Teku" "validator" "$PROJECT_ROOT/configs/teku/teku_validator_base.yaml" "./tmp/teku_validator_custom.yaml" "$TEKU_DIR/validator.yaml"

# Clean up temporary files
rm -rf ./tmp/

# Create systemd service for beacon node
JAVA_OPTS="-Xmx${TEKU_CACHE}m -XX:+UseG1GC"
BEACON_EXEC_START="$TEKU_DIR/bin/teku --config-file=$TEKU_DIR/beacon.yaml"

create_systemd_service "cl" "Teku Ethereum Consensus Client (Beacon Node)" "$BEACON_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Add Java options to beacon service file
sudo sed -i "/\\[Service\\]/a Environment=JAVA_OPTS=\"$JAVA_OPTS\"" /etc/systemd/system/cl.service

# Create systemd service for validator
VALIDATOR_EXEC_START="$TEKU_DIR/bin/teku validator-client --config-file=$TEKU_DIR/validator.yaml"

create_systemd_service "validator" "Teku Ethereum Validator Client" "$VALIDATOR_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300" "network-online.target cl.service" "network-online.target"

# Add Java options to validator service file
sudo sed -i "/\\[Service\\]/a Environment=JAVA_OPTS=\"$JAVA_OPTS\"" /etc/systemd/system/validator.service

# Enable and start services
enable_and_start_systemd_service "cl"
enable_and_start_systemd_service "validator"

# Show completion information
log_installation_complete "Teku" "cl" "$TEKU_DIR/beacon.yaml" "$TEKU_DATA_DIR"

# Display setup information
display_client_setup_info "Teku" "cl" "$TEKU_DIR/beacon.yaml" "$VALIDATOR_DATA_DIR" "5051" "9000" "Metrics available on ports 8008 (beacon) and 8009 (validator)
Java version: $(java -version 2>&1 | head -n1)"