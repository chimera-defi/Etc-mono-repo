#!/usr/bin/env bash
set -euo pipefail

BIN=${1:-/usr/local/bin/monad-bft}
CONFIG=${2:-/etc/monad/config.toml}
STATUS_ENV=${3:-/etc/monad/status.env}

err=0

if [[ ! -x "$BIN" ]]; then
  echo "Missing or not executable: $BIN" >&2
  err=1
fi

if [[ ! -f "$CONFIG" ]]; then
  echo "Missing config: $CONFIG" >&2
  err=1
fi

if [[ ! -f "$STATUS_ENV" ]]; then
  echo "Missing status env: $STATUS_ENV" >&2
  err=1
fi

if [[ $err -ne 0 ]]; then
  echo "Preflight failed" >&2
  exit 1
fi

echo "Preflight OK"
