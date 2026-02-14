#!/bin/bash

# Reth Execution Client Installation Script
# Language: Rust
# Reth is a Rust-based Ethereum client focused on performance and modularity
# Usage: ./reth.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

# Note: This script uses sudo internally for privileged operations

# Start installation
log_installation_start "Reth"


# Check system requirements
check_system_requirements 16 2000

# Source Rust environment (installed centrally via install_dependencies.sh)
[[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env"

# Verify Rust is available
if ! command -v cargo &> /dev/null; then
    log_error "Rust/Cargo not found. Please run install_dependencies.sh first."
    log_error "Or run: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"
    exit 1
fi

log_info "Using Rust: $(rustc --version)"

# Setup firewall rules for Reth
setup_firewall_rules 30303 30304 42069 4000 4001

# Clone and build Reth
log_info "Cloning Reth repository..."
if ! git clone https://github.com/paradigmxyz/reth.git; then
    log_error "Failed to clone Reth repository"
    exit 1
fi

cd reth || exit

log_info "Building Reth..."
if ! cargo build --release; then
    log_error "Failed to build Reth"
    exit 1
fi

# Install Reth globally
log_info "Installing Reth..."
if ! cargo install --path . --bin reth; then
    log_error "Failed to install Reth"
    exit 1
fi

# Create Reth directory
RETH_DIR="$HOME/reth"
rm -rf "${RETH_DIR:?}"/*
ensure_directory "$RETH_DIR"

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create systemd service
EXEC_START="$HOME/.cargo/bin/reth node"

# Verify Reth binary exists
if [[ ! -f "$HOME/.cargo/bin/reth" ]]; then
    log_error "Reth binary not found at $HOME/.cargo/bin/reth"
    exit 1
fi

create_systemd_service "eth1" "Reth Ethereum Execution Client" "$EXEC_START" "$(whoami)" "on-failure" "6000" "10" "3000"

# Enable and start the service
enable_and_start_systemd_service "eth1"

# Show completion information
log_installation_complete "Reth" "eth1"
