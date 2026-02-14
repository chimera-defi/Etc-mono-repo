#!/bin/bash

# Common Web Server Helper Functions
# Shared utilities for both Caddy and Nginx installation scripts
# Note: This file expects log_error to be available from the calling context
# (via lib/common_functions.sh which is sourced before helpers)

# Common security headers (returns header config based on server type)
get_security_headers() {
    local server_type="$1"  # "caddy" or "nginx"
    
    case "$server_type" in
        "caddy")
            cat << 'EOF'
    # Security headers
    header {
        # Enable HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        
        # Prevent clickjacking
        X-Frame-Options "DENY"
        
        # Prevent MIME type sniffing
        X-Content-Type-Options "nosniff"
        
        # XSS protection
        X-XSS-Protection "1; mode=block"
        
        # Referrer policy
        Referrer-Policy "strict-origin-when-cross-origin"
        
        # Content Security Policy
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:; font-src 'self' data:; object-src 'none'; media-src 'self'; frame-src 'none';"
    }
EOF
            ;;
        "nginx")
            cat << 'EOF'
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:; font-src 'self' data:; object-src 'none'; media-src 'self'; frame-src 'none';" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(self), sync-xhr=()" always;
EOF
            ;;
        *)
            log_error "Unknown server type: $server_type"
            return 1
            ;;
    esac
}

# Common rate limiting configuration
# Enhanced from PR #40 with more aggressive limits
get_enhanced_rate_limits() {
    local server_type="$1"
    
    case "$server_type" in
        "caddy")
            cat << 'EOF'
    # Enhanced rate limiting (from PR #40)
    rate_limit {
        zone api {
            key {remote_host}
            events 50
            window 1m
        }
        zone ws {
            key {remote_host}
            events 20
            window 1m
        }
        zone general {
            key {remote_host}
            events 100
            window 1m
        }
    }
EOF
            ;;
        "nginx")
            cat << 'EOF'
# Enhanced Rate limiting configuration (from PR #40)
limit_req_zone $binary_remote_addr zone=api:10m rate=50r/m;
limit_req_zone $binary_remote_addr zone=ws:10m rate=20r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=100r/m;
limit_req_status 429;
EOF
            ;;
        *)
            log_error "Unknown server type: $server_type"
            return 1
            ;;
    esac
}

# Enhanced DDoS protection settings
# Ported from PR #40 with connection limits, timeouts, and buffer limits
get_enhanced_ddos_protection() {
    local server_type="$1"
    
    case "$server_type" in
        "caddy")
            cat << 'EOF'
    # Enhanced DDoS protection (from PR #40)
    # Request size limits
    request_body {
        max_size 10MB
    }
    
    # Timeout configurations
    timeouts {
        read_timeout 30s
        read_header_timeout 10s
        write_timeout 30s
        idle_timeout 60s
    }
EOF
            ;;
        "nginx")
            cat << 'EOF'
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
            ;;
        *)
            log_error "Unknown server type: $server_type"
            return 1
            ;;
    esac
}

# Common proxy headers setup
get_proxy_headers() {
    local server_type="$1"
    
    case "$server_type" in
        "caddy")
            cat << 'EOF'
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
EOF
            ;;
        "nginx")
            cat << 'EOF'
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $http_host;
            proxy_set_header X-NginX-Proxy true;
            proxy_set_header X-Forwarded-Proto $scheme;
EOF
            ;;
        *)
            log_error "Unknown server type: $server_type"
            return 1
            ;;
    esac
}

# Common attack pattern blocking
get_attack_blocks() {
    local server_type="$1"
    
    case "$server_type" in
        "caddy")
            cat << 'EOF'
    # Block common attack patterns
    handle /admin* {
        respond "Access Denied" 403
    }
    
    handle /wp-admin* {
        respond "Access Denied" 403
    }
    
    handle /.env* {
        respond "Access Denied" 403
    }
    
    handle /config* {
        respond "Access Denied" 403
    }
EOF
            ;;
        "nginx")
            cat << 'EOF'
    # Block common attack patterns
    location ~ ^/(admin|wp-admin|\.env|config) {
        deny all;
        return 403;
    }
EOF
            ;;
        *)
            log_error "Unknown server type: $server_type"
            return 1
            ;;
    esac
}
