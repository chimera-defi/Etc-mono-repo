#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

usage() {
  cat <<EOFMSG
Usage: $0 [--with-caddy]

Sets up a Monad infra host:
- installs sysctl tuning
- installs validator + status services
- optionally installs Caddy
- runs preflight and e2e smoke tests
EOFMSG
}

WITH_CADDY=false
if [[ ${1:-} == "--help" ]]; then
  usage
  exit 0
fi
if [[ ${1:-} == "--with-caddy" ]]; then
  WITH_CADDY=true
fi

sudo "$ROOT_DIR/scripts/install_sysctl.sh"
sudo "$ROOT_DIR/scripts/install_validator_service.sh"
sudo "$ROOT_DIR/scripts/install_status_service.sh"

if [[ "$WITH_CADDY" == "true" ]]; then
  sudo "$ROOT_DIR/scripts/install_caddy.sh"
fi

"$ROOT_DIR/scripts/preflight_check.sh"
"$ROOT_DIR/scripts/e2e_smoke_test.sh"

echo "Setup complete. Configure /etc/monad/validator.env and /etc/monad/status.env as needed."
