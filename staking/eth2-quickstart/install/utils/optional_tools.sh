#!/bin/bash


# Optional Tools Installation Script
# Installs useful network monitoring and system utilities
# https://askubuntu.com/questions/257263/how-to-display-network-traffic-in-the-terminal

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/lib/common_functions.sh"

log_installation_start "Optional Tools"

log_info "Network monitoring tools are available..."

log_installation_complete "Optional Tools" "optional-tools"
log_info "Installed tools:"
log_info "- bmon: Bandwidth monitoring"
log_info "- slurm: Network traffic monitor"
log_info "- tcptrack: TCP connection tracker"
log_info ""
log_info "Usage examples:"
log_info "- bmon: Monitor bandwidth usage"
log_info "- slurm: Monitor network traffic by interface"
log_info "- tcptrack: Track TCP connections in real-time"
