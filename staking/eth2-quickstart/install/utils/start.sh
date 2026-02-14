#!/bin/bash

# Service Start Script
# Starts all Ethereum client systemd services
# Usage: ./start.sh
# Note: Requires services to be installed and configured

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/lib/common_functions.sh"

start_all_services
