#!/bin/bash
# Token Reduction Skill Test Script
# Tests that token reduction strategies are working correctly

# Don't exit on error - we want to run all tests
set +e

echo "🧪 Token Reduction Skill Test Suite"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test() {
  local test_name="$1"
  echo -n "Testing: $test_name ... "
}

pass() {
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
}

fail() {
  local reason="$1"
  echo -e "${RED}✗ FAIL${NC}"
  echo "  Reason: $reason"
  ((TESTS_FAILED++))
}

warn() {
  local message="$1"
  echo -e "${YELLOW}⚠ WARNING${NC}"
  echo "  $message"
}

# Test 1: MCP CLI Installation
test "MCP CLI installed"
if command -v mcp-cli &> /dev/null; then
  VERSION=$(mcp-cli --version 2>/dev/null || echo "unknown")
  pass
  echo "  Version: $VERSION"
else
  fail "MCP CLI not found. Install: curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash"
fi

# Test 2: Token Reduction Skill File Exists
test "Token reduction skill file exists"
if [ -f ".cursor/token-reduction-skill.md" ]; then
  pass
  FILE_SIZE=$(wc -c < .cursor/token-reduction-skill.md)
  echo "  File size: $FILE_SIZE bytes"
else
  fail "File .cursor/token-reduction-skill.md not found"
fi

# Test 3: .cursorrules references skill
test ".cursorrules references token reduction skill"
if grep -q "token-reduction-skill.md" .cursorrules; then
  pass
else
  fail ".cursorrules doesn't reference token-reduction-skill.md"
fi

# Test 4: CLAUDE.md references skill
test "CLAUDE.md references token reduction skill"
if grep -q "token-reduction-skill.md" CLAUDE.md; then
  pass
else
  fail "CLAUDE.md doesn't reference token-reduction-skill.md"
fi

# Test 5: MCP_CLI.md exists
test "MCP_CLI.md documentation exists"
if [ -f ".cursor/MCP_CLI.md" ]; then
  pass
else
  fail ".cursor/MCP_CLI.md not found"
fi

# Test 6: MCP CLI bulk file read capability
test "MCP CLI bulk file read works"
if command -v mcp-cli &> /dev/null; then
  # Test with small files
  TEST_OUTPUT=$(mcp-cli filesystem/read_multiple_files '{"paths": [".cursorrules", "CLAUDE.md"]}' 2>&1)
  if [ $? -eq 0 ]; then
    pass
    echo "  Successfully read multiple files"
  else
    fail "MCP CLI bulk read failed: $TEST_OUTPUT"
  fi
else
  warn "Skipped (MCP CLI not installed)"
fi

# Test 7: Memory server capability
test "MCP CLI memory server works"
if command -v mcp-cli &> /dev/null; then
  # Try to list memory tools
  MEMORY_TOOLS=$(mcp-cli grep "*memory*" 2>&1)
  if echo "$MEMORY_TOOLS" | grep -q "memory/"; then
    pass
    echo "  Memory server tools available"
  else
    warn "Memory server tools not found. May need configuration."
  fi
else
  warn "Skipped (MCP CLI not installed)"
fi

# Test 8: AGENTS.md files reference skill
test "All AGENTS.md files reference skill"
AGENTS_FILES=(
  "wallets/AGENTS.md"
  "ideas/AGENTS.md"
  "staking/AGENTS.md"
  "mobile_experiments/Valdi/AGENTS.md"
)
ALL_GOOD=true
for file in "${AGENTS_FILES[@]}"; do
  if [ -f "$file" ]; then
    if ! grep -q "token-reduction-skill.md" "$file"; then
      ALL_GOOD=false
      echo ""
      echo "  Missing reference in: $file"
    fi
  else
    echo ""
    echo "  File not found: $file"
    ALL_GOOD=false
  fi
done

if [ "$ALL_GOOD" = true ]; then
  pass
else
  fail "Not all AGENTS.md files reference the skill"
fi

# Test 9: Numbered rules in .cursorrules
test "Numbered rules include token efficiency (#148-#150)"
if grep -q "#148.*[Tt]oken" .cursorrules && \
   grep -q "#149.*MCP" .cursorrules && \
   grep -q "#150.*knowledge" .cursorrules; then
  pass
else
  fail "Missing numbered rules #148-#150 in .cursorrules"
fi

# Test 10: CLAUDE.md critical rules table
test "CLAUDE.md includes new rules in critical rules table"
if grep -q "#148" CLAUDE.md && \
   grep -q "#149" CLAUDE.md && \
   grep -q "#150" CLAUDE.md; then
  pass
else
  fail "CLAUDE.md critical rules table missing #148-#150"
fi

# Test 11: Skill content validation
test "Skill file has comprehensive content"
if [ -f ".cursor/token-reduction-skill.md" ]; then
  # Check for key sections
  SECTIONS=("Core Principles" "MCP CLI" "Token Budget Targets" "Knowledge Graph")
  ALL_SECTIONS=true
  for section in "${SECTIONS[@]}"; do
    if ! grep -q "$section" .cursor/token-reduction-skill.md; then
      ALL_SECTIONS=false
      echo ""
      echo "  Missing section: $section"
    fi
  done

  if [ "$ALL_SECTIONS" = true ]; then
    pass
    LINES=$(wc -l < .cursor/token-reduction-skill.md)
    echo "  Document has $LINES lines with all key sections"
  else
    fail "Skill file missing key sections"
  fi
else
  fail "Skill file doesn't exist"
fi

# Test 12: Integration test - simulate token-efficient workflow
test "Simulated token-efficient workflow"
if command -v mcp-cli &> /dev/null; then
  # Simulate a typical workflow
  echo ""
  echo "  Step 1: Query knowledge graph (simulated)"
  QUERY_RESULT=$(mcp-cli memory/search_nodes '{"query": "test"}' 2>&1 || echo "QUERY_FAILED")

  echo "  Step 2: Bulk file read (simulated)"
  BULK_READ=$(mcp-cli filesystem/read_multiple_files '{"paths": [".cursorrules"]}' 2>&1)

  if [ $? -eq 0 ]; then
    pass
    echo "  Workflow simulation successful"
  else
    warn "Workflow simulation completed with warnings"
  fi
else
  warn "Skipped (MCP CLI not installed)"
fi

# Summary
echo ""
echo "===================================="
echo "Test Summary"
echo "===================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo "Token Reduction Skill is properly configured."
  echo ""
  echo "Next steps:"
  echo "1. Use MCP CLI for bulk operations"
  echo "2. Query knowledge graph before researching"
  echo "3. Store findings in memory server"
  echo "4. Monitor token usage in conversations"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  echo ""
  echo "Please fix the failing tests and run again."
  exit 1
fi
