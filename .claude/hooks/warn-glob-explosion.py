#!/usr/bin/env python3
"""PostToolUse hook: Warn when Glob returns too many files."""
import json
import sys

FILE_THRESHOLD = 50

def main():
    try:
        data = json.load(sys.stdin)
    except:
        sys.exit(0)

    tool_result = data.get("tool_result", "")

    # Count files in result (each line is a file path)
    if isinstance(tool_result, str):
        lines = [l for l in tool_result.strip().split('\n') if l.strip()]
        file_count = len(lines)
    else:
        sys.exit(0)

    if file_count > FILE_THRESHOLD:
        print(f"WARNING: Glob returned {file_count} files.", file=sys.stderr)
        print("Consider: Use Task(subagent_type='Explore') for large searches.", file=sys.stderr)
        print("This reduces main context by delegating exploration to sub-agent.", file=sys.stderr)

    sys.exit(0)

if __name__ == "__main__":
    main()
