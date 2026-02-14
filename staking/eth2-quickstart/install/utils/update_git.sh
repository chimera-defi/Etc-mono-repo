#!/bin/bash

# Git Update Script for eth2-quickstart
# Updates the eth2-quickstart files by pulling the latest version from git
# Usage: ./update_git.sh [--backup] [--force] [--rollback]
# 
# Options:
#   --backup    Create backup before updating (recommended)
#   --force     Force update even if there are local changes
#   --rollback  Rollback to previous version if available

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/lib/common_functions.sh"
get_script_directories

# Configuration
BACKUP_DIR="$HOME/eth2-quickstart-backups"
GIT_REPO_URL="https://github.com/chimera-defi/eth2-quickstart.git"
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
TARGET_BRANCH="master"

# Parse command line arguments
CREATE_BACKUP=false
FORCE_UPDATE=false
ROLLBACK_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
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
            echo "Usage: $0 [--backup] [--force] [--rollback]"
            echo ""
            echo "Options:"
            echo "  --backup    Create backup before updating (recommended)"
            echo "  --force     Force update even if there are local changes"
            echo "  --rollback  Rollback to previous version if available"
            echo "  -h, --help  Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to create backup
create_backup() {
    local backup_name
    backup_name="eth2-quickstart-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log_info "Creating backup: $backup_path"
    
    # Create backup directory
    ensure_directory "$BACKUP_DIR"
    
    # Create backup of current state
    if [[ -d "$PROJECT_ROOT" ]]; then
        cp -r "$PROJECT_ROOT" "$backup_path"
        log_info "Backup created successfully: $backup_path"
        
        # Store backup info
        echo "$backup_name" > "$BACKUP_DIR/latest_backup"
        echo "$CURRENT_BRANCH" > "$backup_path/backup_branch"
        date > "$backup_path/backup_timestamp"
        
        return 0
    else
        log_error "Project root not found: $PROJECT_ROOT"
        return 1
    fi
}

