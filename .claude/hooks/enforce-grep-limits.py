#!/usr/bin/env python3
"""PreToolUse hook: Warn when Grep returns content without head_limit."""
import json
import sys

def main():
    try:
        data = json.load(sys.stdin)
    except:
        sys.exit(0)  # Allow if can't parse

    tool_input = data.get("tool_input", {})
    output_mode = tool_input.get("output_mode", "files_with_matches")
    head_limit = tool_input.get("head_limit")

    # Only check content mode (files_with_matches is safe)
    if output_mode != "content":
        sys.exit(0)

    # Allow if head_limit specified
    if head_limit is not None and head_limit > 0:
        sys.exit(0)

    # Warn: content mode without limit can bloat context
    print("SUGGESTION: Grep content mode without head_limit can bloat context.", file=sys.stderr)
    print("Consider: head_limit=50 or use output_mode='files_with_matches' first.", file=sys.stderr)
    # Don't block, just warn - exit 0 allows the operation
    sys.exit(0)

if __name__ == "__main__":
    main()
