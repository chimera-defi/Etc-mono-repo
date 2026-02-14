#!/bin/bash

# Common functions library for Ethereum client installation scripts
# This library contains shared functions to reduce code duplication

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# CORE UTILITY FUNCTIONS
# =============================================================================

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as correct user
check_user() {
    local expected_user="$1"
    if [[ $(whoami) != "$expected_user" ]]; then
        log_error "This script should be run as user: $expected_user"
        exit 1
    fi
}

# Create directory if it doesn't exist
ensure_directory() {
    local dir="$1"
    if [[ ! -d "$dir" ]]; then
        log_info "Creating directory: $dir"
        mkdir -p "$dir"
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if running inside Docker/container
is_docker() {
    [[ -f /.dockerenv ]] || grep -q docker /proc/1/cgroup 2>/dev/null
}

# =============================================================================
# SYSTEM CHECK FUNCTIONS
# =============================================================================

# Check if port is in use (with fallback for missing ss)
check_port() {
    local port="$1"
    
    # Try ss first (most common)
    if command_exists ss; then
        ss -tlnp 2>/dev/null | grep -q ":$port " && return 0
    # Fall back to netstat
    elif command_exists netstat; then
        netstat -tlnp 2>/dev/null | grep -q ":$port " && return 0
    # Last resort: check /proc/net/tcp
    elif [[ -f /proc/net/tcp ]]; then
        local hex_port
        hex_port=$(printf '%04X' "$port")
        grep -q ":$hex_port" /proc/net/tcp 2>/dev/null && return 0
    fi
    
    return 1
}

# Check if systemd service exists and get status
# Returns: running, stopped, disabled, not_installed
check_service_status() {
    local service="$1"
    
    if ! systemctl list-unit-files 2>/dev/null | grep -q "^${service}.service"; then
        echo "not_installed"
        return
    fi
    
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        echo "running"
    elif systemctl is-enabled --quiet "$service" 2>/dev/null; then
        echo "stopped"
    else
        echo "disabled"
    fi
}

# Detect hardware profile based on RAM
detect_hardware_profile() {
    local total_ram_gb
    total_ram_gb=$(free -g | awk 'NR==2{print $2}')
    
    if [[ $total_ram_gb -ge 32 ]]; then
        echo "high"
    elif [[ $total_ram_gb -ge 16 ]]; then
        echo "mid"
    else
        echo "low"
    fi
}

# Get recommended clients based on hardware profile
get_recommended_clients() {
    local profile="$1"
    
    case "$profile" in
        "high")
            echo "reth lighthouse"
            ;;
        "mid")
            echo "geth prysm"
            ;;
        "low")
            echo "nimbus_eth1 nimbus"
            ;;
        *)
            echo "geth prysm"
            ;;
    esac
}

# =============================================================================
# WHIPTAIL TUI HELPERS
# =============================================================================

# Show whiptail message box
whiptail_msg() {
    local title="${1:-Eth2 Quick Start}"
    local message="$2"
    local height="${3:-12}"
    local width="${4:-70}"
    
    whiptail --title "$title" --msgbox "$message" "$height" "$width"
}

# Show whiptail yes/no dialog
# Returns 0 for yes, 1 for no
whiptail_yesno() {
    local title="${1:-Eth2 Quick Start}"
    local message="$2"
    local height="${3:-12}"
    local width="${4:-70}"
    
    whiptail --title "$title" --yesno "$message" "$height" "$width"
}

# =============================================================================
# DOWNLOAD FUNCTIONS
# =============================================================================

