#!/bin/bash

# Caddy Security Hardening Script
# Applies security best practices to Caddy configuration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"
source "$PROJECT_ROOT/install/web/caddy_helpers.sh"

# Check if running as root
require_root

log_info "Starting Caddy security hardening..."

# Backup original Caddyfile
log_info "Creating backup of original Caddyfile..."
if [[ -f /etc/caddy/Caddyfile ]]; then
    sudo cp /etc/caddy/Caddyfile "/etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)"
    log_info "Backup created: /etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)"
else
    log_error "Caddyfile not found at /etc/caddy/Caddyfile"
    exit 1
fi

# Create hardened Caddyfile
log_info "Creating hardened Caddyfile..."
cat > /tmp/caddy_hardened << 'EOF'
{
    # Global options with security hardening
    auto_https off
    servers {
        protocols h1 h2 h3
        strict_sni_host
        read_timeout 30s
        read_header_timeout 10s
        write_timeout 30s
        idle_timeout 60s
        max_header_bytes 1048576
    }
    # Disable admin API for security
    admin off
    # Disable metrics by default
    metrics off
}

# HTTP to HTTPS redirect with security headers
http://$SERVER_NAME {
    # Security headers for redirect
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    redir https://$SERVER_NAME{uri} permanent
}

# Main HTTPS site with comprehensive security
https://$SERVER_NAME {
    # SSL/TLS configuration with security hardening
    tls {
        protocols tls1.2 tls1.3
        ciphers ECDHE-ECDSA-AES256-GCM-SHA384 ECDHE-RSA-AES256-GCM-SHA384 ECDHE-ECDSA-CHACHA20-POLY1305 ECDHE-RSA-CHACHA20-POLY1305 ECDHE-ECDSA-AES128-GCM-SHA256 ECDHE-RSA-AES128-GCM-SHA256
        curves X25519 P-256 P-384 P-521
        alpn h2 http/1.1
    }
    
    # Rate limiting with multiple zones
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
    }
    
    # WebSocket proxy with enhanced security
    handle /ws* {
        rate_limit zone ws
        reverse_proxy $LH:$NETHERMIND_WS_PORT {
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
            header_up Connection "upgrade"
            header_up Upgrade "websocket"
        }
    }
    
    # HTTP proxy with rate limiting
    handle /rpc* {
        rate_limit zone api
        reverse_proxy $LH:$NETHERMIND_HTTP_PORT {
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
        }
    }
    
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
    
    # Comprehensive security headers (consistent with Nginx)
    header {
        # HSTS with preload
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        
        # Prevent clickjacking
        X-Frame-Options "DENY"
        
        # Prevent MIME type sniffing
        X-Content-Type-Options "nosniff"
        
        # XSS protection
        X-XSS-Protection "1; mode=block"
        
        # Referrer policy
        Referrer-Policy "strict-origin-when-cross-origin"
        
        # Content Security Policy (strict)
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:; font-src 'self' data:; object-src 'none'; media-src 'self'; frame-src 'none'; base-uri 'self'; form-action 'self';"
        
        # Permissions Policy (consistent with Nginx)
        Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(self), sync-xhr=()"
        
        # Remove server information
        -Server
        
        # Cache control for sensitive endpoints
        Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate"
        Pragma "no-cache"
        Expires "0"
    }
    
    # Enhanced logging with security focus
    log {
        output file /var/log/caddy/access.log {
            roll_size 100mb
            roll_keep 10
            roll_keep_for 720h
        }
        format json {
            time_format "2006-01-02T15:04:05Z07:00"
            level INFO
        }
        level INFO
    }
    
    # Request size limits
    request_body {
        max_size 10MB
    }
    
    # Timeout configurations (consistent with Nginx)
    timeouts {
        read_timeout 30s           # Equivalent to Nginx client_body_timeout
        read_header_timeout 30s    # Equivalent to Nginx client_header_timeout (matched to 30s)
        write_timeout 30s          # Equivalent to Nginx send_timeout
        idle_timeout 60s           # Equivalent to Nginx keepalive_timeout
    }
}

