#!/bin/bash
# Token Reduction Benchmark Script
# Measures actual token/character savings from token reduction strategies

set -e

echo "📊 Token Reduction Benchmark"
echo "============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Temp files for measuring output
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Utility to measure output size and estimate tokens
measure() {
  local label="$1"
  local command="$2"
  # Sanitize label for filename (replace spaces and slashes)
  local safe_label="${label// /_}"
  safe_label="${safe_label//\//_}"
  local output_file="$TEMP_DIR/${safe_label}.txt"

  echo -n "  Measuring: $label ... "

  # Run command and capture output
  eval "$command" > "$output_file" 2>&1 || true

  local bytes=$(wc -c < "$output_file")
  local chars=$(wc -m < "$output_file")
  local lines=$(wc -l < "$output_file")

  # Estimate tokens (rough approximation: ~4 chars per token for English text)
  local estimated_tokens=$((chars / 4))

  echo -e "${GREEN}✓${NC}"
  echo "    Bytes: $bytes | Chars: $chars | Lines: $lines | Est. Tokens: ~$estimated_tokens"

  echo "$bytes $chars $lines $estimated_tokens" > "$output_file.stats"
}

calculate_savings() {
  local baseline_file="$1"
  local optimized_file="$2"
  local metric_index="$3"  # 1=bytes, 2=chars, 3=lines, 4=tokens

  local baseline_val=$(cut -d' ' -f$metric_index "$baseline_file")
  local optimized_val=$(cut -d' ' -f$metric_index "$optimized_file")

  if [ "$baseline_val" -eq 0 ]; then
    echo "0"
    return
  fi

  local savings=$((100 - (optimized_val * 100 / baseline_val)))
  echo "$savings"
}

echo "Test 1: Multiple File Reads"
echo "----------------------------"
echo "Baseline: Reading 3 files separately with cat"
measure "cat .cursorrules" "cat .cursorrules"
measure "cat CLAUDE.md" "cat CLAUDE.md"
measure "cat .cursor/MCP_CLI.md" "cat .cursor/MCP_CLI.md"

# Sum up baseline
baseline_bytes=$(cat "$TEMP_DIR/cat_.cursorrules.txt.stats" "$TEMP_DIR/cat_CLAUDE.md.txt.stats" "$TEMP_DIR/cat_.cursor_MCP_CLI.md.txt.stats" | awk '{s+=$1} END {print s}')
baseline_tokens=$(cat "$TEMP_DIR/cat_.cursorrules.txt.stats" "$TEMP_DIR/cat_CLAUDE.md.txt.stats" "$TEMP_DIR/cat_.cursor_MCP_CLI.md.txt.stats" | awk '{s+=$4} END {print s}')

echo ""
echo "Optimized: MCP CLI bulk read"
measure "mcp-cli bulk read" 'mcp-cli filesystem/read_multiple_files '"'"'{"paths": [".cursorrules", "CLAUDE.md", ".cursor/MCP_CLI.md"]}'"'"''

optimized_bytes=$(cut -d' ' -f1 "$TEMP_DIR/mcp-cli_bulk_read.txt.stats")
optimized_tokens=$(cut -d' ' -f4 "$TEMP_DIR/mcp-cli_bulk_read.txt.stats")

echo ""
echo -e "${BLUE}Results:${NC}"
echo "  Baseline: $baseline_bytes bytes (~$baseline_tokens tokens)"
echo "  Optimized: $optimized_bytes bytes (~$optimized_tokens tokens)"
if [ "$baseline_bytes" -gt 0 ]; then
  savings=$((100 - (optimized_bytes * 100 / baseline_bytes)))
  echo -e "  ${GREEN}Savings: ${savings}%${NC}"
else
  echo "  Savings: Unable to calculate"
fi

echo ""
echo ""
echo "Test 2: Full File vs Targeted Read"
echo "-----------------------------------"

# Use a larger file for this test
if [ -f "wallets/SOFTWARE_WALLETS.md" ]; then
  TEST_FILE="wallets/SOFTWARE_WALLETS.md"
