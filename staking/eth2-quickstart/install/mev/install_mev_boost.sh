#!/bin/bash


# MEV Boost Installation Script
# MEV Boost is a service that connects validators to MEV relays

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/exports.sh"
source "$PROJECT_ROOT/lib/common_functions.sh"

# Get script directories
get_script_directories

log_installation_start "MEV Boost"


# Check system requirements
check_system_requirements 8 500


# Create MEV Boost directory
MEV_BOOST_DIR="$HOME/mev-boost"
rm -rf "$MEV_BOOST_DIR"
ensure_directory "$MEV_BOOST_DIR"

cd "$MEV_BOOST_DIR" || exit

# Clone and build MEV Boost
log_info "Cloning MEV Boost repository..."
if ! git clone https://github.com/flashbots/mev-boost .; then
    log_error "Failed to clone MEV Boost repository"
    exit 1
fi

git checkout v1.9

log_info "Building MEV Boost..."
if ! make build; then
    log_error "Failed to build MEV Boost"
    exit 1
fi

# Create systemd service
EXEC_START="$MEV_BOOST_DIR/mev-boost -mainnet -relay-check -min-bid $MIN_BID -relays $MEV_RELAYS -request-timeout-getheader $MEVGETHEADERT -request-timeout-getpayload $MEVGETPAYLOADT -request-timeout-regval $MEVREGVALT -addr $MEV_HOST:$MEV_PORT -loglevel info -json"

create_systemd_service "mev" "MEV Boost Service" "$EXEC_START" "$(whoami)" "always" "600" "5" "300"

# Enable and start the service
enable_and_start_systemd_service "mev"

# Show completion information
log_installation_complete "MEV Boost" "mev" "" "$MEV_BOOST_DIR"
