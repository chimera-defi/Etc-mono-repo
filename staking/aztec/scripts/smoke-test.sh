#!/bin/bash
# Aztec Liquid Staking Smoke Test Script
#
# This script verifies the development environment and toolchain are working.
# Run this after setting up a new development environment.
#
# Usage: ./staking/aztec/scripts/smoke-test.sh [--minimal]
#
# Modes:
#   Default:  All tests (Docker required for full pass)
#   --minimal: Only test what works without Docker (unit tests, devnet, project structure)
#
# Prerequisites:
#   - noirup installed (Noir toolchain installer)
#   - For full mode: Docker with aztec-nargo binary extracted
#
# Contract Architecture (v3.0.x):
#   - StakedAztecToken: Liquid staking token (stAZTEC)
#   - LiquidStakingCore: Main entry point for deposits/withdrawals
#   - WithdrawalQueue: FIFO unbonding queue with 7-day period

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AZTEC_DIR="$(dirname "$SCRIPT_DIR")"
CONTRACTS_DIR="${AZTEC_DIR}/contracts"
TESTS_DIR="${CONTRACTS_DIR}/staking-math-tests"

# Parse arguments
MINIMAL_MODE=false
if [ "$1" = "--minimal" ]; then
    MINIMAL_MODE=true
fi

echo "========================================"
echo "Aztec Liquid Staking Smoke Test"
echo "========================================"
echo ""
echo "Aztec directory: $AZTEC_DIR"
if [ "$MINIMAL_MODE" = true ]; then
    echo -e "Mode: ${BLUE}Minimal${NC} (Docker-independent tests only)"
else
    echo -e "Mode: ${BLUE}Full${NC} (all tests, Docker required)"
fi
echo ""

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

