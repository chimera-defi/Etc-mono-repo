#!/usr/bin/env bash
# Aztec Contract Compilation Script
#
# Compiles all Aztec liquid staking contracts using the Aztec CLI.
# Artifacts are written to ~/aztec-contracts/<contract>/target/.
#
# Usage: ./scripts/compile-contracts.sh [--help] [contract_name]
#
# Arguments:
#   contract_name   Compile only this contract (e.g., staked-aztec-token)
#                   If omitted, all 3 core contracts are compiled.
#
# Prerequisites:
#   - Aztec CLI installed (aztec-up)
#   - OR aztec-nargo at ~/aztec-bin/nargo

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

AZTEC_DIR="$(resolve_aztec_root "$SCRIPT_DIR")"
CONTRACTS_DIR="${AZTEC_DIR}/contracts"
OUTPUT_DIR="${AZTEC_COMPILE_DIR:-$HOME/aztec-contracts}"

USAGE="Usage: $0 [--help] [contract_name]

Compiles Aztec liquid staking contracts.
  contract_name   Compile only this contract (e.g., staked-aztec-token)
  --help          Show this help message

Core contracts: staked-aztec-token, liquid-staking-core, withdrawal-queue

Output: $OUTPUT_DIR/<contract>/target/"

show_help_if_requested "$USAGE" "$@"

# Find compiler
COMPILER=""
COMPILER_NAME=""
AZTEC_CLI="$(find_aztec_cli)"
AZTEC_NARGO="$(find_aztec_nargo)"

if [ -n "$AZTEC_CLI" ]; then
    COMPILER="$AZTEC_CLI"
    COMPILER_NAME="aztec compile"
elif [ -n "$AZTEC_NARGO" ]; then
    COMPILER="$AZTEC_NARGO"
    COMPILER_NAME="aztec-nargo compile"
else
    log_error "No Aztec compiler found."
    echo "  Install Aztec CLI: bash -i <(curl -s https://install.aztec.network)"
    echo "  Or extract aztec-nargo: see scripts/setup-env.sh"
    exit 1
fi

log_info "Using compiler: $COMPILER_NAME"

# Compile a single contract
compile_one() {
    local name=$1
    local src_dir="$CONTRACTS_DIR/$name"
    local out_dir="$OUTPUT_DIR/$name"

    if [ ! -d "$src_dir" ] || [ ! -f "$src_dir/Nargo.toml" ]; then
        log_error "Contract not found: $src_dir"
        return 1
    fi

    log_info "Compiling $name..."
    rm -rf "${out_dir:?}" 2>/dev/null || true
    mkdir -p "$OUTPUT_DIR"
    cp -r "$src_dir" "$out_dir"

    pushd "$out_dir" >/dev/null || return 1

    if [ "$COMPILER_NAME" = "aztec compile" ]; then
        "$COMPILER" compile 2>&1 | tail -5
    else
        "$COMPILER" compile 2>&1 | tail -5
    fi
    local status=$?

    popd >/dev/null || true

    if [ $status -eq 0 ] && [ -d "$out_dir/target" ]; then
        local size
        size=$(du -sh "$out_dir/target" 2>/dev/null | cut -f1)
        echo -e "  ${GREEN}OK${NC} $name ($size)"
        return 0
    else
        echo -e "  ${RED}FAIL${NC} $name"
        return 1
    fi
}

# Core contracts
CORE_CONTRACTS=(staked-aztec-token liquid-staking-core withdrawal-queue)

print_banner "Aztec Contract Compilation"

# If a specific contract name is given, compile just that one
if [ $# -gt 0 ] && [ "$1" != "--help" ] && [ "$1" != "-h" ]; then
    compile_one "$1"
    exit $?
fi

# Otherwise compile all core contracts
compiled=0
failed=0
for contract in "${CORE_CONTRACTS[@]}"; do
    if compile_one "$contract"; then
        compiled=$((compiled + 1))
    else
        failed=$((failed + 1))
    fi
done

echo ""
log_info "Compiled: $compiled/${#CORE_CONTRACTS[@]} contracts"
if [ "$failed" -gt 0 ]; then
    log_error "Failed: $failed"
    exit 1
fi

echo ""
log_info "Artifacts written to: $OUTPUT_DIR/"
echo "  Run unit tests: cd $CONTRACTS_DIR/staking-math-tests && nargo test"