elif [ -f "README.md" ]; then
  TEST_FILE="README.md"
else
  TEST_FILE=".cursorrules"
fi

echo "Using file: $TEST_FILE"
echo ""
echo "Baseline: Read entire file"
measure "cat full file" "cat $TEST_FILE"
baseline_full=$(cut -d' ' -f1 "$TEMP_DIR/cat_full_file.txt.stats")
baseline_full_tokens=$(cut -d' ' -f4 "$TEMP_DIR/cat_full_file.txt.stats")

echo ""
echo "Optimized: Read first 50 lines only"
measure "head 50 lines" "head -n 50 $TEST_FILE"
optimized_head=$(cut -d' ' -f1 "$TEMP_DIR/head_50_lines.txt.stats")
optimized_head_tokens=$(cut -d' ' -f4 "$TEMP_DIR/head_50_lines.txt.stats")

echo ""
echo -e "${BLUE}Results:${NC}"
echo "  Full file: $baseline_full bytes (~$baseline_full_tokens tokens)"
echo "  First 50 lines: $optimized_head bytes (~$optimized_head_tokens tokens)"
if [ "$baseline_full" -gt 0 ]; then
  savings=$((100 - (optimized_head * 100 / baseline_full)))
  echo -e "  ${GREEN}Savings: ${savings}%${NC}"
fi

echo ""
echo ""
echo "Test 3: Directory Exploration"
echo "------------------------------"
echo "Baseline: Recursive ls with file contents preview"
measure "ls -lR wallets" "ls -lR wallets 2>/dev/null | head -200"

baseline_ls=$(cut -d' ' -f1 "$TEMP_DIR/ls_-lR_wallets.txt.stats")
baseline_ls_tokens=$(cut -d' ' -f4 "$TEMP_DIR/ls_-lR_wallets.txt.stats")

echo ""
echo "Optimized: MCP CLI directory tree (structure only)"
measure "mcp-cli tree" 'mcp-cli filesystem/directory_tree '"'"'{"path": "wallets"}'"'"' 2>/dev/null || echo "MCP CLI tree not available"'

optimized_tree=$(cut -d' ' -f1 "$TEMP_DIR/mcp-cli_tree.txt.stats")
optimized_tree_tokens=$(cut -d' ' -f4 "$TEMP_DIR/mcp-cli_tree.txt.stats")

echo ""
echo -e "${BLUE}Results:${NC}"
echo "  Baseline ls -lR: $baseline_ls bytes (~$baseline_ls_tokens tokens)"
echo "  MCP CLI tree: $optimized_tree bytes (~$optimized_tree_tokens tokens)"
if [ "$baseline_ls" -gt 0 ] && [ "$optimized_tree" -gt 0 ]; then
  savings=$((100 - (optimized_tree * 100 / baseline_ls)))
  echo -e "  ${GREEN}Savings: ${savings}%${NC}"
fi

echo ""
echo ""
echo "Test 4: Response Verbosity"
echo "--------------------------"
echo "Measuring character count differences..."

# Simulate verbose vs concise responses
cat > "$TEMP_DIR/verbose.txt" << 'EOF'
I understand you'd like me to check the file for any potential issues. Let me go ahead and do that for you now. I'll use the appropriate tool to examine the contents of the file and see what we're working with. Once I've had a chance to review it, I'll provide you with a comprehensive analysis of what I find.

After reviewing the file, I can see that there appears to be a bug on line 47. The issue is that there's a missing return statement in the function. This is causing the function to not return the expected value, which could lead to undefined behavior in your application.

Would you like me to fix this for you?
EOF

cat > "$TEMP_DIR/concise.txt" << 'EOF'
Bug on line 47 - missing return statement.
EOF

verbose_chars=$(wc -m < "$TEMP_DIR/verbose.txt")
verbose_tokens=$((verbose_chars / 4))
concise_chars=$(wc -m < "$TEMP_DIR/concise.txt")
concise_tokens=$((concise_chars / 4))

