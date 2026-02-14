#!/bin/bash

# Mock Functions Library for Safe Testing
# These functions override system-modifying operations to allow safe testing
# Source this file AFTER common_functions.sh to override dangerous operations

# Track all mock calls for verification
declare -a MOCK_CALLS=()
MOCK_LOG_FILE="${MOCK_LOG_FILE:-/tmp/mock_calls.log}"

# Initialize mock log
echo "# Mock function calls log - $(date)" > "$MOCK_LOG_FILE"

# Log mock call
_log_mock_call() {
    local func_name="$1"
    shift
    local args="$*"
    local log_entry="[MOCK] $func_name($args)"
    MOCK_CALLS+=("$log_entry")
    echo "$log_entry" >> "$MOCK_LOG_FILE"
    echo -e "\033[0;33m$log_entry\033[0m"
}

# =============================================================================
# SYSTEMD MOCKS - Prevent actual service operations
# =============================================================================

mock_systemctl() {
    _log_mock_call "systemctl" "$@"
    local action="$1"
    local service="$2"
    
    case "$action" in
        "enable"|"start"|"stop"|"restart"|"reload")
            echo "[MOCK] Would $action service: $service"
            return 0
            ;;
        "is-active")
            # Simulate service is inactive by default
            echo "inactive"
            return 1
            ;;
        "is-enabled")
            echo "disabled"
            return 1
            ;;
        "daemon-reload")
            echo "[MOCK] Would reload systemd daemon"
            return 0
            ;;
        "status")
            echo "[MOCK] Service $service status: inactive (mocked)"
            return 0
            ;;
        "list-unit-files")
            echo "[MOCK] Listing unit files (mocked)"
            return 0
            ;;
        *)
            echo "[MOCK] systemctl $action $service"
            return 0
            ;;
    esac
}

# Override systemctl
if [[ "${USE_MOCKS:-false}" == "true" ]]; then
    alias systemctl='mock_systemctl'
    # Also create function version for subshells
    systemctl() { mock_systemctl "$@"; }
fi

# Override create_systemd_service
mock_create_systemd_service() {
    local service_name="$1"
    local description="$2"
    local exec_start="$3"
    local user="${4:-$(whoami)}"
    
    _log_mock_call "create_systemd_service" "$service_name" "$description"
    
    # Create mock service file in temp location
    local mock_service_dir="${MOCK_SERVICE_DIR:-/tmp/mock_services}"
    mkdir -p "$mock_service_dir"
    
    cat > "$mock_service_dir/${service_name}.service" <<EOF
[Unit]
Description=$description
Wants=network-online.target
After=network-online.target

[Service]
User=$user
ExecStart=$exec_start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

    echo "[MOCK] Created mock service file: $mock_service_dir/${service_name}.service"
    return 0
}

# Override enable_and_start_systemd_service
mock_enable_and_start_systemd_service() {
    local service_name="$1"
    _log_mock_call "enable_and_start_systemd_service" "$service_name"
    echo "[MOCK] Would enable and start service: $service_name"
    return 0
}

# Override enable_systemd_service
mock_enable_systemd_service() {
    local service_name="$1"
    _log_mock_call "enable_systemd_service" "$service_name"
    echo "[MOCK] Would enable service: $service_name"
    return 0
}

# =============================================================================
# APT/PACKAGE MOCKS - Prevent actual package installation
# =============================================================================

mock_apt_get() {
    _log_mock_call "apt-get" "$@"
    echo "[MOCK] Would run: apt-get $*"
    return 0
}

mock_apt() {
    _log_mock_call "apt" "$@"
    echo "[MOCK] Would run: apt $*"
    return 0
}

mock_add_apt_repository() {
    _log_mock_call "add-apt-repository" "$@"
    echo "[MOCK] Would add repository: $*"
    return 0
}

if [[ "${USE_MOCKS:-false}" == "true" ]]; then
    alias apt-get='mock_apt_get'
    alias apt='mock_apt'
    alias add-apt-repository='mock_add_apt_repository'
    apt-get() { mock_apt_get "$@"; }
    apt() { mock_apt "$@"; }
    add-apt-repository() { mock_add_apt_repository "$@"; }
fi

# Override install_dependencies
mock_install_dependencies() {
    local packages=("$@")
    _log_mock_call "install_dependencies" "${packages[*]}"
    echo "[MOCK] Would install packages: ${packages[*]}"
    return 0
}

