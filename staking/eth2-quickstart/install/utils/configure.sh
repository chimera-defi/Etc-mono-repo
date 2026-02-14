#!/bin/bash

# Configuration Wizard for Eth2 Quick Start
# Uses whiptail to prompt the user and generates configuration files
#
# This script generates:
# 1. config/user_config.env - User-specific settings
# 2. install_phase1.sh - Phase 1: System hardening (run as root)
# 3. install_phase2.sh - Phase 2: Client installation (run as new user)
#
# IMPORTANT: The two-phase model preserves the security paradigm from run_1.sh/run_2.sh

set -e

# =============================================================================
# SETUP
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../" && pwd)"

# Source common functions for logging (required - no fallback)
# shellcheck source=../../lib/common_functions.sh
source "$ROOT_DIR/lib/common_functions.sh"

# Configuration paths
CONFIG_DIR="$ROOT_DIR/config"
CONFIG_FILE="$CONFIG_DIR/user_config.env"
PHASE1_SCRIPT="$ROOT_DIR/install_phase1.sh"
PHASE2_SCRIPT="$ROOT_DIR/install_phase2.sh"

# Ensure config directory exists
mkdir -p "$CONFIG_DIR"

# =============================================================================
# ARGUMENT PARSING
# =============================================================================

VIBE_MODE=false
for arg in "$@"; do
    case "$arg" in
        --vibe)
            VIBE_MODE=true
            ;;
        --help|-h)
            echo ""
            echo "Eth2 Quick Start - Configuration Wizard"
            echo ""
            echo "Usage: ./configure.sh [options]"
            echo ""
            echo "Options:"
            echo "  --vibe    Non-interactive mode with sensible defaults"
            echo "  --help    Show this help message"
            echo ""
            exit 0
            ;;
    esac
done

# =============================================================================
# HARDWARE & WHIPTAIL HELPERS (from common_functions.sh)
# =============================================================================
# Uses: detect_hardware_profile(), get_recommended_clients() from common_functions.sh
# Uses: whiptail_msg(), whiptail_yesno() from common_functions.sh

# Convenience aliases for backward compatibility
show_msg() {
    whiptail_msg "Eth2 Quick Start" "$1"
}

show_yesno() {
    whiptail_yesno "Eth2 Quick Start" "$1"
}

# =============================================================================
# VIBE MODE (NON-INTERACTIVE DEFAULTS)
# =============================================================================

if [[ "$VIBE_MODE" == "true" ]]; then
    log_info "Running in vibe mode - using sensible defaults based on hardware..."
    
    HARDWARE_PROFILE=$(detect_hardware_profile)
    read -r REC_EXEC REC_CONS <<< "$(get_recommended_clients "$HARDWARE_PROFILE")"
    
    # Set defaults
    NETWORK="mainnet"
    EXEC_CLIENT="$REC_EXEC"
    CONS_CLIENT="$REC_CONS"
    MEV_CHOICE="mev-boost"
    FEE_RECIPIENT="0x0000000000000000000000000000000000000000"
    GRAFFITI="Eth2QuickStart"
    
    log_info "Hardware profile: $HARDWARE_PROFILE"
    log_info "Network: $NETWORK"
    log_info "Execution client: $EXEC_CLIENT"
    log_info "Consensus client: $CONS_CLIENT"
    log_info "MEV solution: $MEV_CHOICE"
    
