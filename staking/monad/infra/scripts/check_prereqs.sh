#!/usr/bin/env bash
set -euo pipefail

bins=(curl rg python3)
missing=0

for bin in "${bins[@]}"; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Missing: $bin" >&2
    missing=1
  fi
 done

if [[ $missing -ne 0 ]]; then
  echo "Install missing prerequisites before continuing." >&2
  exit 1
fi

echo "All prerequisites present: ${bins[*]}"
