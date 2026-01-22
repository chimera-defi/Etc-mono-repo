#!/bin/bash
# user-prompt-submit hook: Remind to check knowledge graph before starting work
# This hook runs when the user submits a prompt

# Check if MCP CLI is available
if command -v mcp-cli &>/dev/null; then
  # Check if there's relevant knowledge in the graph
  QUERY="${1:-}"
  if [ -n "$QUERY" ]; then
    # Extract first few words as search query
    SEARCH_TERMS=$(echo "$QUERY" | cut -d' ' -f1-3 | tr '[:upper:]' '[:lower:]')

    # Only show reminder if this looks like a research task
    if echo "$QUERY" | grep -qiE "find|search|look|check|where|what|how|explain|analyze"; then
      echo "Token efficiency: Consider querying knowledge graph first"
      echo "  mcp-cli memory/search_nodes '{\"query\": \"$SEARCH_TERMS\"}'"
    fi
  fi
fi

exit 0
