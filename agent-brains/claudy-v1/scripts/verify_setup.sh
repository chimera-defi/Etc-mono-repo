#!/bin/bash
# Verify that agent system is properly configured
# Run before major operations

set -e

echo "🔍 Verifying agent system setup..."

# Check files exist
FILES=(
    "SOUL.md"
    "USER.md"
    "MEMORY.md"
    "AGENTS.md"
    "IDENTITY.md"
    "HEARTBEAT.md"
    "docs/README.md"
    "docs/PRINCIPLES.md"
    "docs/ARCHITECTURE.md"
    "docs/DOMAIN.md"
    "docs/OPERATIONS.md"
    "docs/MEMORY_MAP.md"
)

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ MISSING: $file"
        exit 1
    fi
    echo "✅ Found: $file"
done

# Check git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized"
    exit 1
fi
echo "✅ Git initialized"

# Check branch (should not be on master unless PR merged)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" = "master" ] || [ "$CURRENT_BRANCH" = "main" ]; then
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ "$UNCOMMITTED" -gt 0 ]; then
        echo "⚠️  WARNING: You're on master with uncommitted changes"
        echo "    Create a feature branch: git checkout -b feat/your-change"
        exit 1
    fi
fi
echo "✅ Git branch OK (currently: $CURRENT_BRANCH)"

# Check memory directory
if [ ! -d "memory" ]; then
    mkdir -p memory
    echo "✅ Created memory/ directory"
else
    echo "✅ memory/ directory exists"
fi

echo ""
echo "🎉 System verified and ready!"
echo ""
echo "Next steps:"
echo "  1. Read SOUL.md"
echo "  2. Read USER.md"
echo "  3. Check today's memory/YYYY-MM-DD.md"
echo "  4. Review docs/ for any changes"
