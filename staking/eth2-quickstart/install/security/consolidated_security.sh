#!/bin/bash

# Consolidated Security Setup Script
# Combines firewall, fail2ban, and AIDE into one efficient script
# Used by run_1.sh (Phase 1). Same behavior in Docker and production.
#
# Docker divergence (documented): Firewall skips private-network outbound blocks
# in containers (172.17.0.1 gateway would be blocked). All other setup is identical.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Check if running as root
require_root

log_installation_start "Consolidated Security Suite"

# Function 1: Setup Firewall
setup_firewall() {
    log_info "Setting up UFW firewall with comprehensive rules..."

    # Set default policies with error handling
    log_info "Setting default firewall policies..."
    if ! ufw default deny incoming; then
        log_error "Failed to set default deny incoming"
        exit 1
    fi

    if ! ufw default allow outgoing; then
        log_error "Failed to set default allow outgoing"
        exit 1
    fi

    # Open essential ports using common function
    # Use the configured SSH port (not hardcoded 22) to match sshd_config
    local SSH_PORT="${YourSSHPortNumber:-22}"
    log_info "Opening ports for Ethereum clients and SSH (port $SSH_PORT)..."
    setup_firewall_rules 30303 13000/tcp 12000/udp "$SSH_PORT/tcp" 443/tcp

    # Block outbound connections to private/reserved networks to prevent netscan abuse
    # Skip in Docker only: container gateway (172.17.0.1) is in 172.16.0.0/12; blocking would
    # break connectivity. On real servers we apply full rules. Docker E2E tests the rest.
    if ! is_docker; then
        log_info "Blocking outbound connections to private networks..."
        log_info "This prevents netscan abuse warnings (updated Feb '23 from Erigon docs)"

        # Define private network ranges to block
        # Hetzner expected strict outbound blocks (from Erigon README)
        private_networks=(
            "0.0.0.0/8"            # "This" Network
            "10.0.0.0/8"           # Private-Use Networks
            "100.64.0.0/10"        # Carrier-Grade NAT (CGN)
            "127.0.0.0/8"          # Loopback
            "127.16.0.0/12"        # Loopback subset (from Erigon reference list, intentional overlap)
            "169.254.0.0/16"       # Link Local
            "172.16.0.0/12"        # Private-Use Networks
            "192.0.0.0/24"         # IETF Protocol Assignments
            "192.0.2.0/24"         # TEST-NET-1
            "192.88.99.0/24"       # 6to4 Relay Anycast
            "192.168.0.0/16"       # Private-Use Networks
            "198.18.0.0/15"        # Device Benchmark Testing
            "198.51.100.0/24"      # TEST-NET-2
            "203.0.113.0/24"       # TEST-NET-3
            "224.0.0.0/4"          # Multicast
            "240.0.0.0/4"          # Reserved for Future Use
            "255.255.255.255/32"   # Limited Broadcast
        )
        
        # Known problematic subnets that trigger Hetzner abuse reports
        # These are public IP ranges where aggressive P2P discovery causes issues
        # Add subnets here as needed based on abuse reports
        problematic_subnets=(
            "212.192.16.0/22"      # Vultr Frankfurt - triggers Hetzner netscan detection (Nov 2025)
        )

        for network in "${private_networks[@]}"; do
            ufw deny out on any to "$network" || log_warn "Failed to block outbound to $network"
        done
        
        # Block problematic subnets (public IPs that cause abuse reports)
        log_info "Blocking problematic subnets that trigger abuse reports..."
        for subnet in "${problematic_subnets[@]}"; do
            ufw deny out on any to "$subnet" proto udp || log_warn "Failed to block outbound UDP to $subnet"
        done
    else
        log_info "Skipping private network blocks in container (would break Docker networking)"
    fi

    # Block specific ports (updates from Prysm docs Feb '23)
    log_info "Blocking specific ports for security..."
    ufw deny in 4000/tcp || log_warn "Failed to deny port 4000/tcp"
    ufw deny in 3500/tcp || log_warn "Failed to deny port 3500/tcp"
    ufw deny in 8551/tcp || log_warn "Failed to deny port 8551/tcp"
    ufw deny in 8545/tcp || log_warn "Failed to deny port 8545/tcp"

    log_info "✓ Firewall configuration completed!"
    log_info "UFW firewall is now enabled with Ethereum client and security rules"
    log_info "Allowed ports: $SSH_PORT (SSH), 443 (HTTPS), 30303 (Ethereum P2P), 12000/13000 (Prysm)"
    if is_docker; then
        log_info "Blocked: Specific ports (4000, 3500, 8551, 8545)"
    else
        log_info "Blocked: Private networks, problematic subnets (UDP), specific ports (4000, 3500, 8551, 8545)"
    fi
}

