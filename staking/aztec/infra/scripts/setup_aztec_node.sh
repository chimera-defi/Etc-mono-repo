#!/usr/bin/env bash
set -euo pipefail
# Aztec Node Setup Script
#
# Provisions a server to run an Aztec network node (+ optional sequencer/prover).
# Mirrors the Monad setup_server.sh pattern for InfraKit consistency.
#
# Usage: setup_aztec_node.sh [--with-sequencer] [--with-prover] [--with-caddy] [--with-firewall] [--help]
#
# Env vars:
#   AZTEC_NETWORK         Network to join (default: devnet)
#   ETHEREUM_HOSTS        L1 RPC endpoints, comma-separated (required)
#   AZTEC_DATA_DIR        Node data directory (default: /var/lib/aztec)
#   AZTEC_PORT            Node RPC port (default: 8080)
#   AZTEC_ADMIN_PORT      Admin API port (default: 8880)
#   AZTEC_P2P_PORT        P2P port (default: 40400)
#   SEQ_PUBLISHER_PRIVATE_KEY  L1 private key for sequencer (required if --with-sequencer)
#   COINBASE              Block reward recipient (required if --with-sequencer)
#   FEE_RECIPIENT         Fee recipient address (required if --with-sequencer)

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

# ============================================================
# Logging (inline, since infra-kit shared lib not extracted yet)
# ============================================================
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $*" >&2; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# Require root/sudo
if [[ $EUID -ne 0 ]] && ! command -v sudo >/dev/null 2>&1; then
  log_error "This script requires root or sudo."
  exit 1
fi

# ============================================================
# Usage
# ============================================================
usage() {
  cat <<EOFMSG
Usage: $0 [--with-sequencer] [--with-prover] [--with-caddy] [--with-firewall] [--help]

Sets up an Aztec network node:
  Phase 1: Create aztec user + install Aztec CLI
  Phase 2: Install node systemd service (+ optional sequencer/prover)
  Phase 3: Optional Caddy reverse proxy + UFW firewall
  Phase 4: Preflight check + smoke test

Env vars:
  AZTEC_NETWORK           Network to join (default: devnet)
  ETHEREUM_HOSTS          L1 RPC endpoints, comma-separated (required)
  AZTEC_DATA_DIR          Node data directory (default: /var/lib/aztec)
  SEQ_PUBLISHER_PRIVATE_KEY  L1 private key (required if --with-sequencer)
  COINBASE                Block reward recipient (required if --with-sequencer)
EOFMSG
}

# ============================================================
# Argument parsing
# ============================================================
WITH_SEQUENCER=false
WITH_PROVER=false
WITH_CADDY=false
WITH_FIREWALL=false

for arg in "$@"; do
  case "$arg" in
    --help|-h)       usage; exit 0 ;;
    --with-sequencer) WITH_SEQUENCER=true ;;
    --with-prover)    WITH_PROVER=true ;;
    --with-caddy)     WITH_CADDY=true ;;
    --with-firewall)  WITH_FIREWALL=true ;;
    *) echo "Unknown argument: $arg" >&2; usage; exit 2 ;;
  esac
done

# ============================================================
# Defaults
# ============================================================
AZTEC_NETWORK="${AZTEC_NETWORK:-devnet}"
AZTEC_DATA_DIR="${AZTEC_DATA_DIR:-/var/lib/aztec}"
AZTEC_PORT="${AZTEC_PORT:-8080}"
AZTEC_ADMIN_PORT="${AZTEC_ADMIN_PORT:-8880}"
AZTEC_P2P_PORT="${AZTEC_P2P_PORT:-40400}"
SSH_PORT="${SSH_PORT:-22}"

log_info "=== Aztec Node Setup ==="
log_info "Network:    $AZTEC_NETWORK"
log_info "Data dir:   $AZTEC_DATA_DIR"
log_info "RPC port:   $AZTEC_PORT"
log_info "P2P port:   $AZTEC_P2P_PORT"
log_info "Sequencer:  $WITH_SEQUENCER"
log_info "Prover:     $WITH_PROVER"
echo ""

# ============================================================
# Phase 1: Provisioning
# ============================================================
log_info "Phase 1: Provisioning..."

# Create system user
log_info "Creating aztec system user..."
if ! getent group aztec >/dev/null 2>&1; then
  sudo groupadd --system aztec
fi
if ! id aztec >/dev/null 2>&1; then
  sudo useradd --system --gid aztec --home-dir /home/aztec --shell /usr/sbin/nologin aztec
fi
sudo mkdir -p /etc/aztec "$AZTEC_DATA_DIR"
sudo chown -R aztec:aztec /etc/aztec "$AZTEC_DATA_DIR"
log_info "User aztec ready."

