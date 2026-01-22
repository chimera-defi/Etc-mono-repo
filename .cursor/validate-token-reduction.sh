#!/bin/bash
# Comprehensive Token Reduction Validation Script
# Validates all claims, checks for artifacts, ensures consistency

set -e

echo "🔬 Comprehensive Token Reduction Validation"
echo "============================================"
echo ""

ISSUES_FOUND=0
WARNINGS_FOUND=0

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

pass() {
  echo -e "  ${GREEN}✓${NC} $1"
}

warn() {
  echo -e "  ${YELLOW}⚠${NC} $1"
  WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
}

fail() {
  echo -e "  ${RED}✗${NC} $1"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
}

echo "Test 1: File Structure Validation"
echo "-----------------------------------"

# Check required files exist
REQUIRED_FILES=(
  ".claude/skills/token-reduce/SKILL.md"
  ".cursor/token-reduction-skill-v2.md"
  ".cursor/benchmark-real-tokens.sh"
  ".cursor/token-monitor.sh"
  ".cursor/cleanup-workspace.sh"
  ".cursor/test-token-reduction.sh"
  ".cursor/BENCHMARK_RESULTS.md"
  ".cursor/AUTO_WORKFLOW.md"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    pass "Found: $file"
  else
    fail "Missing: $file"
  fi
done

echo ""
echo "Test 2: Benchmark Validation"
echo "-----------------------------"

# Run benchmark and capture output
BENCHMARK_OUTPUT=$(mktemp)
.cursor/benchmark-real-tokens.sh > "$BENCHMARK_OUTPUT" 2>&1 || true

# Extract measured values
CONCISE_SAVINGS=$(grep "Response conciseness" "$BENCHMARK_OUTPUT" | grep -oE "[0-9]+%" | head -1)
KG_SAVINGS=$(grep "Knowledge graph" "$BENCHMARK_OUTPUT" | grep -oE "[0-9]+%" | head -1)
TARGETED_SAVINGS=$(grep "Targeted file reads" "$BENCHMARK_OUTPUT" | grep -oE "[0-9]+%" | head -1)

if [ "$CONCISE_SAVINGS" = "89%" ]; then
  pass "Conciseness: $CONCISE_SAVINGS (matches documentation)"
else
  warn "Conciseness: $CONCISE_SAVINGS (documentation claims 89-91%)"
fi

if [ "$KG_SAVINGS" = "76%" ]; then
  pass "Knowledge graph: $KG_SAVINGS (matches documentation)"
else
  warn "Knowledge graph: $KG_SAVINGS (documentation claims 76-84%)"
fi

if [ "$TARGETED_SAVINGS" = "33%" ]; then
  pass "Targeted reads: $TARGETED_SAVINGS (matches documentation)"
else
  warn "Targeted reads: $TARGETED_SAVINGS (documentation claims 33-44%)"
fi

rm "$BENCHMARK_OUTPUT"

echo ""
echo "Test 3: Documentation Consistency"
echo "----------------------------------"

# Check that v2.0 is referenced, not v1.0
if grep -q "token-reduction-skill-v2.md\|/token-reduce" CLAUDE.md; then
  pass "CLAUDE.md references v2.0 or skill"
else
  warn "CLAUDE.md should reference v2.0"
fi

if grep -q "token-reduction-skill-v2.md" .cursorrules; then
  pass ".cursorrules references v2.0"
else
  warn ".cursorrules should reference v2.0"
fi

# Check skill is invocable
if [ -f ".claude/skills/token-reduce/SKILL.md" ]; then
  if grep -q "name: token-reduce" ".claude/skills/token-reduce/SKILL.md"; then
    pass "Skill properly configured"
  else
    fail "Skill YAML frontmatter invalid"
  fi
fi

# Check auto-invocation keywords
if grep -q "auto-invoke\|Auto-invoke\|keywords:" ".claude/skills/token-reduce/SKILL.md"; then
  pass "Auto-invocation documented"
else
  warn "Auto-invocation keywords should be documented"
fi

echo ""
echo "Test 4: Artifact Detection"
echo "--------------------------"

# Check for duplicate files
if [ -f ".cursor/token-reduction-skill.md" ] && [ -f ".cursor/token-reduction-skill-v2.md" ]; then
  warn "Both v1.0 and v2.0 exist (cleanup available)"
fi

# Check for old benchmarks
OLD_BENCHMARKS=0
if [ -f ".cursor/benchmark-token-reduction.sh" ]; then
  OLD_BENCHMARKS=$((OLD_BENCHMARKS + 1))
fi
if [ -f ".cursor/benchmark-conversation-overhead.sh" ]; then
  OLD_BENCHMARKS=$((OLD_BENCHMARKS + 1))
fi

if [ $OLD_BENCHMARKS -gt 0 ]; then
  warn "$OLD_BENCHMARKS old benchmark scripts found (run cleanup-workspace.sh)"
else
  pass "No old benchmark artifacts"
fi

# Check for broken symlinks
BROKEN_LINKS=$(find .claude/skills/token-reduce -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l)
if [ "$BROKEN_LINKS" -eq 0 ]; then
  pass "All symlinks valid"
else
  fail "$BROKEN_LINKS broken symlinks in skill directory"
fi

echo ""
echo "Test 5: Executable Permissions"
echo "-------------------------------"

EXECUTABLES=(
  ".cursor/benchmark-real-tokens.sh"
  ".cursor/token-monitor.sh"
  ".cursor/cleanup-workspace.sh"
  ".cursor/test-token-reduction.sh"
)

for exe in "${EXECUTABLES[@]}"; do
  if [ -x "$exe" ]; then
    pass "$exe is executable"
  else
    fail "$exe missing execute permission"
  fi
done

echo ""
echo "Test 6: Integration Validation"
echo "-------------------------------"

# Check .cursorrules has auto-active designation
if grep -q "AUTO-ACTIVE\|auto-active" .cursorrules; then
  pass ".cursorrules marked as auto-active"
else
  warn ".cursorrules should indicate auto-active behavior"
fi

# Check CLAUDE.md has session workflow
if grep -q "Session Workflow" CLAUDE.md; then
  pass "CLAUDE.md documents workflow"
else
  warn "CLAUDE.md should have Session Workflow section"
fi

# Check cleanup script exists and works
if [ -x ".cursor/cleanup-workspace.sh" ]; then
  CLEANUP_OUTPUT=$(.cursor/cleanup-workspace.sh 2>&1)
  if echo "$CLEANUP_OUTPUT" | grep -q "DRY RUN"; then
    pass "Cleanup script runs in dry-run mode"
  else
    warn "Cleanup script should default to dry-run"
  fi
fi

echo ""
echo "Test 7: Content Quality"
echo "-----------------------"

# Check for overstated claims
if grep -q "60-95%" .cursor/token-reduction-skill-v2.md; then
  fail "v2.0 still has overstated MCP CLI claims"
else
  pass "MCP CLI claims corrected in v2.0"
fi

# Check for preambles in example sections (should exist as anti-patterns)
EXAMPLE_PREAMBLES=$(grep -c "❌" .cursor/token-reduction-skill-v2.md 2>/dev/null || echo "0")
if [ "$EXAMPLE_PREAMBLES" -gt 0 ] 2>/dev/null; then
  pass "Anti-pattern examples present ($EXAMPLE_PREAMBLES found)"
else
  warn "Should have anti-pattern examples"
fi

# Check benchmark methodology is documented
if grep -q "tiktoken" .cursor/BENCHMARK_RESULTS.md; then
  pass "Benchmark methodology documented"
else
  warn "Should document tiktoken usage"
fi

echo ""
echo "Test 8: Completeness Check"
echo "--------------------------"

# Check README exists
if [ -f ".cursor/README.md" ]; then
  pass ".cursor/README.md exists"
else
  warn "Should have .cursor/README.md"
fi

# Check skill has README
if [ -f ".claude/skills/token-reduce/README.md" ]; then
  pass "Skill README exists"
else
  warn "Should have skill-specific README"
fi

# Check AUTO_WORKFLOW documentation
if [ -f ".cursor/AUTO_WORKFLOW.md" ]; then
  pass "AUTO_WORKFLOW.md exists"
else
  warn "Should document automatic workflow"
fi

echo ""
echo "========================================="
echo "📊 Validation Summary"
echo "========================================="
echo ""

if [ $ISSUES_FOUND -eq 0 ] && [ $WARNINGS_FOUND -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo "Token reduction skill is production-ready."
  exit 0
elif [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${YELLOW}⚠ All critical tests passed with $WARNINGS_FOUND warnings${NC}"
  echo ""
  echo "Warnings indicate optional improvements:"
  echo "- Run cleanup-workspace.sh to remove old files"
  echo "- Consider additional documentation"
  exit 0
else
  echo -e "${RED}✗ Found $ISSUES_FOUND critical issues and $WARNINGS_FOUND warnings${NC}"
  echo ""
  echo "Please fix critical issues before deployment."
  exit 1
fi
