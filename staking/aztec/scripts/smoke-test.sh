#!/usr/bin/env bash
# Aztec Liquid Staking Smoke Test Script
#
# This script verifies the development environment and toolchain are working.
# Run this after setting up a new development environment.
#
# Usage: ./staking/aztec/scripts/smoke-test.sh [--minimal] [--sandbox-e2e] [--help]
#
# Modes:
#   Default:  All tests (Docker required for full pass)
#   --minimal: Only test what works without Docker (unit tests, devnet, project structure)
#   --sandbox-e2e: Run local sandbox deploy + end-to-end flow (requires Aztec CLI)
#   --help: Show this help message
#
# Prerequisites:
#   - noirup installed (Noir toolchain installer)
#   - For full mode: Docker with Aztec CLI installed
#
# Contract Architecture (v3.0.x):
#   - StakedAztecToken: Liquid staking token (stAZTEC)
#   - LiquidStakingCore: Main entry point for deposits/withdrawals
#   - WithdrawalQueue: FIFO unbonding queue with 7-day period

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

AZTEC_DIR="$(resolve_aztec_root "$SCRIPT_DIR")"
CONTRACTS_DIR="${AZTEC_DIR}/contracts"
TESTS_DIR="${CONTRACTS_DIR}/staking-math-tests"

USAGE="Usage: $0 [--minimal] [--sandbox-e2e] [--help]

Verifies the Aztec development environment and toolchain.
  --minimal       Only test Docker-independent features
  --sandbox-e2e   Run local sandbox deploy + end-to-end flow
  --help          Show this help message"

show_help_if_requested "$USAGE" "$@"

# Parse arguments
MINIMAL_MODE=false
SANDBOX_E2E=false
if has_flag "--minimal" "$@"; then MINIMAL_MODE=true; fi
if has_flag "--sandbox-e2e" "$@"; then SANDBOX_E2E=true; fi

print_banner "Aztec Liquid Staking Smoke Test"
echo "Aztec directory: $AZTEC_DIR"
if [ "$MINIMAL_MODE" = true ]; then
    echo -e "Mode: ${BLUE}Minimal${NC} (Docker-independent tests only)"
else
    echo -e "Mode: ${BLUE}Full${NC} (all tests, Docker required)"
fi
if [ "$SANDBOX_E2E" = true ]; then
    echo -e "Sandbox E2E: ${BLUE}Enabled${NC} (local deploy + flow)"
fi
echo ""

ENV_TYPE=$(detect_environment)
echo -e "Environment: ${BLUE}$ENV_TYPE${NC}"
echo ""

# ============================================================
# TEST 1: Standard Nargo (Required for unit tests)
# ============================================================
echo "Test 1: Checking standard nargo installation..."
NARGO_BIN="$(find_nargo)"

if [ -n "$NARGO_BIN" ]; then
    NARGO_VERSION=$("$NARGO_BIN" --version 2>/dev/null | head -1)
    pass "Standard nargo found: $NARGO_VERSION"
else
    fail "Standard nargo not found"
    echo "  Install via: curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash"
    echo "  Then run: ~/.nargo/bin/noirup"
fi

# ============================================================
# TEST 2: Aztec CLI (Compile Support)
# ============================================================
echo ""
echo "Test 2: Checking Aztec CLI installation..."

AZTEC_CLI_FOUND=false
AZTEC_CLI_BIN="$(find_aztec_cli)"

if [ -n "$AZTEC_CLI_BIN" ]; then
    AZTEC_CLI_FOUND=true
fi

if [ "$AZTEC_CLI_FOUND" = true ]; then
    AZTEC_CLI_VERSION=$("$AZTEC_CLI_BIN" --version 2>/dev/null | head -1)
    pass "Aztec CLI found: $AZTEC_CLI_VERSION"
elif [ "$MINIMAL_MODE" = true ]; then
    skip "Aztec CLI (requires full toolchain)"
else
    if [ "$ENV_TYPE" = "sandboxed" ]; then
        warn "Aztec CLI unavailable (sandboxed environment, Docker not supported)"
    else
        fail "Aztec CLI not found"
        echo "  Install via: bash -i <(curl -s https://install.aztec.network)"
        echo "  Then run: aztec-up <version>"
    fi
fi

# ============================================================
# TEST 3: Staking Math Unit Tests (Uses standard nargo)
# ============================================================
echo ""
echo "Test 3: Running staking math unit tests..."
if [ -d "$TESTS_DIR" ] && [ -f "$TESTS_DIR/Nargo.toml" ] && [ -n "$NARGO_BIN" ]; then
    ORIG_DIR=$(pwd)
    cd "$TESTS_DIR" || exit 1
    TEST_OUTPUT=$("$NARGO_BIN" test 2>&1)
    cd "$ORIG_DIR" || true
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
# TEST 4: Aztec Contract Compilation (Requires Aztec CLI)
# ============================================================
echo ""
echo "Test 4: Checking Aztec contract compilation..."

