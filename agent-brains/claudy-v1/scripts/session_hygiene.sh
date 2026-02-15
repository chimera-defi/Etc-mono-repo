#!/bin/bash
# Session Hygiene Script (Tip 7)
# Purpose: Auto-archive bloated sessions, delete old logs, keep agent lean
# Usage: Run manually or via cron (every 6 hours)
# chmod +x /root/.openclaw/workspace/scripts/session_hygiene.sh

set -e

WORKSPACE="/root/.openclaw/workspace"
ARCHIVE_DIR="$WORKSPACE/archives"
ALERT_THRESHOLD_MB=5
ARCHIVE_THRESHOLD_MB=2

echo "[$(date)] Session hygiene check starting..."

# Ensure archive directory exists
mkdir -p "$ARCHIVE_DIR"

# --- STAGE 1: CHECK BLOAT ---
echo ""
echo "Stage 1: Checking for bloated sessions..."

for session_file in "$WORKSPACE"/*.jsonl; do
    [ -f "$session_file" ] || continue
    
    size_bytes=$(stat -c%s "$session_file" 2>/dev/null || stat -f%z "$session_file" 2>/dev/null || echo 0)
    size_mb=$(echo "$size_bytes / 1024 / 1024" | bc -l 2>/dev/null || echo 0)
    
    filename=$(basename "$session_file")
    
    # ALERT: >5MB
    if (( $(echo "$size_mb > $ALERT_THRESHOLD_MB" | bc -l 2>/dev/null) )); then
        echo "  ⚠️  ALERT: $filename is ${size_mb}MB (>$ALERT_THRESHOLD_MB)"
    fi
    
    # ARCHIVE: >2MB
    if (( $(echo "$size_mb > $ARCHIVE_THRESHOLD_MB" | bc -l 2>/dev/null) )); then
        echo "  📦 ARCHIVING: $filename (${size_mb}MB)"
        tar -czf "$ARCHIVE_DIR/${filename}.$(date +%Y%m%d_%H%M%S).tar.gz" "$session_file" 2>/dev/null
        rm "$session_file"
        echo "     ✓ Archived to $ARCHIVE_DIR"
    fi
done

# --- STAGE 2: DELETE OLD LOGS ---
echo ""
echo "Stage 2: Deleting old daily logs (>7 days)..."

old_logs=$(find "$WORKSPACE/memory" -name "daily-logs.md" -mtime +7 2>/dev/null | wc -l)
if [ "$old_logs" -gt 0 ]; then
    find "$WORKSPACE/memory" -name "daily-logs.md" -mtime +7 -delete 2>/dev/null
    echo "  ✓ Deleted $old_logs old log files"
else
    echo "  ✓ No old logs to delete"
fi

# --- STAGE 3: BACKUP CRITICAL FILES ---
echo ""
echo "Stage 3: Backing up critical files..."

mkdir -p "$WORKSPACE/backups"

# IDENTITY.md
if [ -f "$WORKSPACE/IDENTITY.md" ]; then
    cp "$WORKSPACE/IDENTITY.md" "$WORKSPACE/backups/IDENTITY.md.$(date +%Y%m%d_%H%M%S)"
    echo "  ✓ Backed up IDENTITY.md"
fi

# system_prompt.md
if [ -f "$WORKSPACE/system_prompt.md" ]; then
    cp "$WORKSPACE/system_prompt.md" "$WORKSPACE/backups/system_prompt.md.$(date +%Y%m%d_%H%M%S)"
    echo "  ✓ Backed up system_prompt.md"
fi

# Keep only 7 days of backups
old_backups=$(find "$WORKSPACE/backups" -type f -mtime +7 2>/dev/null | wc -l)
if [ "$old_backups" -gt 0 ]; then
    find "$WORKSPACE/backups" -type f -mtime +7 -delete 2>/dev/null
    echo "  ✓ Cleaned old backups ($old_backups deleted)"
fi

# --- STAGE 4: GIT COMMIT ---
echo ""
echo "Stage 4: Git commit (if repo exists)..."

if [ -d "$WORKSPACE/.git" ]; then
    cd "$WORKSPACE"
    git add -A 2>/dev/null || true
    git commit -m "Auto: session hygiene cleanup ($(date +%Y-%m-%d\ %H:%M))" 2>/dev/null || true
    echo "  ✓ Git commit created"
else
    echo "  (no git repo)"
fi

# --- SUMMARY ---
echo ""
echo "[$(date)] Session hygiene complete"
echo ""
echo "Summary:"
echo "  Bloated sessions: archived"
echo "  Old logs: deleted"
echo "  Critical files: backed up"
echo "  Git: committed"
echo ""
echo "Next run: in 6 hours (or manual execution)"
