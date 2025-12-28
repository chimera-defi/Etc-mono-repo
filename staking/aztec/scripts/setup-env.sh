#!/bin/bash
# Aztec Development Environment Setup Script
#
# This script sets up the Aztec development environment including:
# - Standard Noir compiler (nargo) - always installed
# - Aztec-specific compiler (aztec-nargo) - requires Docker
# - Dependencies (aztec-packages v2.1.9)
#
# Usage: ./scripts/setup-env.sh [--minimal]
#
# Options:
#   --minimal   Skip Docker-dependent steps (for sandboxed environments)
#
# After running this script, run smoke-test.sh to verify everything works.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
MINIMAL_MODE=false
if [ "$1" = "--minimal" ]; then
    MINIMAL_MODE=true
fi

echo "========================================"
echo "Aztec Development Environment Setup"
echo "========================================"
echo ""
if [ "$MINIMAL_MODE" = true ]; then
    echo -e "Mode: ${BLUE}Minimal${NC} (no Docker required)"
else
    echo -e "Mode: ${BLUE}Full${NC} (Docker required for aztec-nargo)"
fi
echo ""

# Detect environment
detect_environment() {
    if grep -q "runsc" /proc/version 2>/dev/null || [ "$(uname -r)" = "4.4.0" ]; then
        echo "sandboxed"
    elif command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
        echo "docker-available"
    elif command -v docker &> /dev/null; then
        echo "docker-installed"
    else
        echo "no-docker"
    fi
}

ENV_TYPE=$(detect_environment)
echo -e "Environment detected: ${BLUE}$ENV_TYPE${NC}"
echo ""

# Auto-enable minimal mode in sandboxed environments
if [ "$ENV_TYPE" = "sandboxed" ] && [ "$MINIMAL_MODE" = false ]; then
    echo -e "${YELLOW}Sandboxed environment detected. Switching to minimal mode.${NC}"
    MINIMAL_MODE=true
    echo ""
fi

# ============================================================
# Step 1: Install standard Noir compiler
# ============================================================
echo -e "${YELLOW}Step 1: Installing standard Noir compiler...${NC}"
if [ -f "$HOME/.nargo/bin/nargo" ]; then
    echo "  Already installed at $HOME/.nargo/bin/nargo"
    "$HOME/.nargo/bin/nargo" --version | head -1
else
    echo "  Installing noirup..."
    curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash

    echo "  Installing nargo..."
    "$HOME/.nargo/bin/noirup"

    echo "  Verifying..."
    "$HOME/.nargo/bin/nargo" --version | head -1
fi
echo -e "${GREEN}[OK] Standard nargo installed${NC}"
echo ""

# ============================================================
# Step 2: Install Docker (if not in minimal mode)
# ============================================================
if [ "$MINIMAL_MODE" = false ]; then
    echo -e "${YELLOW}Step 2: Checking Docker...${NC}"

    if [ "$ENV_TYPE" = "docker-available" ]; then
        echo "  Docker already running"
        docker --version | head -1
        echo -e "${GREEN}[OK] Docker available${NC}"
    elif [ "$ENV_TYPE" = "docker-installed" ]; then
        echo "  Docker installed but daemon not running"
        echo "  Attempting to start..."

        if sudo systemctl start docker 2>/dev/null; then
            sleep 3
            if docker info &>/dev/null 2>&1; then
                echo -e "${GREEN}[OK] Docker started${NC}"
                ENV_TYPE="docker-available"
            else
                echo -e "${YELLOW}[WARN] Could not start Docker daemon${NC}"
            fi
        else
            # Try alternative startup for non-systemd environments
            if sudo dockerd --storage-driver=vfs --data-root=/tmp/docker-data \
                --host unix:///var/run/docker.sock --bridge=none --iptables=false &> /tmp/docker.log &
            then
                sleep 5
                if docker info &>/dev/null 2>&1; then
                    echo -e "${GREEN}[OK] Docker started (alternative method)${NC}"
                    ENV_TYPE="docker-available"
                fi
            fi
        fi
    else
        echo "  Docker not installed"
        echo "  Install from: https://docs.docker.com/engine/install/"
        echo -e "${YELLOW}[WARN] Skipping Docker-dependent steps${NC}"
    fi
    echo ""
else
    echo -e "${BLUE}Step 2: Skipping Docker setup (minimal mode)${NC}"
    echo ""
fi

# ============================================================
# Step 3: Extract aztec-nargo from Docker image
# ============================================================
if [ "$MINIMAL_MODE" = false ] && [ "$ENV_TYPE" = "docker-available" ]; then
    echo -e "${YELLOW}Step 3: Setting up aztec-nargo...${NC}"

    if [ -f "$HOME/aztec-bin/nargo" ]; then
        echo "  Already installed at $HOME/aztec-bin/nargo"
        "$HOME/aztec-bin/nargo" --version | head -1
    else
        echo "  Pulling Aztec Docker image (this may take a few minutes)..."
        docker pull aztecprotocol/aztec:latest

        echo "  Extracting aztec-nargo..."
        mkdir -p ~/aztec-bin
        docker create --name extract-nargo-$$ aztecprotocol/aztec:latest
        docker cp extract-nargo-$$:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/
        docker rm extract-nargo-$$
        chmod +x ~/aztec-bin/nargo

        echo "  Verifying..."
        "$HOME/aztec-bin/nargo" --version | head -1
    fi
    echo -e "${GREEN}[OK] aztec-nargo installed${NC}"
    echo ""
