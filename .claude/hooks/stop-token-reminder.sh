#!/bin/bash
# Stop hook: Remind about token efficiency and knowledge graph storage
# This hook runs when Claude Code session ends

# Only show reminder if there were significant operations
if [ -f "$HOME/.cursor_token_monitor.log" ]; then
  echo ""
  echo "Session completed. Token efficiency reminders:"
  echo "  - Store research findings: mcp-cli memory/create_entities"
  echo "  - Review savings: .cursor/token-monitor.sh summary"
fi

exit 0