else
    # =============================================================================
    # INTERACTIVE MODE (WHIPTAIL TUI)
    # =============================================================================
    
    # Check if whiptail is installed
    if ! command -v whiptail &>/dev/null; then
        log_error "Whiptail not found. Installing..."
        sudo apt-get update && sudo apt-get install -y whiptail
    fi
    
    # Welcome message
    whiptail --title "Eth2 Quick Start Wizard" --msgbox "Welcome to the Ethereum Node Setup Wizard.\n\nThis tool will guide you through configuring your node.\n\nIMPORTANT: Installation happens in TWO PHASES:\n  Phase 1: System hardening (as root, requires reboot)\n  Phase 2: Client installation (as new user)\n\nConfiguration will be saved to:\n  $CONFIG_FILE" 16 70
    
    # 1. Network Selection
    NETWORK=$(whiptail --title "Network Selection" --menu "Choose the Ethereum Network:" 15 60 2 \
        "mainnet" "Ethereum Mainnet (Real Value)" \
        "holesky" "Holesky Testnet (Testing)" 3>&1 1>&2 2>&3)
    if [[ $? -ne 0 ]]; then exit 0; fi
    
    # 2. Hardware Profile Detection
    HARDWARE_PROFILE=$(detect_hardware_profile)
    
    HARDWARE=$(whiptail --title "Hardware Profile" --menu "Detected: ${HARDWARE_PROFILE}-end system\n\nSelect your hardware profile:" 16 70 3 \
        "high" "High-End (32GB+ RAM, 2TB+ NVMe) - Best Performance" \
        "mid" "Mid-Range (16GB RAM, SSD) - Balanced" \
        "low" "Low-Resource (8GB RAM) - Efficiency First" \
        --default-item "$HARDWARE_PROFILE" 3>&1 1>&2 2>&3)
    if [[ $? -ne 0 ]]; then HARDWARE="$HARDWARE_PROFILE"; fi
    
    # Get recommended clients based on hardware
    read -r REC_EXEC REC_CONS <<< "$(get_recommended_clients "$HARDWARE")"
    
    # 3. Client Selection
    if show_yesno "Based on your hardware ($HARDWARE), we recommend:\n\nExecution: $REC_EXEC\nConsensus: $REC_CONS\n\nDo you want to use these defaults?"; then
        EXEC_CLIENT="$REC_EXEC"
        CONS_CLIENT="$REC_CONS"
    else
        # Manual execution client selection
        EXEC_CLIENT=$(whiptail --title "Execution Client" --menu "Select Execution Client:" 18 70 6 \
            "geth" "Geth (Go) - Stable, Popular" \
            "nethermind" "Nethermind (C#) - Enterprise Features" \
            "besu" "Besu (Java) - Enterprise, Modular" \
            "erigon" "Erigon (Go) - Archival/Fast Sync" \
            "reth" "Reth (Rust) - High Performance" \
            "nimbus_eth1" "Nimbus (Nim) - Lightweight" 3>&1 1>&2 2>&3)
        if [[ $? -ne 0 ]]; then EXEC_CLIENT="geth"; fi
        
        # Manual consensus client selection
        CONS_CLIENT=$(whiptail --title "Consensus Client" --menu "Select Consensus Client:" 18 70 6 \
            "prysm" "Prysm (Go) - Popular, User-Friendly" \
            "lighthouse" "Lighthouse (Rust) - Secure, Fast" \
            "teku" "Teku (Java) - Institutional Grade" \
            "nimbus" "Nimbus (Nim) - Lightweight" \
            "lodestar" "Lodestar (TypeScript) - JS Ecosystem" \
            "grandine" "Grandine (Rust) - Fast Sync (Beta)" 3>&1 1>&2 2>&3)
        if [[ $? -ne 0 ]]; then CONS_CLIENT="prysm"; fi
    fi
    
    # 4. MEV Selection
    MEV_CHOICE=$(whiptail --title "MEV Configuration" --menu "Select MEV Solution (for validator rewards):\n\nMEV-Boost is recommended for most users." 16 75 3 \
        "mev-boost" "MEV-Boost (RECOMMENDED) - Standard, Stable" \
        "commit-boost" "Commit-Boost (Advanced) - Modular, Experimental" \
        "none" "None - Skip MEV (Not Recommended)" 3>&1 1>&2 2>&3)
    if [[ $? -ne 0 ]]; then MEV_CHOICE="mev-boost"; fi
    
    # 5. Fee Recipient
    FEE_RECIPIENT=$(whiptail --title "Fee Recipient" --inputbox "Enter your ETH address for validator rewards:\n\n(This is where tips and MEV rewards will be sent)" 12 70 "0x0000000000000000000000000000000000000000" 3>&1 1>&2 2>&3)
    if [[ $? -ne 0 ]] || [[ -z "$FEE_RECIPIENT" ]]; then 
        FEE_RECIPIENT="0x0000000000000000000000000000000000000000"
    fi
    
    # 6. Graffiti
    GRAFFITI=$(whiptail --title "Graffiti" --inputbox "Enter your validator graffiti:\n\n(This public note appears on blocks you propose)" 12 70 "Eth2QuickStart" 3>&1 1>&2 2>&3)
    if [[ $? -ne 0 ]] || [[ -z "$GRAFFITI" ]]; then 
        GRAFFITI="Eth2QuickStart"
    fi
