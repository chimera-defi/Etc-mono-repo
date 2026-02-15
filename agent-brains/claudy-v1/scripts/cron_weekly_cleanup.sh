#!/bin/bash
# Weekly cleanup (Sunday 10 PM)
# Usage: cron add --name "weekly-cleanup" --cron "0 22 * * 0" --session isolated --model ollama/qwen2.5:3b --inject-only "active-tasks.md" --delivery "none"

set -e

WORKSPACE="/root/.openclaw/workspace"

# Silent background cleanup
echo "[$(date)] Weekly cleanup starting..."

# 1. Archive sessions >2MB
for session in "$WORKSPACE"/*.jsonl; do
    if [ -f "$session" ]; then
        size_mb=$(stat -f%z "$session" 2>/dev/null | awk '{print $1/1024/1024}' || echo 0)
        if (( $(echo "$size_mb > 2" | bc -l 2>/dev/null) )); then
            tar -czf "${session}.archive.tar.gz" "$session" 2>/dev/null && rm "$session"
            echo "[✓] Archived $session ($size_mb MB)"
        fi
    fi
done

# 2. Delete daily-logs older than 7 days
find "$WORKSPACE/memory" -name "daily-logs.md" -mtime +7 -exec rm {} \; 2>/dev/null
echo "[✓] Deleted old daily logs"

# 3. Backup IDENTITY.md + system_prompt.md
mkdir -p "$WORKSPACE/backups"
cp "$WORKSPACE/IDENTITY.md" "$WORKSPACE/backups/IDENTITY.md.$(date +%Y%m%d)" 2>/dev/null
cp "$WORKSPACE/system_prompt.md" "$WORKSPACE/backups/system_prompt.md.$(date +%Y%m%d)" 2>/dev/null
echo "[✓] Backed up critical files"

# 4. Clean old backups (keep 7 days)
find "$WORKSPACE/backups" -name "*.backup" -mtime +7 -delete 2>/dev/null
echo "[✓] Cleaned old backups"

echo "[$(date)] Weekly cleanup complete"
