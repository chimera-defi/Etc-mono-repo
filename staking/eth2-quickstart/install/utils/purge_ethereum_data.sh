#!/bin/bash

# Ethereum Data Purge Script
# Removes all Ethereum client data directories for clean client switching
# Usage: ./purge_ethereum_data.sh [--confirm] [--dry-run]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# Source common functions
source "$PROJECT_ROOT/lib/common_functions.sh"
get_script_directories

# Source exports for configuration
if [[ -f "$PROJECT_ROOT/exports.sh" ]]; then
    source "$PROJECT_ROOT/exports.sh"
else
    export LOGIN_UNAME="eth"
fi

# Configuration
DRY_RUN=false
CONFIRM_ACTION=false

# All Ethereum data directories to remove
DATA_DIRS=(
    # Execution clients
    "$HOME/.ethereum"                    # Geth
    "$HOME/.local/share/nethermind"      # Nethermind
    "$HOME/.local/share/besu"           # Besu
    "$HOME/.local/share/erigon"         # Erigon
    "$HOME/.local/share/reth"           # Reth
    "$HOME/.local/share/nimbus-eth1"   # Nimbus execution client
    
    # Consensus clients
    "$HOME/.local/share/prysm"          # Prysm data
    "$HOME/.lighthouse"                 # Lighthouse
    "$HOME/.local/share/teku"           # Teku
    "$HOME/.local/share/nimbus"         # Nimbus
    "$HOME/.local/share/lodestar"       # Lodestar
    "$HOME/.local/share/grandine"       # Grandine
    
    # Client directories
    "$HOME/prysm"                       # Prysm
    "$HOME/lighthouse"                  # Lighthouse
    "$HOME/teku"                        # Teku
    "$HOME/nimbus"                      # Nimbus
    "$HOME/lodestar"                    # Lodestar
    "$HOME/grandine"                    # Grandine
    "$HOME/nethermind"                  # Nethermind
    "$HOME/besu"                        # Besu
    "$HOME/erigon"                      # Erigon
    "$HOME/reth"                        # Reth
    "$HOME/nimbus-eth1"                # Nimbus execution client
    "$HOME/mev-boost"                   # MEV-Boost
    
    # Common directories
    "$HOME/secrets"                     # JWT secrets, validator keys
)

# Services to manage
SERVICES=(eth1 cl validator mev nginx)

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --confirm)
            CONFIRM_ACTION=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--confirm] [--dry-run]"
            echo "  --confirm    Skip confirmation prompt"
            echo "  --dry-run    Show what would be deleted"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if running as correct user
check_user "$LOGIN_UNAME"

# Show what will be deleted
show_deletion_summary() {
    log_info "=== DELETION SUMMARY ==="
    local count=0
    
    for dir in "${DATA_DIRS[@]}"; do
        if [[ -d "$dir" && -n "$(ls -A "$dir" 2>/dev/null)" ]]; then
            local size
            size=$(du -sh "$dir" 2>/dev/null | cut -f1)
            log_info "  $dir ($size)"
            ((count++))
        fi
    done
    
    if [[ $count -eq 0 ]]; then
        log_info "No Ethereum data directories found to delete."
        return 1
    fi
    
    log_warn "Total directories to delete: $count"
    return 0
}

# Confirm deletion
confirm_deletion() {
    if [[ "$CONFIRM_ACTION" == "true" ]]; then
        return 0
    fi
    
    log_warn "WARNING: This will permanently delete all Ethereum client data!"
    log_warn "This includes blockchain data, validator keys, and configurations."
    read -p "Are you sure you want to continue? (yes/no): " -r
    
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        return 0
    else
        log_info "Operation cancelled by user."
        exit 0
    fi
}

# Stop services
stop_services() {
    log_info "Stopping Ethereum services..."
    
    for service in "${SERVICES[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            log_info "Stopping $service service..."
            if [[ "$DRY_RUN" == "false" ]]; then
                sudo systemctl stop "$service" || log_warn "Failed to stop $service"
            else
                log_info "[DRY RUN] Would stop: $service"
            fi
        fi
    done
}

# Disable services
disable_services() {
    log_info "Disabling Ethereum services..."
    
    for service in "${SERVICES[@]}"; do
        if systemctl is-enabled "$service" >/dev/null 2>&1; then
            log_info "Disabling $service service..."
            if [[ "$DRY_RUN" == "false" ]]; then
                sudo systemctl disable "$service" || log_warn "Failed to disable $service"
            else
                log_info "[DRY RUN] Would disable: $service"
            fi
        fi
    done
}

# Delete directories
delete_directories() {
    for dir in "${DATA_DIRS[@]}"; do
        if [[ -d "$dir" && -n "$(ls -A "$dir" 2>/dev/null)" ]]; then
            log_info "Deleting: $dir"
            if [[ "$DRY_RUN" == "false" ]]; then
                if ! rm -rf "$dir" 2>/dev/null; then
                    log_error "Failed to delete $dir"
                fi
            else
                log_info "[DRY RUN] Would delete: $dir"
            fi
        fi
    done
}

# Main execution
main() {
    log_info "Starting Ethereum Data Purge"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN MODE - No files will be deleted"
    fi
    
    # Show what will be deleted
    if ! show_deletion_summary; then
        log_info "No data to purge."
        exit 0
    fi
    
    # Confirm deletion
    confirm_deletion
    
    # Stop services
    stop_services
    
    # Delete directories
    delete_directories
    
    # Disable services
    disable_services
    
    if [[ "$DRY_RUN" == "false" ]]; then
        sudo systemctl daemon-reload
    fi
    
    log_info "Ethereum data purge completed!"
    log_info "You can now install new clients with a clean slate."
}

# Run main function
main "$@"