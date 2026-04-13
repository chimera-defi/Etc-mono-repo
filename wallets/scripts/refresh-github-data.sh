#!/bin/bash
# Wallet GitHub Activity Refresh Script
# 
# This script queries the GitHub API to get the latest commit dates
# and activity status for all tracked wallet repositories.
#
# Usage:
#   ./refresh-github-data.sh                    # Output to stdout
#   ./refresh-github-data.sh --json             # Output as JSON
#   ./refresh-github-data.sh --markdown         # Output as Markdown table
#
# Requirements:
#   - curl
#   - jq
#   - (optional) GITHUB_TOKEN environment variable for higher rate limits
#
# Rate limits:
#   - Without token: 60 requests/hour (API only)
#   - With token: 5000 requests/hour

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOFTWARE_TABLE="$SCRIPT_DIR/../SOFTWARE_WALLETS.md"

load_repos_from_table() {
    python3 - "$SOFTWARE_TABLE" <<'PY'
import pathlib
import re
import sys

table_path = pathlib.Path(sys.argv[1])
in_table = False
seen_repos = set()

for raw_line in table_path.read_text(encoding="utf-8").splitlines():
    line = raw_line.strip()
    if line.startswith("| Wallet | Score |"):
        in_table = True
        continue
    if not in_table:
        continue
    if not line.startswith("|"):
        break
    if re.match(r"^\|[\s:-]+\|$", line):
        continue

    cells = [cell.strip() for cell in line.strip("|").split("|")]
    if len(cells) < 6:
        continue

    github_cell = cells[5]
    repo_match = re.search(r"\(https://github\.com/([^)/]+/[^)]+)\)", github_cell)
    if not repo_match:
        continue
    repo = repo_match.group(1)
    if repo in seen_repos:
        continue
    seen_repos.add(repo)

    name_match = re.search(r"\*\*([^*]+)\*\*", cells[0])
    if name_match:
        name = name_match.group(1)
    else:
        name = re.sub(r"\[[^\]]+\]\([^)]+\)", "", cells[0]).strip("*~ ")
    name = name.replace("~~", "").strip()

    print(f"{name}\t{repo}")
PY
}

mapfile -t TABLE_REPO_ROWS < <(load_repos_from_table)
REPOS=()
WALLET_NAMES=()
for row in "${TABLE_REPO_ROWS[@]}"; do
    IFS=$'\t' read -r wallet_name repo <<<"$row"
    WALLET_NAMES+=("$wallet_name")
    REPOS+=("$repo")
done

if [ "${#REPOS[@]}" -eq 0 ]; then
    echo "Error: no software repositories found in $SOFTWARE_TABLE" >&2
    exit 1
fi

# Set up authentication header if token is available
if [ -n "$GITHUB_TOKEN" ]; then
    echo "Using GitHub token for API requests" >&2
else
    echo "Warning: No GITHUB_TOKEN set. Rate limited to 60 requests/hour." >&2
    echo "Set GITHUB_TOKEN environment variable for higher limits." >&2
    echo "Falling back to GitHub Atom feeds for last-commit timestamps." >&2
    echo "Attempting HTML scrape fallback for stars/issues (best effort)." >&2
fi

# Function to get activity status based on days since last commit
get_status() {
    local days=$1
    if [ "$days" -le 30 ]; then
        echo "✅ Active"
    elif [ "$days" -le 120 ]; then
        echo "⚠️ Slow"
    else
        echo "❌ Inactive"
    fi
}

# Function to get status emoji only
get_status_emoji() {
    local days=$1
    if [ "$days" -le 30 ]; then
        echo "✅"
    elif [ "$days" -le 120 ]; then
        echo "⚠️"
    else
        echo "❌"
    fi
}

normalize_count() {
    local raw="$1"
    raw="${raw//,/}"
    if [[ "$raw" =~ ^([0-9]+(\.[0-9]+)?)([kKmM])$ ]]; then
        local num="${BASH_REMATCH[1]}"
        local suffix="${BASH_REMATCH[3]}"
        if [[ "$suffix" =~ [kK] ]]; then
            awk "BEGIN {printf \"%d\", $num*1000}"
        else
            awk "BEGIN {printf \"%d\", $num*1000000}"
        fi
    else
        echo "$raw"
    fi
}

# Parse arguments
OUTPUT_FORMAT="text"
if [ "$1" == "--json" ]; then
    OUTPUT_FORMAT="json"
elif [ "$1" == "--markdown" ]; then
    OUTPUT_FORMAT="markdown"
fi

# Get current date
CURRENT_DATE=$(date +%s)
TODAY=$(date +%Y-%m-%d)

# Start output
if [ "$OUTPUT_FORMAT" == "json" ]; then
    echo "{"
    echo "  \"generated\": \"$TODAY\","
    echo "  \"wallets\": ["
elif [ "$OUTPUT_FORMAT" == "markdown" ]; then
    echo "## GitHub Activity Status (Generated: $TODAY)"
    echo ""
    echo "| Wallet | Repository | Last Commit | Days Ago | Stars | Issues | Status |"
    echo "|--------|------------|-------------|----------|-------|--------|--------|"
else
    echo "=== Wallet GitHub Activity Check ==="
    echo "Generated: $TODAY"
    echo ""
fi

