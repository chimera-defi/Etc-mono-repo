#!/bin/bash
# Hardware Wallet GitHub Activity Refresh Script
# 
# This script queries the GitHub API to get the latest commit dates,
# stars, issues, and activity status for hardware wallet firmware repositories.
#
# Usage:
#   ./refresh-hardware-wallet-data.sh                    # Output to stdout
#   ./refresh-hardware-wallet-data.sh --json             # Output as JSON
#   ./refresh-hardware-wallet-data.sh --markdown         # Output as Markdown table
#
# Requirements:
#   - curl
#   - jq
#   - (optional) GITHUB_TOKEN environment variable for higher rate limits
#
# Rate limits:
#   - Without token: 60 requests/hour
#   - With token: 5000 requests/hour

set -e

# Configuration - Hardware Wallet Firmware Repositories
REPOS=(
    "trezor/trezor-firmware"
    "KeystoneHQ/keystone3-firmware"
    "BitBoxSwiss/bitbox02-firmware"
    "Coldcard/firmware"
    "Foundation-Devices/passport2"
    "OneKeyHQ/firmware-pro"
    "keepkey/keepkey-firmware"
    "ArcticWallet/ArcticWallet"
    "AirGap-it/airgap-vault"
)

WALLET_NAMES=(
    "Trezor"
    "Keystone"
    "BitBox02"
    "ColdCard"
    "Foundation Passport"
    "OneKey"
    "KeepKey"
    "Arctic (Arculus)"
    "AirGap Vault"
)

# Note: These wallets have NO public firmware repos (closed source):
# - Ledger (ledger-live is companion app, not firmware)
# - NGRAVE ZERO
# - Ellipal Titan
# - SafePal S1 (app is open, firmware is not)
# - SecuX
# - Tangem
# - BC Vault
# - GridPlus Lattice1 (SDK only, no firmware)

# Set up authentication header if token is available
AUTH_HEADER=""
if [ -n "$GITHUB_TOKEN" ]; then
    AUTH_HEADER="-H \"Authorization: token $GITHUB_TOKEN\""
    echo "Using GitHub token for API requests" >&2
else
    echo "Warning: No GITHUB_TOKEN set. Rate limited to 60 requests/hour." >&2
    echo "Set GITHUB_TOKEN environment variable for higher limits." >&2
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
    echo "  \"type\": \"hardware_wallets\","
    echo "  \"generated\": \"$TODAY\","
    echo "  \"wallets\": ["
elif [ "$OUTPUT_FORMAT" == "markdown" ]; then
    echo "## Hardware Wallet GitHub Activity Status"
    echo ""
    echo "**Generated:** $TODAY"
    echo ""
    echo "| Wallet | Repository | Last Commit | Days Ago | Stars | Issues | Ratio | Status |"
    echo "|--------|------------|-------------|----------|-------|--------|-------|--------|"
else
    echo "=== Hardware Wallet GitHub Activity Check ==="
    echo "Generated: $TODAY"
    echo ""
    printf "%-20s %-35s %-12s %6s %7s %7s %7s  %s\n" "Wallet" "Repository" "Last Commit" "Days" "Stars" "Issues" "Ratio" "Status"
    echo "-------------------- ----------------------------------- ------------ ------ ------- ------- -------  -----------"
fi

# Process each repository
FIRST=true
for i in "${!REPOS[@]}"; do
    REPO="${REPOS[$i]}"
    WALLET="${WALLET_NAMES[$i]}"
    
    # Get repository info (stars, issues)
    REPO_URL="https://api.github.com/repos/$REPO"
    
    if [ -n "$GITHUB_TOKEN" ]; then
        REPO_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$REPO_URL" 2>/dev/null)
    else
        REPO_RESPONSE=$(curl -s "$REPO_URL" 2>/dev/null)
    fi
    
    # Check for rate limit or error
    if echo "$REPO_RESPONSE" | grep -q "API rate limit exceeded"; then
        echo "Error: GitHub API rate limit exceeded. Set GITHUB_TOKEN." >&2
        exit 1
    fi
    
    # Extract stars and issues
    STARS=$(echo "$REPO_RESPONSE" | jq -r '.stargazers_count // 0' 2>/dev/null)
    ISSUES=$(echo "$REPO_RESPONSE" | jq -r '.open_issues_count // 0' 2>/dev/null)
    
    # Calculate ratio (using awk for portability - bc not always available)
    if [ "$STARS" -gt 0 ] 2>/dev/null; then
        RATIO=$(awk "BEGIN {printf \"%.1f\", $ISSUES * 100 / $STARS}" 2>/dev/null || echo "?")
        RATIO="${RATIO}%"
    else
        RATIO="?"
    fi
    
    # Get the default branch commits
    API_URL="https://api.github.com/repos/$REPO/commits?per_page=1"
    
    if [ -n "$GITHUB_TOKEN" ]; then
        RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API_URL" 2>/dev/null)
    else
        RESPONSE=$(curl -s "$API_URL" 2>/dev/null)
    fi
    
    # Extract last commit date
    LAST_COMMIT=$(echo "$RESPONSE" | jq -r '.[0].commit.committer.date // empty' 2>/dev/null)
    
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
        echo -n "    {\"wallet\": \"$WALLET\", \"repo\": \"$REPO\", \"lastCommit\": \"$LAST_COMMIT_DATE\", \"daysAgo\": $DAYS_AGO, \"stars\": $STARS, \"issues\": $ISSUES, \"ratio\": \"$RATIO\", \"status\": \"$STATUS_EMOJI\"}"
    elif [ "$OUTPUT_FORMAT" == "markdown" ]; then
        echo "| **$WALLET** | [$REPO](https://github.com/$REPO) | $LAST_COMMIT_DATE | $DAYS_AGO | $STARS | $ISSUES | $RATIO | $STATUS |"
    else
        printf "%-20s %-35s %-12s %6s %7s %7s %7s  %s\n" "$WALLET" "$REPO" "$LAST_COMMIT_DATE" "$DAYS_AGO" "$STARS" "$ISSUES" "$RATIO" "$STATUS"
    fi
    
    # Sleep to avoid rate limiting (be nice to GitHub)
    sleep 0.5
done

# End output
if [ "$OUTPUT_FORMAT" == "json" ]; then
    echo ""
    echo "  ],"
    echo "  \"closed_source_note\": \"Ledger, NGRAVE, Ellipal, SafePal, SecuX, Tangem, BC Vault, GridPlus have no public firmware repos\""
    echo "}"
elif [ "$OUTPUT_FORMAT" == "markdown" ]; then
    echo ""
    echo "**Legend:** ✅ Active (≤30 days) | ⚠️ Slow (31-120 days) | ❌ Inactive (>120 days)"
    echo ""
    echo "**Closed Source (no public firmware repos):** Ledger, NGRAVE, Ellipal, SafePal, SecuX, Tangem, BC Vault, GridPlus"
else
    echo ""
    echo "Legend: ✅ Active (≤30 days) | ⚠️ Slow (31-120 days) | ❌ Inactive (>120 days)"
    echo ""
    echo "Note: Ledger, NGRAVE, Ellipal, SafePal, SecuX, Tangem, BC Vault, GridPlus have no public firmware repos"
fi

echo "" >&2
echo "Done! Processed ${#REPOS[@]} repositories." >&2