# Install Aztec CLI
log_info "Installing Aztec CLI..."
if command -v aztec >/dev/null 2>&1; then
  log_info "Aztec CLI already installed: $(aztec --version 2>/dev/null | head -1 || echo 'unknown version')"
else
  # The official Aztec installer -- download first, then execute
  INSTALLER_TMP=$(mktemp /tmp/aztec-install-XXXXXX.sh)
  if curl -fsSL https://install.aztec.network -o "$INSTALLER_TMP"; then
    chmod +x "$INSTALLER_TMP"
    bash "$INSTALLER_TMP"
    rm -f "$INSTALLER_TMP"
    log_info "Aztec CLI installed via official installer."
  else
    log_warn "Official installer failed. Trying Docker extraction..."
    if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
      docker pull aztecprotocol/aztec:latest
      CONTAINER_ID=$(docker create aztecprotocol/aztec:latest)
      sudo docker cp "$CONTAINER_ID":/usr/src/yarn-project/aztec/dest/bin/aztec /usr/local/bin/aztec
      docker rm "$CONTAINER_ID"
      sudo chmod +x /usr/local/bin/aztec
      log_info "Aztec CLI extracted from Docker image."
    else
      log_error "Cannot install Aztec CLI. Install Docker or use the official installer."
      exit 1
    fi
  fi
fi

# Sysctl tuning (network buffers for P2P)
log_info "Applying sysctl tuning..."
SYSCTL_CONF="/etc/sysctl.d/99-aztec-node.conf"
sudo tee "$SYSCTL_CONF" >/dev/null <<'CONF'
# Aztec Node Network Tuning
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.core.rmem_default = 1048576
net.core.wmem_default = 1048576
net.ipv4.tcp_rmem = 4096 1048576 16777216
net.ipv4.tcp_wmem = 4096 1048576 16777216
# File descriptor limits
fs.file-max = 1000000
CONF
sudo sysctl -p "$SYSCTL_CONF" >/dev/null 2>&1 || true
log_info "Sysctl applied."

# ============================================================
# Phase 2: Services
# ============================================================
log_info "Phase 2: Installing services..."

# Write node env file (pre-create with restrictive perms to avoid TOCTOU)
log_info "Writing node env file..."
sudo install -m 0600 -o aztec -g aztec /dev/null /etc/aztec/node.env
sudo tee /etc/aztec/node.env >/dev/null <<EOF
# Aztec Node Configuration
# Generated by setup_aztec_node.sh on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
NETWORK=${AZTEC_NETWORK}
ETHEREUM_HOSTS=${ETHEREUM_HOSTS:-}
DATA_DIRECTORY=${AZTEC_DATA_DIR}
PORT=${AZTEC_PORT}
ADMIN_PORT=${AZTEC_ADMIN_PORT}
P2P_ENABLED=true
EOF

# Install node systemd unit
log_info "Installing aztec-node.service..."
sudo tee /etc/systemd/system/aztec-node.service >/dev/null <<EOF
[Unit]
Description=Aztec Network Node
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=aztec
EnvironmentFile=/etc/aztec/node.env
ExecStart=/usr/local/bin/aztec start --node --archiver --port \${PORT} --admin-port \${ADMIN_PORT}
Restart=on-failure
RestartSec=10
TimeoutStopSec=120
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# Optional: Sequencer service
# NOTE: aztec-sequencer.service runs a FULL node+sequencer combo.
# Run EITHER aztec-node OR aztec-sequencer, not both simultaneously.
if [[ "$WITH_SEQUENCER" == "true" ]]; then
  log_info "Installing sequencer configuration..."

  if [[ -z "${SEQ_PUBLISHER_PRIVATE_KEY:-}" ]]; then
    log_warn "SEQ_PUBLISHER_PRIVATE_KEY not set. You must configure /etc/aztec/sequencer.env before starting."
  fi

  # Pre-create with restrictive perms to prevent private key exposure window
  sudo install -m 0600 -o aztec -g aztec /dev/null /etc/aztec/sequencer.env
  sudo tee /etc/aztec/sequencer.env >/dev/null <<EOF
# Aztec Sequencer Configuration
# SECURITY: This file contains an L1 private key. Ensure proper secrets management.
SEQ_PUBLISHER_PRIVATE_KEY=${SEQ_PUBLISHER_PRIVATE_KEY:-REPLACE_ME}
COINBASE=${COINBASE:-REPLACE_ME}
FEE_RECIPIENT=${FEE_RECIPIENT:-REPLACE_ME}
EOF

  sudo tee /etc/systemd/system/aztec-sequencer.service >/dev/null <<EOF
