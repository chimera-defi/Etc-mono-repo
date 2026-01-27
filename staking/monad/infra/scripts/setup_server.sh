#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

usage() {
  cat <<EOFMSG
Usage: $0 [--with-caddy] [--with-firewall] [--help]

Sets up a Monad infra host:
- installs sysctl tuning
- installs validator + status services
- optionally installs Caddy
- optionally installs UFW firewall rules
- runs preflight and e2e smoke tests
EOFMSG
}

WITH_CADDY=false
WITH_FIREWALL=false
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
    *)
      echo "Unknown argument: $arg" >&2
      usage
      exit 2
      ;;
  esac
done

sudo "$ROOT_DIR/scripts/create_monad_user.sh"
if [[ -n ${MONAD_BFT_BIN_SRC:-} ]]; then
  sudo "$ROOT_DIR/scripts/install_validator_binary.sh" \
    "$MONAD_BFT_BIN_SRC" "${MONAD_CONFIG_SRC:-}"
else
  echo "MONAD_BFT_BIN_SRC not set; skipping binary install."
fi
sudo "$ROOT_DIR/scripts/install_sysctl.sh"
sudo "$ROOT_DIR/scripts/install_validator_service.sh"
sudo "$ROOT_DIR/scripts/install_status_service.sh"

if [[ "$WITH_CADDY" == "true" ]]; then
  sudo "$ROOT_DIR/scripts/install_caddy.sh"
fi
if [[ "$WITH_FIREWALL" == "true" ]]; then
  sudo "$ROOT_DIR/scripts/install_firewall_ufw.sh"
fi

"$ROOT_DIR/scripts/preflight_check.sh"
"$ROOT_DIR/scripts/e2e_smoke_test.sh"

echo "Setup complete. Configure /etc/monad/validator.env and /etc/monad/status.env as needed."
