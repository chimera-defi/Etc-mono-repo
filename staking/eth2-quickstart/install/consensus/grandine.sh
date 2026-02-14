#!/bin/bash

# Grandine Consensus Client Installation Script
# Language: Rust
# Grandine is a Rust-based Ethereum consensus client focused on performance
# Usage: ./grandine.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

# Start installation
log_installation_start "Grandine"


# Check system requirements
check_system_requirements 16 1000

# Source Rust environment (installed centrally via install_dependencies.sh)
[[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env"

# Verify Rust is available
if ! command -v cargo &> /dev/null; then
    log_error "Rust/Cargo not found. Please run install_dependencies.sh first."
    log_error "Or run: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"
    exit 1
fi

log_info "Using Rust: $(rustc --version)"

# Setup firewall rules for Grandine
setup_firewall_rules 9000 5052

# Create Grandine directory
GRANDINE_DIR="$HOME/grandine"
ensure_directory "$GRANDINE_DIR"

cd "$GRANDINE_DIR" || exit

# Clone Grandine repository (as it may not have regular releases yet)
log_info "Cloning Grandine repository..."
if [[ -d ".git" ]]; then
    log_info "Updating existing Grandine repository..."
    git fetch origin
    git checkout main
    git pull origin main
else
    git clone https://github.com/grandinetech/grandine.git .
fi

# Build Grandine
log_info "Building Grandine... This may take some time."
if ! cargo build --release --bin grandine; then
    log_error "Failed to build Grandine. Please check your Rust installation and try again."
    exit 1
fi

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create Grandine data directory
GRANDINE_DATA_DIR="$HOME/.local/share/grandine"
ensure_directory "$GRANDINE_DATA_DIR"

# Create validator data directory
VALIDATOR_DATA_DIR="$GRANDINE_DATA_DIR/validators"
ensure_directory "$VALIDATOR_DATA_DIR"

# Create temporary directory for custom configuration
create_temp_config_dir

# Create custom configuration variables file
cat > ./tmp/grandine_custom.toml << EOF
# Grandine Custom Configuration Variables

# Network settings
target_peers = $MAX_PEERS

# Data directory
data_dir = "$GRANDINE_DATA_DIR"

# Execution layer
jwt_secret_path = "$HOME/secrets/jwt.hex"

# HTTP API
http_api_listen_address = "$CONSENSUS_HOST:${GRANDINE_REST_PORT}"

# Checkpoint sync
checkpoint_sync_url = "$GRANDINE_CHECKPOINT_URL"

# Metrics
metrics_listen_address = "$CONSENSUS_HOST:8008"

# Validator settings
suggested_fee_recipient = "$FEE_RECIPIENT"
graffiti = "$GRAFITTI"
EOF

# Merge base configuration with custom settings
merge_client_config "Grandine" "main" "$PROJECT_ROOT/configs/grandine/grandine_base.toml" "./tmp/grandine_custom.toml" "$GRANDINE_DIR/grandine.toml"

# Clean up temporary files
rm -rf ./tmp/


# Create systemd service for beacon node
BEACON_EXEC_START="$GRANDINE_DIR/target/release/grandine --config $GRANDINE_DIR/grandine.toml"

create_systemd_service "cl" "Grandine Ethereum Consensus Client" "$BEACON_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Enable and start service
enable_and_start_systemd_service "cl"

log_installation_complete "Grandine" "cl"
log_info "To view logs: journalctl -fu cl"

# Display setup information
display_client_setup_info "Grandine" "cl" "" "Beacon Node" ""