#!/bin/bash

# ETHGas Installation Script  
# ETHGas is a preconfirmation protocol module for Commit-Boost
# Enables validators to sell preconfirmations (precons) for additional revenue
# REQUIRES: Commit-Boost must be installed first

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

log_installation_start "ETHGas"

# Check system requirements
check_system_requirements 8 2000

# ============================================================================
# DEPENDENCY VERIFICATION
# ============================================================================

# Verify Commit-Boost is installed (REQUIRED)
if [[ ! -d "$HOME/commit-boost" ]]; then
    log_error "Commit-Boost is not installed. ETHGas requires Commit-Boost."
    log_error "Please run ./install/mev/install_commit_boost.sh first"
    exit 1
fi

# Verify Commit-Boost services exist
if ! systemctl list-unit-files | grep -q "commit-boost-pbs.service"; then
    log_error "Commit-Boost PBS service not found. Please install Commit-Boost first."
    exit 1
fi

log_info "✓ Commit-Boost dependency verified"

# Verify Rust is available (installed centrally via install_dependencies.sh)
[[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env"

if ! command -v cargo &> /dev/null; then
    log_error "Rust/Cargo not found. Please run install_dependencies.sh first."
    log_error "Or run: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"
    exit 1
fi

log_info "✓ Using Rust: $(rustc --version)"

# ============================================================================
# INSTALLATION
# ============================================================================

# Setup firewall rules for ETHGas
setup_firewall_rules "$ETHGAS_PORT"

# Create ETHGas directory
ETHGAS_DIR="$HOME/ethgas"
ensure_directory "$ETHGAS_DIR"

cd "$ETHGAS_DIR" || exit

# Clone ETHGas repository
log_info "Cloning ETHGas repository..."
if [[ -d ".git" ]]; then
    log_info "Updating existing ETHGas repository..."
    git fetch origin
    git checkout main
    git pull origin main
else
    if ! git clone https://github.com/ethgas-developer/ethgas-preconf-commit-boost-module.git .; then
        log_error "Failed to clone ETHGas repository"
        exit 1
    fi
fi

# Get the latest stable release tag
log_info "Fetching latest ETHGas release..."
LATEST_TAG=$(git describe --tags "$(git rev-list --tags --max-count=1)" 2>/dev/null || echo "main")
if [[ "$LATEST_TAG" != "main" ]]; then
    log_info "Checking out version: $LATEST_TAG"
    git checkout "$LATEST_TAG"
else
    log_warn "No stable release tag found, using main branch"
fi

# Build ETHGas binary
log_info "Building ETHGas binary... This may take 2-5 minutes."
log_info "Building: ethgas_commit"

if ! cargo build --release --bin ethgas_commit; then
    log_error "Failed to build ETHGas binary"
    log_error "Please check your Rust installation and build logs above"
    exit 1
fi

# Verify binary was created
if [[ ! -f "$ETHGAS_DIR/target/release/ethgas_commit" ]]; then
    log_error "ETHGas binary not found at $ETHGAS_DIR/target/release/ethgas_commit"
    exit 1
fi

log_info "✓ ETHGas binary built successfully"

# Make binary executable (should already be, but explicit is better)
chmod +x "$ETHGAS_DIR/target/release/ethgas_commit"

# ============================================================================
# CONFIGURATION
# ============================================================================

# Ensure JWT secret exists
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# Create configuration directory
CONFIG_DIR="$ETHGAS_DIR/config"
ensure_directory "$CONFIG_DIR"

# Create ETHGas configuration file
log_info "Creating ETHGas configuration..."
cat > "$CONFIG_DIR/ethgas.toml" << EOF
# ETHGas Preconfirmation Protocol Configuration
# Generated on $(date)

[chain]
# Ethereum chain configuration
chain = "$ETHGAS_NETWORK"

# Beacon node connection (via Commit-Boost)
beacon_node_url = "http://$COMMIT_BOOST_HOST:$COMMIT_BOOST_PORT"

[signer]
# Signer configuration
# ETHGas uses Commit-Boost's signer module
signer_url = "http://$COMMIT_BOOST_HOST:$((COMMIT_BOOST_PORT + 1))"
jwt_secret = "$HOME/secrets/jwt.hex"

[ethgas]
# ETHGas-specific configuration

# ETHGas Exchange API endpoint
api_endpoint = "$ETHGAS_API_ENDPOINT"

# Collateral contract address (network-specific)
collateral_contract = "$ETHGAS_COLLATERAL_CONTRACT"

# Registration mode: 'standard', 'ssv', 'obol', or 'skip'
registration_mode = "$ETHGAS_REGISTRATION_MODE"

# Fee recipient for preconfirmation rewards
fee_recipient = "$FEE_RECIPIENT"

# Minimum preconfirmation value (in wei)
min_preconf_value = "$ETHGAS_MIN_PRECONF_VALUE"

# Enable/disable registration
enable_registration = true

# Collateral per slot (ETH)
# Must be 0 or between 0.01 to 1000 inclusive, max 2 decimal places
collateral_per_slot = 0.1

# Wait interval between module runs (seconds)
# Set to 0 to run once and exit
overall_wait_interval_in_second = 60

[logging]
# Logging configuration
level = "info"

[metrics]
# Metrics configuration
enabled = true
port = $ETHGAS_METRICS_PORT
address = "$ETHGAS_HOST"
EOF

log_info "Configuration file created at: $CONFIG_DIR/ethgas.toml"

# ============================================================================
# SYSTEMD SERVICE
# ============================================================================

# Create systemd service for ETHGas
log_info "Creating systemd service..."

# Set environment variables for the service
ETHGAS_EXEC_START="$ETHGAS_DIR/target/release/ethgas_commit --config $CONFIG_DIR/ethgas.toml"

# Create service with dependency on Commit-Boost
create_systemd_service "ethgas" "ETHGas Preconfirmation Protocol" "$ETHGAS_EXEC_START" "$(whoami)" "always" "600" "5" "300" "network-online.target commit-boost-pbs.service commit-boost-signer.service" "network-online.target commit-boost-pbs.service commit-boost-signer.service"

# Add environment variables to service file
sudo tee -a /etc/systemd/system/ethgas.service > /dev/null << EOF

# ETHGas environment variables
Environment="CB_SIGNER_URL=http://$COMMIT_BOOST_HOST:$((COMMIT_BOOST_PORT + 1))"
Environment="CB_CONFIG=$CONFIG_DIR/ethgas.toml"
Environment="RUST_LOG=info"
EOF

# Reload systemd to pick up environment changes
sudo systemctl daemon-reload

# Enable and start the service
enable_and_start_systemd_service "ethgas"

# ============================================================================
# COMPLETION
# ============================================================================

log_installation_complete "ETHGas" "ethgas" "$CONFIG_DIR/ethgas.toml" "$ETHGAS_DIR"

# Display setup information
cat << EOF

=== ETHGas Setup Information ===

ETHGas has been installed with the following configuration:

Installation Directory: $ETHGAS_DIR
Binary: $ETHGAS_DIR/target/release/ethgas_commit
Configuration: $CONFIG_DIR/ethgas.toml
Network: $ETHGAS_NETWORK
Collateral Contract: $ETHGAS_COLLATERAL_CONTRACT

Key Features:
- Preconfirmation (precon) protocol for real-time transactions
- ETHGas Exchange integration for buying/selling precons
- Collateral-based security model
- Support for standard, SSV, and Obol validators
- Audited by Sigma Prime

Service Management:
- Start:  sudo systemctl start ethgas
- Stop:   sudo systemctl stop ethgas
- Status: sudo systemctl status ethgas
- Logs:   journalctl -u ethgas -f

Dependencies (REQUIRED):
- ✓ Commit-Boost PBS:    systemctl status commit-boost-pbs
- ✓ Commit-Boost Signer: systemctl status commit-boost-signer

Verification:
- Check service: sudo systemctl status ethgas
- Check logs:    journalctl -u ethgas -n 50
- Check metrics: curl http://$ETHGAS_HOST:$ETHGAS_METRICS_PORT/metrics

⚠️  IMPORTANT NOTES:

1. **ETHGas requires Commit-Boost** to be running
   - PBS module must be active: sudo systemctl status commit-boost-pbs
   - Signer module must be active: sudo systemctl status commit-boost-signer

2. **Collateral Contract**
   - Mainnet: $ETHGAS_COLLATERAL_CONTRACT_MAINNET
   - Holesky:  $ETHGAS_COLLATERAL_CONTRACT_HOLESKY
   - Current:  $ETHGAS_COLLATERAL_CONTRACT
   - You must deposit collateral to participate

3. **Registration Mode: $ETHGAS_REGISTRATION_MODE**
   - standard: Most typical validators
   - ssv: SSV validators (requires additional config)
   - obol: Obol validators  
   - skip: Skip registration

4. **Validator Keys**
   - ETHGas uses Commit-Boost signer for validator key management
   - Ensure your validator keys are properly configured in Commit-Boost

5. **Consensus Client Configuration**
   - Your consensus client should point to Commit-Boost PBS:
   - Endpoint: http://$COMMIT_BOOST_HOST:$COMMIT_BOOST_PORT

Next Steps:
1. Deposit collateral to contract (if not already done)
   - Visit: https://app.ethgas.com/my-portfolio/accounts
2. Verify Commit-Boost is running: sudo systemctl status commit-boost-pbs
3. Check ETHGas service: sudo systemctl status ethgas
4. Monitor logs: journalctl -u ethgas -f
5. Verify registration: Check logs for "registration successful"

For more information:
- Documentation: https://docs.ethgas.com/
- API Documentation: https://developers.ethgas.com/
- Repository: https://github.com/ethgas-developer/ethgas-preconf-commit-boost-module
- Twitter: https://x.com/ETHGASofficial

EOF
