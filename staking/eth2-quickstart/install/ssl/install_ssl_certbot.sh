#!/bin/bash


# Certbot SSL Certificate Installation Script
# Uses certbot to get SSL certificates from Let's Encrypt

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

log_installation_start "Certbot SSL"

log_info "Server name: $SERVER_NAME"

# Validate required variables
if [[ -z "$SERVER_NAME" ]]; then
    log_error "SERVER_NAME is not set in exports.sh"
    exit 1
fi

# Install NGINX first
log_info "Installing NGINX..."
if ! ./install_nginx.sh; then
    log_error "Failed to install NGINX"
    exit 1
fi

# Configure certbot
log_info "Configuring certbot..."
if ! sudo snap refresh core; then
    log_error "Failed to refresh snap core"
    exit 1
fi

if ! sudo ln -s /snap/bin/certbot /usr/bin/certbot; then
    log_error "Failed to create certbot symlink"
    exit 1
fi

# Display important information
log_warn "IMPORTANT: For certbot to work, server name records must be pre-set"
log_warn "Certbot may break the nginx config, so we do it manually"
log_info "You will now be prompted to go through SSL certbot challenge for your domain"

# Issue SSL certificate manually
log_info "Issuing SSL certificate manually..."
if ! certbot certonly --manual --preferred-challenges dns; then
    log_error "Failed to issue SSL certificate manually"
    exit 1
fi

# Try nginx integration (expected to fail but generates files)
log_info "Running certbot --nginx (this may fail but will generate needed files)..."
certbot --nginx -d "$SERVER_NAME" || log_warn "Certbot nginx integration failed as expected"

# Configure NGINX with SSL
log_info "Configuring NGINX with SSL..."
if ! ./install_nginx_ssl.sh; then
    log_error "Failed to configure NGINX with SSL"
    exit 1
fi

log_info "Successfully installed NGINX with SSL using Certbot!"
log_info "SSL certificate installed for: $SERVER_NAME"
log_info "Certificate location: /etc/letsencrypt/live/$SERVER_NAME/"
