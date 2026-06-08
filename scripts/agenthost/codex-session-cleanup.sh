#!/usr/bin/env bash
# Kill stale codex app-server daemons to prevent SQLite WAL growth.
# Takopi has no native session TTL, so this runs daily via cron.
#
# Usage: ./codex-session-cleanup.sh [--dry-run] [--max-age-hours N]
#   Default max age: 24 hours
#
# Schedule (cron, daily at 2am):
#   0 2 * * * /home/agents/workspace/Etc-mono-repo/scripts/agenthost/codex-session-cleanup.sh >> /home/agents/.codex/log/session-cleanup.log 2>&1

set -euo pipefail

DRY_RUN=""
MAX_AGE_HOURS=24

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN="--dry-run"; shift ;;
    --max-age-hours) MAX_AGE_HOURS="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

# etime format: [[DD-]HH:]MM:SS
# "stale" = contains a day component (DD-) or HH >= MAX_AGE_HOURS/... simplified: any day prefix
is_stale() {
  local etime="$1"
  if echo "$etime" | grep -qE '^[0-9]+-'; then
    # Has day component — always stale vs 24h threshold
    return 0
  fi
  if [ "$MAX_AGE_HOURS" -lt 24 ]; then
    # Also check HH:MM:SS format for sub-24h thresholds
    local hours
    hours=$(echo "$etime" | grep -oE '^[0-9]+(?=:)' || echo "0")
    [ "${hours:-0}" -ge "$MAX_AGE_HOURS" ] && return 0
  fi
  return 1
}

STALE_PIDS=$(ps -eo pid,etime,cmd 2>/dev/null \
  | awk '/codex.*app-server/ && !/awk/' \
  | while read -r pid etime cmd; do
      if echo "$etime" | grep -qE '^[0-9]+-'; then
        echo "$pid"
      fi
    done)

if [ -z "$STALE_PIDS" ]; then
  log "No stale codex app-server processes (>${MAX_AGE_HOURS}h)"
  exit 0
fi

COUNT=$(echo "$STALE_PIDS" | wc -w)
log "Found $COUNT stale app-server PID(s): $STALE_PIDS"

if [ -n "$DRY_RUN" ]; then
  log "[dry-run] would kill: $STALE_PIDS"
  exit 0
fi

mkdir -p /home/agents/.codex/log

for pid in $STALE_PIDS; do
  kill -9 "$pid" 2>/dev/null && log "Killed PID $pid" || log "PID $pid already gone"
done

log "Done. Killed $COUNT stale session(s)."