# Function 2: Setup Fail2ban
setup_fail2ban() {
    log_info "Setting up fail2ban intrusion prevention..."

    # Define variables with fallback defaults
    local SSH_PORT="${YourSSHPortNumber:-22}"
    local MAX_RETRY="${maxretry:-3}"

    # Install nginx-proxy filter (jail references it; nginx_harden adds more jails in run_2)
    ensure_directory /etc/fail2ban/filter.d
    if [[ ! -f /etc/fail2ban/filter.d/nginx-proxy.conf ]]; then
        cat > /etc/fail2ban/filter.d/nginx-proxy.conf << 'FILTER'
# Block IPs trying to use server as proxy (matches e.g. "GET http://...")
[Definition]
failregex = ^<HOST> -.*GET http.*
ignoreregex =
FILTER
        log_info "Created nginx-proxy fail2ban filter"
    fi

    # Ensure log files exist - fail2ban jails fail to start if logpath is missing
    ensure_directory /var/log/nginx
    for logfile in /var/log/auth.log /var/log/nginx/access.log; do
        if [[ ! -f "$logfile" ]]; then
            touch "$logfile"
            log_info "Created $logfile for fail2ban jail"
        fi
    done

    # Configure fail2ban jails (write mode — idempotent on re-run)
    log_info "Configuring fail2ban jails..."
    cat > /etc/fail2ban/jail.local << EOF
# eth2-quickstart fail2ban configuration
# Generated by consolidated_security.sh

[nginx-proxy]
enabled = true
port = 80,443
filter = nginx-proxy
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 86400

[sshd]
enabled = true
port = $SSH_PORT
filter = sshd
logpath = /var/log/auth.log
maxretry = $MAX_RETRY
bantime = 3600
findtime = 600
# port from jail config is used by fail2ban actions (matches configure_ssh)
EOF

    # Enable and start fail2ban service
    enable_and_start_systemd_service fail2ban

    if systemctl is-active --quiet fail2ban 2>/dev/null; then
        log_info "✓ Fail2ban service running"
    else
        log_warn "Fail2ban not active - check: systemctl status fail2ban"
    fi
    log_info "✓ Fail2ban installation and configuration complete"
}

