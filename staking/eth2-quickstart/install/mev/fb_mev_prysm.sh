#!/bin/bash


# Flashbots MEV Prysm Installation Script
# This script builds Prysm from source with MEV support

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

# Note: This script uses sudo internally for privileged operations

# Start installation
log_installation_start "Flashbots MEV Prysm"


# Check system requirements
check_system_requirements 16 2000


# Install Bazel
log_info "Installing Bazel..."
if ! curl -fsSL https://bazel.build/bazel-release.pub.gpg | gpg --dearmor >bazel-archive-keyring.gpg; then
    log_error "Failed to download Bazel GPG key"
    exit 1
fi

sudo mv bazel-archive-keyring.gpg /usr/share/keyrings
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/bazel-archive-keyring.gpg] https://storage.googleapis.com/bazel-apt stable jdk1.8" | sudo tee /etc/apt/sources.list.d/bazel.list

# Bazel is installed centrally via install_dependencies.sh

# Create build directory
PRYSM_SRC_DIR="$HOME/prysm-src"
rm -rf "$PRYSM_SRC_DIR"
ensure_directory "$PRYSM_SRC_DIR"

cd "$PRYSM_SRC_DIR" || exit

# Clone and build Flashbots Prysm
log_info "Cloning Flashbots Prysm repository..."
if ! git clone --recurse-submodules https://github.com/flashbots/prysm.git; then
    log_error "Failed to clone Flashbots Prysm repository"
    exit 1
fi

cd prysm || exit
git pull

log_info "Building beacon chain..."
if ! bazel build //cmd/beacon-chain:beacon-chain --config=release; then
    log_error "Failed to build beacon chain"
    exit 1
fi

log_info "Building validator..."
if ! bazel build //cmd/validator:validator --config=release; then
    log_error "Failed to build validator"
    exit 1
fi

# Copy binaries to Prysm directory
PRYSM_DIR="$HOME/prysm"
ensure_directory "$PRYSM_DIR"

cp ./bazel-bin/cmd/validator/validator_/validator "$PRYSM_DIR/"
cp ./bazel-bin/cmd/beacon-chain/beacon-chain_/beacon-chain "$PRYSM_DIR/"

# Generate JWT secret
log_info "Generating JWT secret..."
if ! "$PRYSM_DIR/beacon-chain" generate-auth-secret; then
    log_error "Failed to generate JWT secret"
    exit 1
fi

ensure_directory "$HOME/secrets"
rm -f "$HOME/secrets/jwt.hex"
mv ./jwt.hex "$HOME/secrets/"

# Create systemd services using common functions
log_info "Creating systemd services..."

# Create beacon chain service
BEACON_EXEC_START="$PRYSM_DIR/beacon-chain --config-file=$PRYSM_DIR/prysm_beacon_conf.yaml"
create_systemd_service "cl" "Flashbots MEV Prysm Beacon Chain" "$BEACON_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Create validator service
VALIDATOR_EXEC_START="$PRYSM_DIR/validator --config-file=$PRYSM_DIR/prysm_validator_conf.yaml"
create_systemd_service "validator" "Flashbots MEV Prysm Validator" "$VALIDATOR_EXEC_START" "$(whoami)" "on-failure" "600" "5" "300" "network-online.target cl.service" "network-online.target"

# Enable and start services
enable_and_start_systemd_service "cl"
enable_and_start_systemd_service "validator"

# Show completion information
log_installation_complete "Flashbots MEV Prysm" "cl" "$PRYSM_DIR/prysm_beacon_conf.yaml" "$PRYSM_DIR"
log_info "Beacon chain binary: $PRYSM_DIR/beacon-chain"
log_info "Validator binary: $PRYSM_DIR/validator"
log_info "Configuration files: $PRYSM_DIR/prysm_*_conf.yaml"
