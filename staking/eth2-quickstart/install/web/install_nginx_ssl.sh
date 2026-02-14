#!/bin/bash

# NGINX SSL Configuration Script
# Configures NGINX to use SSL certificates

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"
source "$SCRIPT_DIR/nginx_helpers.sh"

# Get script directories
get_script_directories

# Start installation
log_installation_start "NGINX SSL"
log_info "Server name: $SERVER_NAME"

# Check if Nginx is installed
if ! command_exists nginx; then
    log_error "Nginx is not installed. Please run install_nginx.sh first"
    exit 1
fi

# Verify SSL certificates exist
log_info "Verifying SSL certificates..."
if [[ ! -f "/etc/letsencrypt/live/$SERVER_NAME/fullchain.pem" ]]; then
    log_error "SSL certificate not found: /etc/letsencrypt/live/$SERVER_NAME/fullchain.pem"
    log_error "Please run install_ssl_certbot.sh or install_acme_ssl.sh first"
    exit 1
fi

# Create SSL-enabled Nginx configuration
log_info "Creating SSL-enabled Nginx configuration..."
create_nginx_config "$SERVER_NAME" "$HOME/nginx_conf_temp" "true" "/etc/letsencrypt/live/$SERVER_NAME/fullchain.pem" "/etc/letsencrypt/live/$SERVER_NAME/privkey.pem"

# Add rate limiting
log_info "Adding rate limiting..."
add_rate_limiting

# Configure DDoS protection
log_info "Configuring DDoS protection..."
configure_ddos_protection

# Install SSL-enabled Nginx configuration
log_info "Installing SSL-enabled Nginx configuration..."
if ! sudo mv "$HOME/nginx_conf_temp" /etc/nginx/sites-enabled/default; then
    log_error "Failed to install SSL Nginx configuration"
    exit 1
fi

# Set proper permissions
sudo chown root:root /etc/nginx/sites-enabled/default
sudo chmod 644 /etc/nginx/sites-enabled/default

# Setup firewall rules
log_info "Configuring firewall for SSL..."
setup_firewall_rules 80 443

# Validate Nginx configuration
validate_nginx_config

# Restart Nginx with SSL configuration
log_info "Restarting Nginx with SSL configuration..."
if ! sudo systemctl restart nginx; then
    log_error "Failed to restart Nginx"
    exit 1
fi

# Run Nginx hardening
log_info "Running Nginx security hardening..."
if ! ../security/nginx_harden.sh; then
    log_warn "Nginx hardening script failed, but continuing..."
fi

# Verify Nginx is running
log_info "Verifying Nginx SSL configuration..."
if sudo systemctl is-active --quiet nginx; then
    log_info "✓ Nginx is running with SSL successfully"
else
    log_error "Nginx failed to start with SSL configuration"
    exit 1
fi

log_info "Nginx SSL configuration completed!"
log_info "Server name: $SERVER_NAME"
log_info "HTTPS WebSocket endpoint: https://$SERVER_NAME/ws"
log_info "HTTPS RPC endpoint: https://$SERVER_NAME/rpc"
