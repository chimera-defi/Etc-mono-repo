#!/bin/bash


# ACME.sh SSL Certificate Installation Script
# Uses acme.sh to get SSL certificates from Let's Encrypt
# Docs: https://github.com/acmesh-official/acme.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

log_installation_start "ACME.sh SSL"

log_info "Server name: $SERVER_NAME"
log_info "Email: $EMAIL"

# Validate required variables
if [[ -z "$SERVER_NAME" ]]; then
    log_error "SERVER_NAME is not set in exports.sh"
    exit 1
fi

if [[ -z "$EMAIL" ]]; then
    log_error "EMAIL is not set in exports.sh"
    exit 1
fi

# Install NGINX first
log_info "Installing NGINX..."
if ! ./install_nginx.sh; then
    log_error "Failed to install NGINX"
    exit 1
fi

# Install dependencies

# Clone and install acme.sh
log_info "Cloning acme.sh repository..."
cd "$HOME" || exit

if ! git clone https://github.com/acmesh-official/acme.sh.git; then
    log_error "Failed to clone acme.sh repository"
    exit 1
fi

cd ./acme.sh || exit

log_info "Installing acme.sh..."
if ! ./acme.sh --install -m "$EMAIL"; then
    log_error "Failed to install acme.sh"
    exit 1
fi

# Issue SSL certificate
log_info "Issuing SSL certificate for $SERVER_NAME..."
if ! ./acme.sh --issue -d "$SERVER_NAME" -w /usr/share/nginx/html --debug 2 --server letsencrypt; then
    log_error "Failed to issue SSL certificate"
    exit 1
fi

# Install certificate
log_info "Installing SSL certificate..."
if ! ./acme.sh --install-cert -d "$SERVER_NAME" --reloadcmd "service nginx force-reload"; then
    log_error "Failed to install SSL certificate"
    exit 1
fi

# Install certificate with specific paths
log_info "Installing certificate with specific paths..."
if ! ./acme.sh --install-cert -d "$SERVER_NAME" \
    --key-file /etc/letsencrypt/live/"$SERVER_NAME"/privkey.pem \
    --fullchain-file /etc/letsencrypt/live/"$SERVER_NAME"/fullchain.pem \
    --reloadcmd "sudo service nginx force-reload"; then
    log_error "Failed to install certificate with specific paths"
    exit 1
fi

# Configure NGINX with SSL
log_info "Configuring NGINX with SSL..."
if ! ./install_nginx_ssl.sh; then
    log_error "Failed to configure NGINX with SSL"
    exit 1
fi

log_info "Successfully installed NGINX with SSL!"
log_info "SSL certificate installed for: $SERVER_NAME"
log_info "Certificate location: /etc/letsencrypt/live/$SERVER_NAME/"
