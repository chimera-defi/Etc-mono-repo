#!/bin/bash

# Nethermind Execution Client Installation Script
# Language: C# (.NET)
# Nethermind is a .NET Ethereum client designed for enterprise use
# Usage: ./nethermind.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

log_installation_start "Nethermind"

# Check system requirements
check_system_requirements 16 2000


# Setup firewall rules for Nethermind
setup_firewall_rules 30303 8545 8546 8551

# Create Nethermind directory
NETHERMIND_DIR="$HOME/nethermind"
ensure_directory "$NETHERMIND_DIR"

cd "$NETHERMIND_DIR" || exit

# Get latest release version
log_info "Fetching latest Nethermind release..."
LATEST_VERSION=$(get_latest_release "NethermindEth/nethermind")
if [[ -z "$LATEST_VERSION" ]]; then
    LATEST_VERSION="1.25.4"  # Fallback version
    log_warn "Could not fetch latest version, using fallback: $LATEST_VERSION"
fi

# Download Nethermind
DOWNLOAD_URL="https://github.com/NethermindEth/nethermind/releases/download/${LATEST_VERSION}/nethermind-${LATEST_VERSION}-linux-x64.zip"
ARCHIVE_FILE="nethermind-${LATEST_VERSION}-linux-x64.zip"

log_info "Downloading Nethermind ${LATEST_VERSION}..."
if download_file "$DOWNLOAD_URL" "$ARCHIVE_FILE"; then
    extract_archive "$ARCHIVE_FILE" "$NETHERMIND_DIR" 0
    rm -f "$ARCHIVE_FILE"
else
    log_error "Failed to download Nethermind"
    exit 1
fi

# Make Nethermind executable
chmod +x "$NETHERMIND_DIR/Nethermind.Runner"

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create temporary directory for custom configuration
create_temp_config_dir

# Create custom configuration with variables
cat > "$NETHERMIND_DIR/nethermind_custom.cfg" << EOF
{
  "Init": {
    "WebSocketsEnabled": true,
    "StoreReceipts": true,
    "IsMining": false,
    "ChainSpecPath": "chainspec/mainnet.json",
    "BaseDbPath": "nethermind_db/mainnet",
    "LogFileName": "mainnet.logs.txt",
    "MemoryHint": ${NETHERMIND_CACHE}000000
  },
  "Network": {
    "DiscoveryPort": 30303,
    "P2PPort": 30303,
    "LocalIp": "127.0.0.1"
  },
  "JsonRpc": {
    "Enabled": true,
    "Timeout": 20000,
    "Host": "'$LH'",
    "Port": ${NETHERMIND_HTTP_PORT},
    "WebSocketsPort": ${NETHERMIND_WS_PORT},
    "JwtSecretFile": "$HOME/secrets/jwt.hex",
    "EngineHost": "'$LH'",
    "EnginePort": ${NETHERMIND_ENGINE_PORT},
    "EnabledModules": ["Admin", "Eth", "Net", "Web3", "Engine"]
  },
  "EthStats": {
    "Enabled": false
  },
  "Metrics": {
    "Enabled": true,
    "NodeName": "Nethermind",
    "PushGatewayUrl": "",
    "IntervalSeconds": 5,
    "ExposeHost": "'$LH'",
    "ExposePort": 6060
  },
  "Sync": {
    "SnapSync": true,
    "PivotNumber": 0,
    "PivotHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "PivotTotalDifficulty": "0",
    "FastBlocks": true,
    "UseGethLimitsInFastBlocks": false,
    "SnapSyncCatchUpHeightDelta": 10000000000
  },
  "Bloom": {
    "IndexLevelBucketSizes": [4, 8, 8]
  },
  "Mining": {
    "Enabled": false,
    "Coinbase": "${FEE_RECIPIENT}",
    "ExtraData": "${GRAFITTI}"
  },
  "KeyStore": {
    "TestNodeKey": "0x7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d"
  },
  "Db": {
    "CacheIndexAndFilterBlocks": false
  },
  "TxPool": {
    "Size": 2048
  },
  "Merge": {
    "Enabled": true,
    "TerminalTotalDifficulty": "58750000000000000000000"
  }
}
EOF

# Merge base configuration with custom settings
merge_client_config "Nethermind" "main" "$PROJECT_ROOT/configs/nethermind/nethermind_base.cfg" "$NETHERMIND_DIR/nethermind_custom.cfg" "$NETHERMIND_DIR/nethermind.cfg"

# Clean up temporary files
rm -rf ./tmp/

# Create systemd service
EXEC_START="$NETHERMIND_DIR/Nethermind.Runner --config $NETHERMIND_DIR/nethermind.cfg --JsonRpc.JwtSecretFile $HOME/secrets/jwt.hex --JsonRpc.EngineHost $LH --JsonRpc.EnginePort 8551"

create_systemd_service "eth1" "Nethermind Ethereum Execution Client" "$EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Enable and start the service
enable_and_start_systemd_service "eth1"

log_installation_complete "Nethermind" "nethermind"
log_info "Configuration file: $NETHERMIND_DIR/nethermind.cfg"
log_info "To check status: sudo systemctl status eth1"
log_info "To view logs: journalctl -fu eth1"

# Display sync information
cat << EOF

=== Nethermind Sync Information ===
Nethermind will automatically start syncing when the service is started.
Initial sync may take 1-3 days depending on your hardware and network.

Key features:
- Fast sync enabled for quicker initial synchronization
- JSON-RPC API available on port 8545
- WebSocket API available on port 8546
- Engine API for consensus client communication on port 8551
- P2P networking on port 30303

EOF