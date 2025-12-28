#!/bin/bash
# Aztec Validator Setup Script
#
# This script automates the setup of an Aztec Validator node on Ubuntu 22.04.
# WARNING: This is a template/work-in-progress. Validation on actual hardware is required.
#
# Usage: sudo ./setup-validator.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}   Aztec Validator Node Setup (Template)         ${NC}"
echo -e "${BLUE}=================================================${NC}"

# 1. System Updates
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git jq build-essential ca-certificates gnupg lsb-release

# 2. Install Docker (Official Repo)
echo -e "${YELLOW}Step 2: Installing Docker Engine...${NC}"
if ! command -v docker &> /dev/null; then
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    echo -e "${GREEN}[OK] Docker installed${NC}"
else
    echo -e "${GREEN}[OK] Docker already installed${NC}"
fi

# 3. Install Aztec CLI
echo -e "${YELLOW}Step 3: Installing Aztec Tooling...${NC}"
# Note: Using the official install script is the standard way.
# Confirm this URL is still valid in docs.
bash -i <(curl -s https://install.aztec.network)

# 4. Configuration
echo -e "${YELLOW}Step 4: Configuring Validator...${NC}"
AZTEC_HOME="$HOME/.aztec"
mkdir -p "$AZTEC_HOME"

# Placeholder for environment variables
cat <<EOF > "$AZTEC_HOME/.env"
# Network Configuration
AZTEC_NETWORK=testnet
L1_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY  # CHANGE THIS

# Validator Identity
VALIDATOR_KEY=0x...  # CHANGE THIS (Use secure key management in prod!)
COINBASE_ADDRESS=0x... # Where rewards go

# Node Settings
LOG_LEVEL=info
P2P_PORT=40400
RPC_PORT=8080
EOF

echo -e "${GREEN}[OK] Configuration template created at $AZTEC_HOME/.env${NC}"

# 5. Service Definition (Systemd)
echo -e "${YELLOW}Step 5: Creating Systemd Service...${NC}"
cat <<EOF > /etc/systemd/system/aztec-validator.service
[Unit]
Description=Aztec Validator Node
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME
EnvironmentFile=$AZTEC_HOME/.env
ExecStart=/usr/local/bin/aztec start --node --archival --sequencer
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}[OK] Systemd service created. Enable with: systemctl enable aztec-validator${NC}"

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}   Setup Complete!                               ${NC}"
echo -e "${BLUE}=================================================${NC}"
echo "Next Steps:"
echo "1. Edit $AZTEC_HOME/.env with your keys and RPC URLs."
echo "2. Fund your L1 validator address with ETH (for gas) and AZTEC (for stake)."
echo "3. Start the node: sudo systemctl start aztec-validator"
echo "4. Monitor logs: journalctl -u aztec-validator -f"
