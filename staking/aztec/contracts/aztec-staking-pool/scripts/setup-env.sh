#!/bin/bash
# Aztec Development Environment Setup Script
#
# This script sets up the complete Aztec development environment including:
# - Standard Noir compiler (nargo)
# - Aztec-specific compiler (aztec-nargo)
# - Dependencies (aztec-packages v2.1.9)
# - Docker (optional but recommended)
#
# Usage: ./scripts/setup-env.sh
#
# After running this script, run smoke-test.sh to verify everything works.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "Aztec Development Environment Setup"
echo "========================================"
echo ""

# Step 1: Install standard Noir compiler
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
echo -e "${GREEN}✓ Standard nargo installed${NC}"
echo ""

# Step 2: Install Docker (if not present)
echo -e "${YELLOW}Step 2: Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    echo "  Docker already installed"
else
    echo "  Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y docker.io
fi

# Try to start Docker daemon if not running
if ! sudo docker info &> /dev/null 2>&1; then
    echo "  Starting Docker daemon..."
    sudo dockerd --storage-driver=vfs --data-root=/tmp/docker-data \
        --host unix:///var/run/docker.sock --bridge=none --iptables=false &> /tmp/docker.log &
    sleep 5
fi

if sudo docker info &> /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker available${NC}"
else
    echo -e "${YELLOW}⚠ Docker daemon not running (optional)${NC}"
fi
echo ""

# Step 3: Extract aztec-nargo from Docker image
echo -e "${YELLOW}Step 3: Setting up aztec-nargo...${NC}"
if [ -f "$HOME/aztec-bin/nargo" ]; then
    echo "  Already installed at $HOME/aztec-bin/nargo"
    "$HOME/aztec-bin/nargo" --version | head -1
else
    if sudo docker info &> /dev/null 2>&1; then
        echo "  Pulling Aztec Docker image..."
        sudo docker pull aztecprotocol/aztec:latest
        
        echo "  Extracting aztec-nargo..."
        mkdir -p ~/aztec-bin
        sudo docker create --name extract-nargo-$$ aztecprotocol/aztec:latest
        sudo docker cp extract-nargo-$$:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/
        sudo docker rm extract-nargo-$$
        sudo chown $USER:$USER ~/aztec-bin/nargo
        chmod +x ~/aztec-bin/nargo
        
        echo "  Verifying..."
        "$HOME/aztec-bin/nargo" --version | head -1
        echo -e "${GREEN}✓ aztec-nargo installed${NC}"
    else
        echo -e "${RED}✗ Cannot install aztec-nargo without Docker${NC}"
        echo "  Please install Docker first, or manually copy aztec-nargo binary"
    fi
fi
echo ""

# Step 4: Download Aztec dependencies
echo -e "${YELLOW}Step 4: Setting up Aztec dependencies...${NC}"
DEPS_DIR="$HOME/nargo/github.com/AztecProtocol/aztec-packages/v2.1.9"
if [ -d "$DEPS_DIR" ]; then
    echo "  Dependencies already cached at $DEPS_DIR"
else
    echo "  Downloading aztec-packages v2.1.9..."
    mkdir -p "$DEPS_DIR"
    curl -L "https://api.github.com/repos/AztecProtocol/aztec-packages/tarball/v2.1.9" -o /tmp/aztec-v2.1.9.tar.gz
    tar -xzf /tmp/aztec-v2.1.9.tar.gz -C /tmp
    cp -r /tmp/AztecProtocol-aztec-packages-*/* "$DEPS_DIR/"
    rm -rf /tmp/AztecProtocol-aztec-packages-* /tmp/aztec-v2.1.9.tar.gz
fi
echo -e "${GREEN}✓ Dependencies cached${NC}"
echo ""

# Step 5: Compile base contract to verify everything works
echo -e "${YELLOW}Step 5: Verifying contract compilation...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$HOME/aztec-bin/nargo" ]; then
    echo "  Compiling StakingPool contract..."
    rm -rf ~/aztec-contracts
    cp -r "$PROJECT_DIR" ~/aztec-contracts
    cd ~/aztec-contracts
    
    if "$HOME/aztec-bin/nargo" compile 2>&1 | tail -5; then
        if [ -f "target/staking_pool-StakingPool.json" ]; then
            ARTIFACT_SIZE=$(ls -lh "target/staking_pool-StakingPool.json" | awk '{print $5}')
            echo -e "${GREEN}✓ Contract compiled: $ARTIFACT_SIZE${NC}"
        else
            echo -e "${RED}✗ Compilation succeeded but no artifact found${NC}"
        fi
    else
        echo -e "${RED}✗ Contract compilation failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping compilation (aztec-nargo not available)${NC}"
fi
echo ""

# Summary
echo "========================================"
echo "Setup Complete"
echo "========================================"
echo ""
echo "Add these to your PATH:"
echo "  export PATH=\"\$HOME/.nargo/bin:\$HOME/aztec-bin:\$PATH\""
echo ""
echo "Next steps:"
echo "  1. Run smoke test: ./scripts/smoke-test.sh"
echo "  2. Run unit tests: cd ../staking-math-tests && nargo test"
echo "  3. Compile contracts: Copy to ~/ and run ~/aztec-bin/nargo compile"
echo ""
echo "Quick compile command:"
echo "  cp -r /workspace/staking/contracts/YOUR-CONTRACT ~/ && cd ~/YOUR-CONTRACT && ~/aztec-bin/nargo compile"