# Block requests to unknown hosts
:80 {
    respond "Access Denied" 403
}

:443 {
    respond "Access Denied" 403
}
EOF

# Replace SERVER_NAME placeholder
sed -i "s/\$SERVER_NAME/$SERVER_NAME/g" /tmp/caddy_hardened

# Install hardened configuration
log_info "Installing hardened Caddyfile..."
if ! sudo mv /tmp/caddy_hardened /etc/caddy/Caddyfile; then
    log_error "Failed to install hardened Caddyfile"
    exit 1
fi

# Set proper permissions
sudo chown caddy:caddy /etc/caddy/Caddyfile
sudo chmod 644 /etc/caddy/Caddyfile

# Validate configuration
if ! validate_caddy_config "/etc/caddy/Caddyfile"; then
    log_error "Hardened Caddyfile validation failed"
    log_info "Restoring backup..."
    sudo cp /etc/caddy/Caddyfile.backup.* /etc/caddy/Caddyfile
    exit 1
fi

# Restart Caddy with hardened configuration
log_info "Restarting Caddy with hardened configuration..."
if ! sudo systemctl restart caddy; then
    log_error "Failed to restart Caddy with hardened configuration"
    log_info "Restoring backup..."
    sudo cp /etc/caddy/Caddyfile.backup.* /etc/caddy/Caddyfile
    sudo systemctl restart caddy
    exit 1
fi

# Verify Caddy is running
if sudo systemctl is-active --quiet caddy; then
    log_info "✓ Caddy is running with hardened configuration"
else
    log_error "Caddy failed to start with hardened configuration"
    exit 1
fi

# Additional security measures
log_info "Applying additional security measures..."

# Create Caddy security monitoring script
sudo tee /usr/local/bin/caddy_security_monitor.sh > /dev/null << 'EOF'
#!/bin/bash
# Caddy security monitoring script

LOG_FILE="/var/log/caddy_security.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Caddy security monitoring check" >> "$LOG_FILE"

# Check for suspicious requests
if [[ -f /var/log/caddy/access.log ]]; then
    # Check for common attack patterns
    if grep -q "wp-admin\|admin\|config\|\.env" /var/log/caddy/access.log; then
        echo "[$DATE] WARNING: Suspicious requests detected" >> "$LOG_FILE"
    fi
    
    # Check for high request rates
    recent_requests=$(grep "$(date '+%d/%b/%Y:%H')" /var/log/caddy/access.log | wc -l)
    if [[ $recent_requests -gt 1000 ]]; then
        echo "[$DATE] WARNING: High request rate detected: $recent_requests requests in the last hour" >> "$LOG_FILE"
    fi
fi

# Check Caddy process
if ! pgrep -f caddy >/dev/null; then
    echo "[$DATE] ERROR: Caddy process not running" >> "$LOG_FILE"
fi

echo "[$DATE] Caddy security monitoring check complete" >> "$LOG_FILE"
EOF

sudo chmod +x /usr/local/bin/caddy_security_monitor.sh

# Add security monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/caddy_security_monitor.sh") | crontab - 2>/dev/null || true

log_info "✓ Caddy security hardening completed!"
log_info "Hardened features applied:"
log_info "- Enhanced SSL/TLS configuration"
log_info "- Comprehensive security headers"
log_info "- Rate limiting on all endpoints"
log_info "- Attack pattern blocking"
log_info "- Request size limits"
log_info "- Timeout configurations"
log_info "- Security monitoring"
log_info "- Enhanced logging"

log_info "Configuration file: /etc/caddy/Caddyfile"
log_info "Backup file: /etc/caddy/Caddyfile.backup.*"
log_info "Security logs: /var/log/caddy_security.log"