# Function to rollback to previous version
rollback_update() {
    if [[ ! -f "$BACKUP_DIR/latest_backup" ]]; then
        log_error "No backup found for rollback"
        return 1
    fi
    
    local latest_backup
    latest_backup=$(cat "$BACKUP_DIR/latest_backup")
    local backup_path="$BACKUP_DIR/$latest_backup"
    
    if [[ ! -d "$backup_path" ]]; then
        log_error "Backup directory not found: $backup_path"
        return 1
    fi
    
    log_info "Rolling back to: $latest_backup"
    
    # Stop services before rollback
    log_info "Stopping services for rollback..."
    stop_all_services || true
    
    # Restore from backup
    if [[ -d "$PROJECT_ROOT" ]]; then
        rm -rf "$PROJECT_ROOT"
    fi
    
    cp -r "$backup_path" "$PROJECT_ROOT"
    
    # Restore permissions
    chmod +x "$PROJECT_ROOT"/*.sh
    find "$PROJECT_ROOT" -name "*.sh" -exec chmod +x {} \;
    
    log_info "Rollback completed successfully"
    log_info "You may need to restart services manually"
    
    return 0
}

# Function to check for local changes
check_local_changes() {
    if ! git status --porcelain | grep -q .; then
        log_info "No local changes detected"
        return 0
    else
        log_warn "Local changes detected:"
        git status --short
        return 1
    fi
}

# Function to handle merge conflicts
handle_merge_conflicts() {
    log_warn "Merge conflicts detected. Please resolve them manually:"
    echo ""
    echo "Files with conflicts:"
    git diff --name-only --diff-filter=U
    echo ""
    echo "To resolve conflicts:"
    echo "1. Edit the conflicted files"
    echo "2. Run: git add <resolved-files>"
    echo "3. Run: git commit"
    echo "4. Re-run this script"
    echo ""
    echo "Or to abort the update:"
    echo "git merge --abort"
    echo "git checkout $CURRENT_BRANCH"
    
    return 1
}

# Function to update from git
update_from_git() {
    log_info "Updating eth2-quickstart from git..."
    
    # Check if we're in a git repository
    if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
        log_error "Not in a git repository. Cannot update."
        return 1
    fi
    
    # Store current commit for reference
    local current_commit
    current_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    log_info "Current commit: $current_commit"
    
    # Fetch latest changes
    log_info "Fetching latest changes from remote..."
    if ! git fetch origin; then
        log_error "Failed to fetch from remote repository"
        return 1
    fi
    
    # Check if we're on the correct branch
    if [[ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]]; then
        log_info "Switching to branch: $TARGET_BRANCH"
        if ! git checkout "$TARGET_BRANCH"; then
            log_error "Failed to switch to branch: $TARGET_BRANCH"
            return 1
        fi
    fi
    
    # Check for local changes
    if ! check_local_changes; then
        if [[ "$FORCE_UPDATE" == "true" ]]; then
            log_warn "Force update enabled. Stashing local changes..."
            git stash push -m "Auto-stash before update $(date)"
        else
            log_error "Local changes detected. Use --force to override or commit/stash changes first."
            return 1
        fi
    fi
    
    # Pull latest changes
    log_info "Pulling latest changes..."
    if ! git pull origin "$TARGET_BRANCH"; then
        log_error "Failed to pull latest changes"
        if [[ "$FORCE_UPDATE" == "true" ]]; then
            log_warn "Attempting to reset to remote state..."
            git reset --hard "origin/$TARGET_BRANCH"
        else
            return 1
        fi
    fi
    
    # Get new commit hash
    local new_commit
    new_commit=$(git rev-parse HEAD)
    log_info "Updated to commit: $new_commit"
    
    # Update file permissions
    log_info "Updating file permissions..."
    chmod +x "$PROJECT_ROOT"/*.sh
    find "$PROJECT_ROOT" -name "*.sh" -exec chmod +x {} \;
    
    # Check if exports.sh was modified
    if git diff "$current_commit" "$new_commit" --name-only | grep -q "exports.sh"; then
        log_warn "exports.sh was updated. Please review your configuration."
        log_warn "Your current exports.sh may have been overwritten."
        log_warn "Check $BACKUP_DIR for your previous version if backup was created."
    fi
    
    return 0
}

# Function to verify update
verify_update() {
    log_info "Verifying update..."
    
    # Check if critical files exist
    local critical_files=(
        "exports.sh"
        "run_1.sh"
        "run_2.sh"
        "lib/common_functions.sh"
    )
    
    for file in "${critical_files[@]}"; do
        if [[ ! -f "$PROJECT_ROOT/$file" ]]; then
            log_error "Critical file missing after update: $file"
            return 1
        fi
    done
    
    # Check if scripts are executable
    if ! find "$PROJECT_ROOT" -name "*.sh" -exec test -x {} \; 2>/dev/null; then
        log_warn "Some scripts may not be executable"
    fi
    
    log_info "Update verification completed successfully"
    return 0
}

# Function to show update summary
show_update_summary() {
    local new_commit
    new_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    
    echo ""
    echo "=========================================="
    echo "           UPDATE SUMMARY"
    echo "=========================================="
    echo "Repository: $GIT_REPO_URL"
    echo "Branch: $TARGET_BRANCH"
    echo "New commit: $new_commit"
    echo "Update time: $(date)"
    
    if [[ "$CREATE_BACKUP" == "true" ]]; then
        echo "Backup created: $BACKUP_DIR/latest_backup"
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
    echo "If you encounter issues, you can rollback with:"
    echo "   ./install/utils/update_git.sh --rollback"
    echo "=========================================="
}

# Main execution
main() {
    log_info "Starting eth2-quickstart git update..."
    
    # Change to project root
    cd "$PROJECT_ROOT" || {
        log_error "Failed to change to project root: $PROJECT_ROOT"
        exit 1
    }
    
    # Handle rollback mode
    if [[ "$ROLLBACK_MODE" == "true" ]]; then
        rollback_update
        exit $?
    fi
    
    # Create backup if requested
    if [[ "$CREATE_BACKUP" == "true" ]]; then
        if ! create_backup; then
            log_error "Failed to create backup. Aborting update."
            exit 1
        fi
    fi
    
    # Update from git
    if ! update_from_git; then
        log_error "Failed to update from git"
        if [[ "$CREATE_BACKUP" == "true" ]]; then
            log_info "You can rollback using: $0 --rollback"
        fi
        exit 1
    fi
    
    # Verify update
    if ! verify_update; then
        log_error "Update verification failed"
        if [[ "$CREATE_BACKUP" == "true" ]]; then
            log_info "You can rollback using: $0 --rollback"
        fi
        exit 1
    fi
    
    # Show summary
    show_update_summary
    
    log_info "Git update completed successfully!"
}

# Run main function
main "$@"