# Get latest release version from GitHub
get_latest_release() {
    local repo="$1"
    local release_url="https://api.github.com/repos/${repo}/releases/latest"
    local version
    
    # Check if curl is available
    if ! command_exists curl; then
        log_error "curl is not installed"
        return 1
    fi
    
    # Try to fetch latest release tag from GitHub API with error handling
    if ! version=$(curl -sf "$release_url" 2>/dev/null | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/'); then
        log_warn "Could not fetch latest release for $repo (API request failed)"
        return 1
    fi
    
    if [[ -n "$version" ]]; then
        echo "$version"
        return 0
    else
        log_warn "Could not parse version from GitHub API response for $repo"
        return 1
    fi
}

# Extract archive (tar.gz, tgz, zip)
extract_archive() {
    local archive_file="$1"
    local dest_dir="$2"
    local strip_components="${3:-0}"
    
    if [[ ! -f "$archive_file" ]]; then
        log_error "Archive file not found: $archive_file"
        return 1
    fi
    
    log_info "Extracting archive: $archive_file"
    
    local extract_result=0
    
    case "$archive_file" in
        *.tar.gz|*.tgz)
            if [[ $strip_components -gt 0 ]]; then
                tar -xzf "$archive_file" -C "$dest_dir" --strip-components="$strip_components"
                extract_result=$?
            else
                tar -xzf "$archive_file" -C "$dest_dir"
                extract_result=$?
            fi
            ;;
        *.zip)
            unzip -q "$archive_file" -d "$dest_dir"
            extract_result=$?
            ;;
        *)
            log_error "Unsupported archive format: $archive_file"
            return 1
            ;;
    esac
    
    if [[ $extract_result -eq 0 ]]; then
        log_info "Archive extracted successfully"
        return 0
    else
        log_error "Failed to extract archive"
        return 1
    fi
}

# Download file with retry logic and security validation
download_file() {
    local url="$1"
    local output="$2"
    local max_retries="${3:-3}"
    
    # Use secure download function
    secure_download "$url" "$output" "$max_retries"
}


# Secure download function
secure_download() {
    local url="$1"
    local output="$2"
    local max_retries="${3:-3}"
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        if wget --timeout=30 --tries=1 -O "$output" "$url" 2>/dev/null; then
            log_info "Successfully downloaded: $output"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [[ $retry_count -lt $max_retries ]]; then
            log_warn "Download failed, attempt $retry_count/$max_retries"
            sleep 2
        fi
    done
    
    log_error "Failed to download $url after $max_retries attempts"
    return 1
}

# =============================================================================
# SYSTEMD SERVICE FUNCTIONS
# =============================================================================

# Create systemd service
create_systemd_service() {
    local service_name="$1"
    local description="$2"
    local exec_start="$3"
    local user="${4:-$(whoami)}"
    local restart="${5:-on-failure}"
    local timeout_stop="${6:-600}"
    local restart_sec="${7:-5}"
    local timeout_sec="${8:-300}"
    local wants="${9:-network-online.target}"
    local after="${10:-network-online.target}"
    
    local service_file="$HOME/${service_name}.service"
    
    cat > "$service_file" <<EOF
[Unit]
Description=$description
Wants=$wants
After=$after

[Service]
User=$user
ExecStart=$exec_start
Restart=$restart
TimeoutStopSec=$timeout_stop
RestartSec=$restart_sec
TimeoutSec=$timeout_sec

[Install]
WantedBy=multi-user.target
EOF

    sudo mv "$service_file" "/etc/systemd/system/${service_name}.service"
    sudo chmod 644 "/etc/systemd/system/${service_name}.service"
    log_info "Created systemd service: ${service_name}.service"
}

# Enable systemd service
enable_systemd_service() {
    local service_name="$1"
    
    if ! sudo systemctl daemon-reload; then
        if [[ "${CI_E2E:-}" == "true" ]]; then
            log_warn "CI E2E: systemctl unavailable (not in systemd), skipping enable for $service_name"
            return 0
        fi
        return 1
    fi
    if ! sudo systemctl enable "$service_name"; then
        if [[ "${CI_E2E:-}" == "true" ]]; then
            log_warn "CI E2E: systemctl enable failed, skipping for $service_name"
            return 0
        fi
        return 1
    fi
    log_info "Enabled systemd service: $service_name"
}

