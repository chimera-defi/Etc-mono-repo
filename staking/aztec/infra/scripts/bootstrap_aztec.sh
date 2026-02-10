#!/usr/bin/env bash
set -euo pipefail
# Aztec Full Infrastructure Bootstrap
#
# Wraps setup_aztec_node.sh + optional monitoring, hardening, L1 check.
# Mirrors the Monad bootstrap_all.sh pattern for InfraKit consistency.
#
# Usage: bootstrap_aztec.sh [--with-sequencer] [--with-prover] [--with-caddy]
#                           [--with-firewall] [--with-monitoring] [--with-hardening]
#                           [--help]
#
# Env vars: See setup_aztec_node.sh for full list.

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
SCRIPTS_DIR="$ROOT_DIR/scripts"

# Logging
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

usage() {
  cat <<EOFMSG
Usage: $0 [--with-sequencer] [--with-prover] [--with-caddy]
          [--with-firewall] [--with-monitoring] [--with-hardening] [--help]

Runs full Aztec infra bootstrap:
  1. Node setup (setup_aztec_node.sh) with forwarded flags
  2. Optional monitoring stack (docker compose)
  3. Optional security hardening (SSH + fail2ban + unattended upgrades)
  4. L1 connectivity verification

Env vars:
  AZTEC_NETWORK           Network to join (default: devnet)
  ETHEREUM_HOSTS          L1 RPC endpoints (required)
  See setup_aztec_node.sh for full list.
EOFMSG
}

# Parse args
WITH_SEQUENCER=false
WITH_PROVER=false
WITH_CADDY=false
WITH_FIREWALL=false
WITH_MONITORING=false
WITH_HARDENING=false

for arg in "$@"; do
  case "$arg" in
    --help|-h)         usage; exit 0 ;;
    --with-sequencer)  WITH_SEQUENCER=true ;;
    --with-prover)     WITH_PROVER=true ;;
    --with-caddy)      WITH_CADDY=true ;;
    --with-firewall)   WITH_FIREWALL=true ;;
    --with-monitoring) WITH_MONITORING=true ;;
    --with-hardening)  WITH_HARDENING=true ;;
    *) echo "Unknown argument: $arg" >&2; usage; exit 2 ;;
  esac
done

# ============================================================
# Step 1: Core node setup
# ============================================================
log_info "Step 1: Running node setup..."
setup_args=()
if [[ "$WITH_SEQUENCER" == "true" ]]; then setup_args+=(--with-sequencer); fi
if [[ "$WITH_PROVER" == "true" ]];    then setup_args+=(--with-prover); fi
if [[ "$WITH_CADDY" == "true" ]];     then setup_args+=(--with-caddy); fi
if [[ "$WITH_FIREWALL" == "true" ]];  then setup_args+=(--with-firewall); fi

"$SCRIPTS_DIR/setup_aztec_node.sh" "${setup_args[@]}"

# ============================================================
# Step 2: Optional monitoring stack
# ============================================================
if [[ "$WITH_MONITORING" == "true" ]]; then
  log_info "Step 2: Starting monitoring stack..."
  if [[ -d "$ROOT_DIR/monitoring" ]] && [[ -f "$ROOT_DIR/monitoring/docker-compose.yml" ]]; then
    (cd "$ROOT_DIR/monitoring" && sudo docker compose up -d)
    log_info "Monitoring up: Grafana http://<host>:3000, Prometheus http://<host>:9090"
  else
    log_warn "Monitoring directory not found at $ROOT_DIR/monitoring. Skipping."
    log_warn "To add monitoring, create a docker-compose.yml with Prometheus + Grafana + Loki."
  fi
else
  log_info "Step 2: Skipping monitoring (use --with-monitoring to enable)."
fi

