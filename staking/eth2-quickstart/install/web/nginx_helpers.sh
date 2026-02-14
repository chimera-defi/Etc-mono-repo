#!/bin/bash

# Nginx Helper Functions
# Local helper functions for Nginx installation scripts

# Source common web helpers
source "$(dirname "$0")/web_helpers_common.sh"

# Install Nginx web server
install_nginx() {
    log_info "Installing Nginx web server..."
    
    if ! command_exists nginx; then
        # Update package list
        sudo apt-get update
        
        # Install Nginx
        sudo apt-get install -y nginx
        
        log_info "Nginx installed successfully"
    else
        log_info "Nginx is already installed"
    fi
}

# Setup Nginx service and directories
setup_nginx_service() {
    log_info "Setting up Nginx service and directories..."
    
    # Create Nginx configuration directories if they don't exist
    sudo mkdir -p /etc/nginx/sites-available
    sudo mkdir -p /etc/nginx/sites-enabled
    
    # Create log directory
    sudo mkdir -p /var/log/nginx
    sudo chown www-data:www-data /var/log/nginx
    
    # Enable and start Nginx service
    if ! enable_and_start_systemd_service nginx; then
        log_error "Failed to start Nginx service"
        return 1
    fi
    
    log_info "✓ Nginx service setup complete"
}

# Validate Nginx configuration
validate_nginx_config() {
    local config_file="${1:-/etc/nginx/nginx.conf}"
    
    log_info "Validating Nginx configuration..."
    
    if sudo nginx -t -c "$config_file"; then
        log_info "✓ Nginx configuration is valid"
        return 0
    else
        log_error "Nginx configuration validation failed"
        return 1
    fi
}

# Add rate limiting to Nginx configuration
add_rate_limiting() {
    log_info "Adding rate limiting to Nginx configuration..."
    
    # Create rate limiting configuration
    local rate_limit_file="/etc/nginx/conf.d/rate-limit.conf"
    
    sudo tee "$rate_limit_file" > /dev/null << 'EOF'
# Enhanced Rate limiting configuration (from PR #40)
limit_req_zone $binary_remote_addr zone=api:10m rate=50r/m;
limit_req_zone $binary_remote_addr zone=ws:10m rate=20r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=100r/m;
limit_req_status 429;
EOF

    if [[ -f "$rate_limit_file" ]]; then
        log_info "✓ Rate limiting configuration added"
        return 0
    else
        log_error "Failed to add rate limiting configuration"
        return 1
    fi
}

# Configure DDoS protection (enhanced from PR #40)
configure_ddos_protection() {
    log_info "Configuring enhanced DDoS protection..."
    
    # Create DDoS protection configuration
    local ddos_protection_file="/etc/nginx/conf.d/ddos-protection.conf"
    
    sudo tee "$ddos_protection_file" > /dev/null << 'EOF'
# Enhanced DDoS Protection Configuration (from PR #40)
client_body_buffer_size 128k;
client_max_body_size 10m;
client_body_timeout 30s;
client_header_timeout 30s;
keepalive_timeout 60s;
send_timeout 30s;

# Limit connections per IP (enhanced)
limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
limit_conn_zone $binary_remote_addr zone=conn_limit_total:10m;
limit_conn conn_limit_per_ip 50;
limit_conn_status 429;

# Hide Nginx version
server_tokens off;

# Additional DDoS mitigations
client_body_temp_path /var/cache/nginx/client_temp 1 2;
client_body_in_file_only clean;
client_body_in_single_buffer on;
EOF

    # Ensure temp directory exists
    sudo mkdir -p /var/cache/nginx/client_temp
    sudo chown www-data:www-data /var/cache/nginx/client_temp
    
    if [[ -f "$ddos_protection_file" ]]; then
        log_info "✓ Enhanced DDoS protection configuration added"
        return 0
    else
        log_error "Failed to add DDoS protection configuration"
        return 1
    fi
}

# Create Nginx base configuration with security headers
create_nginx_config() {
    local server_name="$1"
    local config_path="$2"
    local use_ssl="${3:-false}"
    local cert_path="${4:-}"
    local key_path="${5:-}"
    
    log_info "Creating Nginx configuration for $server_name..."
    
    if [[ "$use_ssl" == "true" ]]; then
        cat > "$config_path" << EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name $server_name;
    
    # Security headers for redirect
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    return 301 https://\$server_name\$request_uri;
}

# Main HTTPS site
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $server_name;
    
    # SSL certificate configuration
    ssl_certificate $cert_path;
    ssl_certificate_key $key_path;
    
    # SSL/TLS security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:; font-src 'self' data:; object-src 'none'; media-src 'self'; frame-src 'none';" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(self), sync-xhr=()" always;
    
    # WebSocket proxy with rate limiting
    location ^~ /ws {
        limit_req zone=ws burst=5 nodelay;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass   http://$LH:$NETHERMIND_WS_PORT/;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
    
    # HTTP proxy with rate limiting
    location ^~ /rpc {
        limit_req zone=api burst=10 nodelay;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_pass    http://$LH:$NETHERMIND_HTTP_PORT/;
        proxy_read_timeout 30s;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
    }
    
    # Block common attack patterns
    location ~ ^/(admin|wp-admin|\.env|config) {
        deny all;
        return 403;
    }
    
    # Cache control for sensitive endpoints
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
}
EOF
    else
        cat > "$config_path" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $server_name;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # WebSocket proxy with rate limiting
    location ^~ /ws {
        limit_req zone=ws burst=5 nodelay;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass   http://$LH:$NETHERMIND_WS_PORT/;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    # HTTP proxy with rate limiting
    location ^~ /rpc {
        limit_req zone=api burst=10 nodelay;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass    http://$LH:$NETHERMIND_HTTP_PORT/;
        proxy_read_timeout 30s;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
    }
    
    # Block common attack patterns
    location ~ ^/(admin|wp-admin|\.env|config) {
        deny all;
        return 403;
    }
}
EOF
    fi
    
    log_info "Nginx configuration created: $config_path"
}
