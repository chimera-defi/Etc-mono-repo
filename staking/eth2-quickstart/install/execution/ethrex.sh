#!/bin/bash

# Ethrex Execution Client Installation Script
# Language: Rust
# Ethrex is a minimalist, fast and modular Ethereum execution client written in Rust
# by Lambda Class. Supports both L1 and L2 modes.
# Usage: ./ethrex.sh
# https://github.com/lambdaclass/ethrex

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

# Note: This script uses sudo internally for privileged operations

# Start installation
log_installation_start "Ethrex"

# Check system requirements (ethrex is lightweight, lower requirements than other clients)
check_system_requirements 8 1000

# Setup firewall rules for Ethrex
# P2P, HTTP RPC, WS RPC, Engine API, Metrics (using variables from exports.sh)
setup_firewall_rules "$ETHREX_P2P_PORT" "$ETHREX_HTTP_PORT" "$ETHREX_WS_PORT" "$ETHREX_ENGINE_PORT" "$ETHREX_METRICS_PORT"

# Determine system architecture
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)
        ETHREX_BINARY="ethrex-linux-x86_64"
        ;;
    aarch64)
        ETHREX_BINARY="ethrex-linux-aarch64"
        ;;
    *)
        log_error "Unsupported architecture: $ARCH (requires x86_64 or aarch64)"
        exit 1
        ;;
esac

# Get latest release version
log_info "Fetching latest ethrex release..."
ETHREX_VERSION=$(get_latest_release "lambdaclass/ethrex")
if [[ -z "$ETHREX_VERSION" ]]; then
    log_warn "Could not fetch latest version, using v7.0.0"
    ETHREX_VERSION="v7.0.0"
fi
log_info "Installing ethrex version: $ETHREX_VERSION"

# Create installation directory
ETHREX_DIR="$HOME/ethrex"
ensure_directory "$ETHREX_DIR"
ensure_directory "$ETHREX_DIR/data"

# Download pre-built binary
DOWNLOAD_URL="https://github.com/lambdaclass/ethrex/releases/download/${ETHREX_VERSION}/${ETHREX_BINARY}"
log_info "Downloading ethrex binary from: $DOWNLOAD_URL"

if ! secure_download "$DOWNLOAD_URL" "$ETHREX_DIR/ethrex"; then
    log_warn "Pre-built binary not available, attempting to build from source..."
    
    # Fallback: Build from source
    # Source Rust environment (installed centrally via install_dependencies.sh)
    [[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env"
    
    # Verify Rust is available
    if ! command -v cargo &> /dev/null; then
        log_error "Rust/Cargo not found. Please run install_dependencies.sh first."
        log_error "Or run: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"
        exit 1
    fi
    
    log_info "Using Rust: $(rustc --version)"
    
    # Clone and build ethrex
    log_info "Cloning ethrex repository..."
    TEMP_BUILD_DIR=$(mktemp -d)
    if ! git clone https://github.com/lambdaclass/ethrex.git "$TEMP_BUILD_DIR/ethrex"; then
        log_error "Failed to clone ethrex repository"
        rm -rf "$TEMP_BUILD_DIR"
        exit 1
    fi
    
    cd "$TEMP_BUILD_DIR/ethrex" || exit
    
    log_info "Building ethrex (this may take several minutes depending on your hardware)..."
    if ! cargo build --release; then
        log_error "Failed to build ethrex"
        rm -rf "$TEMP_BUILD_DIR"
        exit 1
    fi
    
    # Copy binary to installation directory
    cp target/release/ethrex "$ETHREX_DIR/ethrex"
    
    # Cleanup
    cd "$HOME" || exit
    rm -rf "$TEMP_BUILD_DIR"
fi

# Make binary executable
chmod +x "$ETHREX_DIR/ethrex"

# Verify binary works
if ! "$ETHREX_DIR/ethrex" --version &>/dev/null; then
    log_error "ethrex binary verification failed"
    exit 1
fi

ETHREX_INSTALLED_VERSION=$("$ETHREX_DIR/ethrex" --version 2>/dev/null || echo "unknown")
log_info "ethrex installed: $ETHREX_INSTALLED_VERSION"

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Build the ethrex command with all necessary options
# Using variables from exports.sh for consistency with other clients
# Note: ethrex CLI verified against v7.0.0 --help output
ETHREX_CMD="$ETHREX_DIR/ethrex \
--network mainnet \
--datadir $ETHREX_DIR/data \
--syncmode snap \
--http.addr $LH \
--http.port $ETHREX_HTTP_PORT \
--ws.enabled \
--ws.addr $LH \
--ws.port $ETHREX_WS_PORT \
--authrpc.addr $LH \
--authrpc.port $ETHREX_ENGINE_PORT \
--authrpc.jwtsecret $HOME/secrets/jwt.hex \
--p2p.port $ETHREX_P2P_PORT \
--target.peers $MAX_PEERS \
--metrics \
--metrics.addr $LH \
--metrics.port $ETHREX_METRICS_PORT \
--log.level info"

# Create systemd service
create_systemd_service "eth1" "Ethrex Ethereum Execution Client" "$ETHREX_CMD" "$(whoami)" "on-failure" "600" "5" "300"

# Enable and start the service
enable_and_start_systemd_service "eth1"

# Display installation summary
cat << EOF

=== Ethrex Installation Summary ===

Binary Location: $ETHREX_DIR/ethrex
Data Directory:  $ETHREX_DIR/data
Version:         $ETHREX_INSTALLED_VERSION

Endpoints:
  HTTP RPC:      http://$LH:$ETHREX_HTTP_PORT
  WebSocket:     ws://$LH:$ETHREX_WS_PORT
  Engine API:    http://$LH:$ETHREX_ENGINE_PORT
  Metrics:       http://$LH:$ETHREX_METRICS_PORT
  P2P:           $ETHREX_P2P_PORT (TCP/UDP)

Service Management:
  Status:  sudo systemctl status eth1
  Start:   sudo systemctl start eth1
  Stop:    sudo systemctl stop eth1
  Logs:    sudo journalctl -u eth1 -f

About Ethrex:
  Ethrex is a minimalist, fast and modular Ethereum execution client
  written in Rust by Lambda Class. It focuses on simplicity, minimal
  code, and fast iteration. It supports both L1 and L2 (ZK-Rollup) modes.
  
  GitHub:  https://github.com/lambdaclass/ethrex
  Docs:    https://docs.ethrex.xyz/

=== Installation Complete ===

EOF

# Show completion information
log_installation_complete "Ethrex" "eth1"