# ============================================================
# Step 3: Optional security hardening
# ============================================================
if [[ "$WITH_HARDENING" == "true" ]]; then
  log_info "Step 3: Applying security hardening..."

  # SSH hardening (use Monad's shared script if available, otherwise inline)
  MONAD_SCRIPTS="${ROOT_DIR}/../../monad/infra/scripts"
  if [[ -x "$MONAD_SCRIPTS/harden_ssh.sh" ]]; then
    sudo "$MONAD_SCRIPTS/harden_ssh.sh"
  else
    log_info "Hardening SSH inline..."
    SSHD_CONFIG="/etc/ssh/sshd_config"
    if [[ -f "$SSHD_CONFIG" ]]; then
      sudo cp "$SSHD_CONFIG" "${SSHD_CONFIG}.bak"
      for setting in "PasswordAuthentication no" "PermitRootLogin no" "PubkeyAuthentication yes"; do
        key=$(echo "$setting" | awk '{print $1}')
        if grep -qE "^${key}\b" "$SSHD_CONFIG"; then
          sudo sed -i "s/^${key}.*/${setting}/" "$SSHD_CONFIG"
        else
          echo "$setting" | sudo tee -a "$SSHD_CONFIG" >/dev/null
        fi
      done
      sudo sshd -t && sudo systemctl reload sshd
      log_info "SSH hardened."
    fi
  fi

  # fail2ban
  if [[ -x "$MONAD_SCRIPTS/install_fail2ban.sh" ]]; then
    sudo "$MONAD_SCRIPTS/install_fail2ban.sh"
  else
    log_info "Installing fail2ban inline..."
    sudo apt-get update -qq && sudo apt-get install -y -qq fail2ban
    sudo systemctl enable --now fail2ban
    log_info "fail2ban installed."
  fi

  # Unattended upgrades
  if [[ -x "$MONAD_SCRIPTS/enable_unattended_upgrades.sh" ]]; then
    sudo "$MONAD_SCRIPTS/enable_unattended_upgrades.sh"
  else
    log_info "Enabling unattended upgrades inline..."
    sudo apt-get update -qq && sudo apt-get install -y -qq unattended-upgrades
    sudo systemctl enable --now unattended-upgrades
    log_info "Unattended upgrades enabled."
  fi
else
  log_info "Step 3: Skipping hardening (use --with-hardening to enable)."
fi

# ============================================================
# Step 4: L1 connectivity verification
# ============================================================
log_info "Step 4: Verifying L1 connectivity..."
ETHEREUM_HOSTS="${ETHEREUM_HOSTS:-}"

if [[ -n "$ETHEREUM_HOSTS" ]]; then
  # Test first L1 endpoint
  FIRST_HOST=$(echo "$ETHEREUM_HOSTS" | cut -d',' -f1)
  L1_RESPONSE=$(curl -s -m 10 -X POST "$FIRST_HOST" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null || true)

  if echo "$L1_RESPONSE" | grep -q "result"; then
    BLOCK_HEX=$(echo "$L1_RESPONSE" | grep -oP '"result"\s*:\s*"\K[^"]+' 2>/dev/null || echo "unknown")
    log_info "L1 reachable at $FIRST_HOST (block: $BLOCK_HEX)"
  else
    log_warn "L1 not reachable at $FIRST_HOST. Check ETHEREUM_HOSTS."
  fi
else
  log_warn "ETHEREUM_HOSTS not set. Cannot verify L1 connectivity."
  log_warn "Set ETHEREUM_HOSTS in /etc/aztec/node.env before starting the node."
fi

# ============================================================
# Done
# ============================================================
echo ""
log_info "=== Bootstrap Complete ==="
echo ""
echo "Services installed:"
echo "  aztec-node.service       (always)"
if [[ "$WITH_SEQUENCER" == "true" ]]; then
  echo "  aztec-sequencer.service  (sequencer mode)"
fi
if [[ "$WITH_PROVER" == "true" ]]; then
  echo "  aztec-prover.service     (prover agent)"
fi
echo ""
echo "Enable and start:"
if [[ "$WITH_SEQUENCER" == "true" ]]; then
  echo "  sudo systemctl enable --now aztec-sequencer"
else
  echo "  sudo systemctl enable --now aztec-node"
fi
