#!/bin/bash

# Comprehensive Update Script for eth2-quickstart
# Updates both the eth2-quickstart files and the Ethereum software stack
# Usage: ./update_all.sh [--git-only] [--software-only] [--backup] [--force] [--rollback]
# 
# Options:
#   --git-only      Update only the eth2-quickstart files from git
#   --software-only Update only the Ethereum software stack
#   --backup        Create backup before updating (recommended for git updates)
#   --force         Force update even if there are local changes (git only)
#   --rollback      Rollback to previous version if available (git only)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

# Configuration
GIT_UPDATE_SCRIPT="$SCRIPT_DIR/update_git.sh"
SOFTWARE_UPDATE_SCRIPT="$SCRIPT_DIR/update.sh"

# Parse command line arguments
GIT_ONLY=false
SOFTWARE_ONLY=false
CREATE_BACKUP=false
FORCE_UPDATE=false
ROLLBACK_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --git-only)
            GIT_ONLY=true
            shift
            ;;
        --software-only)
            SOFTWARE_ONLY=true
            shift
            ;;
        --backup)
            CREATE_BACKUP=true
            shift
            ;;
        --force)
            FORCE_UPDATE=true
            shift
            ;;
        --rollback)
            ROLLBACK_MODE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--git-only] [--software-only] [--backup] [--force] [--rollback]"
            echo ""
            echo "Options:"
            echo "  --git-only      Update only the eth2-quickstart files from git"
            echo "  --software-only Update only the Ethereum software stack"
            echo "  --backup        Create backup before updating (recommended for git updates)"
            echo "  --force         Force update even if there are local changes (git only)"
            echo "  --rollback      Rollback to previous version if available (git only)"
            echo "  -h, --help      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --backup                    # Update both git files and software with backup"
            echo "  $0 --git-only --backup         # Update only git files with backup"
            echo "  $0 --software-only             # Update only software stack"
            echo "  $0 --rollback                  # Rollback git changes"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Validate script combinations
if [[ "$GIT_ONLY" == "true" && "$SOFTWARE_ONLY" == "true" ]]; then
    log_error "Cannot specify both --git-only and --software-only"
    exit 1
fi

if [[ "$ROLLBACK_MODE" == "true" && "$SOFTWARE_ONLY" == "true" ]]; then
    log_error "Rollback is only available for git updates"
    exit 1
fi

# Function to update git files
update_git_files() {
    log_info "Updating eth2-quickstart files from git..."
    
    local git_args=()
    [[ "$CREATE_BACKUP" == "true" ]] && git_args+=("--backup")
    [[ "$FORCE_UPDATE" == "true" ]] && git_args+=("--force")
    [[ "$ROLLBACK_MODE" == "true" ]] && git_args+=("--rollback")
    
    if ! "$GIT_UPDATE_SCRIPT" "${git_args[@]}"; then
        log_error "Git update failed"
        return 1
    fi
    
    log_info "Git update completed successfully"
    return 0
}

# Function to update software stack
update_software_stack() {
    log_info "Updating Ethereum software stack..."
    
    if ! "$SOFTWARE_UPDATE_SCRIPT"; then
        log_error "Software update failed"
        return 1
    fi
    
    log_info "Software update completed successfully"
    return 0
}

# Function to show update summary
show_update_summary() {
    echo ""
    echo "=========================================="
    echo "           UPDATE SUMMARY"
    echo "=========================================="
    echo "Update time: $(date)"
    
    if [[ "$GIT_ONLY" == "true" ]]; then
        echo "Updated: eth2-quickstart files from git"
    elif [[ "$SOFTWARE_ONLY" == "true" ]]; then
        echo "Updated: Ethereum software stack"
    else
        echo "Updated: Both eth2-quickstart files and software stack"
    fi
    
    if [[ "$CREATE_BACKUP" == "true" ]]; then
        echo "Backup created: ~/eth2-quickstart-backups/latest_backup"
    fi
    
    echo ""
    echo "Next steps:"
    echo "1. Review any changes to configuration files"
    echo "2. Update your exports.sh if needed"
    echo "3. Restart services if necessary:"
    echo "   sudo systemctl restart eth1 cl validator mev nginx"
    echo "4. Check service status:"
    echo "   ./install/utils/stats.sh"
    echo ""
    if [[ "$GIT_ONLY" == "false" && "$SOFTWARE_ONLY" == "false" ]]; then
        echo "For future updates:"
        echo "  ./install/utils/update_all.sh --git-only --backup    # Update only git files"
        echo "  ./install/utils/update_all.sh --software-only        # Update only software"
        echo "  ./install/utils/update_all.sh --backup               # Update both"
    fi
    echo "=========================================="
}

# Main execution
main() {
    log_info "Starting comprehensive eth2-quickstart update..."
    
    # Change to project root
    cd "$PROJECT_ROOT" || {
        log_error "Failed to change to project root: $PROJECT_ROOT"
        exit 1
    }
    
    # Check if required scripts exist
    if [[ ! -f "$GIT_UPDATE_SCRIPT" ]]; then
        log_error "Git update script not found: $GIT_UPDATE_SCRIPT"
        exit 1
    fi
    
    if [[ ! -f "$SOFTWARE_UPDATE_SCRIPT" ]]; then
        log_error "Software update script not found: $SOFTWARE_UPDATE_SCRIPT"
        exit 1
    fi
    
    # Determine what to update
    local update_git=false
    local update_software=false
    
    if [[ "$GIT_ONLY" == "true" ]]; then
        update_git=true
    elif [[ "$SOFTWARE_ONLY" == "true" ]]; then
        update_software=true
    else
        # Default: update both
        update_git=true
        update_software=true
    fi
    
    # Perform updates
    local success=true
    
    if [[ "$update_git" == "true" ]]; then
        if ! update_git_files; then
            success=false
        fi
    fi
    
    if [[ "$update_software" == "true" && "$success" == "true" ]]; then
        if ! update_software_stack; then
            success=false
        fi
    fi
    
    if [[ "$success" == "false" ]]; then
        log_error "Update process failed"
        if [[ "$update_git" == "true" && "$CREATE_BACKUP" == "true" ]]; then
            log_info "You can rollback git changes using: $0 --rollback"
        fi
        exit 1
    fi
    
    # Show summary
    show_update_summary
    
    log_info "Comprehensive update completed successfully!"
}

# Run main function
main "$@"