else
    echo -e "${BLUE}Step 3: Skipping aztec-nargo (requires Docker)${NC}"
    echo ""
fi

# ============================================================
# Step 4: Download Aztec dependencies (optional)
# ============================================================
echo -e "${YELLOW}Step 4: Setting up Aztec dependencies...${NC}"
DEPS_DIR="$HOME/nargo/github.com/AztecProtocol/aztec-packages/v2.1.9"

if [ -d "$DEPS_DIR" ]; then
    echo "  Dependencies already cached at $DEPS_DIR"
else
    echo "  Downloading aztec-packages v2.1.9..."
    mkdir -p "$DEPS_DIR"

    if curl -L "https://api.github.com/repos/AztecProtocol/aztec-packages/tarball/v2.1.9" -o /tmp/aztec-v2.1.9.tar.gz 2>/dev/null; then
        tar -xzf /tmp/aztec-v2.1.9.tar.gz -C /tmp
        cp -r /tmp/AztecProtocol-aztec-packages-*/* "$DEPS_DIR/" 2>/dev/null || true
        rm -rf /tmp/AztecProtocol-aztec-packages-* /tmp/aztec-v2.1.9.tar.gz
        echo -e "${GREEN}[OK] Dependencies cached${NC}"
    else
        echo -e "${YELLOW}[WARN] Could not download dependencies (will be fetched on first compile)${NC}"
    fi
fi
echo ""

# ============================================================
# Step 5: Verify contract compilation (if aztec-nargo available)
# ============================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACTS_DIR="$(dirname "$SCRIPT_DIR")/contracts"

if [ -f "$HOME/aztec-bin/nargo" ]; then
    echo -e "${YELLOW}Step 5: Verifying contract compilation...${NC}"

    echo "  Compiling StakingPool contract..."
    rm -rf ~/aztec-contracts 2>/dev/null
    cp -r "$CONTRACTS_DIR/aztec-staking-pool" ~/aztec-contracts

    ORIG_DIR=$(pwd)
    cd ~/aztec-contracts

    if "$HOME/aztec-bin/nargo" compile 2>&1 | tail -3; then
        if [ -f "target/staking_pool-StakingPool.json" ]; then
            ARTIFACT_SIZE=$(ls -lh "target/staking_pool-StakingPool.json" | awk '{print $5}')
            echo -e "${GREEN}[OK] Contract compiled: $ARTIFACT_SIZE${NC}"
        else
            echo -e "${YELLOW}[WARN] Compilation succeeded but no artifact found${NC}"
        fi
    else
        echo -e "${YELLOW}[WARN] Contract compilation had issues${NC}"
    fi

    cd "$ORIG_DIR"
    echo ""
else
    echo -e "${BLUE}Step 5: Skipping compilation (aztec-nargo not available)${NC}"
    echo ""
fi

# ============================================================
# Summary
# ============================================================
echo "========================================"
echo "Setup Complete"
echo "========================================"
echo ""

# Display PATH instructions
echo "Add to your shell profile (~/.bashrc or ~/.zshrc):"
echo ""
echo "  export PATH=\"\$HOME/.nargo/bin:\$HOME/aztec-bin:\$PATH\""
echo ""

# Display what's available
echo "Installed components:"
if [ -f "$HOME/.nargo/bin/nargo" ]; then
    echo -e "  ${GREEN}[OK]${NC} Standard nargo"
fi
if [ -f "$HOME/aztec-bin/nargo" ]; then
    echo -e "  ${GREEN}[OK]${NC} Aztec nargo"
else
    echo -e "  ${YELLOW}[--]${NC} Aztec nargo (requires Docker)"
fi
if [ -d "$DEPS_DIR" ]; then
    echo -e "  ${GREEN}[OK]${NC} Aztec dependencies (v2.1.9)"
fi
echo ""

echo "Next steps:"
echo "  1. Run smoke test: ./scripts/smoke-test.sh$([ "$MINIMAL_MODE" = true ] && echo ' --minimal')"
echo "  2. Run unit tests: cd contracts/staking-math-tests && nargo test"
if [ -f "$HOME/aztec-bin/nargo" ]; then
    echo "  3. Compile contracts: See docs/INTEGRATION-TESTING.md"
fi
echo ""

# Exit with appropriate code
if [ "$MINIMAL_MODE" = true ]; then
    echo -e "${GREEN}Minimal setup complete!${NC}"
else
    if [ -f "$HOME/aztec-bin/nargo" ]; then
        echo -e "${GREEN}Full setup complete!${NC}"
    else
        echo -e "${YELLOW}Partial setup complete (aztec-nargo unavailable)${NC}"
    fi
fi
