#!/bin/bash

# Service Refresh Script
# Restarts all Ethereum client services
# Usage: ./refresh.sh
# Note: Restarts services without stopping them first

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/lib/common_functions.sh"

log_info "Refreshing all Ethereum services..."
restart_all_services
