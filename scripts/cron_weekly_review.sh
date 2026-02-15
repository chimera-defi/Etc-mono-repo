#!/bin/bash
# Weekly review (Monday 9 AM)
# Usage: cron add --name "weekly-review" --cron "0 9 * * 1" --session isolated --model claude/claude-haiku --inject-only "mistakes.md,self-review.md,project-status.md"

set -e

TIMESTAMP=$(date "+%Y-%m-%d %H:%M GMT+1")
WORKSPACE="/root/.openclaw/workspace"

# Deep dive analysis
{
  echo "🔍 Weekly Review ($TIMESTAMP)"
  echo ""
  echo "## Mistakes This Week"
  grep -A2 "Mistake [0-9]" "$WORKSPACE/memory/mistakes.md" 2>/dev/null | head -10 || echo "- None recorded"
  echo ""
  echo "## Self-Assessment"
  grep -E "What I Did Well|Where I Failed" "$WORKSPACE/memory/self-review.md" 2>/dev/null | head -5 || echo "- (due for checkpoint)"
  echo ""
  echo "## Project Status"
  grep -E "Status:|Completion:" "$WORKSPACE/memory/project-status.md" 2>/dev/null | head -3 || echo "- Check workspace"
} > /tmp/weekly_review.txt

cat /tmp/weekly_review.txt
