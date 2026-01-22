#!/bin/bash
# PreToolUse hook: Remind to check knowledge graph before research
# Triggered on Grep/Glob operations that might benefit from cached knowledge

# This hook provides a gentle reminder - does not block
# The reminder helps enforce rule #147 and #150

# Check if MCP CLI is available
if command -v mcp-cli &>/dev/null; then
  echo "Reminder: Query knowledge graph first - mcp-cli memory/search_nodes"
fi

exit 0
