#!/usr/bin/env python3
"""PreToolUse hook: Block reading large files without limit parameter."""
import json
import sys
import os

LINE_THRESHOLD = 300

def main():
    try:
        data = json.load(sys.stdin)
    except:
        sys.exit(0)  # Allow if can't parse

    tool_input = data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")
    limit = tool_input.get("limit")

    # Allow if limit specified
    if limit is not None:
        sys.exit(0)

    # Allow if file doesn't exist or can't check
    if not file_path or not os.path.isfile(file_path):
        sys.exit(0)

    # Check line count
    try:
        with open(file_path, 'r', errors='ignore') as f:
            lines = sum(1 for _ in f)
    except:
        sys.exit(0)

    # Block if over threshold
    if lines > LINE_THRESHOLD:
        print(f"BLOCKED: {lines} lines. Use limit parameter.", file=sys.stderr)
        sys.exit(1)

    sys.exit(0)

if __name__ == "__main__":
    main()
