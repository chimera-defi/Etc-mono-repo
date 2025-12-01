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
#   - Without token: 60 requests/hour
#   - With token: 5000 requests/hour

set -e

# Configuration
REPOS=(
    "MetaMask/metamask-extension"
    "RabbyHub/Rabby"
    "coinbase/coinbase-wallet-sdk"
    "trustwallet/wallet-core"
    "rainbow-me/rainbow"
    "safe-global/safe-wallet-monorepo"
    "AmbireTech/extension"
    "MyEtherWallet/MyEtherWallet"
    "tahowallet/extension"
    "floating/frame"
    "brave/brave-browser"
    "enkryptcom/enKrypt"
    "consenlabs/token-core-monorepo"
    "daimo-eth/daimo"
    "argentlabs/argent-x"
    "block-wallet/extension"
    "wigwamapp/wigwam"
)

WALLET_NAMES=(
    "MetaMask"
    "Rabby"
    "Coinbase"
    "Trust Wallet"
    "Rainbow"
    "Safe"
    "Ambire"
    "MEW"
    "Taho"
    "Frame"
    "Brave"
    "Enkrypt"
    "imToken"
    "Daimo"
    "Argent"
    "Block Wallet"
    "Wigwam"
)

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
    echo "  \"generated\": \"$TODAY\","
    echo "  \"wallets\": ["
elif [ "$OUTPUT_FORMAT" == "markdown" ]; then
    echo "## GitHub Activity Status (Generated: $TODAY)"
    echo ""
    echo "| Wallet | Repository | Last Commit | Days Ago | Status |"
    echo "|--------|------------|-------------|----------|--------|"
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
    
    # Get the default branch commits
    API_URL="https://api.github.com/repos/$REPO/commits?per_page=1"
    
    if [ -n "$GITHUB_TOKEN" ]; then
        RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API_URL" 2>/dev/null)
    else
        RESPONSE=$(curl -s "$API_URL" 2>/dev/null)
    fi
    
    # Check for rate limit or error
    if echo "$RESPONSE" | grep -q "API rate limit exceeded"; then
        echo "Error: GitHub API rate limit exceeded. Set GITHUB_TOKEN." >&2
        exit 1
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
        echo -n "    {\"wallet\": \"$WALLET\", \"repo\": \"$REPO\", \"lastCommit\": \"$LAST_COMMIT_DATE\", \"daysAgo\": $DAYS_AGO, \"status\": \"$STATUS_EMOJI\"}"
    elif [ "$OUTPUT_FORMAT" == "markdown" ]; then
        echo "| **$WALLET** | [$REPO](https://github.com/$REPO) | $LAST_COMMIT_DATE | $DAYS_AGO | $STATUS |"
    else
        printf "%-15s %-40s %-12s %4s days  %s\n" "$WALLET" "$REPO" "$LAST_COMMIT_DATE" "$DAYS_AGO" "$STATUS"
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
echo "Done! Processed ${#REPOS[@]} repositories." >&2
