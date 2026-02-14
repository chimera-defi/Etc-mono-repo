#!/bin/bash

# System Setup Script - Phase 2
# This script should be run as the non-root user
# It will install:
# 1. Geth
# 2. Prysm
# 3. Flashbots mev boost builder
# 4. Nginx without SSL, exposing the geth RPC route. 
#    (You can run `service nginx stop` to disable this)
# Note: External ETH1 RPC calls expect SSL so you will have to 
#       manually run: `sudo su`
#       Followed by: 
#       `./install/ssl/install_acme_ssl.sh`  or 
#       `./install_certbot_ssl.sh` 
#       to get SSL certs and configure NGINX properly
#
# Non-interactive (for CI/testing):
#   ./run_2.sh --execution=geth --consensus=prysm --mev=mev-boost
#   ./run_2.sh --execution=besu --consensus=lighthouse --mev=none --skip-deps

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" || exit 1
source ./exports.sh
source ./lib/common_functions.sh

# Parse flags for non-interactive mode
EXECUTION_CLIENT=""
CONSENSUS_CLIENT=""
MEV_FLAG=""
SKIP_DEPS=false
for arg in "$@"; do
    case "$arg" in
        --execution=*)
            EXECUTION_CLIENT="${arg#*=}"
            ;;
        --consensus=*)
            CONSENSUS_CLIENT="${arg#*=}"
            ;;
        --mev=*)
            MEV_FLAG="${arg#*=}"
            ;;
        --skip-deps)
            SKIP_DEPS=true
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --execution=NAME   Install execution client (geth, besu, erigon, nethermind, nimbus_eth1, reth, ethrex)"
            echo "  --consensus=NAME   Install consensus client (prysm, lighthouse, lodestar, teku, nimbus, grandine)"
            echo "  --mev=NAME         Install MEV (mev-boost, commit-boost, none)"
            echo "  --skip-deps        Skip install_dependencies.sh (for CI when deps already installed)"
            echo "  --help             Show this help"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Interactive mode"
            echo "  $0 --execution=geth --consensus=prysm --mev=mev-boost"
            echo "  $0 --execution=besu --consensus=teku --mev=none --skip-deps"
            exit 0
            ;;
    esac
done
FLAGS_MODE=false
[[ -n "$EXECUTION_CLIENT" || -n "$CONSENSUS_CLIENT" || -n "$MEV_FLAG" ]] && FLAGS_MODE=true

# Check if running as correct user (non-root)
check_user "$LOGIN_UNAME"

log_info "Starting system setup - Phase 2..."

# Check system compatibility first
if ! check_system_compatibility; then
    log_error "System compatibility check failed"
    exit 1
fi
log_info "This script will install Ethereum clients and services"

# Start syncing prysm and geth
# Geth takes a day
# prysm takes 3-5. few hrs w/ the checkpt
# Slightly faster via the screen cmds

# You may want to run a different cmd via screen for more flexibility and faster sync
# screen -d -m  geth --syncmode snap --http --http.addr 127.0.0.1 --cache=16384 --ipcdisable --maxpeers 500 --lightkdf --v5disc
# cd prysm
# screen -d -m ./prysm.sh beacon-chain --p2p-host-ip=$(curl -s v4.ident.me) --config-file=./prysm_conf_beacon_sync.yaml
#  ./prysm.sh beacon-chain --checkpoint-block=$PWD/block_mainnet_altair_4620512-0xef9957e6a709223202ab00f4ee2435e1d42042ad35e160563015340df677feb0.ssz --checkpoint-state=$PWD/state_mainnet_altair_4620512-0xc1397f57149c99b3a2166d422a2ee50602e2a2c7da2e31d7ea740216b8fd99ab.ssz --genesis-state=$PWD/genesis.ssz --config-file=$PWD/prysm_beacon_conf.yaml --p2p-host-ip=88.99.65.230
# Install all dependencies centrally (unless --skip-deps)
if [[ "$SKIP_DEPS" != "true" ]]; then
    log_info "Installing all system dependencies..."
    if ! ./install/utils/install_dependencies.sh; then
        log_error "Failed to install dependencies"
        exit 1
    fi
fi

