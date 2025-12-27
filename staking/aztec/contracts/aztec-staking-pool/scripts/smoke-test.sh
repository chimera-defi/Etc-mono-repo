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
#   - aztec-nargo binary extracted (at ~/aztec-bin/nargo)

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
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
}

# Test 1: Check nargo (standard Noir compiler)
echo "Test 1: Checking standard nargo installation..."
NARGO_BIN=""
if [ -f "$HOME/.nargo/bin/nargo" ]; then
    NARGO_BIN="$HOME/.nargo/bin/nargo"
elif command -v nargo &> /dev/null; then
    NARGO_BIN="$(command -v nargo)"
fi

if [ -n "$NARGO_BIN" ]; then
    NARGO_VERSION=$("$NARGO_BIN" --version 2>/dev/null | head -1)
    pass "Standard nargo found: $NARGO_VERSION"
else
    fail "Standard nargo not found. Install via: curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash && ~/.nargo/bin/noirup"
fi

# Test 2: Check aztec-nargo (Aztec-specific compiler)
echo ""
echo "Test 2: Checking aztec-nargo installation..."
if [ -f "$HOME/aztec-bin/nargo" ]; then
    AZTEC_NARGO_VERSION=$("$HOME/aztec-bin/nargo" --version 2>/dev/null | head -1)
    if echo "$AZTEC_NARGO_VERSION" | grep -qi "aztec"; then
        pass "Aztec nargo found: $AZTEC_NARGO_VERSION"
    else
        pass "Nargo at ~/aztec-bin/nargo: $AZTEC_NARGO_VERSION"
    fi
elif [ -f "$HOME/.aztec/bin/aztec-nargo" ]; then
    pass "aztec-nargo found at $HOME/.aztec/bin/aztec-nargo"
else
    fail "aztec-nargo not found. Extract from Docker: docker cp <container>:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/"
fi

# Test 3: Run staking math unit tests
echo ""
echo "Test 3: Running staking math unit tests..."
if [ -d "$TESTS_DIR" ] && [ -f "$TESTS_DIR/Nargo.toml" ] && [ -n "$NARGO_BIN" ]; then
    cd "$TESTS_DIR"
    TEST_OUTPUT=$("$NARGO_BIN" test 2>&1)
    if echo "$TEST_OUTPUT" | grep -q "tests passed"; then
        PASSED=$(echo "$TEST_OUTPUT" | grep -oE '[0-9]+ tests passed' | grep -oE '[0-9]+')
        pass "Staking math tests: $PASSED tests passed"
    else
        fail "Staking math tests failed"
        echo "$TEST_OUTPUT" | tail -10
    fi
else
    warn "Staking math tests directory not found or nargo not available"
fi

# Test 4: Check Aztec contract compilation
echo ""
echo "Test 4: Checking Aztec contract artifacts..."
ARTIFACT_PATH="$HOME/aztec-contracts/target/staking_pool-StakingPool.json"
if [ -f "$ARTIFACT_PATH" ]; then
    ARTIFACT_SIZE=$(ls -lh "$ARTIFACT_PATH" | awk '{print $5}')
    FUNC_COUNT=$(python3 -c "import json; d=json.load(open('$ARTIFACT_PATH')); print(len(d.get('functions', [])))" 2>/dev/null || echo "?")
    pass "Contract artifact exists: $ARTIFACT_SIZE, $FUNC_COUNT functions"
else
    # Try to compile
    if [ -f "$HOME/aztec-bin/nargo" ]; then
        echo "  Compiling contract..."
        cp -r "$PROJECT_DIR" ~/aztec-contracts 2>/dev/null
        cd ~/aztec-contracts
        if "$HOME/aztec-bin/nargo" compile 2>&1 | grep -q "error"; then
            fail "Contract compilation failed"
        else
            if [ -f "target/staking_pool-StakingPool.json" ]; then
                ARTIFACT_SIZE=$(ls -lh "target/staking_pool-StakingPool.json" | awk '{print $5}')
                pass "Contract compiled: $ARTIFACT_SIZE"
            else
                fail "Contract artifact not created"
            fi
        fi
    else
        warn "Contract artifact not found and aztec-nargo not available"
    fi
fi

# Test 5: Check Docker (optional, for full sandbox)
echo ""
echo "Test 5: Checking Docker availability..."
if command -v docker &> /dev/null; then
    if sudo docker info &> /dev/null 2>&1; then
        DOCKER_VERSION=$(docker --version | head -1)
        pass "Docker available: $DOCKER_VERSION"
    else
        warn "Docker installed but daemon not running"
    fi
else
    warn "Docker not installed (optional for contract compilation)"
fi

# Test 6: Check devnet connectivity
echo ""
echo "Test 6: Checking Aztec devnet connectivity..."
DEVNET_URL="https://next.devnet.aztec-labs.com"
DEVNET_RESPONSE=$(curl -s -m 10 -X POST "$DEVNET_URL" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"node_getVersion","params":[],"id":1}' 2>/dev/null)

if echo "$DEVNET_RESPONSE" | grep -q "result"; then
    pass "Devnet reachable at $DEVNET_URL"
else
    warn "Could not connect to devnet at $DEVNET_URL"
fi

# Test 7: Check new contracts
echo ""
echo "Test 7: Checking new contract projects..."
CONTRACTS_DIR="$(dirname "$PROJECT_DIR")"

check_contract() {
    local name=$1
    local dir=$2
    if [ -d "$CONTRACTS_DIR/$dir" ] && [ -f "$CONTRACTS_DIR/$dir/Nargo.toml" ]; then
        echo -e "  ${GREEN}✓${NC} $name: $CONTRACTS_DIR/$dir"
        return 0
    else
        echo -e "  ${YELLOW}○${NC} $name: not found"
        return 1
    fi
}

CONTRACTS_FOUND=0
check_contract "StakedAztecToken" "staked-aztec-token" && CONTRACTS_FOUND=$((CONTRACTS_FOUND + 1))
check_contract "WithdrawalQueue" "withdrawal-queue" && CONTRACTS_FOUND=$((CONTRACTS_FOUND + 1))
check_contract "ValidatorRegistry" "validator-registry" && CONTRACTS_FOUND=$((CONTRACTS_FOUND + 1))

if [ $CONTRACTS_FOUND -eq 3 ]; then
    pass "All 3 new contracts found"
else
    warn "Found $CONTRACTS_FOUND/3 new contracts"
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
    echo ""
    echo "Environment is ready for development."
    echo ""
    echo "Quick commands:"
    echo "  Run tests:    cd /workspace/staking/aztec/contracts/staking-math-tests && ~/.nargo/bin/nargo test"
    echo "  Compile:      cp -r /workspace/staking/aztec/contracts/aztec-staking-pool ~/aztec-contracts && cd ~/aztec-contracts && ~/aztec-bin/nargo compile"
    exit 0
else
    echo -e "${RED}Some tests failed. Review the output above.${NC}"
    exit 1
fi
