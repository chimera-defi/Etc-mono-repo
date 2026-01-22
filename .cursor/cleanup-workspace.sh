#!/bin/bash
# Workspace Cleanup Script
# Identifies and optionally removes temporary and old working files

set -e

echo "🧹 Workspace Cleanup"
echo "===================="
echo ""

# Colors
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

DRY_RUN=true
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --execute)
      DRY_RUN=false
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --help)
      cat << 'EOF'
Workspace Cleanup Script

Usage:
  ./cleanup-workspace.sh           # Dry run (shows what would be deleted)
  ./cleanup-workspace.sh --execute # Actually delete files
  ./cleanup-workspace.sh --force   # Delete without confirmation

Categories:
  - Temporary benchmark files (old versions, superseded)
  - Session logs and monitoring data
  - Build artifacts and caches
  - IDE temporary files

Files kept:
  - Production skills (.claude/skills/)
  - Latest documentation (.cursor/*-v2.md, README.md)
  - Latest benchmarks (benchmark-real-tokens.sh)
  - Core tools (token-monitor.sh, test-*.sh)
EOF
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}DRY RUN MODE${NC} - No files will be deleted"
  echo "Run with --execute to actually delete files"
  echo ""
fi

# Track what we find
FOUND_FILES=()
FOUND_DIRS=()

echo "🔍 Scanning for temporary and old files..."
echo ""

# Category 1: Superseded documentation versions
echo -e "${BLUE}Category: Superseded Documentation${NC}"
echo "-----------------------------------"

if [ -f ".cursor/token-reduction-skill.md" ]; then
  echo "  ⚠️  .cursor/token-reduction-skill.md (v1.0 - superseded by v2.0)"
  FOUND_FILES+=(".cursor/token-reduction-skill.md")
fi

# Category 2: Old benchmark scripts (keep only the essential ones)
echo ""
echo -e "${BLUE}Category: Old Benchmark Scripts${NC}"
echo "--------------------------------"

# List of temporary/old benchmark files to potentially remove
OLD_BENCHMARKS=(
  ".cursor/benchmark-token-reduction.sh"
  ".cursor/benchmark-conversation-overhead.sh"
)

for file in "${OLD_BENCHMARKS[@]}"; do
  if [ -f "$file" ]; then
    echo "  ⚠️  $file (older benchmark, consolidated in benchmark-real-tokens.sh)"
    FOUND_FILES+=("$file")
  fi
done

# Category 3: Session logs and monitoring data
echo ""
echo -e "${BLUE}Category: Session Logs${NC}"
echo "-----------------------"

if [ -f "$HOME/.cursor_token_monitor.log" ]; then
  echo "  ⚠️  ~/.cursor_token_monitor.log (old session data)"
  FOUND_FILES+=("$HOME/.cursor_token_monitor.log")
fi

# Category 4: Temporary build artifacts
echo ""
echo -e "${BLUE}Category: Build Artifacts${NC}"
echo "-------------------------"

TEMP_PATTERNS=(
  "*.log"
  "*.tmp"
  ".DS_Store"
  "Thumbs.db"
)

for pattern in "${TEMP_PATTERNS[@]}"; do
  # Find files matching pattern (exclude node_modules, .git)
  while IFS= read -r -d '' file; do
    echo "  ⚠️  $file (temporary file)"
    FOUND_FILES+=("$file")
  done < <(find . -type f -name "$pattern" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -print0 2>/dev/null)
done

# Summary
echo ""
echo "========================================="
echo "📊 Cleanup Summary"
echo "========================================="

if [ ${#FOUND_FILES[@]} -eq 0 ]; then
  echo -e "${GREEN}✓ No temporary files found - workspace is clean!${NC}"
  exit 0
fi

echo "Found ${#FOUND_FILES[@]} files to clean up:"
echo ""

# Calculate total size
TOTAL_SIZE=0
for file in "${FOUND_FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(du -h "$file" | cut -f1)
    BYTES=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    TOTAL_SIZE=$((TOTAL_SIZE + BYTES))
    echo "  - $file ($SIZE)"
  fi
done

TOTAL_SIZE_HR=$(numfmt --to=iec-i --suffix=B $TOTAL_SIZE 2>/dev/null || echo "$TOTAL_SIZE bytes")
echo ""
echo "Total size: $TOTAL_SIZE_HR"
echo ""

# Execute deletion if requested
if [ "$DRY_RUN" = false ]; then
  if [ "$FORCE" = false ]; then
    echo -e "${RED}⚠️  WARNING: This will permanently delete the files listed above!${NC}"
    echo ""
    read -p "Continue with deletion? (yes/no): " CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
      echo "Cleanup cancelled."
      exit 0
    fi
  fi

  echo ""
  echo "🗑️  Deleting files..."
  echo ""

  DELETED=0
  FAILED=0

  for file in "${FOUND_FILES[@]}"; do
    if [ -f "$file" ]; then
      if rm "$file" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} Deleted: $file"
        DELETED=$((DELETED + 1))
      else
        echo -e "  ${RED}✗${NC} Failed: $file"
        FAILED=$((FAILED + 1))
      fi
    fi
  done

  echo ""
  echo "========================================="
  echo "Results:"
  echo "  Deleted: $DELETED files"
  echo "  Failed: $FAILED files"
  echo "  Freed: $TOTAL_SIZE_HR"
  echo ""
  echo -e "${GREEN}✓ Cleanup complete!${NC}"
else
  echo "To execute cleanup, run:"
  echo "  .cursor/cleanup-workspace.sh --execute"
fi

echo ""
echo "Files kept (production):"
echo "  ✓ .claude/skills/token-reduce/ (slash command skill)"
echo "  ✓ .cursor/token-reduction-skill-v2.md (latest guide)"
echo "  ✓ .cursor/benchmark-real-tokens.sh (tiktoken benchmarks)"
echo "  ✓ .cursor/token-monitor.sh (session tracking)"
echo "  ✓ .cursor/test-token-reduction.sh (validation)"
echo "  ✓ .cursor/BENCHMARK_RESULTS.md (empirical data)"
echo "  ✓ .cursor/README.md (documentation)"
echo ""
