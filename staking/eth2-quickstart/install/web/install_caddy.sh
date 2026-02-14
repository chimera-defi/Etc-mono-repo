#!/bin/bash

# Caddy Installation Script
# Installs and configures Caddy web server with automatic HTTPS

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"
source "$SCRIPT_DIR/caddy_helpers.sh"

# Get script directories
get_script_directories

log_installation_start "Caddy"

log_info "Server name: $SERVER_NAME"
log_info "Login username: $LOGIN_UNAME"

# Install Caddy
install_caddy

# Setup Caddy service and directories
setup_caddy_service

# Create Caddy configuration
log_info "Creating Caddy configuration..."
create_caddy_config_auto_https "$SERVER_NAME" "$HOME/caddy_conf_temp"

# Install Caddy configuration
log_info "Installing Caddy configuration..."
if ! sudo mv "$HOME/caddy_conf_temp" /etc/caddy/Caddyfile; then
    log_error "Failed to install Caddy configuration"
    exit 1
fi

# Set proper permissions
sudo chown caddy:caddy /etc/caddy/Caddyfile
sudo chmod 644 /etc/caddy/Caddyfile

# Setup firewall rules
log_info "Configuring firewall..."
setup_firewall_rules 80 443

# Validate Caddy configuration
validate_caddy_config "/etc/caddy/Caddyfile"

# Run Caddy hardening
log_info "Running Caddy security hardening..."
if ! ../security/caddy_harden.sh; then
    log_warn "Caddy hardening script failed, but continuing..."
fi

# Verify Caddy is running
log_info "Verifying Caddy installation..."
if sudo systemctl is-active --quiet caddy; then
    log_info "✓ Caddy is running successfully"
else
    log_error "Caddy failed to start"
    exit 1
fi

log_installation_complete "Caddy" "caddy"
log_info "Server name: $SERVER_NAME"
log_info "HTTPS WebSocket endpoint: https://$SERVER_NAME/ws"
log_info "HTTPS RPC endpoint: https://$SERVER_NAME/rpc"

log_info ""
log_info "=== Caddy Setup Complete ==="
log_info "Caddy has been installed with automatic HTTPS support"
log_info "Configuration file: /etc/caddy/Caddyfile"
log_info "Logs: /var/log/caddy/access.log"
log_info "Service: sudo systemctl status caddy"
log_info ""
log_info "Note: Automatic HTTPS requires DNS to be properly configured"
log_info "For manual SSL setup, see install_caddy_ssl.sh"