[Unit]
Description=Aztec Node + Sequencer
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=aztec
EnvironmentFile=/etc/aztec/node.env
EnvironmentFile=/etc/aztec/sequencer.env
ExecStart=/usr/local/bin/aztec start --node --sequencer --archiver --port \${PORT} --admin-port \${ADMIN_PORT}
Restart=on-failure
RestartSec=10
TimeoutStopSec=120
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
  log_info "aztec-sequencer.service installed."
fi

# Optional: Prover agent service
if [[ "$WITH_PROVER" == "true" ]]; then
  log_info "Installing prover agent configuration..."

  sudo install -m 0600 -o aztec -g aztec /dev/null /etc/aztec/prover.env
  sudo tee /etc/aztec/prover.env >/dev/null <<EOF
# Aztec Prover Agent Configuration
# PROVER_BROKER_URL=http://localhost:8080
EOF

  sudo tee /etc/systemd/system/aztec-prover.service >/dev/null <<EOF
[Unit]
Description=Aztec Prover Agent
After=network-online.target

[Service]
Type=simple
User=aztec
EnvironmentFile=/etc/aztec/prover.env
ExecStart=/usr/local/bin/aztec start --prover-agent
Restart=on-failure
RestartSec=30
TimeoutStopSec=300
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
  log_info "aztec-prover.service installed."
fi

sudo systemctl daemon-reload
log_info "Systemd units installed."

# ============================================================
# Phase 3: Networking
# ============================================================
log_info "Phase 3: Networking..."

if [[ "$WITH_CADDY" == "true" ]]; then
  if [[ -x "$ROOT_DIR/scripts/install_caddy.sh" ]]; then
    sudo "$ROOT_DIR/scripts/install_caddy.sh"
  else
    log_warn "install_caddy.sh not found. Install Caddy manually for reverse proxy."
  fi
fi

if [[ "$WITH_FIREWALL" == "true" ]]; then
  log_info "Configuring UFW firewall..."
  if ! command -v ufw >/dev/null 2>&1; then
    sudo apt-get update -qq && sudo apt-get install -y -qq ufw
  fi
  sudo ufw allow "${SSH_PORT}/tcp"
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw allow "${AZTEC_P2P_PORT}/tcp"
  sudo ufw allow "${AZTEC_P2P_PORT}/udp"
  # Deny external access to admin and direct RPC (use Caddy proxy instead)
  sudo ufw deny "${AZTEC_ADMIN_PORT}/tcp"
  sudo ufw --force enable
  sudo ufw status verbose
  log_info "UFW configured."
fi

# ============================================================
# Phase 4: Verification
# ============================================================
log_info "Phase 4: Verification..."

# Preflight check
PREFLIGHT_OK=true
if ! command -v aztec >/dev/null 2>&1 && [[ ! -x /usr/local/bin/aztec ]]; then
  log_error "Preflight FAIL: aztec binary not found"
  PREFLIGHT_OK=false
fi
if [[ ! -f /etc/aztec/node.env ]]; then
  log_error "Preflight FAIL: /etc/aztec/node.env not found"
  PREFLIGHT_OK=false
fi
if [[ -z "${ETHEREUM_HOSTS:-}" ]]; then
  log_warn "Preflight WARN: ETHEREUM_HOSTS not set. Node will not sync without L1 RPC."
fi
if [[ ! -d "$AZTEC_DATA_DIR" ]]; then
  log_error "Preflight FAIL: Data directory $AZTEC_DATA_DIR not found"
  PREFLIGHT_OK=false
fi

if [[ "$PREFLIGHT_OK" == "true" ]]; then
  log_info "Preflight OK."
else
  log_error "Preflight FAILED. Fix issues above before starting services."
  exit 1
fi

# ============================================================
# Done
# ============================================================
echo ""
log_info "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Edit /etc/aztec/node.env  (set ETHEREUM_HOSTS)"
if [[ "$WITH_SEQUENCER" == "true" ]]; then
  echo "  2. Edit /etc/aztec/sequencer.env  (set SEQ_PUBLISHER_PRIVATE_KEY, COINBASE, FEE_RECIPIENT)"
fi
echo ""
echo "Start the node:"
if [[ "$WITH_SEQUENCER" == "true" ]]; then
  echo "  sudo systemctl enable --now aztec-sequencer"
else
  echo "  sudo systemctl enable --now aztec-node"
fi
echo ""
echo "Check status:"
echo "  sudo systemctl status aztec-node"
echo "  curl -s http://localhost:${AZTEC_PORT} -X POST -H 'Content-Type: application/json' \\"
echo "    -d '{\"jsonrpc\":\"2.0\",\"method\":\"node_getVersion\",\"params\":[],\"id\":1}'"
