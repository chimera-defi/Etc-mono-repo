#!/bin/bash


# Prysm Checkpoint Sync Example Script
# This script demonstrates how to run Prysm with checkpoint sync
# for faster initial synchronization

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

log_info "Starting Prysm checkpoint sync example..."

# Check if Prysm is installed
if [[ ! -f "./prysm.sh" ]]; then
    log_error "Prysm not found. Please run ../consensus/prysm.sh first"
    exit 1
fi

# Check if checkpoint files exist
CHECKPOINT_BLOCK="block_mainnet_altair_4620512-0xef9957e6a709223202ab00f4ee2435e1d42042ad35e160563015340df677feb0.ssz"
CHECKPOINT_STATE="state_mainnet_altair_4620512-0xc1397f57149c99b3a2166d422a2ee50602e2a2c7da2e31d7ea740216b8fd99ab.ssz"
GENESIS_STATE="genesis.ssz"

if [[ ! -f "$CHECKPOINT_BLOCK" ]]; then
    log_error "Checkpoint block file not found: $CHECKPOINT_BLOCK"
    exit 1
fi

if [[ ! -f "$CHECKPOINT_STATE" ]]; then
    log_error "Checkpoint state file not found: $CHECKPOINT_STATE"
    exit 1
fi

if [[ ! -f "$GENESIS_STATE" ]]; then
    log_error "Genesis state file not found: $GENESIS_STATE"
    exit 1
fi

log_info "Running Prysm with checkpoint sync..."
log_info "Checkpoint block: $CHECKPOINT_BLOCK"
log_info "Checkpoint state: $CHECKPOINT_STATE"
log_info "Genesis state: $GENESIS_STATE"

# Run Prysm with checkpoint sync
./prysm.sh beacon-chain \
    --checkpoint-block="$PWD"/"$CHECKPOINT_BLOCK" \
    --checkpoint-state="$PWD"/"$CHECKPOINT_STATE" \
    --genesis-state="$PWD"/"$GENESIS_STATE" \
    --config-file="$PWD"/prysm_beacon_conf.yaml \
    --p2p-host-ip=88.99.65.230
 