fi

# =============================================================================
# GENERATE USER CONFIGURATION
# =============================================================================

log_info "Generating user configuration..."

cat > "$CONFIG_FILE" << EOF
# Auto-generated by configure.sh on $(date)
# User Configuration for Eth2 Quick Start

# Network Selection
export ETH_NETWORK='$NETWORK'

# Your ETH address for validator rewards
export FEE_RECIPIENT='$FEE_RECIPIENT'

# Validator graffiti (shown on proposed blocks)
export GRAFITTI='$GRAFFITI'

# Selected Clients
export EXEC_CLIENT='$EXEC_CLIENT'
export CONS_CLIENT='$CONS_CLIENT'

# MEV Configuration
export MEV_SOLUTION='$MEV_CHOICE'
EOF

log_info "Configuration saved to: $CONFIG_FILE"

# =============================================================================
# GENERATE PHASE 1 SCRIPT (System Hardening)
# =============================================================================

log_info "Generating Phase 1 script (system hardening)..."

cat > "$PHASE1_SCRIPT" << 'PHASE1_EOF'
#!/bin/bash

# Eth2 Quick Start - Phase 1: System Hardening
# This script must be run as ROOT
#
# After this script completes:
# 1. REBOOT the system
# 2. SSH back in as the new user
# 3. Run install_phase2.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Source exports.sh for safety settings and configuration
# shellcheck source=exports.sh
source "$SCRIPT_DIR/exports.sh"

# Source common functions
# shellcheck source=lib/common_functions.sh
source "$SCRIPT_DIR/lib/common_functions.sh"

# Ensure running as root
require_root

echo ""
echo "=============================================="
echo "  Phase 1: System Hardening"
echo "=============================================="
echo ""

log_info "Running Phase 1 - System hardening and user setup..."
log_info "This will:"
log_info "  - Update system packages"
log_info "  - Configure SSH security"
log_info "  - Create secure user account"
log_info "  - Setup firewall and intrusion detection"
echo ""

# Run the main security setup script
if ! "$SCRIPT_DIR/run_1.sh"; then
    log_error "Phase 1 failed. Please check the output above."
    exit 1
fi

echo ""
echo "=============================================="
echo "  Phase 1 Complete!"
echo "=============================================="
echo ""
log_warn "⚠️  IMPORTANT: You MUST reboot now!"
echo ""
echo "Next steps:"
echo "  1. Note the SSH credentials shown above"
echo "  2. Reboot: sudo reboot"
echo "  3. SSH back in as the NEW user"
echo "  4. Run: cd \$(pwd) && ./install_phase2.sh"
echo ""
log_error "Do NOT skip the reboot - security changes require it!"
echo ""
PHASE1_EOF

chmod +x "$PHASE1_SCRIPT"
log_info "Phase 1 script created: $PHASE1_SCRIPT"

# =============================================================================
# GENERATE PHASE 2 SCRIPT (Client Installation)
# =============================================================================

log_info "Generating Phase 2 script (client installation)..."

cat > "$PHASE2_SCRIPT" << PHASE2_EOF
#!/bin/bash

# Eth2 Quick Start - Phase 2: Client Installation
# This script must be run as the NEW USER (not root)
#
# Prerequisites:
# 1. Phase 1 completed successfully
# 2. System has been rebooted
# 3. You are logged in as the new user

SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
cd "\$SCRIPT_DIR"

# Source exports.sh for safety settings and configuration
# shellcheck source=exports.sh
source "\$SCRIPT_DIR/exports.sh"

# Source common functions
# shellcheck source=lib/common_functions.sh
source "\$SCRIPT_DIR/lib/common_functions.sh"

# Source user configuration (overrides exports.sh defaults)
# shellcheck source=config/user_config.env
if [[ -f "\$SCRIPT_DIR/config/user_config.env" ]]; then
    source "\$SCRIPT_DIR/config/user_config.env"
fi

echo ""
echo "=============================================="
echo "  Phase 2: Client Installation"
echo "=============================================="
echo ""

