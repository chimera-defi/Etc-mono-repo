#!/bin/bash

# Eth2 Quick Start - One-Liner Bootstrap Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/chimera-defi/eth2-quickstart/master/install.sh | sudo bash
#
# This script bootstraps the Eth2 Quick Start installation by:
# 1. Checking prerequisites (root, git)
# 2. Cloning/updating the repository
# 3. Launching the configuration wizard
#
# IMPORTANT: This is a bootstrap script that runs BEFORE the repo is cloned,
# so it defines colors locally. After cloning, it sources common_functions.sh.

set -e

# =============================================================================
# BOOTSTRAP COLORS (defined locally because this runs before repo is cloned)
# =============================================================================
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Bootstrap logging (before common_functions.sh is available)
bootstrap_log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

bootstrap_log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

bootstrap_log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# CONFIGURATION
# =============================================================================
REPO_URL="https://github.com/chimera-defi/eth2-quickstart.git"
INSTALL_DIR="${ETH2_INSTALL_DIR:-$HOME/.eth2-quickstart}"
BRANCH="${ETH2_BRANCH:-master}"

# =============================================================================
# MAIN BOOTSTRAP LOGIC
# =============================================================================

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}       Eth2 Quick Start - One-Liner Setup         ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""

# Display the TWO-PHASE security model
echo -e "${YELLOW}==================================================${NC}"
echo -e "${YELLOW}  ⚠️  IMPORTANT: TWO-PHASE SECURITY MODEL  ⚠️     ${NC}"
echo -e "${YELLOW}==================================================${NC}"
echo ""
echo "This installation follows a secure TWO-PHASE process:"
echo ""
echo -e "  ${BLUE}Phase 1${NC} (as root):"
echo "    - System hardening (SSH, firewall, intrusion detection)"
echo "    - Creates secure user account"
echo -e "    - ${RED}REQUIRES REBOOT${NC} after completion"
echo ""
echo -e "  ${BLUE}Phase 2${NC} (as new user, after reboot):"
echo "    - Ethereum client installation"
echo "    - MEV solution setup"
echo "    - Final security validation"
echo ""
echo -e "${RED}You MUST reboot between phases to verify SSH access.${NC}"
echo ""

# Check if running as root
bootstrap_log_info "Checking system requirements..."
if [[ "$(id -u)" -ne 0 ]]; then
    bootstrap_log_error "This script must be run as root to setup the initial environment."
    echo ""
    echo "Please run: sudo bash -c 'curl -fsSL https://raw.githubusercontent.com/chimera-defi/eth2-quickstart/master/install.sh | bash'"
    echo ""
    exit 1
fi

# Check for required commands
for cmd in curl wget; do
    if command -v "$cmd" &>/dev/null; then
        bootstrap_log_info "Found $cmd"
        break
    fi
done

# Install git if not present
if ! command -v git &>/dev/null; then
    bootstrap_log_info "Installing git..."
    apt-get update && apt-get install -y git
fi

# Install whiptail for TUI wizard
if ! command -v whiptail &>/dev/null; then
    bootstrap_log_info "Installing whiptail for configuration wizard..."
    apt-get update && apt-get install -y whiptail
fi

# Clone or update repository
if [[ -d "$INSTALL_DIR" ]]; then
    bootstrap_log_info "Updating existing repository at $INSTALL_DIR..."
    cd "$INSTALL_DIR"
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
else
    bootstrap_log_info "Cloning repository to $INSTALL_DIR..."
    git clone -b "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

bootstrap_log_info "Repository ready at $INSTALL_DIR"

# =============================================================================
# HANDOVER TO WIZARD (now we can use common_functions.sh)
# =============================================================================

# Source common_functions.sh for better logging
# shellcheck source=/dev/null
if [[ -f "$INSTALL_DIR/lib/common_functions.sh" ]]; then
    source "$INSTALL_DIR/lib/common_functions.sh"
fi

log_info "Starting configuration wizard..."
echo ""

# Make scripts executable
chmod +x "$INSTALL_DIR/install/utils/configure.sh"
chmod +x "$INSTALL_DIR/run_1.sh"
chmod +x "$INSTALL_DIR/run_2.sh"

# Check for vibe mode (non-interactive)
VIBE_MODE=false
for arg in "$@"; do
    case "$arg" in
        --vibe)
            VIBE_MODE=true
            ;;
        --help|-h)
            echo ""
            echo "Eth2 Quick Start - One-Liner Installer"
            echo ""
            echo "Usage:"
            echo "  curl -fsSL https://.../install.sh | sudo bash"
            echo "  curl -fsSL https://.../install.sh | sudo bash -s -- --vibe"
            echo ""
            echo "Options:"
            echo "  --vibe    Non-interactive mode with sensible defaults"
            echo "  --help    Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  ETH2_INSTALL_DIR    Installation directory (default: \$HOME/.eth2-quickstart)"
            echo "  ETH2_BRANCH         Git branch to use (default: master)"
            echo ""
            exit 0
            ;;
    esac
done

# Launch the configuration wizard
if [[ "$VIBE_MODE" == "true" ]]; then
    log_info "Running in vibe mode (non-interactive defaults)..."
    "$INSTALL_DIR/install/utils/configure.sh" --vibe
else
    "$INSTALL_DIR/install/utils/configure.sh"
fi

# Display next steps
echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  Configuration Complete!                          ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo "Generated scripts are ready in: $INSTALL_DIR"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "  1. Run Phase 1 (as root):"
echo -e "     ${BLUE}cd $INSTALL_DIR && ./install_phase1.sh${NC}"
echo ""
echo "  2. REBOOT the system:"
echo -e "     ${BLUE}sudo reboot${NC}"
echo ""
echo "  3. SSH back in as the new user and run Phase 2:"
echo -e "     ${BLUE}cd $INSTALL_DIR && ./install_phase2.sh${NC}"
echo ""
echo -e "${RED}⚠️  Do NOT skip the reboot - it verifies your SSH access!${NC}"
echo ""