echo "  Verbose response: $verbose_chars chars (~$verbose_tokens tokens)"
echo "  Concise response: $concise_chars chars (~$concise_tokens tokens)"
if [ "$verbose_tokens" -gt 0 ]; then
  savings=$((100 - (concise_tokens * 100 / verbose_tokens)))
  echo -e "  ${GREEN}Savings: ${savings}%${NC}"
fi

echo ""
echo ""
echo "Test 5: File Search Pattern"
echo "----------------------------"
echo "Baseline: Multiple individual grep commands"

# Simulate searching for patterns in multiple steps
{
  grep -r "export" wallets --include="*.md" 2>/dev/null | head -20
  grep -r "import" wallets --include="*.md" 2>/dev/null | head -20
  grep -r "function" wallets --include="*.md" 2>/dev/null | head -20
} > "$TEMP_DIR/multiple_greps.txt"

baseline_grep_bytes=$(wc -c < "$TEMP_DIR/multiple_greps.txt")
baseline_grep_tokens=$(($(wc -m < "$TEMP_DIR/multiple_greps.txt") / 4))

echo "  Multiple greps: $baseline_grep_bytes bytes (~$baseline_grep_tokens tokens)"

echo ""
echo "Optimized: Single combined pattern search"
grep -rE "(export|import|function)" wallets --include="*.md" 2>/dev/null | head -60 > "$TEMP_DIR/combined_grep.txt"

optimized_grep_bytes=$(wc -c < "$TEMP_DIR/combined_grep.txt")
optimized_grep_tokens=$(($(wc -m < "$TEMP_DIR/combined_grep.txt") / 4))

echo "  Combined grep: $optimized_grep_bytes bytes (~$optimized_grep_tokens tokens)"
if [ "$baseline_grep_tokens" -gt 0 ]; then
  savings=$((100 - (optimized_grep_tokens * 100 / baseline_grep_tokens)))
  echo -e "  ${GREEN}Savings: ${savings}%${NC}"
fi

echo ""
echo ""
echo "============================="
echo "📊 Benchmark Summary"
echo "============================="
echo ""

# Calculate average savings
total_savings=0
count=0

if [ "$baseline_bytes" -gt 0 ] && [ "$optimized_bytes" -gt 0 ]; then
  test1_savings=$((100 - (optimized_bytes * 100 / baseline_bytes)))
  echo "Test 1 (Multi-file read):   ${test1_savings}% savings"
  total_savings=$((total_savings + test1_savings))
  count=$((count + 1))
fi

if [ "$baseline_full" -gt 0 ] && [ "$optimized_head" -gt 0 ]; then
  test2_savings=$((100 - (optimized_head * 100 / baseline_full)))
  echo "Test 2 (Targeted read):     ${test2_savings}% savings"
  total_savings=$((total_savings + test2_savings))
  count=$((count + 1))
fi

if [ "$baseline_ls" -gt 0 ] && [ "$optimized_tree" -gt 0 ]; then
  test3_savings=$((100 - (optimized_tree * 100 / baseline_ls)))
  echo "Test 3 (Directory tree):    ${test3_savings}% savings"
  total_savings=$((total_savings + test3_savings))
  count=$((count + 1))
fi

if [ "$verbose_tokens" -gt 0 ]; then
  test4_savings=$((100 - (concise_tokens * 100 / verbose_tokens)))
  echo "Test 4 (Response concise):  ${test4_savings}% savings"
  total_savings=$((total_savings + test4_savings))
  count=$((count + 1))
fi

if [ "$baseline_grep_tokens" -gt 0 ]; then
  test5_savings=$((100 - (optimized_grep_tokens * 100 / baseline_grep_tokens)))
  echo "Test 5 (Search patterns):   ${test5_savings}% savings"
  total_savings=$((total_savings + test5_savings))
  count=$((count + 1))
fi

echo ""
if [ "$count" -gt 0 ]; then
  avg_savings=$((total_savings / count))
  echo -e "${GREEN}Average savings across all tests: ${avg_savings}%${NC}"
else
  echo "Unable to calculate average savings"
fi

echo ""
echo "Note: Token estimates based on ~4 chars per token"
echo "Actual token counts may vary based on tokenizer"
echo ""