# Override add_ppa_repository
mock_add_ppa_repository() {
    local ppa="$1"
    _log_mock_call "add_ppa_repository" "$ppa"
    echo "[MOCK] Would add PPA: $ppa"
    return 0
}

# =============================================================================
# FIREWALL MOCKS - Prevent actual firewall changes
# =============================================================================

mock_ufw() {
    _log_mock_call "ufw" "$@"
    
    case "$1" in
        "status")
            echo "Status: active"
            echo "[MOCK] Firewall status (mocked)"
            return 0
            ;;
        "allow"|"deny"|"default")
            echo "[MOCK] Would configure firewall: ufw $*"
            return 0
            ;;
        "--force")
            echo "[MOCK] Would force ufw: $*"
            return 0
            ;;
        *)
            echo "[MOCK] ufw $*"
            return 0
            ;;
    esac
}

if [[ "${USE_MOCKS:-false}" == "true" ]]; then
    alias ufw='mock_ufw'
    ufw() { mock_ufw "$@"; }
fi

# Override setup_firewall_rules
mock_setup_firewall_rules() {
    local ports=("$@")
    _log_mock_call "setup_firewall_rules" "${ports[*]}"
    echo "[MOCK] Would setup firewall rules for ports: ${ports[*]}"
    return 0
}

# =============================================================================
# USER MANAGEMENT MOCKS - Prevent actual user changes
# =============================================================================

mock_useradd() {
    _log_mock_call "useradd" "$@"
    echo "[MOCK] Would create user: $*"
    return 0
}

mock_usermod() {
    _log_mock_call "usermod" "$@"
    echo "[MOCK] Would modify user: $*"
    return 0
}

mock_chpasswd() {
    _log_mock_call "chpasswd" "(password hidden)"
    echo "[MOCK] Would change password"
    return 0
}

if [[ "${USE_MOCKS:-false}" == "true" ]]; then
    alias useradd='mock_useradd'
    alias usermod='mock_usermod'
    alias chpasswd='mock_chpasswd'
    useradd() { mock_useradd "$@"; }
    usermod() { mock_usermod "$@"; }
    chpasswd() { mock_chpasswd "$@"; }
fi

# Override setup_secure_user
mock_setup_secure_user() {
    local username="$1"
    # Password is captured but intentionally not used (for future logging)
    # shellcheck disable=SC2034
    local password="${2:-}"
    _log_mock_call "setup_secure_user" "$username" "(password hidden)"
    echo "[MOCK] Would setup secure user: $username"
    return 0
}

# =============================================================================
# NETWORK/DOWNLOAD MOCKS - Prevent actual network operations
# =============================================================================

mock_wget() {
    _log_mock_call "wget" "$@"
    local output_file=""
    
    # Parse wget arguments to find output file
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -O)
                output_file="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
    
    # Create mock output file if specified
    if [[ -n "$output_file" && "$output_file" != "-" ]]; then
        mkdir -p "$(dirname "$output_file")" 2>/dev/null || true
        echo "# Mock downloaded content" > "$output_file"
        echo "[MOCK] Created mock file: $output_file"
    fi
    
    return 0
}

mock_curl() {
    _log_mock_call "curl" "$@"
    
    # Check if this is a version/IP check
    if echo "$*" | grep -q "v4.ident.me\|ifconfig.me"; then
        echo "192.168.1.100"  # Mock public IP
        return 0
    fi
    
    # Check if this is a GitHub API call
    if echo "$*" | grep -q "api.github.com"; then
        echo '{"tag_name": "v1.0.0"}'  # Mock release info
        return 0
    fi
    
    echo "[MOCK] curl $*"
    return 0
}

if [[ "${USE_MOCKS:-false}" == "true" ]]; then
    alias wget='mock_wget'
    alias curl='mock_curl'
    wget() { mock_wget "$@"; }
    curl() { mock_curl "$@"; }
fi

# Override download_file
mock_download_file() {
    local url="$1"
    local output="$2"
    _log_mock_call "download_file" "$url" "$output"
    
    mkdir -p "$(dirname "$output")" 2>/dev/null || true
    echo "# Mock downloaded content from $url" > "$output"
    echo "[MOCK] Would download: $url -> $output"
    return 0
}

# Override secure_download
mock_secure_download() {
    mock_download_file "$@"
}

