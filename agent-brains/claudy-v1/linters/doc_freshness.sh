#!/bin/bash
# Check that docs/ files are up to date
# Fails if any file not updated in 30 days

set -e

DOCS_DIR="${1:-.}/docs"
THRESHOLD_DAYS=30
TODAY=$(date +%s)

echo "📋 Checking docs/ freshness..."

find "$DOCS_DIR" -name "*.md" | while read -r file; do
    LAST_MODIFIED=$(stat -f%m "$file" 2>/dev/null || stat -c%Y "$file" 2>/dev/null)
    DAYS_OLD=$(( ($TODAY - $LAST_MODIFIED) / 86400 ))
    
    if [ "$DAYS_OLD" -gt "$THRESHOLD_DAYS" ]; then
        echo "⚠️  STALE: $file ($DAYS_OLD days old)"
        exit 1
    else
        echo "✅ Fresh: $file ($DAYS_OLD days old)"
    fi
done

echo "✅ All docs fresh!"
