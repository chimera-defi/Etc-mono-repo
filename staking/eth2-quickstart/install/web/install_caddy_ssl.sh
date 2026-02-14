#!/bin/bash

# Caddy SSL Configuration Script
# Configures Caddy to use manual SSL certificates (Let's Encrypt or custom)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"
source "$SCRIPT_DIR/caddy_helpers.sh"

# Get script directories
get_script_directories

# Start installation
log_installation_start "Caddy SSL"
log_info "Server name: $SERVER_NAME"

# Check if Caddy is installed
if ! command_exists caddy; then
    log_error "Caddy is not installed. Please run install_caddy.sh first"
    exit 1
fi

# Create SSL-enabled Caddy configuration
log_info "Creating SSL-enabled Caddy configuration..."
create_caddy_config_manual_ssl "$SERVER_NAME" "$HOME/caddy_ssl_conf_temp" "/etc/letsencrypt/live/$SERVER_NAME/fullchain.pem" "/etc/letsencrypt/live/$SERVER_NAME/privkey.pem"

# Verify SSL certificates exist
log_info "Verifying SSL certificates..."
if [[ ! -f "/etc/letsencrypt/live/$SERVER_NAME/fullchain.pem" ]]; then
    log_error "SSL certificate not found: /etc/letsencrypt/live/$SERVER_NAME/fullchain.pem"
    log_error "Please run install_ssl_certbot.sh or install_acme_ssl.sh first"
    exit 1
fi

# Install SSL-enabled Caddy configuration
log_info "Installing SSL-enabled Caddy configuration..."
if ! sudo mv "$HOME/caddy_ssl_conf_temp" /etc/caddy/Caddyfile; then
    log_error "Failed to install SSL Caddy configuration"
    exit 1
fi

# Set proper permissions
sudo chown caddy:caddy /etc/caddy/Caddyfile
sudo chmod 644 /etc/caddy/Caddyfile

# Setup firewall rules
log_info "Configuring firewall for SSL..."
setup_firewall_rules 80 443

# Validate Caddy configuration
validate_caddy_config "/etc/caddy/Caddyfile"

# Restart Caddy
log_info "Restarting Caddy with SSL configuration..."
if ! sudo systemctl restart caddy; then
    log_error "Failed to restart Caddy"
    exit 1
fi

# Verify Caddy is running
log_info "Verifying Caddy SSL configuration..."
if sudo systemctl is-active --quiet caddy; then
    log_info "✓ Caddy is running with SSL successfully"
else
    log_error "Caddy failed to start with SSL configuration"
    exit 1
fi

log_info "Caddy SSL configuration completed!"
log_info "Server name: $SERVER_NAME"
log_info "HTTPS WebSocket endpoint: https://$SERVER_NAME/ws"
log_info "HTTPS RPC endpoint: https://$SERVER_NAME/rpc"