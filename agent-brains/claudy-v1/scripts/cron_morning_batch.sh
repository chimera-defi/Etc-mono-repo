#!/bin/bash
# Morning batch (7 AM, Mon-Fri)
# Usage: cron add --name "morning-batch" --cron "0 7 * * 1-5" --session isolated --model ollama/qwen2.5:3b --inject-only "active-tasks.md,project-status.md"

set -e

TIMESTAMP=$(date "+%Y-%m-%d %H:%M GMT+1")
WORKSPACE="/root/.openclaw/workspace"

# Morning priorities
{
  echo "🌅 Morning Batch ($TIMESTAMP)"
  echo ""
  echo "## Today's Priority"
  grep -A2 "Currently Running" "$WORKSPACE/memory/active-tasks.md" 2>/dev/null | head -4 || echo "- Check active-tasks.md"
  echo ""
  echo "## Project Status"
  grep "Status:" "$WORKSPACE/memory/project-status.md" 2>/dev/null | head -2 || echo "- All systems nominal"
  echo ""
  echo "## System Health"
  systemctl is-active openclaw-gateway >/dev/null && echo "✓ gateway" || echo "✗ gateway"
  systemctl is-active takopi >/dev/null && echo "✓ takopi" || echo "✗ takopi"
  free -h | grep Mem | awk '{print "RAM: " $3 " / " $2}'
} > /tmp/morning_batch.txt

cat /tmp/morning_batch.txt