# Process each repository
FIRST=true
for i in "${!REPOS[@]}"; do
    REPO="${REPOS[$i]}"
    WALLET="${WALLET_NAMES[$i]}"
    
    # Get repository stats (stars/issues)
    if [ -n "$GITHUB_TOKEN" ]; then
        REPO_URL="https://api.github.com/repos/$REPO"
        REPO_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$REPO_URL" 2>/dev/null)
        if echo "$REPO_RESPONSE" | grep -q "API rate limit exceeded"; then
            echo "Error: GitHub API rate limit exceeded. Set GITHUB_TOKEN." >&2
            exit 1
        fi
        STARS=$(echo "$REPO_RESPONSE" | jq -r '.stargazers_count // 0' 2>/dev/null)
        ISSUES=$(echo "$REPO_RESPONSE" | jq -r '.open_issues_count // 0' 2>/dev/null)
    else
        REPO_URL="https://api.github.com/repos/$REPO"
        REPO_RESPONSE=$(curl -s "$REPO_URL" 2>/dev/null)
        if echo "$REPO_RESPONSE" | grep -q "API rate limit exceeded"; then
            STAR_RAW=$(curl -s "https://r.jina.ai/http://github.com/$REPO" 2>/dev/null | grep -m1 "Star " | sed -n 's/.*Star[[:space:]]\\{1,\\}\\([0-9][0-9.,kKmM]*\\).*/\\1/p')
            ISSUE_RAW=$(curl -s "https://r.jina.ai/http://github.com/$REPO/issues?q=is%3Aissue+is%3Aopen" 2>/dev/null | grep -m1 "Open[[:space:]]\\{1,\\}[0-9]" | sed -n 's/.*Open[[:space:]]\\{1,\\}\\([0-9][0-9.,kKmM]*\\).*/\\1/p')
            STARS=$(normalize_count "$STAR_RAW")
            ISSUES=$(normalize_count "$ISSUE_RAW")
        else
            STARS=$(echo "$REPO_RESPONSE" | jq -r '.stargazers_count // "?"' 2>/dev/null)
            ISSUES=$(echo "$REPO_RESPONSE" | jq -r '.open_issues_count // "?"' 2>/dev/null)
        fi
        if [ -z "$STARS" ]; then STARS="?"; fi
        if [ -z "$ISSUES" ]; then ISSUES="?"; fi
    fi

    # Get the default branch commits
    if [ -n "$GITHUB_TOKEN" ]; then
        API_URL="https://api.github.com/repos/$REPO/commits?per_page=1"
        RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API_URL" 2>/dev/null)
        if echo "$RESPONSE" | grep -q "API rate limit exceeded"; then
            echo "Error: GitHub API rate limit exceeded. Set GITHUB_TOKEN." >&2
            exit 1
        fi
        LAST_COMMIT=$(echo "$RESPONSE" | jq -r '.[0].commit.committer.date // empty' 2>/dev/null)
    else
        ATOM_URL="https://github.com/$REPO/commits/HEAD.atom"
        LAST_COMMIT=$(curl -s "$ATOM_URL" 2>/dev/null | grep -m1 "<updated>" | sed -e 's/.*<updated>//' -e 's/<\/updated>.*//')
        if [ -z "$LAST_COMMIT" ]; then
            API_URL="https://api.github.com/repos/$REPO/commits?per_page=1"
            RESPONSE=$(curl -s "$API_URL" 2>/dev/null)
            LAST_COMMIT=$(echo "$RESPONSE" | jq -r '.[0].commit.committer.date // empty' 2>/dev/null)
        fi
    fi
    
    if [ -z "$LAST_COMMIT" ]; then
        LAST_COMMIT_DATE="Unknown"
        DAYS_AGO="?"
        STATUS="?"
        STATUS_EMOJI="?"
    else
        # Convert to epoch and calculate days
        COMMIT_EPOCH=$(date -d "$LAST_COMMIT" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$LAST_COMMIT" +%s 2>/dev/null)
        DAYS_AGO=$(( (CURRENT_DATE - COMMIT_EPOCH) / 86400 ))
        LAST_COMMIT_DATE=$(echo "$LAST_COMMIT" | cut -d'T' -f1)
        STATUS=$(get_status $DAYS_AGO)
        STATUS_EMOJI=$(get_status_emoji $DAYS_AGO)
    fi
    
    # Output based on format
    if [ "$OUTPUT_FORMAT" == "json" ]; then
        if [ "$FIRST" != "true" ]; then
            echo ","
        fi
        FIRST=false
        echo -n "    {\"wallet\": \"$WALLET\", \"repo\": \"$REPO\", \"lastCommit\": \"$LAST_COMMIT_DATE\", \"daysAgo\": $DAYS_AGO, \"stars\": \"$STARS\", \"issues\": \"$ISSUES\", \"status\": \"$STATUS_EMOJI\"}"
    elif [ "$OUTPUT_FORMAT" == "markdown" ]; then
        echo "| **$WALLET** | [$REPO](https://github.com/$REPO) | $LAST_COMMIT_DATE | $DAYS_AGO | $STARS | $ISSUES | $STATUS |"
    else
        printf "%-15s %-40s %-12s %4s days  %7s %7s  %s\n" "$WALLET" "$REPO" "$LAST_COMMIT_DATE" "$DAYS_AGO" "$STARS" "$ISSUES" "$STATUS"
    fi
    
    # Sleep to avoid rate limiting (be nice to GitHub)
    sleep 0.5
done

# End output
if [ "$OUTPUT_FORMAT" == "json" ]; then
    echo ""
    echo "  ]"
    echo "}"
elif [ "$OUTPUT_FORMAT" == "markdown" ]; then
    echo ""
    echo "**Legend:** ✅ Active (≤30 days) | ⚠️ Slow (31-120 days) | ❌ Inactive (>120 days)"
else
    echo ""
    echo "Legend: ✅ Active (≤30 days) | ⚠️ Slow (31-120 days) | ❌ Inactive (>120 days)"
fi

echo "" >&2
echo "Done! Processed ${#REPOS[@]} repositories from SOFTWARE_WALLETS.md." >&2
