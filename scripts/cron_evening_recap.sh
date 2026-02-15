#!/bin/bash
# Evening recap (6 PM, Mon-Fri)
# Usage: cron add --name "evening-recap" --cron "0 18 * * 1-5" --session isolated --model ollama/qwen2.5:3b --inject-only "active-tasks.md,project-status.md"

set -e

TIMESTAMP=$(date "+%Y-%m-%d %H:%M GMT+1")
WORKSPACE="/root/.openclaw/workspace"

# End of day summary
{
  echo "🌆 Evening Recap ($TIMESTAMP)"
  echo ""
  echo "## Completed Today"
  grep "Completion:" "$WORKSPACE/memory/project-status.md" 2>/dev/null | head -1 || echo "- (check project-status.md)"
  echo ""
  echo "## Tomorrow's Prep"
  grep "ETA\|Next" "$WORKSPACE/memory/active-tasks.md" 2>/dev/null | head -2 || echo "- Resume from active-tasks.md"
  echo ""
  echo "## Any Blockers?"
  grep "⏳\|Blocked" "$WORKSPACE/memory/active-tasks.md" 2>/dev/null | wc -l | \
    awk '{if ($1 > 0) print "Yes, " $1 " items"; else print "No blockers"}'
} > /tmp/evening_recap.txt

cat /tmp/evening_recap.txt