# Function 3: Setup AIDE
setup_aide() {
    log_info "Setting up AIDE file integrity monitoring..."

    ensure_directory /var/lib/aide
    ensure_directory /etc/aide

    # Copy config and initialize (config/aide.conf is single source)
    log_info "Initializing AIDE database..."
    local aide_conf_src="$PROJECT_ROOT/config/aide.conf"
    if [[ -f "$aide_conf_src" ]]; then
        cp "$aide_conf_src" /etc/aide/aide.conf
        log_info "Copied AIDE config from $aide_conf_src"
    else
        log_error "AIDE config not found at $aide_conf_src"
        exit 1
    fi

    log_info "Running aide --init (this may take a moment)..."
    if ! aide --config=/etc/aide/aide.conf --init; then
        log_error "Failed to initialize AIDE database"
        exit 1
    fi

    # Move database to production location
    if [[ -f /var/lib/aide/aide.db.new ]]; then
        mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
        log_info "AIDE database initialized successfully"
    else
        log_error "AIDE did not produce aide.db.new - init may have failed"
        exit 1
    fi

    # Create AIDE check script
    log_info "Creating AIDE check script..."
    cat > /usr/local/bin/aide_check.sh << 'EOF'
#!/bin/bash
# AIDE File Integrity Check Script

log_info() {
    echo "[INFO] $1"
}

log_warn() {
    echo "[WARN] $1"
}

log_info "Running AIDE file integrity check..."

# Run AIDE check (use config from /etc/aide - same as init)
if aide --config=/etc/aide/aide.conf --check > /var/log/aide_check.log 2>&1; then
    log_info "✓ AIDE check passed - no changes detected"
else
    log_warn "⚠ AIDE check found changes - check /var/log/aide_check.log"
fi
EOF

    chmod +x /usr/local/bin/aide_check.sh
    log_info "AIDE check script installed at /usr/local/bin/aide_check.sh"

    # Schedule AIDE check in crontab (idempotent — only adds if not already present)
    # crontab -l exits 1 when no crontab exists; use || true to avoid pipefail exit
    log_info "Scheduling AIDE check in crontab..."
    local existing_crontab
    existing_crontab=$(crontab -l 2>/dev/null) || true
    if echo "$existing_crontab" | grep -Fq "/usr/local/bin/aide_check.sh"; then
        log_info "AIDE cron job already present, skipping"
    else
        (echo "$existing_crontab"; echo "0 2 * * * /usr/local/bin/aide_check.sh") | crontab -
        log_info "AIDE cron job added (daily at 2 AM)"
    fi

    log_info "✓ AIDE file integrity monitoring setup complete"
}

# Function 4: Security Verification
verify_security_setup() {
    log_info "Verifying security setup..."

    local issues=0

    # Check firewall
    log_info "Checking UFW status..."
    if ufw status 2>/dev/null | grep -q "Status: active"; then
        log_info "✓ UFW firewall is active"
    else
        log_error "✗ UFW firewall is not active"
        issues=$((issues + 1))
    fi

    # Check fail2ban
    log_info "Checking fail2ban service..."
    if systemctl is-active --quiet fail2ban 2>/dev/null; then
        log_info "✓ Fail2ban is running"
    else
        log_error "✗ Fail2ban is not running"
        issues=$((issues + 1))
    fi

    # Check AIDE
    log_info "Checking AIDE installation..."
    if command -v aide &>/dev/null; then
        log_info "✓ AIDE is installed"
        if [[ -f /var/lib/aide/aide.db ]]; then
            log_info "✓ AIDE database exists"
        else
            log_error "✗ AIDE database missing at /var/lib/aide/aide.db"
            issues=$((issues + 1))
        fi
    else
        log_error "✗ AIDE is not installed"
        issues=$((issues + 1))
    fi

    if [[ $issues -eq 0 ]]; then
        log_info "✓ All security features verified successfully"
    else
        log_warn "⚠ $issues security issues found - check logs above"
    fi
}

# Main execution
main() {
    # Install aide, cron, fail2ban - apt handles duplicates (no reinstall if already present)
    install_dependencies aide cron fail2ban

    # Run all security setup functions
    setup_firewall
    setup_fail2ban
    setup_aide
    
    # Verify security setup
    verify_security_setup

    log_info "=== SECURITY SETUP COMPLETE ==="
    log_info "✓ Firewall configured with comprehensive rules"
    log_info "✓ Fail2ban intrusion prevention active"
    log_info "✓ AIDE file integrity monitoring scheduled"
    log_info "✓ All security features are now active and protecting your system"
    
    log_installation_complete "Consolidated Security Suite" "security-suite"
}

# Execute main function
main "$@"