compile_contract() {
    local contract_name=$1
    local contract_dir=$2

    echo "  Compiling $contract_name..."
    rm -rf ~/aztec-contracts/"$contract_dir" 2>/dev/null
    mkdir -p ~/aztec-contracts 2>/dev/null
    cp -r "$CONTRACTS_DIR/$contract_dir" ~/aztec-contracts/ 2>/dev/null
    ORIG_DIR=$(pwd)
    cd ~/aztec-contracts/"$contract_dir" || return 1
    COMPILE_OUTPUT=$("$AZTEC_CLI_BIN" compile 2>&1)
    COMPILE_STATUS=$?
    cd "$ORIG_DIR" || true

    if [ "$COMPILE_STATUS" -eq 0 ] && [ -d ~/aztec-contracts/"$contract_dir"/target ]; then
        ARTIFACT_SIZE=$(du -sh ~/aztec-contracts/"$contract_dir"/target 2>/dev/null | cut -f1)
        echo -e "    ${GREEN}✓${NC} $contract_name compiled ($ARTIFACT_SIZE)"
        return 0
    else
        echo -e "    ${RED}✗${NC} $contract_name failed"
        echo "$COMPILE_OUTPUT" | tail -5
        return 1
    fi
}

if [ "$MINIMAL_MODE" = true ]; then
    skip "Contract compilation (requires aztec compile)"
elif [ "$AZTEC_CLI_FOUND" = true ]; then
    CONTRACTS_COMPILED=0

    compile_contract "StakedAztecToken" "staked-aztec-token" && CONTRACTS_COMPILED=$((CONTRACTS_COMPILED + 1))
    compile_contract "LiquidStakingCore" "liquid-staking-core" && CONTRACTS_COMPILED=$((CONTRACTS_COMPILED + 1))
    compile_contract "WithdrawalQueue" "withdrawal-queue" && CONTRACTS_COMPILED=$((CONTRACTS_COMPILED + 1))

    if [ $CONTRACTS_COMPILED -eq 3 ]; then
        pass "All 3 contracts compiled successfully"
    else
        fail "Compiled $CONTRACTS_COMPILED/3 contracts"
    fi
else
    if [ "$ENV_TYPE" = "sandboxed" ]; then
        warn "Contract compilation unavailable (sandboxed environment)"
    else
        fail "Aztec CLI not available for contract compilation"
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
if DEVNET_VERSION=$(check_devnet_connectivity); then
    pass "Devnet reachable: $DEVNET_VERSION"
else
    warn "Could not connect to devnet at $AZTEC_DEVNET_URL"
fi

# ============================================================
# TEST 7: Contract Projects Structure
# ============================================================
echo ""
echo "Test 7: Checking contract projects..."

check_contract() {
    local name=$1
    local dir=$2
    check_contract_project "$name" "$CONTRACTS_DIR/$dir"
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
# TEST 8: Local Sandbox E2E (De-risks devnet deploy)
# ============================================================
RUN_SANDBOX_E2E=$SANDBOX_E2E
# Re-resolve CLI for sandbox E2E check
AZTEC_CLI_BIN="$(find_aztec_cli)"

if [ "$MINIMAL_MODE" = false ] && [ "$RUN_SANDBOX_E2E" = false ] && [ -n "$AZTEC_CLI_BIN" ]; then
    RUN_SANDBOX_E2E=true
fi

if [ "$RUN_SANDBOX_E2E" = true ]; then
    echo ""
    echo "Test 8: Local sandbox deploy + E2E flow..."
    if [ "$MINIMAL_MODE" = true ]; then
        skip "Sandbox E2E (requires full mode)"
    elif [ -x "$AZTEC_DIR/scripts/local-sandbox-e2e.sh" ]; then
        if "$AZTEC_DIR/scripts/local-sandbox-e2e.sh" >/tmp/aztec-sandbox-e2e.log 2>&1; then
            pass "Local sandbox E2E flow completed"
        else
            fail "Local sandbox E2E flow failed (see /tmp/aztec-sandbox-e2e.log)"
        fi
    else
        fail "Local sandbox E2E script not found"
    fi
else
    skip "Sandbox E2E (run with --sandbox-e2e when Aztec CLI is installed)"
fi

# ============================================================
# Summary
# ============================================================
print_test_summary "Smoke Test"

if [ "$TESTS_FAILED" -eq 0 ]; then
    if [ "$MINIMAL_MODE" = true ]; then
        echo -e "${GREEN}All minimal tests passed!${NC}"
        echo ""
        echo "Environment is ready for unit test development."
        echo ""
        echo "For full contract compilation and sandbox testing, you need:"
        echo "  1. Docker installed and running"
        echo "  2. Aztec CLI installed (aztec-up)"
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
    if [ "$AZTEC_CLI_FOUND" = true ]; then
        echo "  Compile:      cp -r staking/aztec/contracts/staked-aztec-token ~/aztec-contracts/ && cd ~/aztec-contracts/staked-aztec-token && aztec compile"
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