pass() {
    echo -e "${GREEN}PASS${NC}: $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
    echo -e "${RED}FAIL${NC}: $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

warn() {
    echo -e "${YELLOW}WARN${NC}: $1"
}

skip() {
    echo -e "${BLUE}SKIP${NC}: $1"
    TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
}

# Detect environment type
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
echo -e "Environment: ${BLUE}$ENV_TYPE${NC}"
echo ""

# ============================================================
# TEST 1: Standard Nargo (Required for unit tests)
# ============================================================
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
    fail "Standard nargo not found"
    echo "  Install via: curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash"
    echo "  Then run: ~/.nargo/bin/noirup"
fi

# ============================================================
# TEST 2: Aztec-Nargo (Requires Docker extraction)
# ============================================================
echo ""
echo "Test 2: Checking aztec-nargo installation..."

AZTEC_NARGO_FOUND=false
AZTEC_NARGO_BIN=""

if [ -f "$HOME/aztec-bin/aztec-nargo" ]; then
    AZTEC_NARGO_BIN="$HOME/aztec-bin/aztec-nargo"
    AZTEC_NARGO_FOUND=true
elif [ -f "$HOME/aztec-bin/nargo" ]; then
    AZTEC_NARGO_BIN="$HOME/aztec-bin/nargo"
    AZTEC_NARGO_FOUND=true
elif [ -f "$HOME/.aztec/bin/aztec-nargo" ]; then
    AZTEC_NARGO_BIN="$HOME/.aztec/bin/aztec-nargo"
    AZTEC_NARGO_FOUND=true
fi

if [ "$AZTEC_NARGO_FOUND" = true ]; then
    AZTEC_NARGO_VERSION=$("$AZTEC_NARGO_BIN" --version 2>/dev/null | head -1)
    pass "Aztec nargo found: $AZTEC_NARGO_VERSION"
elif [ "$MINIMAL_MODE" = true ]; then
    skip "aztec-nargo (requires Docker to install)"
else
    if [ "$ENV_TYPE" = "sandboxed" ]; then
        warn "aztec-nargo unavailable (sandboxed environment, Docker not supported)"
    else
        fail "aztec-nargo not found"
        echo "  To install with Docker:"
        echo "    docker pull aztecprotocol/aztec:latest"
        echo "    docker create --name tmp-aztec aztecprotocol/aztec:latest"
        echo "    docker cp tmp-aztec:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/"
        echo "    docker rm tmp-aztec"
    fi
fi

# ============================================================
# TEST 3: Staking Math Unit Tests (Uses standard nargo)
# ============================================================
echo ""
echo "Test 3: Running staking math unit tests..."
if [ -d "$TESTS_DIR" ] && [ -f "$TESTS_DIR/Nargo.toml" ] && [ -n "$NARGO_BIN" ]; then
    ORIG_DIR=$(pwd)
    cd "$TESTS_DIR"
    TEST_OUTPUT=$("$NARGO_BIN" test 2>&1)
    cd "$ORIG_DIR"
    if echo "$TEST_OUTPUT" | grep -q "tests passed"; then
        PASSED=$(echo "$TEST_OUTPUT" | grep -oE '[0-9]+ tests passed' | grep -oE '[0-9]+')
        pass "Staking math tests: $PASSED tests passed"
    else
        fail "Staking math tests failed"
        echo "$TEST_OUTPUT" | tail -10
    fi
elif [ -z "$NARGO_BIN" ]; then
    fail "Cannot run tests: nargo not installed"
else
    fail "Staking math tests directory not found at $TESTS_DIR"
fi

# ============================================================
# TEST 4: Aztec Contract Compilation (Requires aztec-nargo)
# ============================================================
echo ""
echo "Test 4: Checking Aztec contract compilation..."

compile_contract() {
    local contract_name=$1
    local contract_dir=$2
    local artifact_name=$3

    echo "  Compiling $contract_name..."
    rm -rf ~/aztec-contracts/$contract_dir 2>/dev/null
    mkdir -p ~/aztec-contracts 2>/dev/null
    cp -r "$CONTRACTS_DIR/$contract_dir" ~/aztec-contracts/ 2>/dev/null
    ORIG_DIR=$(pwd)
    cd ~/aztec-contracts/$contract_dir
    COMPILE_OUTPUT=$("$AZTEC_NARGO_BIN" compile 2>&1)
    COMPILE_STATUS=$?
    cd "$ORIG_DIR"

    if [ $COMPILE_STATUS -eq 0 ] && [ -d ~/aztec-contracts/$contract_dir/target ]; then
        ARTIFACT_SIZE=$(du -sh ~/aztec-contracts/$contract_dir/target 2>/dev/null | cut -f1)
        echo -e "    ${GREEN}✓${NC} $contract_name compiled ($ARTIFACT_SIZE)"
        return 0
    else
        echo -e "    ${RED}✗${NC} $contract_name failed"
        echo "$COMPILE_OUTPUT" | tail -5
        return 1
    fi
}

if [ "$MINIMAL_MODE" = true ]; then
    skip "Contract compilation (requires aztec-nargo)"
elif [ "$AZTEC_NARGO_FOUND" = true ]; then
    CONTRACTS_COMPILED=0

    compile_contract "StakedAztecToken" "staked-aztec-token" "staked_aztec_token" && CONTRACTS_COMPILED=$((CONTRACTS_COMPILED + 1))
    compile_contract "LiquidStakingCore" "liquid-staking-core" "liquid_staking_core" && CONTRACTS_COMPILED=$((CONTRACTS_COMPILED + 1))
    compile_contract "WithdrawalQueue" "withdrawal-queue" "withdrawal_queue" && CONTRACTS_COMPILED=$((CONTRACTS_COMPILED + 1))

    if [ $CONTRACTS_COMPILED -eq 3 ]; then
        pass "All 3 contracts compiled successfully"
    else
        fail "Compiled $CONTRACTS_COMPILED/3 contracts"
    fi
else
    if [ "$ENV_TYPE" = "sandboxed" ]; then
        warn "Contract compilation unavailable (sandboxed environment)"
    else
        fail "aztec-nargo not available for contract compilation"
    fi
fi

# ============================================================
# TEST 5: Docker Availability
# ============================================================
echo ""
echo "Test 5: Checking Docker availability..."
if [ "$ENV_TYPE" = "sandboxed" ]; then
    if [ "$MINIMAL_MODE" = true ]; then
        skip "Docker (sandboxed environment)"
    else
        warn "Docker unavailable (sandboxed environment - gVisor/container runtime detected)"
    fi
elif [ "$ENV_TYPE" = "docker-available" ]; then
    DOCKER_VERSION=$(docker --version | head -1)
    pass "Docker available: $DOCKER_VERSION"
elif [ "$ENV_TYPE" = "docker-installed" ]; then
    warn "Docker installed but daemon not running"
    echo "  Start with: sudo systemctl start docker"
else
    if [ "$MINIMAL_MODE" = true ]; then
        skip "Docker (not installed)"
    else
        warn "Docker not installed"
        echo "  Install: https://docs.docker.com/engine/install/"
    fi
fi

# ============================================================
# TEST 6: Devnet Connectivity
# ============================================================
echo ""
echo "Test 6: Checking Aztec devnet connectivity..."
DEVNET_URL="https://next.devnet.aztec-labs.com"
DEVNET_RESPONSE=$(curl -s -m 10 -X POST "$DEVNET_URL" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"node_getVersion","params":[],"id":1}' 2>/dev/null)

if echo "$DEVNET_RESPONSE" | grep -q "result"; then
    VERSION=$(echo "$DEVNET_RESPONSE" | grep -oP '"result"\s*:\s*"\K[^"]+' || echo "connected")
    pass "Devnet reachable: $VERSION"
else
    warn "Could not connect to devnet at $DEVNET_URL"
fi

# ============================================================
# TEST 7: Contract Projects Structure
# ============================================================
echo ""
echo "Test 7: Checking contract projects..."

check_contract() {
    local name=$1
    local dir=$2
    if [ -d "$CONTRACTS_DIR/$dir" ] && [ -f "$CONTRACTS_DIR/$dir/Nargo.toml" ]; then
        echo -e "  ${GREEN}✓${NC} $name"
        return 0
    else
        echo -e "  ${YELLOW}✗${NC} $name (not found)"
        return 1
    fi
}

CONTRACTS_FOUND=0
echo "  Core contracts (required):"
check_contract "staked-aztec-token" "staked-aztec-token" && CONTRACTS_FOUND=$((CONTRACTS_FOUND + 1))
check_contract "liquid-staking-core" "liquid-staking-core" && CONTRACTS_FOUND=$((CONTRACTS_FOUND + 1))
check_contract "withdrawal-queue" "withdrawal-queue" && CONTRACTS_FOUND=$((CONTRACTS_FOUND + 1))
echo "  Test suite:"
check_contract "staking-math-tests" "staking-math-tests" && CONTRACTS_FOUND=$((CONTRACTS_FOUND + 1))

if [ $CONTRACTS_FOUND -eq 4 ]; then
    pass "All 4 contract projects found (3 core + 1 test suite)"
else
    fail "Found $CONTRACTS_FOUND/4 contract projects"
fi

# ============================================================
# Summary
# ============================================================
echo ""
echo "========================================"
echo "Smoke Test Summary"
echo "========================================"
echo -e "Passed:  ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed:  ${RED}$TESTS_FAILED${NC}"
echo -e "Skipped: ${BLUE}$TESTS_SKIPPED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    if [ "$MINIMAL_MODE" = true ]; then
        echo -e "${GREEN}All minimal tests passed!${NC}"
        echo ""
        echo "Environment is ready for unit test development."
        echo ""
        echo "For full contract compilation and sandbox testing, you need:"
        echo "  1. Docker installed and running"
        echo "  2. aztec-nargo extracted from Docker image"
        echo ""
        echo "See: staking/aztec/docs/INTEGRATION-TESTING.md"
    else
        echo -e "${GREEN}All tests passed!${NC}"
        echo ""
        echo "Environment is ready for full development."
    fi
    echo ""
    echo "Quick commands:"
    echo "  Run tests:    cd staking/aztec/contracts/staking-math-tests && ~/.nargo/bin/nargo test"
    if [ "$AZTEC_NARGO_FOUND" = true ]; then
        echo "  Compile:      cp -r staking/aztec/contracts/staked-aztec-token ~/aztec-contracts/ && cd ~/aztec-contracts/staked-aztec-token && ~/aztec-bin/aztec-nargo compile"
    fi
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    echo ""
    if [ "$ENV_TYPE" = "sandboxed" ]; then
        echo "You appear to be in a sandboxed environment (gVisor/container)."
        echo "Docker is not available in this environment."
        echo ""
        echo "Run with --minimal to test only Docker-independent features:"
        echo "  ./staking/aztec/scripts/smoke-test.sh --minimal"
    fi
    exit 1
fi
