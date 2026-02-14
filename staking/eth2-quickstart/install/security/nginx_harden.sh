#!/bin/bash

# NGINX Security Hardening Script
# Applies security best practices to Nginx configuration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Check if running as root
require_root

log_info "Starting Nginx security hardening..."

# Backup original Nginx configuration
log_info "Creating backup of original Nginx configuration..."
if [[ -f /etc/nginx/sites-enabled/default ]]; then
    sudo cp /etc/nginx/sites-enabled/default "/etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d_%H%M%S)"
    log_info "Backup created: /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d_%H%M%S)"
else
    log_error "Nginx configuration not found at /etc/nginx/sites-enabled/default"
    exit 1
fi

# Backup nginx.conf if it exists
if [[ -f /etc/nginx/nginx.conf ]]; then
    sudo cp /etc/nginx/nginx.conf "/etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create fail2ban filter for nginx proxy abuse
log_info "Creating fail2ban filter for nginx proxy abuse..."
sudo mkdir -p /etc/fail2ban/filter.d
cat > /tmp/nginx-proxy.conf << EOF
# Block IPs trying to use server as proxy.
#
# Matches e.g.
# 192.168.1.1 - - "GET http://www.something.com/

[Definition]
failregex = ^<HOST> -.*GET http.*
ignoreregex =
EOF

# Install the filter
if ! sudo mv /tmp/nginx-proxy.conf /etc/fail2ban/filter.d/nginx-proxy.conf; then
    log_error "Failed to install nginx-proxy filter"
    exit 1
fi

# Create or update fail2ban jail configuration
log_info "Creating fail2ban jail configuration..."
if [[ -f /etc/fail2ban/jail.local ]]; then
    # Backup existing jail.local
    sudo cp /etc/fail2ban/jail.local "/etc/fail2ban/jail.local.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Append nginx-proxy jail if not already present
if ! grep -q "\[nginx-proxy\]" /etc/fail2ban/jail.local 2>/dev/null; then
    cat >> /tmp/jail.local << EOF

## block hosts trying to abuse our server as a forward proxy
[nginx-proxy]
enabled = true
port    = 80,443
filter = nginx-proxy
logpath = /var/log/nginx/access.log
maxretry = 2
bantime  = 86400
EOF
    if [[ -f /etc/fail2ban/jail.local ]]; then
        cat /etc/fail2ban/jail.local >> /tmp/jail.local
    fi
    sudo mv /tmp/jail.local /etc/fail2ban/jail.local
fi

# Add nginx rate limit jail
if ! grep -q "\[nginx-limit-req\]" /etc/fail2ban/jail.local 2>/dev/null; then
    cat >> /etc/fail2ban/jail.local << EOF

[nginx-limit-req]
enabled = true
port    = 80,443
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5
bantime  = 3600
EOF
fi

# Create nginx-limit-req filter
cat > /tmp/nginx-limit-req.conf << EOF
[Definition]
failregex = limiting requests, excess:.* by zone.*client: <HOST>
ignoreregex =
EOF

sudo mv /tmp/nginx-limit-req.conf /etc/fail2ban/filter.d/nginx-limit-req.conf

# Add additional security settings to nginx.conf
log_info "Enhancing nginx.conf with security settings..."
if [[ -f /etc/nginx/nginx.conf ]]; then
    # Add security settings if not already present
    if ! grep -q "# Security headers" /etc/nginx/nginx.conf; then
        sudo sed -i '/http {/a\
    # Security headers\
    server_tokens off;' /etc/nginx/nginx.conf
    fi
fi

# Restart services
log_info "Restarting fail2ban..."
if ! sudo systemctl restart fail2ban; then
    log_error "Failed to restart fail2ban"
    exit 1
fi

# Validate Nginx configuration
log_info "Validating Nginx configuration..."
if ! sudo nginx -t; then
    log_error "Nginx configuration validation failed after hardening"
    log_info "Restoring backup..."
    sudo cp /etc/nginx/sites-enabled/default.backup.* /etc/nginx/sites-enabled/default
    sudo systemctl restart nginx
    exit 1
fi

log_info "Restarting nginx..."
if ! sudo systemctl restart nginx; then
    log_error "Failed to restart nginx"
    log_info "Restoring backup..."
    sudo cp /etc/nginx/sites-enabled/default.backup.* /etc/nginx/sites-enabled/default
    sudo systemctl restart nginx
    exit 1
fi

# Verify services are running
if sudo systemctl is-active --quiet nginx; then
    log_info "✓ Nginx is running with hardened configuration"
else
    log_error "Nginx failed to start with hardened configuration"
    exit 1
fi

if sudo systemctl is-active --quiet fail2ban; then
    log_info "✓ Fail2ban is running with Nginx jails"
else
    log_warn "Fail2ban is not running - hardening features may be limited"
fi

# Create Nginx security monitoring script
log_info "Setting up Nginx security monitoring..."
sudo tee /usr/local/bin/nginx_security_monitor.sh > /dev/null << 'EOF'
#!/bin/bash
# Nginx security monitoring script

LOG_FILE="/var/log/nginx_security.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Nginx security monitoring check" >> "$LOG_FILE"

# Check for suspicious requests
if [[ -f /var/log/nginx/access.log ]]; then
    # Check for common attack patterns
    if grep -q "wp-admin\|admin\|config\|\.env" /var/log/nginx/access.log; then
        echo "[$DATE] WARNING: Suspicious requests detected" >> "$LOG_FILE"
    fi
    
    # Check for high request rates
    recent_requests=$(grep "$(date '+%d/%b/%Y:%H')" /var/log/nginx/access.log | wc -l)
    if [[ $recent_requests -gt 1000 ]]; then
        echo "[$DATE] WARNING: High request rate detected: $recent_requests requests in the last hour" >> "$LOG_FILE"
    fi
    
    # Check for proxy abuse attempts
    if grep -q "GET http" /var/log/nginx/access.log; then
        echo "[$DATE] WARNING: Proxy abuse attempts detected" >> "$LOG_FILE"
    fi
fi

# Check Nginx process
if ! pgrep -f nginx >/dev/null; then
    echo "[$DATE] ERROR: Nginx process not running" >> "$LOG_FILE"
fi

# Check fail2ban status
if ! pgrep -f fail2ban >/dev/null; then
    echo "[$DATE] WARNING: Fail2ban process not running" >> "$LOG_FILE"
fi

echo "[$DATE] Nginx security monitoring check complete" >> "$LOG_FILE"
EOF

sudo chmod +x /usr/local/bin/nginx_security_monitor.sh

# Add security monitoring to crontab
(crontab -l 2>/dev/null | grep -v nginx_security_monitor.sh; echo "*/5 * * * * /usr/local/bin/nginx_security_monitor.sh") | crontab - 2>/dev/null || true

log_info "✓ Nginx security hardening completed!"
log_info "Hardened features applied:"
log_info "- Fail2ban proxy abuse protection"
log_info "- Fail2ban rate limit protection"
log_info "- Enhanced security monitoring"
log_info "- Configuration backup and rollback support"
log_info "- Server tokens disabled"

log_info "Configuration backup: /etc/nginx/sites-enabled/default.backup.*"
log_info "Security logs: /var/log/nginx_security.log"
log_info "Fail2ban jails: nginx-proxy, nginx-limit-req"
