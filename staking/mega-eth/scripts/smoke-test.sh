#!/bin/bash
# MegaETH Smoke Test Script
# Validates local setup without external dependencies

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Test counters
PASS=0
FAIL=0
WARN=0

# Helper functions
test_pass() {
    echo -e "${GREEN}✅${NC} $1"
    ((PASS++))
}

test_fail() {
    echo -e "${RED}❌${NC} $1"
    ((FAIL++))
}

test_warn() {
    echo -e "${YELLOW}⚠️ ${NC} $1"
    ((WARN++))
}

test_info() {
    echo -e "${BLUE}ℹ️ ${NC} $1"
}

echo "🧪 MegaETH Smoke Test"
echo "======================================"
echo ""

# Test 1: .env file exists
echo "Test 1: Environment configuration"
if [ -f "$PROJECT_ROOT/.env" ]; then
    test_pass "Environment file (.env) exists"
else
    test_fail "Environment file (.env) not found"
    echo "   Run: ./scripts/setup-env.sh"
fi
echo ""

# Test 2: Load environment
echo "Test 2: Loading environment variables"
if [ -f "$PROJECT_ROOT/.env" ]; then
    set +u
    source "$PROJECT_ROOT/.env" 2>/dev/null || {
        test_fail "Failed to load .env"
        exit 1
    }
    set -u
    test_pass "Environment variables loaded"
else
    test_warn "Skipping .env load (file not found)"
fi
echo ""

# Test 3: Check required variables
echo "Test 3: Required environment variables"

REQUIRED_VARS=(
    "RPC_URL"
    "CHAIN_ID"
    "MIN_STAKE_AMOUNT"
    "MAX_STAKE_AMOUNT"
    "PROTOCOL_FEE_BPS"
    "VALIDATOR_PUBKEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        test_warn "Variable not set: $var (using default)"
    else
        test_pass "Variable set: $var"
    fi
done
echo ""

# Test 4: Validate config files
echo "Test 4: Configuration files"

CONFIG_FILES=(
    "config/.env.example"
    "README.md"
    "SETUP.md"
    "RUNBOOK.md"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        test_pass "File exists: $file"
    else
        test_fail "File missing: $file"
    fi
done
echo ""

# Test 5: Validate directory structure
echo "Test 5: Directory structure"

REQUIRED_DIRS=(
    "config"
    "scripts"
    "logs"
    "docs"
    "monitoring"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$PROJECT_ROOT/$dir" ]; then
        test_pass "Directory exists: $dir"
    else
        test_warn "Directory missing: $dir (creating...)"
        mkdir -p "$PROJECT_ROOT/$dir"
    fi
done
echo ""

# Test 6: Validate format values
echo "Test 6: Value validation"

# Validate chain ID
if [[ "${CHAIN_ID:-}" =~ ^[0-9]+$ ]]; then
    test_pass "CHAIN_ID is numeric: $CHAIN_ID"
else
    test_warn "CHAIN_ID not numeric: ${CHAIN_ID:-not set}"
fi

# Validate validator pubkey format
if [[ "${VALIDATOR_PUBKEY:-}" =~ ^0x[0-9a-fA-F]+$ ]]; then
    if [ ${#VALIDATOR_PUBKEY} -eq 66 ]; then
        test_pass "Validator pubkey format valid (${#VALIDATOR_PUBKEY} chars)"
    else
        test_warn "Validator pubkey length unusual: ${#VALIDATOR_PUBKEY} chars (expected 66)"
    fi
else
    test_warn "Validator pubkey not hex format: ${VALIDATOR_PUBKEY:0:20}..."
fi

# Validate fees are numeric
if [[ "${PROTOCOL_FEE_BPS:-}" =~ ^[0-9]+$ ]]; then
    test_pass "PROTOCOL_FEE_BPS is numeric: ${PROTOCOL_FEE_BPS:-unknown}"
else
    test_warn "PROTOCOL_FEE_BPS not numeric: ${PROTOCOL_FEE_BPS:-not set}"
fi

# Validate min/max stake
if [[ "${MIN_STAKE_AMOUNT:-}" =~ ^[0-9]+$ ]]; then
    test_pass "MIN_STAKE_AMOUNT is numeric: ${MIN_STAKE_AMOUNT:-unknown}"
else
    test_warn "MIN_STAKE_AMOUNT not numeric: ${MIN_STAKE_AMOUNT:-not set}"
fi

if [[ "${MAX_STAKE_AMOUNT:-}" =~ ^[0-9]+$ ]]; then
    test_pass "MAX_STAKE_AMOUNT is numeric: ${MAX_STAKE_AMOUNT:-unknown}"
else
    test_warn "MAX_STAKE_AMOUNT not numeric: ${MAX_STAKE_AMOUNT:-not set}"
fi

echo ""

# Test 7: RPC connectivity (optional)
echo "Test 7: RPC Endpoint connectivity"

if [ -z "${RPC_URL:-}" ]; then
    test_warn "RPC_URL not set (skip connectivity check)"
elif [ "$RPC_URL" == "http://localhost:8545" ]; then
    test_info "Local RPC URL detected (skip connectivity check for local dev)"
else
    # Try to reach the RPC endpoint
    if command -v curl &> /dev/null; then
        if timeout 5 curl -s -X POST "$RPC_URL" \
            -H "Content-Type: application/json" \
            -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
            > /dev/null 2>&1; then
            test_pass "RPC endpoint reachable: $RPC_URL"
        else
            test_warn "RPC endpoint unreachable: $RPC_URL (dev environment may not have internet)"
        fi
    else
        test_info "curl not available (skipping RPC test)"
    fi
fi

echo ""

# Test 8: Script permissions
echo "Test 8: Script permissions"

for script in "$SCRIPT_DIR"/*.sh; do
    if [ -x "$script" ]; then
        test_pass "Executable: $(basename "$script")"
    else
        test_warn "Not executable: $(basename "$script")"
        chmod +x "$script"
    fi
done
echo ""

# Test 9: Summary
echo "======================================"
echo "Test Results Summary"
echo "======================================"
echo -e "${GREEN}Passed:${NC}  $PASS"
echo -e "${RED}Failed:${NC}  $FAIL"
echo -e "${YELLOW}Warned:${NC}  $WARN"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ Smoke test FAILED${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./scripts/setup-env.sh"
    echo "  2. Edit: .env"
    echo "  3. Retry: ./scripts/smoke-test.sh"
    exit 1
elif [ $WARN -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Smoke test PASSED with warnings${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review warnings above"
    echo "  2. Edit .env if needed: nano .env"
    echo "  3. Run full test: ./scripts/validate-config.sh"
    echo ""
    exit 0
else
    echo -e "${GREEN}✅ Smoke test PASSED${NC}"
    echo ""
    echo "All systems nominal!"
    echo ""
    echo "Next steps:"
    echo "  1. Read setup guide: cat SETUP.md"
    echo "  2. Explore runbook: cat RUNBOOK.md"
    echo "  3. Check connectivity: ./scripts/check-endpoints.sh"
    echo ""
    exit 0
fi
