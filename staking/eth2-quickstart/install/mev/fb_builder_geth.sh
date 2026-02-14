#!/bin/bash


# Flashbots Builder Geth Installation Script
# Builds Geth from Flashbots builder repository

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

# Note: This script uses sudo internally for privileged operations

# Start installation
log_installation_start "Flashbots Builder Geth"


# Check system requirements
check_system_requirements 16 2000


# Clone Flashbots builder repository
log_info "Cloning Flashbots builder repository..."
if ! git clone https://github.com/flashbots/builder.git; then
    log_error "Failed to clone Flashbots builder repository"
    exit 1
fi

cd builder/ || exit

# Build Geth
log_info "Building Geth from source..."
if ! make geth; then
    log_error "Failed to build Geth"
    exit 1
fi

# Create local bin directory if it doesn't exist
ensure_directory "$HOME/.local/bin"

# Install Geth binary to user's local bin
log_info "Installing Geth binary to user's local bin..."
if ! cp ./build/bin/geth "$HOME/.local/bin/"; then
    log_error "Failed to install Geth binary"
    exit 1
fi

# Make executable
chmod +x "$HOME/.local/bin/geth"

# Add to PATH if not already there
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    log_info "Adding $HOME/.local/bin to PATH"
    echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$HOME/.bashrc"
    export PATH="$HOME/.local/bin:$PATH"
fi

log_installation_complete "Flashbots Builder Geth" "mev-geth"
log_info "Geth binary installed to: $HOME/.local/bin/geth"
log_info "This is a custom Geth build with Flashbots builder support"
log_info "NOTE: You may need to restart your shell or run: source ~/.bashrc"
