#!/bin/bash

# Nimbus Execution Client Installation Script
# Language: Nim
# Nimbus-eth1 is a Nim-based Ethereum execution client designed for resource efficiency
# Usage: ./nimbus_eth1.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

log_installation_start "Nimbus-eth1"

# Check system requirements (Nimbus is lightweight)
check_system_requirements 4 500

# Setup firewall rules for Nimbus execution client
setup_firewall_rules 30303 8545 8546 8551

# Create Nimbus execution client directory
NIMBUS_ETH1_DIR="$HOME/nimbus-eth1"
ensure_directory "$NIMBUS_ETH1_DIR"

cd "$NIMBUS_ETH1_DIR" || exit

# Nimbus-eth1 uses nightly builds, so we'll use the latest nightly release
log_info "Fetching latest Nimbus-eth1 nightly release..."
# Get the latest nightly release asset URL
NIGHTLY_URL=$(curl -s https://api.github.com/repos/status-im/nimbus-eth1/releases/latest | grep -o '"browser_download_url": "[^"]*linux-amd64-nightly-latest[^"]*"' | head -1 | cut -d'"' -f4)

if [[ -z "$NIGHTLY_URL" ]]; then
    # Fallback to a known nightly URL pattern
    NIGHTLY_URL="https://github.com/status-im/nimbus-eth1/releases/download/nightly/nimbus-eth1-linux-amd64-nightly-latest.tar.gz"
    log_warn "Could not fetch latest nightly URL, using fallback: $NIGHTLY_URL"
fi

ARCHIVE_FILE="nimbus-eth1-linux-amd64-nightly-latest.tar.gz"

log_info "Downloading Nimbus-eth1 nightly build..."
if download_file "$NIGHTLY_URL" "$ARCHIVE_FILE"; then
    if ! extract_archive "$ARCHIVE_FILE" "$NIMBUS_ETH1_DIR" 1; then
        log_error "Failed to extract Nimbus-eth1 archive"
        exit 1
    fi
    rm -f "$ARCHIVE_FILE"
else
    log_error "Failed to download Nimbus-eth1"
    exit 1
fi

# Find the extracted directory and move contents to nimbus-eth1 directory
EXTRACTED_DIR=$(find "$NIMBUS_ETH1_DIR" -maxdepth 1 -type d -name "nimbus-eth1*" | head -1)
if [[ -n "$EXTRACTED_DIR" && "$EXTRACTED_DIR" != "$NIMBUS_ETH1_DIR" ]]; then
    mv "$EXTRACTED_DIR"/* "$NIMBUS_ETH1_DIR/" 2>/dev/null || true
    rmdir "$EXTRACTED_DIR" 2>/dev/null || true
fi

# Find and make Nimbus executable (could be nimbus, nimbus-eth1, or in build/ subdirectory)
if [[ -f "$NIMBUS_ETH1_DIR/nimbus" ]]; then
    chmod +x "$NIMBUS_ETH1_DIR/nimbus"
    NIMBUS_EXEC="$NIMBUS_ETH1_DIR/nimbus"
elif [[ -f "$NIMBUS_ETH1_DIR/build/nimbus" ]]; then
    chmod +x "$NIMBUS_ETH1_DIR/build/nimbus"
    NIMBUS_EXEC="$NIMBUS_ETH1_DIR/build/nimbus"
elif [[ -f "$NIMBUS_ETH1_DIR/nimbus-eth1" ]]; then
    chmod +x "$NIMBUS_ETH1_DIR/nimbus-eth1"
    NIMBUS_EXEC="$NIMBUS_ETH1_DIR/nimbus-eth1"
else
    # Try to find any executable named nimbus*
    NIMBUS_EXEC=$(find "$NIMBUS_ETH1_DIR" -type f -name "nimbus*" -executable | head -1)
    if [[ -z "$NIMBUS_EXEC" ]]; then
        log_error "Could not find Nimbus executable"
        exit 1
    fi
fi

log_info "Found Nimbus executable: $NIMBUS_EXEC"

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create Nimbus execution client data directory
NIMBUS_ETH1_DATA_DIR="$HOME/.local/share/nimbus-eth1"
ensure_directory "$NIMBUS_ETH1_DATA_DIR"

# Create temporary directory for custom configuration
create_temp_config_dir

# Create custom configuration variables file
cat > ./tmp/nimbus_eth1_custom.toml << EOF
# Nimbus-eth1 Custom Configuration Variables

# Network settings
network = "mainnet"
tcp-port = 30303
udp-port = 30303

# Data directory
data-dir = "$NIMBUS_ETH1_DATA_DIR"

# JSON-RPC settings
rpc-port = ${NIMBUS_ETH1_HTTP_PORT:-8545}
rpc-address = "$LH"

# WebSocket settings
ws-port = ${NIMBUS_ETH1_WS_PORT:-8546}
ws-address = "$LH"

# Engine API (JWT-secured)
engine-api-port = ${NIMBUS_ETH1_ENGINE_PORT:-8551}
engine-api-address = "$LH"
jwt-secret = "$HOME/secrets/jwt.hex"

# Mining settings (disabled for staking)
miner-enabled = false
miner-coinbase = "$FEE_RECIPIENT"
miner-extra-data = "$GRAFITTI"

# Performance
max-peers = $MAX_PEERS
cache-size = ${NIMBUS_ETH1_CACHE:-4096}

# Metrics
metrics-enabled = true
metrics-address = "$LH"
metrics-port = ${METRICS_PORT:-6060}

# Logging
log-level = "INFO"
log-file = "$NIMBUS_ETH1_DATA_DIR/nimbus-eth1.log"
EOF

# Merge base configuration with custom settings
merge_client_config "Nimbus-eth1" "main" "$PROJECT_ROOT/configs/nimbus/nimbus_eth1_base.toml" "./tmp/nimbus_eth1_custom.toml" "$NIMBUS_ETH1_DIR/nimbus-eth1.toml"

# Clean up temporary files
rm -rf ./tmp/

# Create systemd service
EXEC_START="$NIMBUS_EXEC --config-file=$NIMBUS_ETH1_DIR/nimbus-eth1.toml"

create_systemd_service "eth1" "Nimbus Ethereum Execution Client" "$EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Enable and start the service
enable_and_start_systemd_service "eth1"

log_installation_complete "Nimbus-eth1" "nimbus-eth1"
log_info "Configuration file: $NIMBUS_ETH1_DIR/nimbus-eth1.toml"
log_info "Data directory: $NIMBUS_ETH1_DATA_DIR"
log_info "To check status: sudo systemctl status eth1"
log_info "To view logs: journalctl -fu eth1"

# Display setup information
cat << EOF

=== Nimbus-eth1 Setup Information ===
Nimbus-eth1 has been installed with the following features:
- Lightweight, resource-efficient execution client
- JSON-RPC API available on port ${NIMBUS_ETH1_HTTP_PORT:-8545}
- WebSocket API available on port ${NIMBUS_ETH1_WS_PORT:-8546}
- Engine API for consensus client communication on port ${NIMBUS_ETH1_ENGINE_PORT:-8551}
- P2P networking on port 30303
- Metrics available on port ${METRICS_PORT:-6060}

Next Steps:
1. Wait for execution client to sync (this may take 1-3 days)
2. Once synced, start your consensus client
3. Monitor sync progress: journalctl -fu eth1

Key features:
- Resource efficient design (low memory and CPU usage)
- Fast sync capabilities
- MEV-Boost ready
- Suitable for low-resource systems

Nimbus-eth1 is particularly suitable for:
- Raspberry Pi and other ARM devices
- VPS instances with limited resources
- Home stakers with bandwidth constraints

Note: Nimbus-eth1 uses nightly builds for the latest features and improvements.

EOF
