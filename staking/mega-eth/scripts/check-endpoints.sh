#!/bin/bash
# MegaETH Endpoint Connectivity Check

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔌 MegaETH Endpoint Connectivity Check"
echo "======================================"
echo ""

# Load environment
set +u
source "$PROJECT_ROOT/.env" 2>/dev/null || {
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Run: ./scripts/setup-env.sh"
    exit 1
}
set -u

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl not found${NC}"
    echo "Install curl and retry"
    exit 1
fi

echo "Testing endpoints..."
echo ""

# Test RPC URL
test_rpc() {
    local rpc_url="$1"
    local label="$2"
    
    echo -n "Testing $label ($rpc_url)... "
    
    if [ "$rpc_url" == "http://localhost:8545" ]; then
        if nc -z localhost 8545 2>/dev/null || timeout 2 curl -s "$rpc_url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Reachable${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Not reachable (local dev OK)${NC}"
            return 1
        fi
    else
        if timeout 5 curl -s -X POST "$rpc_url" \
            -H "Content-Type: application/json" \
            -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
            | grep -q "result" 2>/dev/null; then
            echo -e "${GREEN}✅ Reachable${NC}"
            return 0
        else
            echo -e "${RED}❌ Unreachable${NC}"
            return 1
        fi
    fi
}

# Test primary RPC
if [ -n "${RPC_URL:-}" ]; then
    test_rpc "$RPC_URL" "Primary RPC"
else
    echo -e "${YELLOW}⚠️  RPC_URL not configured${NC}"
fi

echo ""

# Test backup RPC endpoints if configured
if [ -n "${BACKUP_RPC_URLS:-}" ]; then
    echo "Backup RPC endpoints:"
    IFS=',' read -ra BACKUPS <<< "$BACKUP_RPC_URLS"
    for i in "${!BACKUPS[@]}"; do
        url=$(echo "${BACKUPS[$i]}" | xargs)  # trim whitespace
        test_rpc "$url" "Backup $((i+1))"
    done
    echo ""
fi

# Test Prometheus if configured
if [ -n "${PROMETHEUS_URL:-}" ]; then
    echo -n "Testing Prometheus ($PROMETHEUS_URL)... "
    if timeout 5 curl -s "$PROMETHEUS_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Reachable${NC}"
    else
        echo -e "${YELLOW}⚠️  Unreachable${NC}"
    fi
fi

# Test Grafana if configured
if [ -n "${GRAFANA_URL:-}" ]; then
    echo -n "Testing Grafana ($GRAFANA_URL)... "
    if timeout 5 curl -s "$GRAFANA_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Reachable${NC}"
    else
        echo -e "${YELLOW}⚠️  Unreachable${NC}"
    fi
fi

echo ""
echo "======================================"
echo ""

# Summary
echo "Chain ID: ${CHAIN_ID:-not set}"
echo "Network: ${NETWORK_NAME:-not configured}"
echo ""

if [ -z "${RPC_URL:-}" ] || [ "$RPC_URL" == "http://localhost:8545" ]; then
    echo -e "${BLUE}ℹ️ Local development setup${NC}"
    echo ""
    echo "To connect to testnet, set RPC_URL in .env:"
    echo "  RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY"
    echo ""
    echo "Get Infura key: https://infura.io/"
else
    echo -e "${GREEN}✅ Setup complete. Ready for development.${NC}"
fi
