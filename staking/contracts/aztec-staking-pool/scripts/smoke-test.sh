#!/bin/bash
# Aztec Staking Pool Smoke Test Script
# 
# This script verifies the development environment and toolchain are working.
# Run this after setting up a new development environment.
#
# Usage: ./scripts/smoke-test.sh
#
# Prerequisites:
#   - noirup installed (Noir toolchain installer)
#   - Docker installed and running (for aztec-nargo in Docker mode)
#   OR
#   - Extracted aztec-nargo binary (for direct mode)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TESTS_DIR="${PROJECT_DIR}/../staking-math-tests"

echo "========================================"
echo "Aztec Staking Pool Smoke Test"
echo "========================================"
echo ""

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((TESTS_FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
}

# Test 1: Check nargo (standard Noir compiler)
echo "Test 1: Checking standard nargo installation..."
if command -v nargo &> /dev/null || [ -f "$HOME/.nargo/bin/nargo" ]; then
    NARGO_BIN="${HOME}/.nargo/bin/nargo"
    if [ ! -f "$NARGO_BIN" ]; then
        NARGO_BIN="$(command -v nargo)"
    fi
    NARGO_VERSION=$("$NARGO_BIN" --version 2>/dev/null | head -1)
    pass "Standard nargo found: $NARGO_VERSION"
else
    fail "Standard nargo not found. Install via: curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash && noirup"
fi

# Test 2: Check aztec-nargo (Aztec-specific compiler)
echo ""
echo "Test 2: Checking aztec-nargo installation..."
if [ -f "$HOME/.aztec/bin/aztec-nargo" ]; then
    pass "aztec-nargo found at $HOME/.aztec/bin/aztec-nargo"
elif [ -f "$HOME/aztec-bin/nargo" ]; then
    AZTEC_NARGO_VERSION=$("$HOME/aztec-bin/nargo" --version 2>/dev/null | head -1)
    if echo "$AZTEC_NARGO_VERSION" | grep -q "aztec"; then
        pass "Aztec nargo (extracted) found: $AZTEC_NARGO_VERSION"
    else
        warn "Found nargo but not Aztec version: $AZTEC_NARGO_VERSION"
    fi
else
    warn "aztec-nargo not found. Install via: bash -i <(curl -s https://install.aztec.network)"
fi

# Test 3: Run staking math unit tests
echo ""
echo "Test 3: Running staking math unit tests..."
if [ -d "$TESTS_DIR" ] && [ -f "$TESTS_DIR/Nargo.toml" ]; then
    cd "$TESTS_DIR"
    if [ -n "$NARGO_BIN" ] && "$NARGO_BIN" test 2>&1 | grep -q "tests passed"; then
        PASSED=$("$NARGO_BIN" test 2>&1 | grep -oP '\d+(?= tests passed)')
        pass "Staking math tests: $PASSED tests passed"
    else
        fail "Staking math tests failed"
    fi
else
    warn "Staking math tests directory not found at $TESTS_DIR"
fi

# Test 4: Check Aztec contract compilation
echo ""
echo "Test 4: Checking Aztec contract compilation..."
if [ -f "$PROJECT_DIR/target/staking_pool-StakingPool.json" ]; then
    ARTIFACT_SIZE=$(ls -lh "$PROJECT_DIR/target/staking_pool-StakingPool.json" | awk '{print $5}')
    FUNC_COUNT=$(python3 -c "import json; d=json.load(open('$PROJECT_DIR/target/staking_pool-StakingPool.json')); print(len(d.get('functions', [])))" 2>/dev/null || echo "?")
    pass "Contract artifact exists: $ARTIFACT_SIZE, $FUNC_COUNT functions"
else
    warn "Contract artifact not found. Run compilation with aztec-nargo."
fi

# Test 5: Check Docker (optional, for full sandbox)
echo ""
echo "Test 5: Checking Docker for sandbox support..."
if command -v docker &> /dev/null && docker info &> /dev/null; then
    DOCKER_VERSION=$(docker --version | head -1)
    pass "Docker available: $DOCKER_VERSION"
else
    warn "Docker not available or daemon not running. Some features may be limited."
fi

# Test 6: Check devnet connectivity
echo ""
echo "Test 6: Checking Aztec devnet connectivity..."
DEVNET_URL="https://next.devnet.aztec-labs.com"
DEVNET_RESPONSE=$(curl -s -X POST "$DEVNET_URL" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"node_getVersion","params":[],"id":1}' 2>/dev/null | head -100)

if echo "$DEVNET_RESPONSE" | grep -q "result"; then
    ROLLUP_VERSION=$(echo "$DEVNET_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('result', 'unknown'))" 2>/dev/null || echo "unknown")
    pass "Devnet reachable at $DEVNET_URL (rollup version: $ROLLUP_VERSION)"
else
    warn "Could not connect to devnet at $DEVNET_URL"
fi

# Summary
echo ""
echo "========================================"
echo "Smoke Test Summary"
echo "========================================"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All critical tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Review the output above.${NC}"
    exit 1
fi
