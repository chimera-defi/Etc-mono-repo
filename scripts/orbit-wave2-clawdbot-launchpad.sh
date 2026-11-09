#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${OUT_DIR:-$HOME/launches/clawdbot-launchpad-wave2/out}"
EVIDENCE_DIR="${EVIDENCE_DIR:-$HOME/launches/clawdbot-launchpad-wave2/evidence}"

exec "$ROOT_DIR/scripts/orbit-run-launch-pack.sh" \
  --pack-dir ideas/orbit-pilot/wave2/clawdbot-launchpad \
  --out-dir "$OUT_DIR" \
  --evidence-dir "$EVIDENCE_DIR" \
  "$@"
