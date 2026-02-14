#!/bin/bash

# System Update Script
# Updates the Ethereum software stack and shows version changes
# Usage: ./update.sh
# Note: Stops services before updating, restarts after completion

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/lib/common_functions.sh"
get_script_directories

log_info "Starting software stack update..."

# Stop services before update (except validators to avoid downtime)
log_info "Stopping services for update..."
sudo systemctl stop eth1 cl mev nginx
# Note: Validators are not stopped to avoid downtime during upgrades

# regular linux housecleaning
log_info "Updating system packages..."
sudo apt-get update
sudo apt upgrade -y
sudo apt dist-upgrade -y
sudo apt autoremove -y

# geth - upgrade before already shouldve upgraded it for us but here is cmd in case needed
log_info "Updating Geth..."
sudo apt upgrade geth -y 

# prysm
log_info "Restarting Prysm services..."
# Services will be restarted after MEV Boost update

# mev / flashbots
log_info "Updating MEV Boost..."
rm -rf ./mev-boost # remove any pre-existing copies
../mev/install_mev_boost.sh

# Start all services (validators will restart automatically via enable_and_start_systemd_service)
log_info "Starting all services..."
sudo systemctl start eth1 cl mev nginx
# Validators are already running and will be restarted by install scripts if needed

# Try to output a report
echo 'Upgraded from versions:'
echo "$MEV_BOOST_VERSION"
echo "$GETH_VERSION"
echo "$PRYSM_VERSION"
echo "$NGINX_VERSION"
echo 'to version'
export MEV_BOOST_VERSION
MEV_BOOST_VERSION=$(../mev-boost -version)
export GETH_VERSION
GETH_VERSION=$(geth version)
export PRYSM_VERSION
PRYSM_VERSION=$(../../prysm/prysm.sh validator --version)
export NGINX_VERSION
NGINX_VERSION=$(nginx -v)
echo "$MEV_BOOST_VERSION"
echo "$GETH_VERSION"
echo "$PRYSM_VERSION"
echo "$NGINX_VERSION"
