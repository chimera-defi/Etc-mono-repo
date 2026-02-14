#!/bin/bash

# Centralized Dependency Installation Script
# Single source of truth for all apt packages
#
# Usage:
#   ./install_dependencies.sh          # Full production install
#   ./install_dependencies.sh --test   # Test env (shellcheck, systemd, aide, cron, fail2ban)
#   ./install_dependencies.sh --base  # Base packages only

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=../../lib/common_functions.sh
source "$SCRIPT_DIR/../../lib/common_functions.sh"

# =============================================================================
# PACKAGE DEFINITIONS
# =============================================================================

BASE_PACKAGES=(
    bash
    curl
    wget
    git
    tar
    gzip
    sudo
    jq
    openssl
    ca-certificates
    gnupg
    lsb-release
    software-properties-common
    apt-transport-https
)

TEST_PACKAGES=(
    shellcheck
    ufw
    systemd
    systemd-sysv
    openssh-server
    aide
    cron
    fail2ban
)

PRODUCTION_PACKAGES=(
    unzip
    build-essential
    python3
    python3-pip
    chrony
    ufw
    aide
    cron
    fail2ban
    snapd
    cmake
    libssl-dev
    libgmp-dev
    libtinfo5
    libprotobuf-dev
    pkg-config
    openjdk-17-jdk
    libclang-dev
    nginx
    apache2-utils
    bmon
    tcptrack
)

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

install_packages() {
    local packages=("$@")
    if [[ ${#packages[@]} -eq 0 ]]; then
        return 0
    fi
    
    log_info "Installing packages: ${packages[*]}"
    
    # Use sudo if not root, direct apt if root
    if [[ $EUID -eq 0 ]]; then
        apt-get install -y --no-install-recommends "${packages[@]}"
    else
        sudo apt-get install -y --no-install-recommends "${packages[@]}"
    fi
}

# =============================================================================
# INSTALLATION MODES
# =============================================================================

install_base() {
    log_info "Installing base packages..."
    install_packages "${BASE_PACKAGES[@]}"
}

install_test() {
    log_info "Installing test environment packages..."
    install_base
    install_packages "${TEST_PACKAGES[@]}"
    log_info "Test dependencies installed successfully!"
}

install_production() {
    log_info "Installing production packages..."
    
    # Check we're not root (production should run as regular user)
    if [[ $EUID -eq 0 ]] && ! is_docker; then
        log_error "Production install should not run as root. Use a regular user with sudo."
        exit 1
    fi
    
    # Update system
    if [[ $EUID -eq 0 ]]; then
        apt-get update -y
    else
        sudo apt-get update -y
    fi
    
    # Install all packages
    install_base
    install_packages "${PRODUCTION_PACKAGES[@]}"
    
    # Add Ethereum PPA and install ethereum package
    if command -v add_ppa_repository &>/dev/null; then
        add_ppa_repository "ppa:ethereum/ethereum"
        install_packages "ethereum"
    fi
    
    # Install Node.js (skip in Docker unless CI_E2E - needed for lodestar)
    if ! is_docker; then
        log_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        install_packages "nodejs"
    elif [[ "${CI_E2E:-}" == "true" ]]; then
        log_info "CI E2E: Installing Node.js via apt..."
        install_packages "nodejs" "npm"
    fi

    # Go: snap (production) or apt golang-go (Docker CI_E2E)
    if ! is_docker && command -v snap &>/dev/null; then
        log_info "Installing Go via snap..."
        sudo snap install --classic go
        sudo ln -sf /snap/bin/go /usr/bin/go
        log_info "Installing certbot via snap..."
        sudo snap install core
        sudo snap install --classic certbot
        sudo ln -sf /snap/bin/certbot /usr/bin/certbot
    elif is_docker && [[ "${CI_E2E:-}" == "true" ]]; then
        log_info "CI E2E: Installing Go via apt..."
        install_packages "golang-go"
    else
        log_warn "Skipping snap installs (Docker or snap unavailable)"
    fi

    # Install Rust (needed for grandine, ethgas; reth uses prebuilt)
    if ! is_docker; then
        log_info "Installing Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        [[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env"
    elif [[ "${CI_E2E:-}" == "true" ]]; then
        log_info "CI E2E: Installing Rust (for Grandine, ETHGas)..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        [[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env"
    fi

    # Install Bazel (may not be available in all repos)
    if apt-cache show bazel &>/dev/null; then
        log_info "Installing Bazel..."
        install_packages "bazel"
    fi
    
    # Configure time synchronization (skip in Docker)
    if ! is_docker && command -v timedatectl &>/dev/null; then
        log_info "Configuring time synchronization..."
        timedatectl set-ntp on || log_warn "Could not enable NTP"
    fi
    
    log_info "All production dependencies installed successfully!"
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    local mode="${1:-production}"
    
    case "$mode" in
        --test|-t)
            install_test
            ;;
        --base|-b)
            install_base
            ;;
        --production|-p|production|"")
            install_production
            ;;
        --help|-h)
            echo "Usage: $0 [--test|--base|--production]"
            echo ""
            echo "Modes:"
            echo "  --test, -t       Install test dependencies"
            echo "  --base, -b       Install base packages only"
            echo "  --production, -p Install full production dependencies (default)"
            ;;
        *)
            log_error "Unknown mode: $mode"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

main "$@"