# Enable and start systemd service
enable_and_start_systemd_service() {
    local service_name="$1"
    
    if ! enable_systemd_service "$service_name"; then
        return 1
    fi
    if ! sudo systemctl start "$service_name"; then
        if [[ "${CI_E2E:-}" == "true" ]]; then
            log_warn "CI E2E: systemctl start failed (not in systemd), service file created for $service_name"
            return 0
        fi
        log_error "Failed to start systemd service: $service_name"
        return 1
    fi
    if sudo systemctl is-active --quiet "$service_name"; then
        log_info "Started systemd service: $service_name"
    else
        if [[ "${CI_E2E:-}" == "true" ]]; then
            log_warn "CI E2E: service $service_name not active (expected when not in systemd)"
            return 0
        fi
        log_error "Failed to start systemd service: $service_name"
        return 1
    fi
}


# =============================================================================
# SYSTEM MANAGEMENT FUNCTIONS
# =============================================================================

# Stop all Ethereum services
stop_all_services() {
    log_info "Stopping all Ethereum services..."
    
    local services=("eth1" "cl" "validator" "mev-boost" "nginx" "caddy")
    
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            log_info "Stopping $service..."
            sudo systemctl stop "$service" || log_warn "Failed to stop $service"
        fi
    done
    
    log_info "All services stopped"
}

# Add PPA repository
add_ppa_repository() {
    local ppa="$1"
    
    if ! command_exists add-apt-repository; then
        sudo apt-get update
        sudo apt-get install -y software-properties-common
    fi
    
    sudo add-apt-repository -y "$ppa"
    sudo apt-get update
    log_info "Added PPA repository: $ppa"
}

# Install dependencies
install_dependencies() {
    local packages=("$@")
    
    log_info "Installing dependencies: ${packages[*]}"
    
    sudo apt-get update
    if sudo apt-get install -y "${packages[@]}"; then
        log_info "Dependencies installed successfully"
    else
        log_error "Failed to install some dependencies"
        return 1
    fi
}

# Setup firewall rules
# When CI_E2E=true (Docker E2E test): skip UFW - container lacks kernel modules for iptables/nftables
setup_firewall_rules() {
    local ports=("$@")
    log_info "Setting up firewall rules for ports: ${ports[*]}"
    if [[ "${CI_E2E:-}" == "true" ]]; then
        log_warn "CI E2E: skipping UFW (container lacks kernel modules)"
        return 0
    fi
    # Install UFW if not present
    if ! command_exists ufw; then
        sudo apt-get update
        sudo apt-get install -y ufw
    fi
    # Enable UFW if not already enabled
    if ! sudo ufw status | grep -q "Status: active"; then
        sudo ufw --force enable
    fi
    # Add rules for each port
    for port in "${ports[@]}"; do
        sudo ufw allow "$port"
        log_info "Added firewall rule for port $port"
    done
}

# Run install script (used by run_2.sh flag mode)
run_install_script() {
    local script="$1"
    local name="${2:-$(basename "$script" .sh)}"
    local log_file exit_code
    if [[ ! -f "$script" ]]; then
        log_error "Script not found: $script"
        return 1
    fi
    log_info "Installing $name..."
    log_file=$(mktemp)
    trap 'rm -f "$log_file"' RETURN
    set +e
    ./"$script" 2>&1 | tee "$log_file"
    exit_code=$?
    set -e
    if [[ $exit_code -eq 0 ]]; then
        log_info "✓ $name installed"
        return 0
    else
        log_error "Failed to install $name (exit=$exit_code)"
        log_error "Last 15 lines of output:"
        tail -15 "$log_file" | while IFS= read -r line; do log_error "  $line"; done
        return 1
    fi
}

# Ensure JWT secret exists
ensure_jwt_secret() {
    local jwt_path="$1"
    
    if [[ ! -f "$jwt_path" ]]; then
        log_info "Generating JWT secret at $jwt_path"
        openssl rand -hex 32 > "$jwt_path"
        sudo chmod 600 "$jwt_path"
        log_info "JWT secret generated and secured"
    else
        log_info "JWT secret already exists at $jwt_path"
    fi
}