# Verify NOT running as root
if [[ \$EUID -eq 0 ]]; then
    log_error "This script must NOT be run as root!"
    log_error "Please login as the new user created in Phase 1."
    echo ""
    echo "If you just rebooted, SSH in as the new user:"
    echo "  ssh <username>@<server-ip>"
    echo ""
    exit 1
fi

log_info "Running Phase 2 - Client installation..."
log_info "Configuration:"
log_info "  Network: \${ETH_NETWORK:-mainnet}"
log_info "  Execution: $EXEC_CLIENT"
log_info "  Consensus: $CONS_CLIENT"
log_info "  MEV: $MEV_CHOICE"
echo ""

# Install execution client
log_info "Installing execution client: $EXEC_CLIENT..."
if ! "\$SCRIPT_DIR/install/execution/${EXEC_CLIENT}.sh"; then
    log_error "Failed to install execution client: $EXEC_CLIENT"
    exit 1
fi
log_info "Execution client installed successfully!"

# Install consensus client
log_info "Installing consensus client: $CONS_CLIENT..."
if ! "\$SCRIPT_DIR/install/consensus/${CONS_CLIENT}.sh"; then
    log_error "Failed to install consensus client: $CONS_CLIENT"
    exit 1
fi
log_info "Consensus client installed successfully!"

# Install MEV solution
case "$MEV_CHOICE" in
    "mev-boost")
        log_info "Installing MEV-Boost..."
        if ! "\$SCRIPT_DIR/install/mev/install_mev_boost.sh"; then
            log_warn "MEV-Boost installation failed (optional component)"
        else
            log_info "MEV-Boost installed successfully!"
        fi
        ;;
    "commit-boost")
        log_info "Installing Commit-Boost..."
        if ! "\$SCRIPT_DIR/install/mev/install_commit_boost.sh"; then
            log_warn "Commit-Boost installation failed (optional component)"
        else
            log_info "Commit-Boost installed successfully!"
        fi
        ;;
    "none")
        log_info "Skipping MEV installation as configured."
        ;;
esac

# Run health check if available
if [[ -x "\$SCRIPT_DIR/install/utils/doctor.sh" ]]; then
    echo ""
    log_info "Running health check..."
    "\$SCRIPT_DIR/install/utils/doctor.sh" || true
fi

echo ""
echo "=============================================="
echo "  Phase 2 Complete!"
echo "=============================================="
echo ""
log_info "Your Ethereum node is now installed!"
echo ""
echo "Installed components:"
echo "  - Execution: $EXEC_CLIENT"
echo "  - Consensus: $CONS_CLIENT"
echo "  - MEV: $MEV_CHOICE"
echo ""
echo "Next steps:"
echo "  1. Start the execution client: sudo systemctl start eth1"
echo "  2. Start the consensus client: sudo systemctl start cl"
echo "  3. Monitor logs: sudo journalctl -fu eth1 -fu cl"
echo ""
echo "For SSL/RPC setup, see: ./install/ssl/install_acme_ssl.sh"
echo ""
PHASE2_EOF

chmod +x "$PHASE2_SCRIPT"
log_info "Phase 2 script created: $PHASE2_SCRIPT"

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "=============================================="
echo "  Configuration Complete!"
echo "=============================================="
echo ""
log_info "Generated files:"
echo "  - $CONFIG_FILE"
echo "  - $PHASE1_SCRIPT"
echo "  - $PHASE2_SCRIPT"
echo ""
echo "Your configuration:"
echo "  Network:    $NETWORK"
echo "  Execution:  $EXEC_CLIENT"
echo "  Consensus:  $CONS_CLIENT"
echo "  MEV:        $MEV_CHOICE"
echo "  Graffiti:   $GRAFFITI"
echo ""

if [[ "$VIBE_MODE" != "true" ]]; then
    # Interactive confirmation
    if show_yesno "Configuration complete!\n\nWould you like to run Phase 1 now?\n\n(This will start system hardening)"; then
        clear
        log_info "Starting Phase 1..."
        exec "$PHASE1_SCRIPT"
    else
        clear
        echo ""
        log_info "Setup complete. Run Phase 1 when ready:"
        echo ""
        echo "  cd $ROOT_DIR"
        echo "  sudo ./install_phase1.sh"
        echo ""
    fi
fi
