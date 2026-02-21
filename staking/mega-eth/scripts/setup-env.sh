#!/bin/bash
# MegaETH Environment Setup Script
# Initializes .env file and validates directory structure

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 MegaETH Environment Setup"
echo "================================"
echo "Project root: $PROJECT_ROOT"
echo ""

# 1. Check prerequisites
echo "1️⃣  Checking prerequisites..."

if ! command -v bash &> /dev/null; then
    echo -e "${RED}❌ Bash not found${NC}"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo -e "${YELLOW}⚠️  curl not found (optional, needed for endpoint checks)${NC}"
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# 2. Create config directory if missing
echo "2️⃣  Setting up directory structure..."

mkdir -p "$PROJECT_ROOT/config"
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/monitoring"
mkdir -p "$PROJECT_ROOT/docs"
mkdir -p "$PROJECT_ROOT/backups"

echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# 3. Create .env file if missing
echo "3️⃣  Creating .env configuration..."

ENV_FILE="$PROJECT_ROOT/.env"

if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env already exists, skipping creation${NC}"
    echo "   To recreate: rm .env && $0"
else
    # Copy example to .env
    cp "$PROJECT_ROOT/config/.env.example" "$ENV_FILE"
    echo -e "${GREEN}✅ Created .env from template${NC}"
    
    # For local development, use sensible defaults
    if grep -q "http://localhost:8545" "$ENV_FILE"; then
        echo "   Using local development defaults"
    fi
fi

echo ""

# 4. Verify required config files exist
echo "4️⃣  Verifying configuration files..."

REQUIRED_FILES=(
    "config/.env.example"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$PROJECT_ROOT/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing files:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    exit 1
else
    echo -e "${GREEN}✅ All config files present${NC}"
fi

echo ""

# 5. Make scripts executable
echo "5️⃣  Setting script permissions..."

chmod +x "$SCRIPT_DIR"/*.sh 2>/dev/null || true

echo -e "${GREEN}✅ Scripts executable${NC}"
echo ""

# 6. Validate .env format
echo "6️⃣  Validating .env configuration..."

# Check if .env has required sections
REQUIRED_VARS=(
    "RPC_URL"
    "CHAIN_ID"
    "MIN_STAKE_AMOUNT"
    "MAX_STAKE_AMOUNT"
    "PROTOCOL_FEE_BPS"
    "VALIDATOR_PUBKEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE"; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo "   These should be in .env or defaults will be used"
else
    echo -e "${GREEN}✅ Environment variables present${NC}"
fi

echo ""

# 7. Load and display configuration summary
echo "7️⃣  Configuration Summary"
echo "================================"

# Source the .env file (safely)
set +u
source "$ENV_FILE" 2>/dev/null || true
set -u

# Display key configuration
echo "Network:"
echo "  RPC URL: ${RPC_URL:-http://localhost:8545}"
echo "  Chain ID: ${CHAIN_ID:-1337}"
echo "  Network: ${NETWORK_NAME:-Development}"
echo ""

echo "Staking:"
echo "  Min Stake: ${MIN_STAKE_AMOUNT:-32} ETH"
echo "  Max Stake: ${MAX_STAKE_AMOUNT:-1000} ETH"
echo ""

echo "Fees (basis points):"
echo "  Protocol: ${PROTOCOL_FEE_BPS:-500} BPS"
echo "  Operator: ${OPERATOR_FEE_BPS:-200} BPS"
echo "  Treasury: ${TREASURY_FEE_BPS:-300} BPS"
echo "  Total: $((${PROTOCOL_FEE_BPS:-500} + ${OPERATOR_FEE_BPS:-200} + ${TREASURY_FEE_BPS:-300})) BPS"
echo ""

echo "Validator:"
echo "  Pubkey: ${VALIDATOR_PUBKEY:0:18}...${VALIDATOR_PUBKEY: -16}"
echo ""

# 8. Next steps
echo "8️⃣  Next Steps"
echo "================================"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Quick Start:"
echo "  1. Verify configuration:"
echo "     ./scripts/smoke-test.sh"
echo ""
echo "  2. Check connectivity (optional):"
echo "     ./scripts/check-endpoints.sh"
echo ""
echo "  3. Read the documentation:"
echo "     cat SETUP.md        # Full setup guide"
echo "     cat RUNBOOK.md      # Operations guide"
echo "     cat DESIGN.md       # Architecture"
echo ""
echo "Configuration Files:"
echo "  - Edit: .env (your settings)"
echo "  - Template: config/.env.example"
echo "  - Presets: config/.env.sepolia, config/.env.goerli"
echo ""
echo "Environment Loaded:"
echo "  source .env"
echo ""
echo "Default Network: ${NETWORK_NAME:-Development} (${CHAIN_ID:-1337})"
echo ""
echo "================================"