# Override get_latest_release
mock_get_latest_release() {
    local repo="$1"
    _log_mock_call "get_latest_release" "$repo"
    
    # Return mock versions for known repos
    case "$repo" in
        "hyperledger/besu") echo "24.1.0" ;;
        "NethermindEth/nethermind") echo "1.25.4" ;;
        "ConsenSys/teku") echo "24.1.0" ;;
        "sigp/lighthouse") echo "v5.0.0" ;;
        "Commit-Boost/commit-boost-client") echo "v0.9.2" ;;
        *) echo "v1.0.0" ;;
    esac
    return 0
}

# =============================================================================
# SSH MOCKS - Prevent SSH configuration changes
# =============================================================================

mock_configure_ssh() {
    local ssh_port="$1"
    _log_mock_call "configure_ssh" "$ssh_port"
    echo "[MOCK] Would configure SSH on port: $ssh_port"
    return 0
}

# =============================================================================
# SECURITY MOCKS - Prevent security tool installation
# =============================================================================

mock_setup_fail2ban() {
    _log_mock_call "setup_fail2ban"
    echo "[MOCK] Would setup fail2ban"
    return 0
}

mock_setup_security_monitoring() {
    _log_mock_call "setup_security_monitoring"
    echo "[MOCK] Would setup security monitoring"
    return 0
}

mock_apply_network_security() {
    _log_mock_call "apply_network_security"
    echo "[MOCK] Would apply network security settings"
    return 0
}

# =============================================================================
# APPLY MOCKS - Override functions when USE_MOCKS is true
# =============================================================================

apply_mocks() {
    if [[ "${USE_MOCKS:-false}" != "true" ]]; then
        echo "[INFO] Mocks disabled - using real functions"
        return 0
    fi
    
    echo "[INFO] Applying mock functions for safe testing..."
    
    # Override common_functions.sh functions
    create_systemd_service() { mock_create_systemd_service "$@"; }
    enable_and_start_systemd_service() { mock_enable_and_start_systemd_service "$@"; }
    enable_systemd_service() { mock_enable_systemd_service "$@"; }
    install_dependencies() { mock_install_dependencies "$@"; }
    add_ppa_repository() { mock_add_ppa_repository "$@"; }
    setup_firewall_rules() { mock_setup_firewall_rules "$@"; }
    setup_secure_user() { mock_setup_secure_user "$@"; }
    download_file() { mock_download_file "$@"; }
    secure_download() { mock_secure_download "$@"; }
    get_latest_release() { mock_get_latest_release "$@"; }
    configure_ssh() { mock_configure_ssh "$@"; }
    setup_fail2ban() { mock_setup_fail2ban "$@"; }
    setup_security_monitoring() { mock_setup_security_monitoring "$@"; }
    apply_network_security() { mock_apply_network_security "$@"; }
    
    echo "[INFO] Mock functions applied successfully"
}

# =============================================================================
# VERIFICATION FUNCTIONS
# =============================================================================

# Get all mock calls
get_mock_calls() {
    cat "$MOCK_LOG_FILE" 2>/dev/null || echo "No mock calls recorded"
}

# Check if a specific function was called
was_function_called() {
    local func_name="$1"
    grep -q "\[MOCK\] $func_name" "$MOCK_LOG_FILE" 2>/dev/null
}

# Count calls to a specific function
count_function_calls() {
    local func_name="$1"
    grep -c "\[MOCK\] $func_name" "$MOCK_LOG_FILE" 2>/dev/null || echo "0"
}

# Reset mock log
reset_mock_log() {
    MOCK_CALLS=()
    echo "# Mock function calls log - $(date)" > "$MOCK_LOG_FILE"
}

# Print summary of mock calls
print_mock_summary() {
    echo ""
    echo "=== Mock Call Summary ==="
    if [[ -f "$MOCK_LOG_FILE" ]]; then
        local count
        count=$(grep -c '\[MOCK\]' "$MOCK_LOG_FILE" 2>/dev/null || echo 0)
        echo "Total mock calls: $count"
        echo ""
        echo "Functions called:"
        # Use || true to prevent pipefail from causing script exit when no matches
        grep '\[MOCK\]' "$MOCK_LOG_FILE" 2>/dev/null | sed 's/\[MOCK\] //' | cut -d'(' -f1 | sort | uniq -c | sort -rn || true
    else
        echo "No mock calls recorded"
    fi
    echo "========================="
}

# Auto-apply mocks if USE_MOCKS is set
if [[ "${USE_MOCKS:-false}" == "true" ]]; then
    apply_mocks
fi
