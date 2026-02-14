#!/bin/bash

# [CLIENT NAME] Installation Script
# [Brief description of what this client does]
# Usage: ./install_[client].sh
# Requirements: [OS version], [RAM]GB+ RAM, [Storage]GB+ storage

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

log_installation_start "[CLIENT NAME]"

# Check system requirements
check_system_requirements [RAM] [STORAGE]

# Install dependencies
# install_dependencies DEPENDENCY_LIST

# Setup firewall rules for [CLIENT NAME]
# setup_firewall_rules PORT_LIST

# Create CLIENT_NAME directory
# CLIENT_NAME_DIR="$HOME/client_name"
# ensure_directory "$CLIENT_NAME_DIR"

# cd "$CLIENT_NAME_DIR" || exit

# [Download/Build steps specific to client]
log_info "Downloading/Building [CLIENT NAME]..."
# [Client-specific installation logic]

# Ensure JWT secret exists (for execution clients)
ensure_jwt_secret "$HOME/secrets/jwt.hex"

# [Configuration steps specific to client]
log_info "Creating [CLIENT NAME] configuration..."
# [Client-specific configuration logic]

# Create systemd service
EXEC_START="[COMMAND_TO_START_CLIENT]"
create_systemd_service "[SERVICE_NAME]" "[SERVICE_DESCRIPTION]" "$EXEC_START" "$(whoami)" "on-failure" "600" "5" "300"

# Enable and start the service
enable_and_start_systemd_service "[SERVICE_NAME]"

# Show completion information
log_installation_complete "[CLIENT NAME]" "[SERVICE NAME]"
log_info "To check status: sudo systemctl status [SERVICE_NAME]"
log_info "To view logs: journalctl -fu [SERVICE_NAME]"

# [Client-specific additional information]
cat << EOF

=== [CLIENT NAME] Setup Information ===
[CLIENT NAME] has been installed with the following features:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Next Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Key features:
- [Port information]
- [API information]
- [Other important details]

EOF