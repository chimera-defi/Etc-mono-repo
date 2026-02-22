#!/bin/bash
# Daily recap (6 PM)
# Usage: cron add --name "daily-recap" --cron "0 18 * * *" --session isolated --model ollama/qwen2.5:3b --inject-only "active-tasks.md,project-status.md"

set -e

TIMESTAMP=$(date "+%Y-%m-%d %H:%M GMT+1")
WORKSPACE="/root/.openclaw/workspace"

# Summarize today's work
{
  echo "📊 Daily Recap ($TIMESTAMP)"
  echo ""
  echo "## Completed"
  grep -E "✅|DONE" "$WORKSPACE/memory/active-tasks.md" 2>/dev/null | head -3 || echo "- (no updates yet)"
  echo ""
  echo "## Blockers"
  grep -E "⏳|Blocked" "$WORKSPACE/memory/active-tasks.md" 2>/dev/null | head -2 || echo "- None"
  echo ""
  echo "## Tomorrow"
  grep -E "ETA|Next" "$WORKSPACE/memory/project-status.md" 2>/dev/null | head -2 || echo "- Resume benchmark"
} > /tmp/daily_recap.txt

# Send to user (if configured)
cat /tmp/daily_recap.txt
