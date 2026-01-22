#!/bin/bash
# PreToolUse hook for Read: Remind about targeted reads
# This hook runs before Read tool is invoked

# Get the file path from tool arguments (passed via stdin or args)
FILE_PATH="${1:-}"

# Only remind for potentially large files
if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
  LINE_COUNT=$(wc -l < "$FILE_PATH" 2>/dev/null || echo "0")

  if [ "$LINE_COUNT" -gt 200 ]; then
    echo "Token efficiency: File has $LINE_COUNT lines"
    echo "  Consider: Read with limit/offset for specific sections"
  fi
fi

exit 0
