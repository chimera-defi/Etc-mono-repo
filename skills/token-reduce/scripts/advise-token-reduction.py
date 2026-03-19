#!/usr/bin/env python3
"""PreToolUse hook: block broad exploratory Bash scans and redirect to token-reduce workflow."""
import json
import re
import sys

BROAD_PATTERNS = [
    r"\bfind\s+(\.|/)",
    r"\bls\s+-R\b",
    r"\bgrep\s+-R\b",
    r"\bgrep\s+--recursive\b",
    r"\bdu\s+-a\b",
    r"\brg\b.*\s--files(?:\s+\.|\s*$)",
    r"\btree\b(?:\s+\.|\s*$)",
]

SAFE_HINTS = (
    "Use a path-only kickoff first.",
    "Shortcut: ./skills/token-reduce/scripts/token-reduce-paths.sh topic words",
    "If you need one excerpt after the file list: ./skills/token-reduce/scripts/token-reduce-snippet.sh topic words",
    "Examples: qmd search \"topic\" -n 5 --files",
    "          rg -n -g '*.ts' 'keyword'",
    "Escalate to Task(subagent_type='Explore') if the search space stays broad.",
)


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0

    tool_name = data.get("tool_name")
    if tool_name != "Bash":
        return 0

    tool_input = data.get("tool_input", {})
    command = tool_input.get("command", "") or ""

    if any(re.search(pattern, command) for pattern in BROAD_PATTERNS):
        json.dump(
            {
                "decision": "deny",
                "reason": " ".join(("Blocked broad exploratory Bash scan.",) + SAFE_HINTS),
            },
            sys.stderr,
        )
        print(file=sys.stderr)
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
