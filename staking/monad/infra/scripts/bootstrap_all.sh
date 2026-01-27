#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

usage() {
  cat <<EOFMSG
Usage: $0 [--with-caddy] [--with-firewall] [--with-monitoring] [--with-hardening]

Runs full infra bootstrap:
- validator + status setup (setup_server.sh)
- optional Caddy + firewall
- optional monitoring stack (docker compose)
- optional security hardening (SSH + fail2ban + unattended upgrades)

Env vars:
  MONAD_BFT_BIN_SRC     Path or URL to monad-bft binary
  MONAD_CONFIG_SRC      Path or URL to config.toml
  GRAFANA_BASIC_AUTH_HASH  For Caddy basic auth (monitoring subdomain)
EOFMSG
}

WITH_CADDY=false
WITH_FIREWALL=false
WITH_MONITORING=false
WITH_HARDENING=false

for arg in "$@"; do
  case "$arg" in
    --help)
      usage
      exit 0
      ;;
    --with-caddy)
      WITH_CADDY=true
      ;;
    --with-firewall)
      WITH_FIREWALL=true
      ;;
    --with-monitoring)
      WITH_MONITORING=true
      ;;
    --with-hardening)
      WITH_HARDENING=true
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage
      exit 2
      ;;
  esac
done

setup_args=()
if [[ "$WITH_CADDY" == "true" ]]; then
  setup_args+=(--with-caddy)
fi
if [[ "$WITH_FIREWALL" == "true" ]]; then
  setup_args+=(--with-firewall)
fi

"$ROOT_DIR/scripts/setup_server.sh" "${setup_args[@]}"

if [[ "$WITH_MONITORING" == "true" ]]; then
  (cd "$ROOT_DIR/monitoring" && sudo docker compose up -d)
  echo "Monitoring up: Grafana http://<host>:3000, Prometheus http://<host>:9090, Loki http://<host>:3100"
fi

if [[ "$WITH_HARDENING" == "true" ]]; then
  sudo "$ROOT_DIR/scripts/harden_ssh.sh"
  sudo "$ROOT_DIR/scripts/install_fail2ban.sh"
  sudo "$ROOT_DIR/scripts/enable_unattended_upgrades.sh"
fi

echo "Bootstrap complete."
