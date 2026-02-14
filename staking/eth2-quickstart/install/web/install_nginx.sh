#!/bin/bash


# NGINX Installation Script
# Installs and configures NGINX web server

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"
source "$SCRIPT_DIR/nginx_helpers.sh"

# Get script directories
get_script_directories

log_installation_start "NGINX"

log_info "Server name: $SERVER_NAME"
log_info "Login username: $LOGIN_UNAME"

# Install Nginx
install_nginx

# Setup Nginx service and directories
setup_nginx_service

# Create Nginx configuration
log_info "Creating Nginx configuration..."
create_nginx_config "$SERVER_NAME" "$HOME/nginx_conf_temp" "false"

# Add rate limiting
log_info "Adding rate limiting..."
add_rate_limiting

# Configure DDoS protection
log_info "Configuring DDoS protection..."
configure_ddos_protection

# Install Nginx configuration
log_info "Installing Nginx configuration..."
if ! sudo mv "$HOME/nginx_conf_temp" /etc/nginx/sites-enabled/default; then
    log_error "Failed to install Nginx configuration"
    exit 1
fi

# Set proper permissions
sudo chown root:root /etc/nginx/sites-enabled/default
sudo chmod 644 /etc/nginx/sites-enabled/default

# Setup firewall rules
log_info "Configuring firewall..."
setup_firewall_rules 80 443

# Validate Nginx configuration
validate_nginx_config

# Run Nginx hardening
log_info "Running Nginx security hardening..."
if ! ../security/nginx_harden.sh; then
    log_warn "Nginx hardening script failed, but continuing..."
fi

# Verify Nginx is running
log_info "Verifying Nginx installation..."
if sudo systemctl is-active --quiet nginx; then
    log_info "✓ Nginx is running successfully"
else
    log_error "Nginx failed to start"
    exit 1
fi

log_installation_complete "NGINX" "nginx"
log_info "Server name: $SERVER_NAME"
log_info "HTTP WebSocket endpoint: http://$SERVER_NAME/ws"
log_info "HTTP RPC endpoint: http://$SERVER_NAME/rpc"

log_info ""
log_info "=== Nginx Setup Complete ==="
log_info "Nginx has been installed and configured"
log_info "Configuration file: /etc/nginx/sites-enabled/default"
log_info "Logs: /var/log/nginx/access.log"
log_info "Service: sudo systemctl status nginx"
log_info ""
log_info "Note: For SSL setup, see install_nginx_ssl.sh"