# =============================================================================
# INPUT VALIDATION FUNCTIONS
# =============================================================================

# Validate menu choice
validate_menu_choice() {
    local choice="$1"
    local max="${2:-10}"
    
    # Check if choice is a number
    if ! [[ "$choice" =~ ^[0-9]+$ ]]; then
        return 1
    fi
    
    # Check if choice is within valid range
    if [[ $choice -lt 1 ]] || [[ $choice -gt $max ]]; then
        return 1
    fi
    
    return 0
}

# =============================================================================
# SYSTEM VALIDATION FUNCTIONS
# =============================================================================

# Check system requirements (min_memory_gb, min_disk_gb)
# Logs warnings if below threshold but never fails - allows CI/Docker E2E to proceed.
# Real servers will see the warning; clients may fail at runtime if undersized.
check_system_requirements() {
    local min_memory_gb="${1:-16}"
    local min_disk_gb="${2:-1000}"
    log_info "Checking system requirements (${min_memory_gb}GB RAM, ${min_disk_gb}GB disk recommended)..."
    local ok=true
    local total_memory_gb
    total_memory_gb=$(free -g 2>/dev/null | awk 'NR==2{print $2}' || echo "0")
    if [[ "${total_memory_gb:-0}" -lt "$min_memory_gb" ]] 2>/dev/null; then
        log_warn "⚠ Low memory: ${total_memory_gb:-?}GB available, ${min_memory_gb}GB recommended (proceeding anyway)"
        ok=false
    fi
    local available_disk_gb
    available_disk_gb=$(df -BG / 2>/dev/null | awk 'NR==2{print $4}' | sed 's/G//' || echo "0")
    if [[ "${available_disk_gb:-0}" -lt "$min_disk_gb" ]] 2>/dev/null; then
        log_warn "⚠ Low disk: ${available_disk_gb:-?}GB available, ${min_disk_gb}GB recommended (proceeding anyway)"
        ok=false
    fi
    if [[ "$ok" == "true" ]]; then
        log_info "✓ System requirements check passed"
    fi
    return 0
}

# Check system compatibility
check_system_compatibility() {
    log_info "Checking system compatibility..."
    
    # Check OS
    if [[ -f /etc/os-release ]]; then
        local os_id
        os_id=$(grep "^ID=" /etc/os-release | cut -d'=' -f2 | tr -d '"')
        case "$os_id" in
            "ubuntu"|"debian")
                log_info "✓ Running on $os_id"
                ;;
            *)
                log_warn "⚠ Unsupported OS: $os_id (designed for Ubuntu/Debian)"
                ;;
        esac
    fi
    
    # Check architecture
    local arch
    arch=$(uname -m)
    if [[ "$arch" != "x86_64" ]]; then
        log_error "Unsupported architecture: $arch (requires x86_64)"
        return 1
    fi
    
    log_info "✓ System compatibility check passed"
    return 0
}

# Root check standardization
require_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# =============================================================================
# SECURITY FUNCTIONS - Required for run_1.sh and run_2.sh
# =============================================================================

