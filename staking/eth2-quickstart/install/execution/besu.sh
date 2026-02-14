#!/bin/bash

# Hyperledger Besu Execution Client Installation Script
# Language: Java
# Besu is a Java-based Ethereum client designed for both public and private networks
# Usage: ./besu.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

log_installation_start "Besu"


# Check system requirements
check_system_requirements 8 1000


# Setup firewall rules for Besu
setup_firewall_rules 30303 8545 8546 8551

# Create Besu directory
BESU_DIR="$HOME/besu"
ensure_directory "$BESU_DIR"

cd "$BESU_DIR" || exit

# Get latest release version
log_info "Fetching latest Besu release..."
LATEST_VERSION=$(get_latest_release "hyperledger/besu")
if [[ -z "$LATEST_VERSION" ]]; then
    LATEST_VERSION="23.10.3"  # Fallback version
    log_warn "Could not fetch latest version, using fallback: $LATEST_VERSION"
fi

# Download Besu
DOWNLOAD_URL="https://github.com/hyperledger/besu/releases/download/${LATEST_VERSION}/besu-${LATEST_VERSION}.tar.gz"
ARCHIVE_FILE="besu-${LATEST_VERSION}.tar.gz"

log_info "Downloading Besu ${LATEST_VERSION}..."
if download_file "$DOWNLOAD_URL" "$ARCHIVE_FILE"; then
    extract_archive "$ARCHIVE_FILE" "$BESU_DIR" 1
    rm -f "$ARCHIVE_FILE"
else
    log_error "Failed to download Besu"
    exit 1
fi

# Find the extracted directory and move contents to besu directory
EXTRACTED_DIR=$(find "$BESU_DIR" -maxdepth 1 -type d -name "besu-*" | head -1)
if [[ -n "$EXTRACTED_DIR" && "$EXTRACTED_DIR" != "$BESU_DIR" ]]; then
    mv "$EXTRACTED_DIR"/* "$BESU_DIR/"
    rmdir "$EXTRACTED_DIR"
fi

# Make Besu executable
chmod +x "$BESU_DIR/bin/besu"

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create Besu data directory
BESU_DATA_DIR="$HOME/.local/share/besu"
ensure_directory "$BESU_DATA_DIR"

# Create temporary directory for custom configuration
create_temp_config_dir

# Create custom configuration variables file
cat > ./tmp/besu_custom.toml << EOF
# Besu Custom Configuration Variables

# Data storage
data-path="$BESU_DATA_DIR"

# JSON-RPC settings  
rpc-http-port=${BESU_HTTP_PORT}

# WebSocket settings
rpc-ws-port=${BESU_WS_PORT}

# Engine API settings
engine-rpc-port=${BESU_ENGINE_PORT}
engine-jwt-secret="$HOME/secrets/jwt.hex"

# Mining settings (disabled for staking)
miner-coinbase="$FEE_RECIPIENT"
miner-extra-data="$GRAFITTI"
EOF

# Merge base configuration with custom settings
merge_client_config "Besu" "main" "$PROJECT_ROOT/configs/besu/besu_base.toml" "./tmp/besu_custom.toml" "$BESU_DIR/besu.toml"

# Clean up temporary files
rm -rf ./tmp/

# Create systemd service
JAVA_OPTS="-Xmx${BESU_CACHE}m -XX:+UseG1GC"
EXEC_START="$BESU_DIR/bin/besu --config-file=$BESU_DIR/besu.toml"

create_systemd_service "eth1" "Hyperledger Besu Ethereum Execution Client" "$EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Add Java options to service file
sudo sed -i "/\\[Service\\]/a Environment=JAVA_OPTS=\"$JAVA_OPTS\"" /etc/systemd/system/eth1.service

# Enable and start the service
enable_and_start_systemd_service "eth1"

log_installation_complete "Besu" "besu"
log_info "Configuration file: $BESU_DIR/besu.toml"
log_info "Data directory: $BESU_DATA_DIR"
log_info "To check status: sudo systemctl status eth1"
log_info "To view logs: journalctl -fu eth1"

# Display sync information
cat << EOF

=== Besu Sync Information ===
Besu will automatically start syncing when the service is started.
Using SNAP sync mode for faster initial synchronization.
Initial sync may take 1-2 days depending on your hardware and network.

Key features:
- SNAP sync for faster synchronization
- Bonsai data storage format for reduced disk usage
- JSON-RPC API available on port 8545
- WebSocket API available on port 8546
- Engine API for consensus client communication on port 8551
- P2P networking on port 30303

Java version: $(java -version 2>&1 | head -n1)

EOF