# Non-interactive path: install specified clients via flags
if [[ "$FLAGS_MODE" == "true" ]]; then
    FAILED=0
    if [[ -n "$EXECUTION_CLIENT" ]]; then
        case "$EXECUTION_CLIENT" in
            geth|besu|erigon|nethermind|nimbus_eth1|reth|ethrex)
                run_install_script "install/execution/${EXECUTION_CLIENT}.sh" "$EXECUTION_CLIENT" || FAILED=1
                ;;
            *)
                log_error "Unknown execution client: $EXECUTION_CLIENT"
                exit 1
                ;;
        esac
    fi
    if [[ -n "$CONSENSUS_CLIENT" ]]; then
        case "$CONSENSUS_CLIENT" in
            prysm|lighthouse|lodestar|teku|nimbus|grandine)
                run_install_script "install/consensus/${CONSENSUS_CLIENT}.sh" "$CONSENSUS_CLIENT" || FAILED=1
                ;;
            *)
                log_error "Unknown consensus client: $CONSENSUS_CLIENT"
                exit 1
                ;;
        esac
    fi
    if [[ -n "$MEV_FLAG" && "$MEV_FLAG" != "none" ]]; then
        case "$MEV_FLAG" in
            mev-boost)
                run_install_script "install/mev/install_mev_boost.sh" "MEV-Boost" || FAILED=1
                ;;
            commit-boost)
                run_install_script "install/mev/install_commit_boost.sh" "Commit-Boost" || FAILED=1
                ;;
            *)
                log_error "Unknown MEV: $MEV_FLAG (use mev-boost, commit-boost, or none)"
                exit 1
                ;;
        esac
    fi
    if [[ $FAILED -eq 1 ]]; then
        exit 1
    fi
    log_info "Flag-based installation complete."
    # Skip to next steps / security validation
else
# Interactive path
# MEV Solution Selection (Step 1: Base MEV)
log_info "=== MEV Solution Selection ==="
echo
echo "⚠️  IMPORTANT: Choose ONE MEV solution (mutually exclusive):"
echo ""
echo "1. MEV-Boost (RECOMMENDED - stable, production-proven)"
echo "   → Standard MEV extraction via relays"
echo "   → Battle-tested by thousands of validators"
echo "   → Simple, reliable architecture"
echo ""
echo "2. Commit-Boost (EXPERIMENTAL - for advanced users)"
echo "   → Replaces MEV-Boost with modular architecture"
echo "   → MEV-Boost compatible + additional protocols"
echo "   → Support for preconfirmations, inclusion lists"
echo "   → Option to add ETHGas preconfirmation protocol"
echo ""
echo "3. Skip MEV installation (install later manually)"
echo ""
read -r -p "Select MEV option (1-3): " mev_choice
if ! validate_menu_choice "$mev_choice" 3; then
    log_warn "Invalid choice. Defaulting to MEV-Boost"
    mev_choice=1
fi

# Store base MEV choice
MEV_SELECTED="none"
ETHGAS_SELECTED=false

case "$mev_choice" in
    1)
        MEV_SELECTED="mev-boost"
        log_info "Selected: MEV-Boost (recommended)"
        ;;
    2)
        MEV_SELECTED="commit-boost"
        log_info "Selected: Commit-Boost (experimental)"
        
        # Step 2: ETHGas Add-on (only if Commit-Boost selected)
        echo ""
        log_info "=== ETHGas Add-on (Optional) ==="
        echo ""
        echo "ETHGas is a preconfirmation protocol that runs on Commit-Boost."
        echo "It enables validators to sell preconfirmations for additional revenue."
        echo ""
        echo "Requirements:"
        echo "  • Collateral deposit to ETHGas contract"
        echo "  • Rust build environment (5-10 minutes compile time)"
        echo "  • Additional configuration"
        echo ""
        read -r -p "Install ETHGas with Commit-Boost? (y/n): " ethgas_choice
        
        if [[ "$ethgas_choice" =~ ^[Yy]$ ]]; then
            ETHGAS_SELECTED=true
            log_info "ETHGas will be installed with Commit-Boost"
        else
            log_info "ETHGas will not be installed (can add later)"
        fi
        ;;
    3)
        MEV_SELECTED="none"
        log_info "MEV installation will be skipped"
        ;;
esac

# Client selection and installation
log_info "Starting client selection process..."
log_info "You can choose your clients interactively or use the default setup"

# Ask user if they want to use interactive selection
echo
echo "Would you like to:"
echo "1. Use interactive client selection (recommended)"
echo "2. Use default setup (Geth + Prysm + Selected MEV)"
echo
read -r -p "Select option (1/2): " client_choice
if ! validate_menu_choice "$client_choice" 2; then
    log_error "Invalid choice. Please select 1 or 2."
    exit 1
fi

# Function to install default clients (reduces code duplication)
install_default_clients() {
    log_info "Installing default clients (Geth + Prysm + Selected MEV)..."
    
    log_info "Installing Geth..."
    if ! ./install/execution/geth.sh; then
        log_error "Failed to install Geth"
        return 1
    fi

    log_info "Installing Prysm..."
    if ! ./install/consensus/prysm.sh; then
        log_error "Failed to install Prysm"
        return 1
    fi

    # Install selected MEV solution
    if ! install_mev_solution "$MEV_SELECTED" "$ETHGAS_SELECTED"; then
        log_error "Failed to install MEV solution"
        return 1
    fi

    log_info "All default Ethereum clients installed successfully!"
    if [[ "$ETHGAS_SELECTED" == "true" ]]; then
        log_info "Installed: Geth, Prysm, Commit-Boost, ETHGas"
    else
        log_info "Installed: Geth, Prysm, $MEV_SELECTED"
    fi
    
    return 0
}