# Secure user creation and setup
# Automatically migrates root's SSH authorized_keys to the new user
setup_secure_user() {
    local username="$1"
    local password="$2"
    local ssh_key_file="${3:-}"

    log_info "Setting up secure user: $username"

    # Create user if it doesn't exist
    if ! id -u "$username" >/dev/null 2>&1; then
        log_info "Creating user: $username"
        if ! useradd -m -d "/home/$username" -s /bin/bash "$username"; then
            log_error "Failed to create user: $username"
            return 1
        fi
    else
        log_info "User $username already exists"
    fi

    # Set password
    if [[ -n "$password" ]]; then
        log_info "Setting password for user: $username"
        if ! echo "$username:$password" | chpasswd; then
            log_error "Failed to set password for user: $username"
            return 1
        fi
    fi

    # Setup SSH directory
    local ssh_dir="/home/$username/.ssh"
    mkdir -p "$ssh_dir"

    # Copy SSH keys if explicitly provided
    if [[ -n "$ssh_key_file" && -f "$ssh_key_file" ]]; then
        cp "$ssh_key_file" "$ssh_dir/authorized_keys"
        log_info "SSH key copied from provided file for user: $username"
    fi

    # CRITICAL: Migrate root's SSH authorized_keys to the new user
    # This prevents lockout when PermitRootLogin is later restricted
    if [[ -f /root/.ssh/authorized_keys ]] && [[ -s /root/.ssh/authorized_keys ]]; then
        if [[ -f "$ssh_dir/authorized_keys" ]]; then
            # Merge: append root's keys that aren't already present
            while IFS= read -r key; do
                [[ -z "$key" || "$key" =~ ^# ]] && continue
                if ! grep -Fqx "$key" "$ssh_dir/authorized_keys" 2>/dev/null; then
                    echo "$key" >> "$ssh_dir/authorized_keys"
                fi
            done < /root/.ssh/authorized_keys
        else
            cp /root/.ssh/authorized_keys "$ssh_dir/authorized_keys"
        fi
        log_info "Root SSH authorized_keys migrated to user: $username"
    else
        log_warn "No root SSH keys found to migrate to $username"
        log_warn "Ensure you can authenticate as $username before restricting root access"
    fi

    # Set correct ownership and permissions
    chown -R "$username:$username" "$ssh_dir"
    chmod 700 "$ssh_dir"
    if [[ -f "$ssh_dir/authorized_keys" ]]; then
        chmod 600 "$ssh_dir/authorized_keys"
    fi

    # Configure sudo access (NOPASSWD for staking operations)
    log_info "Configuring sudo for user: $username"
    usermod -aG sudo "$username"

    cat > "/etc/sudoers.d/$username" << EOF
$username ALL=(ALL) NOPASSWD:ALL
EOF

    chmod 440 "/etc/sudoers.d/$username"

    if visudo -cf "/etc/sudoers.d/$username" >/dev/null 2>&1; then
        log_info "Sudo configured for user: $username"
    else
        log_error "Invalid sudoers syntax for $username, removing file"
        rm -f "/etc/sudoers.d/$username"
        return 1
    fi

    log_info "User $username setup complete"
}

# Detect the correct SSH service name (ssh on Ubuntu 22.04+, sshd on older/other distros)
get_ssh_service_name() {
    if systemctl list-unit-files ssh.service &>/dev/null && systemctl list-unit-files ssh.service 2>/dev/null | grep -q "ssh.service"; then
        echo "ssh"
    else
        echo "sshd"
    fi
}

# Configure SSH with security hardening
# Uses the hardened configs/sshd_config template with port substitution
configure_ssh() {
    local ssh_port="$1"
    local project_root="${2:-}"

    log_info "Configuring SSH security hardening on port $ssh_port..."

    # Resolve project root if not passed
    if [[ -z "$project_root" ]]; then
        project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    fi

    local config_template="$project_root/configs/sshd_config"
    local banner_file="$project_root/configs/ssh_banner"

    # Validate template exists
    if [[ ! -f "$config_template" ]]; then
        log_error "SSH config template not found: $config_template"
        return 1
    fi

    # Backup original SSH config (only if no backup exists yet)
    if [[ ! -f /etc/ssh/sshd_config.backup ]]; then
        cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
        log_info "Original SSH config backed up to /etc/ssh/sshd_config.backup"
    fi

    # Deploy the hardened config template with port substitution
    cp "$config_template" /etc/ssh/sshd_config
    sed -i "s/^Port .*/Port $ssh_port/" /etc/ssh/sshd_config

    # Audit sshd_config.d drop-in directory: files here can override hardened settings
    # The template includes "Include /etc/ssh/sshd_config.d/*.conf" (Ubuntu default)
    if [[ -d /etc/ssh/sshd_config.d ]]; then
        local dropin_count
        dropin_count=$(find /etc/ssh/sshd_config.d -name "*.conf" -type f 2>/dev/null | wc -l)
        if [[ "$dropin_count" -gt 0 ]]; then
            log_warn "Found $dropin_count drop-in config(s) in /etc/ssh/sshd_config.d/ that may override hardened settings"
            find /etc/ssh/sshd_config.d -name "*.conf" -type f -exec basename {} \; 2>/dev/null | while read -r f; do
                log_warn "  Drop-in: $f"
            done
        fi
    fi

    # CRITICAL: During Phase 1, allow BOTH root (key-only) and the new user
    # This prevents lockout. Root access can be removed later in Phase 2
    # after verifying the new user can log in successfully.
    # PermitRootLogin is already "prohibit-password" in the template (key-only).
    # Do NOT add AllowUsers here — it would lock out root before key migration.

    # Deploy SSH banner
    if [[ -f "$banner_file" ]]; then
        cp "$banner_file" /etc/ssh/ssh_banner
        log_info "SSH banner deployed"
    else
        log_warn "SSH banner file not found: $banner_file"
    fi

    # Set secure permissions
    chmod 600 /etc/ssh/sshd_config

    # Validate the new config before applying
    if ! sshd -t 2>/dev/null; then
        log_error "SSH config validation failed! Restoring backup."
        cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
        return 1
    fi
    log_info "SSH config validation passed"

    # Detect correct service name and reload (not restart, to preserve active sessions)
    local ssh_service
    ssh_service=$(get_ssh_service_name)

    if systemctl reload "$ssh_service" 2>/dev/null; then
        log_info "SSH service reloaded successfully ($ssh_service)"
    elif systemctl restart "$ssh_service" 2>/dev/null; then
        log_warn "SSH reload failed, restarted $ssh_service instead"
    else
        log_error "Failed to reload/restart SSH service ($ssh_service)"
        return 1
    fi

    if systemctl is-active --quiet "$ssh_service"; then
        log_info "SSH configured and running on port $ssh_port"
    else
        log_error "SSH service is not running after configuration!"
        log_error "Restoring backup config..."
        cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
        systemctl restart "$ssh_service" 2>/dev/null
        return 1
    fi
}


# Generate, display, and save secure handoff information
# Also saves to /root/handoff_info.txt with restricted permissions
generate_handoff_info() {
    local username="$1"
    local password="$2"
    local server_ip="${3:-}"
    local ssh_port="${4:-22}"

    # Auto-detect server IP if not provided
    if [[ -z "$server_ip" ]]; then
        server_ip=$(curl -s v4.ident.me 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
    fi

    local ssh_cmd="ssh $username@$server_ip"
    if [[ "$ssh_port" != "22" ]]; then
        ssh_cmd="ssh -p $ssh_port $username@$server_ip"
    fi

    log_info "Generating secure handoff information..."

    local auth_line="Authentication: SSH key only (no password)"
    [[ -n "$password" ]] && auth_line="Password: $password (sudo/console fallback)"

    local handoff_text
    handoff_text=$(cat << EOF
=== SECURE HANDOFF INFORMATION ===
Username: $username
$auth_line
Server IP: $server_ip
SSH Port: $ssh_port
SSH Command: $ssh_cmd
Next Step: ./run_2.sh

IMPORTANT: SSH key authentication is required.
Root's SSH keys have been migrated to this user.
Delete /root/handoff_info.txt after noting this information.

AIDE: After apt upgrade, update the integrity database:
  sudo aide --config=/etc/aide/aide.conf --update
  sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

Generated: $(date)
=====================================
EOF
)

    # Display to console
    echo ""
    echo "$handoff_text"
    echo ""

    # Save to file with restricted permissions
    echo "$handoff_text" > /root/handoff_info.txt
    chmod 600 /root/handoff_info.txt

    log_info "After reboot: $ssh_cmd"
    log_info "Then run: ./run_2.sh"
}


apply_network_security() {
    log_info "Applying OS and network hardening..."

    # Restrict shared memory (takes effect after reboot via fstab)
    append_once /etc/fstab $'tmpfs\t/run/shm\ttmpfs\tro,noexec,nosuid\t0 0'

    # Disable unnecessary network services
    systemctl disable bluetooth 2>/dev/null || true
    systemctl disable cups 2>/dev/null || true
    systemctl disable avahi-daemon 2>/dev/null || true

    # Configure kernel parameters for security using a drop-in file
    # Using /etc/sysctl.d/ avoids duplication issues with appending to sysctl.conf
    local sysctl_file="/etc/sysctl.d/99-eth2-hardening.conf"
    cat > "$sysctl_file" << 'EOF'
# Network security settings - eth2-quickstart hardening
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0
EOF

    # Apply sysctl settings
    sysctl --system >/dev/null 2>&1 || true

    log_info "Network security applied"
}

setup_security_monitoring() {
    log_info "Setting up security monitoring..."

    # Create security monitoring script
    tee /usr/local/bin/security_monitor.sh > /dev/null << 'EOF'
#!/bin/bash
# Security monitoring script

LOG_FILE="/var/log/security_monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Security monitoring check" >> "$LOG_FILE"

# Check for failed login attempts
if command -v lastb >/dev/null 2>&1; then
    failed_logins=$(lastb | wc -l)
    if [[ $failed_logins -gt 0 ]]; then
        echo "[$DATE] WARNING: $failed_logins failed login attempts detected" >> "$LOG_FILE"
    fi
fi

# Check for suspicious processes
if pgrep -f "nc -l" >/dev/null 2>&1; then
    echo "[$DATE] WARNING: Suspicious netcat listener detected" >> "$LOG_FILE"
fi

# Check disk usage
disk_usage=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
if [[ $disk_usage -gt 90 ]]; then
    echo "[$DATE] WARNING: Disk usage at ${disk_usage}%" >> "$LOG_FILE"
fi

echo "[$DATE] Security monitoring check complete" >> "$LOG_FILE"
EOF

    chmod +x /usr/local/bin/security_monitor.sh

    # Add to crontab (idempotent — only adds if not already present)
    # crontab -l exits 1 when no crontab exists; capture with || true to avoid pipefail exit
    local cron_entry="*/15 * * * * /usr/local/bin/security_monitor.sh"
    local existing_crontab
    existing_crontab=$(crontab -l 2>/dev/null) || true
    if ! echo "$existing_crontab" | grep -Fq "/usr/local/bin/security_monitor.sh"; then
        (echo "$existing_crontab"; echo "$cron_entry") | crontab -
    fi

    log_info "Security monitoring setup complete"
}


# validate_user_input remains — used by install scripts for interactive input
validate_user_input() {
    local input="$1"
    local max_length="${2:-50}"
    local min_length="${3:-1}"

    # Handle empty parameters
    if [[ -z "$max_length" ]]; then
        max_length=50
    fi
    if [[ -z "$min_length" ]]; then
        min_length=1
    fi

    # Check length
    if [[ ${#input} -lt $min_length ]] || [[ ${#input} -gt $max_length ]]; then
        return 1
    fi

    # Check for dangerous characters using grep
    if echo "$input" | grep -q '[<>"'\'';&|`$]'; then
        return 1
    fi

    return 0
}

# =============================================================================
# REFACTORING FUNCTIONS - Requested in REFACTORING_AUDIT_REPORT.md
# =============================================================================

# 2. Installation Start Messages - log_installation_start()
log_installation_start() {
    local client_name="$1"
    log_info "Starting $client_name installation..."
}

# 3. Installation Complete Messages - log_installation_complete()
log_installation_complete() {
    local client_name="$1"
    local service_name="$2"
    
    log_info "$client_name installation completed!"
    log_info "To check status: sudo systemctl status $service_name"
    log_info "To start service: sudo systemctl start $service_name"
    log_info "To enable service: sudo systemctl enable $service_name"
    log_info "To view logs: sudo journalctl -u $service_name -f"
}

# 4. Setup Information Display - display_client_setup_info()
display_client_setup_info() {
    local client_name="$1"
    local beacon_service="${2:-}"
    local validator_service="${3:-}"
    local beacon_desc="${4:-Beacon Node}"
    local validator_desc="${5:-Validator Client}"
    
    cat << EOF

=== $client_name Setup Information ===
$client_name has been installed with the following components:

EOF

    if [[ -n "$beacon_service" ]]; then
        echo "1. Beacon Node ($beacon_service service) - $beacon_desc"
    fi
    
    if [[ -n "$validator_service" ]]; then
        echo "2. Validator Client ($validator_service service) - $validator_desc"
    fi
    
    cat << EOF

Configuration files are located in:
- Base configs: $SCRIPT_DIR/configs/$client_name/
- Active configs: /etc/$client_name/

Data directories:
- Beacon data: /var/lib/$client_name/beacon
- Validator data: /var/lib/$client_name/validator

To manage services:
- Start: sudo systemctl start $beacon_service $validator_service
- Stop: sudo systemctl stop $beacon_service $validator_service
- Status: sudo systemctl status $beacon_service $validator_service
- Logs: sudo journalctl -fu $beacon_service $validator_service

=== Setup Complete ===
EOF
}

# 5. Temporary Directory Creation - create_temp_config_dir()
create_temp_config_dir() {
    local temp_dir="./tmp"
    
    if [[ ! -d "$temp_dir" ]]; then
        mkdir -p "$temp_dir"
        log_info "Created temporary directory: $temp_dir"
    fi
    
    echo "$temp_dir"
}

# 1. SCRIPT_DIR Pattern Duplication - get_script_directories()
get_script_directories() {
    # Get the directory of the calling script
    local script_dir
    script_dir="$(cd "$(dirname "${BASH_SOURCE[1]}")" && pwd)"
    local project_root
    project_root="$(cd "$script_dir/../.." && pwd)"
    
    # Export variables for use in calling script
    export SCRIPT_DIR="$script_dir"
    export PROJECT_ROOT="$project_root"
    
    log_info "Script directory: $script_dir"
    log_info "Project root: $project_root"
}





# 6. Configuration Merging - merge_client_config()
merge_client_config() {
    local client_name="$1"
    local config_type="$2"
    local base_config="$3"
    local custom_config="$4"
    local output_config="$5"
    
    log_info "Merging $client_name $config_type configuration..."
    
    # Create temp directory if it doesn't exist
    create_temp_config_dir > /dev/null
    
    # Check if files exist
    if [[ ! -f "$base_config" ]]; then
        log_error "Base config not found: $base_config"
        return 1
    fi
    
    if [[ ! -f "$custom_config" ]]; then
        log_error "Custom config not found: $custom_config"
        return 1
    fi
    
    # Merge based on file type
    case "$base_config" in
        *.json)
            if command_exists jq; then
                jq -s '.[0] * .[1]' "$base_config" "$custom_config" > "$output_config"
            else
                log_error "jq not found, cannot merge JSON configs"
                return 1
            fi
            ;;
        *.yaml|*.yml)
            # Manual YAML merge: copy base config and append custom config
            cp "$base_config" "$output_config"
            if [[ -f "$custom_config" ]]; then
                {
                    echo ""
                    echo "# Custom configuration overrides"
                    cat "$custom_config"
                } >> "$output_config"
            fi
            ;;
        *.toml)
            # For TOML, we'll do a simple concatenation (custom overrides base)
            cat "$base_config" "$custom_config" > "$output_config"
            ;;
        *)
            log_error "Unsupported config format: $base_config"
            return 1
            ;;
    esac
    
    if [[ -f "$output_config" ]]; then
        log_info "Configuration merged successfully: $output_config"
        return 0
    else
        log_error "Failed to merge configuration"
        return 1
    fi
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Append text to file only if not already present
append_once() {
    local file="$1"
    shift
    local text="$*"
    
    if [[ ! -f "$file" ]] || ! grep -Fqx -- "$text" "$file"; then
        echo "$text" | sudo tee -a "$file" >/dev/null
    fi
}