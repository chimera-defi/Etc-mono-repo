#!/usr/bin/env bash
# Checkpoint and truncate the codex SQLite WAL to prevent unbounded growth.
# Run manually or via cron. Kills stale codex app-server daemons, checkpoints,
# then optionally restarts takopi-managed sessions.
#
# Usage: ./codex-wal-checkpoint.sh [--dry-run]
#
# Schedule (cron, weekly):
#   0 3 * * 0 /home/agents/workspace/Etc-mono-repo/scripts/agenthost/codex-wal-checkpoint.sh >> /tmp/codex-wal-checkpoint.log 2>&1

set -euo pipefail
DB="/home/agents/.codex/logs_2.sqlite"
WAL="${DB}-wal"
DRY_RUN="${1:-}"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

wal_size_gb() { python3 -c "import os; print(f'{os.path.getsize(\"${WAL}\")/1e9:.1f} GB')" 2>/dev/null || echo "?"; }

log "WAL size before: $(wal_size_gb)"

# Find and kill stale codex app-server processes (>24h old)
STALE_PIDS=$(ps -eo pid,etime,cmd 2>/dev/null \
  | awk '/codex.*app-server/ && !/awk/' \
  | while read -r pid etime cmd; do
      # etime format: [[DD-]HH:]MM:SS — stale if contains '-' (days) or HH > 23
      if echo "$etime" | grep -qE '^[0-9]+-'; then
        echo "$pid"
      fi
    done)

if [ -n "$STALE_PIDS" ]; then
  log "Stale app-server PIDs (>24h): $STALE_PIDS"
  if [ "$DRY_RUN" != "--dry-run" ]; then
    for pid in $STALE_PIDS; do
      kill -9 "$pid" 2>/dev/null && log "Killed PID $pid" || log "PID $pid already gone"
    done
    sleep 2
  else
    log "[dry-run] would kill: $STALE_PIDS"
  fi
else
  log "No stale app-server processes found"
fi

# Kill remaining holders
REMAINING=$(lsof "$DB" 2>/dev/null | awk 'NR>1 {print $2}' | sort -u || true)
if [ -n "$REMAINING" ]; then
  log "Remaining DB holders: $REMAINING"
  if [ "$DRY_RUN" != "--dry-run" ]; then
    echo "$REMAINING" | xargs -r kill -9 2>/dev/null || true
    sleep 1
  fi
fi

# Checkpoint
if [ "$DRY_RUN" != "--dry-run" ]; then
  log "Running PRAGMA wal_checkpoint(TRUNCATE)..."
  python3 -c "
import sqlite3, os, sys
db = '${DB}'
wal = '${WAL}'
try:
    conn = sqlite3.connect(db, timeout=30)
    result = conn.execute('PRAGMA wal_checkpoint(TRUNCATE)').fetchone()
    conn.close()
    busy, log_frames, checkpointed = result
    if busy == 0:
        print(f'Checkpoint OK: {checkpointed} frames written to DB')
    else:
        print(f'Checkpoint BUSY (busy={busy}, log={log_frames})', file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print(f'Checkpoint FAILED: {e}', file=sys.stderr)
    sys.exit(1)
"
fi

log "WAL size after:  $(wal_size_gb)"
log "Done."
