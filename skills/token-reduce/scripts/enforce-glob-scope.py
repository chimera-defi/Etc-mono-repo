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
        json.dump(
            {
                "decision": "deny",
                "reason": (
                    "Blocked broad exploratory Glob pattern. "
                    "Use ./skills/token-reduce/scripts/token-reduce-paths.sh for a path-only kickoff, "
                    "./skills/token-reduce/scripts/token-reduce-snippet.sh for one ranked excerpt, "
                    "or scoped rg -g first."
                ),
            },
            sys.stderr,
        )
        print(file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
