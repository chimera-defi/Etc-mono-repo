#!/usr/bin/env bash
# Aztec Development Toolchain - Common Functions Library
#
# Shared utilities for all Aztec dev/test scripts.
# Source this at the top of every script:
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
#   source "$SCRIPT_DIR/lib/common.sh"

# Safety defaults (scripts can override after sourcing)
set -euo pipefail

# ============================================================
# Colors
# ============================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================
# Logging
# ============================================================
log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================================
# Test result tracking
# ============================================================
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

print_test_summary() {
    local label="${1:-Test}"
    echo ""
    echo "========================================"
    echo "$label Summary"
    echo "========================================"
    echo -e "Passed:  ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed:  ${RED}$TESTS_FAILED${NC}"
    echo -e "Skipped: ${BLUE}$TESTS_SKIPPED${NC}"
    echo ""
}

# ============================================================
# Environment detection
# ============================================================
detect_environment() {
    if grep -q "runsc" /proc/version 2>/dev/null || [ "$(uname -r)" = "4.4.0" ]; then
        echo "sandboxed"
    elif command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
        echo "docker-available"
    elif command -v docker &>/dev/null; then
        echo "docker-installed"
    else
        echo "no-docker"
    fi
}

# ============================================================
# Path resolution helpers
# ============================================================

# Resolve the Aztec project root (parent of scripts/)
resolve_aztec_root() {
    local script_dir="${1:-.}"
    cd "$script_dir/.." && pwd
}

# Find nargo binary (standard)
find_nargo() {
    if [ -f "$HOME/.nargo/bin/nargo" ]; then
        echo "$HOME/.nargo/bin/nargo"
    elif command -v nargo &>/dev/null; then
        command -v nargo
    else
        echo ""
    fi
}

# Find aztec-nargo binary
find_aztec_nargo() {
    if [ -f "$HOME/aztec-bin/aztec-nargo" ]; then
        echo "$HOME/aztec-bin/aztec-nargo"
    elif [ -f "$HOME/aztec-bin/nargo" ]; then
        echo "$HOME/aztec-bin/nargo"
    else
        echo ""
    fi
}

# Find Aztec CLI binary
find_aztec_cli() {
    if [ -f "$HOME/.aztec/bin/aztec" ]; then
        echo "$HOME/.aztec/bin/aztec"
    elif command -v aztec &>/dev/null; then
        command -v aztec
    else
        echo ""
    fi
}

# Find Aztec wallet binary
find_aztec_wallet() {
    if [ -f "$HOME/.aztec/bin/aztec-wallet" ]; then
        echo "$HOME/.aztec/bin/aztec-wallet"
    elif command -v aztec-wallet &>/dev/null; then
        command -v aztec-wallet
    else
        echo ""
    fi
}

# ============================================================
# Contract helpers
# ============================================================

# Check if a contract project exists (has Nargo.toml)
check_contract_project() {
    local name=$1
    local dir=$2
    if [ -d "$dir" ] && [ -f "$dir/Nargo.toml" ]; then
        echo -e "  ${GREEN}✓${NC} $name"
        return 0
    else
        echo -e "  ${YELLOW}✗${NC} $name (not found at $dir)"
        return 1
    fi
}

# Check if a compiled artifact has bytecode
artifact_has_bytecode() {
    local artifact=$1

    if command -v jq >/dev/null 2>&1; then
        jq -e 'any(.functions[]?; (.bytecode != null) and (.bytecode | length > 0))' "$artifact" >/dev/null 2>&1
        return $?
    fi

    grep -q '"bytecode"' "$artifact"
}

# ============================================================
# Devnet connectivity
# ============================================================
AZTEC_DEVNET_URL="${AZTEC_DEVNET_URL:-https://next.devnet.aztec-labs.com}"

check_devnet_connectivity() {
    local url="${1:-$AZTEC_DEVNET_URL}"
    local timeout="${2:-10}"
    local resp
    resp=$(curl -s -m "$timeout" -X POST "$url" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"node_getVersion","params":[],"id":1}' 2>/dev/null)

    if echo "$resp" | grep -q "result"; then
        local version
        version=$(echo "$resp" | grep -oP '"result"\s*:\s*"\K[^"]+' 2>/dev/null || echo "connected")
        echo "$version"
        return 0
    else
        return 1
    fi
}

# ============================================================
# Argument parsing helpers
# ============================================================
has_flag() {
    local flag="$1"
    shift
    for arg in "$@"; do
        if [ "$arg" = "$flag" ]; then
            return 0
        fi
    done
    return 1
}

show_help_if_requested() {
    local usage_text="$1"
    shift
    for arg in "$@"; do
        if [ "$arg" = "--help" ] || [ "$arg" = "-h" ]; then
            echo "$usage_text"
            exit 0
        fi
    done
}

# ============================================================
# Banner helper
# ============================================================
print_banner() {
    local title="$1"
    echo "========================================"
    echo "$title"
    echo "========================================"
    echo ""
}