# Function to install selected MEV solution
install_mev_solution() {
    local mev_type="$1"
    local install_ethgas="$2"
    
    case "$mev_type" in
        "mev-boost")
            log_info "Installing MEV-Boost..."
            if ! ./install/mev/install_mev_boost.sh; then
                log_error "Failed to install MEV-Boost"
                return 1
            fi
            log_info "✓ MEV-Boost installed successfully"
            ;;
            
        "commit-boost")
            log_info "Installing Commit-Boost..."
            if ! ./install/mev/install_commit_boost.sh; then
                log_error "Failed to install Commit-Boost"
                return 1
            fi
            log_info "✓ Commit-Boost installed successfully"
            
            # Install ETHGas if selected
            if [[ "$install_ethgas" == "true" ]]; then
                echo ""
                log_info "Installing ETHGas add-on..."
                log_warn "Building from Rust source (5-10 minutes)..."
                
                if ! ./install/mev/install_ethgas.sh; then
                    log_error "Failed to install ETHGas"
                    log_warn "Commit-Boost is still installed and functional"
                    return 1
                fi
                
                log_info "✓ ETHGas installed successfully"
                echo ""
                log_warn "⚠️  IMPORTANT: ETHGas Configuration Required"
                log_warn "1. Deposit collateral to ETHGas contract:"
                log_warn "   → Visit: https://app.ethgas.com/my-portfolio/accounts"
                log_warn "2. Configure your validator keys in Commit-Boost"
                log_warn "3. Review ETHGas config: ~/ethgas/config/ethgas.toml"
            fi
            ;;
            
        "none")
            log_info "Skipping MEV installation as requested"
            ;;
            
        *)
            log_error "Unknown MEV type: $mev_type"
            return 1
            ;;
    esac
    
    return 0
}

case "$client_choice" in
    1)
        log_info "Starting interactive client selection..."
        ./install/utils/select_clients.sh
        
        # Install selected MEV solution
        if [[ "$MEV_SELECTED" != "none" ]]; then
            echo
            log_info "=== Installing Selected MEV Solution ==="
            install_mev_solution "$MEV_SELECTED" "$ETHGAS_SELECTED"
        fi
        
        log_info "Please run the recommended install scripts from the client selection tool"
        log_info "Example: ./install/execution/geth.sh && ./install/consensus/prysm.sh"
        ;;
    2)
        if ! install_default_clients; then
            log_error "Failed to install default clients"
            exit 1
        fi
        ;;
    *)
        log_error "Invalid selection. Using default setup..."
        if ! install_default_clients; then
            log_error "Failed to install default clients"
            exit 1
        fi
        ;;
esac
fi

# Security hardening already applied in run_1.sh
log_info "Security hardening already applied in run_1.sh"

# Display next steps
cat << EOF

=== Next Steps ===

To expose your own uncensored geth RPC proxy for use, install nginx with SSL:

1. Switch to super user: sudo su
2. Run one of the following SSL setup commands:
   - ./install/ssl/install_acme_ssl.sh (Preferred - uses acme.sh)
   - ./install/ssl/install_ssl_certbot.sh (uses certbot with manual DNS verification)

If you are new to NGINX, strongly recommend running only './install/web/install_nginx.sh' first 
and confirming it works without SSL, locally, then remotely via your domain name.

Next step is to start syncing via:
- sudo systemctl start eth1
- Or try: ./install/utils/start.sh

=== Security Features Enabled ===
- File integrity monitoring (AIDE) - runs daily at 2 AM
- Security monitoring - runs every 15 minutes
- Network security restrictions applied
- Configuration files secured with proper permissions
- Firewall rules configured for all client ports

To verify security setup, run: ./install/security/test_security_fixes.sh

=== Running Security Validation ===

EOF

# Run security validation (skip in CI E2E - run_1 not executed, security_monitor absent)
SECURITY_VALIDATION_FAILED=0
if [[ "${CI_E2E:-}" != "true" ]]; then
    log_info "Running security validation..."
    if [[ -f "docs/validate_security_safe.sh" && -x "docs/validate_security_safe.sh" ]]; then
        log_info "Running code quality validation..."
        if ! ./docs/validate_security_safe.sh; then
            log_error "Security code validation failed"
            SECURITY_VALIDATION_FAILED=1
        fi
    else
        log_warn "Security validation script not found"
    fi

    if [[ -f "docs/server_security_validation.sh" && -x "docs/server_security_validation.sh" ]]; then
        log_info "Running server security validation..."
        if ! ./docs/server_security_validation.sh; then
            log_error "Server security validation failed"
            SECURITY_VALIDATION_FAILED=1
        fi
    else
        log_warn "Server security validation script not found"
    fi

    if [[ $SECURITY_VALIDATION_FAILED -eq 1 ]]; then
        log_error "Security validation failed - fix errors above"
        exit 1
    fi
    log_info "Security validation completed."
else
    log_info "CI E2E: skipping security validation (run_1 not executed)"
fi
