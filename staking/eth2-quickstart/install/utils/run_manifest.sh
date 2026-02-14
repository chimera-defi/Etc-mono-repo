#!/bin/bash

# Eth2 Quick Start - Manifest Runner
# Executes installation phases with logging and error handling
#
# This script:
# 1. Auto-detects which phase should run based on user context
# 2. Executes the appropriate phase script
# 3. Logs output for debugging
# 4. Provides clear feedback and next steps

set -e

# =============================================================================
# SETUP
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../" && pwd)"

# Source common functions for logging (required - no fallback)
# shellcheck source=../../lib/common_functions.sh
source "$ROOT_DIR/lib/common_functions.sh"

# Phase script locations
PHASE1_MANIFEST="$ROOT_DIR/install_phase1.sh"
PHASE2_MANIFEST="$ROOT_DIR/install_phase2.sh"
LOG_DIR="$ROOT_DIR/logs"

# Create log directory
mkdir -p "$LOG_DIR"

# =============================================================================
# ARGUMENT PARSING
# =============================================================================

DRY_RUN=false
FORCE_PHASE=""

for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            ;;
        --phase1)
            FORCE_PHASE="1"
            ;;
        --phase2)
            FORCE_PHASE="2"
            ;;
        --help)
            echo ""
            echo "Eth2 Quick Start - Manifest Runner"
            echo ""
            echo "Usage: ./run_manifest.sh [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run   Show what would be executed without running"
            echo "  --phase1    Force run Phase 1 (system hardening)"
            echo "  --phase2    Force run Phase 2 (client installation)"
            echo "  --help      Show this help message"
            echo ""
            echo "Security Model:"
            echo "  Phase 1: System hardening (run as root, requires reboot)"
            echo "  Phase 2: Client installation (run as new user after reboot)"
            echo ""
            exit 0
            ;;
    esac
done

# =============================================================================
# PHASE DETECTION
# =============================================================================

detect_phase() {
    # If forced, use that
    if [[ -n "$FORCE_PHASE" ]]; then
        echo "$FORCE_PHASE"
        return
    fi

    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        # Root user - should run Phase 1
        echo "1"
    else
        # Non-root user - should run Phase 2
        echo "2"
    fi
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Eth2 Quick Start - Manifest Runner${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Source configuration if available
if [[ -f "$ROOT_DIR/exports.sh" ]]; then
    # shellcheck source=/dev/null
    source "$ROOT_DIR/exports.sh" 2>/dev/null || true
fi
if [[ -f "$ROOT_DIR/config/user_config.env" ]]; then
    # shellcheck source=/dev/null
    source "$ROOT_DIR/config/user_config.env" 2>/dev/null || true
fi

# Detect phase
PHASE=$(detect_phase)
log_info "Detected Phase: $PHASE"

case "$PHASE" in
    "1")
        MANIFEST_FILE="$PHASE1_MANIFEST"
        LOG_FILE="$LOG_DIR/phase1_$(date +%Y%m%d_%H%M%S).log"

        if [[ ! -f "$MANIFEST_FILE" ]]; then
            log_error "Phase 1 manifest not found: $MANIFEST_FILE"
            echo ""
            echo "Please run the configuration wizard first:"
            echo "  ./install/utils/configure.sh"
            exit 1
        fi

        log_info "Running Phase 1: System Hardening"
        echo ""
        echo -e "${YELLOW}This phase will:${NC}"
        echo "  - Update system packages"
        echo "  - Configure SSH security"
        echo "  - Create secure user account"
        echo "  - Setup firewall and intrusion detection"
        echo ""
        echo -e "${RED}After completion, you MUST reboot and login as the new user.${NC}"
        echo ""
        ;;
    "2")
        MANIFEST_FILE="$PHASE2_MANIFEST"
        LOG_FILE="$LOG_DIR/phase2_$(date +%Y%m%d_%H%M%S).log"

        if [[ ! -f "$MANIFEST_FILE" ]]; then
            log_error "Phase 2 manifest not found: $MANIFEST_FILE"
            echo ""
            echo "Please run the configuration wizard first:"
            echo "  ./install/utils/configure.sh"
            exit 1
        fi

        log_info "Running Phase 2: Client Installation"
        echo ""
        echo "Configuration:"
        echo "  Network:    ${ETH_NETWORK:-mainnet}"
        echo "  Execution:  ${EXEC_CLIENT:-not set}"
        echo "  Consensus:  ${CONS_CLIENT:-not set}"
        echo "  MEV:        ${MEV_SOLUTION:-not set}"
        echo ""
        ;;
    *)
        log_error "Unknown phase: $PHASE"
        exit 1
        ;;
esac

if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${YELLOW}[DRY RUN] Would execute:${NC}"
    echo "  $MANIFEST_FILE"
    echo ""
    echo "--- Manifest Contents ---"
    head -50 "$MANIFEST_FILE"
    echo "..."
    echo "--- End Preview ---"
    exit 0
fi

# Confirm before proceeding
echo -e "${YELLOW}Log file: $LOG_FILE${NC}"
echo ""
read -r -p "Press Enter to continue or Ctrl+C to cancel..."

# Execute the manifest
log_info "Starting installation..."
echo ""

cd "$ROOT_DIR"
if "$MANIFEST_FILE" 2>&1 | tee -a "$LOG_FILE"; then
    log_info "Phase $PHASE completed successfully"
else
    log_error "Phase $PHASE failed. Check log: $LOG_FILE"
    exit 1
fi
