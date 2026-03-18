#!/usr/bin/env python3
"""PreToolUse hook: block broad exploratory Glob patterns."""
import json
import sys


def is_broad(pattern: str) -> bool:
    if not pattern:
        return False
    if pattern.startswith("**/") or "**/*" in pattern:
        return True
    if pattern.count("*") >= 2 and "/" not in pattern:
        return True
    if pattern.endswith("/**") or pattern.endswith("/**/*"):
        return True
    return False


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0

    if data.get("tool_name") != "Glob":
        return 0

    pattern = (data.get("tool_input", {}) or {}).get("pattern", "")
    if is_broad(pattern):
        print("BLOCKED: broad exploratory Glob pattern.", file=sys.stderr)
        print("Use qmd search, scoped rg -g, or ./.claude/token-reduce-search.sh first.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
