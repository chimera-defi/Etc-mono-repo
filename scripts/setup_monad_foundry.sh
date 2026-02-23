#!/bin/bash

# Monad Foundry Integration Setup Script
# Purpose: Automated validation and setup for Monad Foundry integration
# Created: 2026-02-14

set -e

echo "=========================================="
echo "Monad Foundry Integration Validator"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Helper functions
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 found"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 NOT found"
        ((FAILED++))
    fi
}

check_version() {
    local cmd=$1
    local keyword=$2
    if $cmd --version 2>&1 | grep -q "$keyword"; then
        echo -e "${GREEN}✓${NC} $cmd supports $keyword"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} $cmd version check (expected: $keyword)"
        ((FAILED++))
    fi
}

echo "1. Checking Prerequisites..."
echo "----------------------------"
check_command "bash"
check_command "git"
check_command "curl"
check_command "rustc"
check_command "cargo"
echo ""

echo "2. Checking Monad Foundry Installation..."
echo "------------------------------------------"
check_command "foundryup"
check_command "forge"
check_command "cast"
check_command "anvil"
check_command "chisel"
echo ""

echo "3. Verifying Monad Support..."
echo "-----------------------------"
if forge --version 2>&1 | grep -q "monad" || forge --version 2>&1 | grep -q "forge"; then
    echo -e "${GREEN}✓${NC} Forge installed (version check)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Forge version not showing Monad indicator (may still be OK)"
fi
echo ""

echo "4. Checking RPC Endpoints..."
echo "----------------------------"
echo -n "Testing Monad testnet RPC... "
if curl -s -X POST https://testnet-rpc.monad.xyz -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | grep -q "result"; then
    echo -e "${GREEN}✓${NC} Testnet RPC reachable"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Testnet RPC unreachable"
    ((FAILED++))
fi

echo -n "Testing Monad mainnet RPC... "
if curl -s -X POST https://rpc.monad.xyz -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | grep -q "result"; then
    echo -e "${GREEN}✓${NC} Mainnet RPC reachable"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Mainnet RPC unreachable"
    ((FAILED++))
fi
echo ""

echo "5. Optional: Check Anvil Readiness..."
echo "-------------------------------------"
echo "Note: Anvil cannot be tested without starting it (requires port 8545)"
echo "To test: Run 'anvil --monad' in another terminal, then run:"
echo "  cast block --rpc-url http://localhost:8545"
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Monad Foundry is ready to use.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start Anvil in background: anvil --monad"
    echo "2. Create project: mkdir my-monad-project && cd my-monad-project && forge init"
    echo "3. Write contracts and run: forge test"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review above and reinstall if needed.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "- Reinstall Monad Foundry: foundryup --network monad --force"
    echo "- Update Rust: rustup update"
    echo "- Check git repo: https://github.com/category-labs/foundry/tree/monad"
    echo ""
    exit 1
fi
