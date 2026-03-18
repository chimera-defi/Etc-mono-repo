#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MEASURE_CMD="cd $ROOT && ./.claude/baseline-measurement.sh --scope repo >> ./.cursor/artifacts/token-reduction/cron.log 2>&1"
SUMMARY_CMD="cd $ROOT && python3 ./.claude/summarize_token_reduction.py >> ./.cursor/artifacts/token-reduction/cron.log 2>&1"

mkdir -p "$ROOT/.cursor/artifacts/token-reduction"
touch "$ROOT/.cursor/artifacts/token-reduction/cron.log"

CURRENT="$(crontab -l 2>/dev/null || true)"
FILTERED="$(printf '%s\n' "$CURRENT" | sed '/# token-reduction-etc-mono-repo/d;/baseline-measurement.sh --scope repo/d;/summarize_token_reduction.py/d')"

{
  printf '%s\n' "$FILTERED"
  echo "# token-reduction-etc-mono-repo"
  echo "15 9 * * * $MEASURE_CMD"
  echo "30 9 * * 1 $SUMMARY_CMD"
} | crontab -

echo "Installed cron entries:"
crontab -l | rg 'token-reduction-etc-mono-repo|baseline-measurement.sh --scope repo|summarize_token_reduction.py'
