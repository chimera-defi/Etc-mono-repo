#!/usr/bin/env python3
"""UserPromptSubmit hook: nudge repo exploration onto the token-reduce path."""
import json
import re
import sys


TRIGGERS = (
    r"\bfind\b",
    r"\bwhere\b",
    r"\blives?\b",
    r"\bexplor",
    r"\bcontext\b",
    r"\breview\b",
    r"\bbenchmark\b",
    r"\bsearch\b",
)


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0

    prompt = data.get("user_prompt", "") or ""
    if not any(re.search(pattern, prompt, re.IGNORECASE) for pattern in TRIGGERS):
        return 0

    json.dump(
        {
            "continue": True,
            "systemMessage": (
                "For repo discovery in this workspace, do not invoke the Skill tool. "
                "Your first tool call must be a single standalone Bash command: "
                "./skills/token-reduce/scripts/token-reduce-paths.sh topic words. "
                "That helper gives a low-token path-only kickoff. "
                "Use the user's literal filenames, identifiers, or key nouns as the query words; "
                "do not replace them with generic synonyms. "
                "If you need one ranked excerpt after the file list, use "
                "./skills/token-reduce/scripts/token-reduce-snippet.sh topic words. "
                "Do not start with find, ls, grep, Grep, Read, or broad Glob fallbacks before the helper runs."
            ),
        },
        sys.stdout,
    )
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
