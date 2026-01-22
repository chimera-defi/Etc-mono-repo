# Claude Code Configuration & Skills

This directory contains configuration files, skills, and benchmarks for optimizing Claude Code usage.

---

## 📚 Quick Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| **MCP_CLI.md** | MCP CLI integration guide | Bulk file operations |
| **TOKEN_REDUCTION.md** | Token optimization (recommended) | Every session |
| **token-reduction-skill.md** | Token optimization v1.0 | Legacy reference |
| **BENCHMARK_RESULTS.md** | Empirical benchmark data | Validate claims |

---

## 🎯 Token Reduction Skills

### Version 2.0 (Recommended)

**File:** `TOKEN_REDUCTION.md`

**Focus:** Impact-driven, evidence-based token optimization

**Key strategies (by impact):**
1. **Concise communication** - 89-91% savings 🔥
2. **Knowledge graph** - 76-84% savings (multi-session) 🔥
3. **Targeted file reads** - 33-44% savings
4. **Parallel tool calls** - 20% savings
5. **MCP CLI** - 1-10% savings (ergonomic benefits)

**What's new:**
- Real token counting with tiktoken
- Before/after examples for every pattern
- Communication style guide with anti-patterns
- Session monitoring framework
- Honest metrics (admitted MCP CLI overstatement)

### Version 1.0 (Legacy)

**File:** `token-reduction-skill.md`

**Status:** Superseded by v2.0 but kept for reference

**Issues addressed in v2:**
- Overstated MCP CLI savings (claimed 60-95%, measured 1-10%)
- Used character estimates instead of token counts
- Lacked concrete communication examples
- No monitoring or measurement framework

---

## 🧪 Benchmarks

### Available Benchmarks

1. **`benchmark-token-reduction.sh`** - Raw output size comparison
   - Compares native tools vs MCP CLI
   - Measures file sizes and character counts
   - Results: Mixed (some strategies add overhead)

2. **`benchmark-conversation-overhead.sh`** - Simulated conversations
   - Models tool call overhead and conversation turns
   - Estimates real-world impact
   - Results: Validates 20-91% savings by strategy

3. **`benchmark-real-tokens.sh`** ⭐ NEW
   - Uses tiktoken for actual token counting
   - Validates all claims empirically
   - Results: Confirms 89% conciseness, 76% knowledge graph, 33% targeted reads

### Run All Benchmarks

```bash
# Real token counts (requires Python + tiktoken)
.cursor/benchmark-real-tokens.sh

# Comprehensive validation
.cursor/validate-token-reduction.sh

# Full analysis
cat .cursor/BENCHMARK_RESULTS.md
```

---

## 📊 Session Monitoring

### Token Monitor

**File:** `token-monitor.sh`

**Purpose:** Track token usage and savings during coding sessions

**Usage:**

```bash
# Start session
.cursor/token-monitor.sh init

# Log successful optimizations
.cursor/token-monitor.sh saved "Concise response" 150 "Skipped preamble"
.cursor/token-monitor.sh saved "Knowledge graph" 500 "Cached wallet criteria"

# Log missed opportunities
.cursor/token-monitor.sh missed "Used verbose explanation" 120

# Check progress
.cursor/token-monitor.sh stats
# Output:
# Tokens saved: 650
# Missed opportunities: 120

# End session with summary
.cursor/token-monitor.sh summary

# Analyze patterns over time
.cursor/token-monitor.sh analyze
```

**Benefits:**
- Real-time feedback on token efficiency
- Quantifies improvement over sessions
- Identifies recurring anti-patterns
- Builds evidence base for refinement

---

## 📖 Documentation

### BENCHMARK_RESULTS.md

Comprehensive analysis of empirical testing:
- Methodology for each benchmark
- Detailed results with token counts
- What works and what doesn't
- Real-world impact analysis
- Honest assessment of claims

**Key findings:**
- Response conciseness: 91% savings ✅
- Knowledge graph: 84% multi-session savings ✅
- Targeted reads: 44% savings ✅
- MCP CLI bulk ops: 1-10% savings (overstated in v1)

---

## 🚀 Getting Started

### First Time Setup

```bash
# 1. Install MCP CLI
curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash

# 2. Read the skill
cat .cursor/TOKEN_REDUCTION.md

# 3. Run validation to verify
.cursor/validate-token-reduction.sh
.cursor/benchmark-real-tokens.sh

# 4. Start monitoring
.cursor/token-monitor.sh init
```

### Daily Usage

**Before starting work:**
```bash
# Initialize session monitoring
.cursor/token-monitor.sh init
```

**During work:**
- Skip preambles ("I'll help you...")
- Skip confirmations ("After reviewing...")
- Query knowledge graph before researching
- Use targeted file reads (head/tail)
- Batch parallel tool calls

**After completing tasks:**
```bash
# Review session
.cursor/token-monitor.sh summary
```

---

## 📈 Real-World Impact

### Simple Task (1-2 files)

**Without skill:** ~1,000 tokens
**With skill:** ~750 tokens
**Savings: 25%**

### Complex Task (5+ files)

**Without skill:** ~4,000 tokens
**With skill:** ~2,500 tokens
**Savings: 37%**

### Multi-Session Work (10 sessions)

**Without skill:** ~30,000 tokens
**With skill:** ~8,000 tokens
**Savings: 73%**

**Key driver:** Knowledge graph prevents duplicate research

---

## 🎓 Best Practices

### Communication Patterns

✅ **DO:**
- `[uses tool]` instead of "Let me use the tool..."
- `Bug on line 47:` instead of "I found an issue..."
- `Fix it?` instead of "Would you like me to fix this?"
- `✓ Complete.` instead of "I've successfully completed..."

❌ **DON'T:**
- Restate user requests
- Apologize for being concise
- Narrate tool usage
- Explain the obvious
- Ask permission for standard actions

### File Operations

✅ **DO:**
- Use `head -50` for large files
- Query knowledge graph before researching
- Batch parallel tool calls in one turn
- Use MCP CLI for 10+ file operations

❌ **DON'T:**
- Read entire files when you need specific sections
- Re-research what's in knowledge graph
- Make sequential tool calls that could be parallel
- Use MCP CLI for 1-3 files (overhead > savings)

---

## 🔬 Validation Methodology

### Token Counting

**v1.0:** Character count ÷ 4 (rough estimate)
**v2.0:** tiktoken (cl100k_base) - OpenAI's tokenizer

**Accuracy:** ±10% vs actual Claude tokens

**Why tiktoken:**
- Open source and deterministic
- Close approximation to Claude's tokenizer
- Repeatable for benchmarking
- Better than character estimation

### Benchmark Types

1. **Unit tests** - Individual strategies in isolation
2. **Integration tests** - Combined strategies in workflows
3. **Conversation simulations** - Realistic usage patterns
4. **Real session tracking** - Actual usage monitoring

---

## 📝 Version History

### v2.0 (2026-01-21)

✅ Real token counting with tiktoken
✅ Impact-focused structure (lead with 91% win)
✅ Concrete before/after examples
✅ Communication style guide
✅ Session monitoring framework
✅ Honest metrics (admitted MCP CLI overstatement)
✅ Anti-patterns section
✅ Practical workflow guidance

### v1.0 (2026-01-21)

- Initial release with estimated savings
- Organized by tool types
- Mixed claims (some overstated)
- Character-based estimation
- Led to honest reassessment → v2.0

---

## 🤝 Contributing

### Reporting Issues

Found a verbose pattern we missed?
```bash
.cursor/token-monitor.sh missed "Pattern description" estimated_tokens
```

### Suggesting Improvements

1. Run benchmarks with your approach
2. Document measured results
3. Submit findings with evidence

### Adding Benchmarks

Follow the pattern:
1. Measure with tiktoken
2. Compare baseline vs optimized
3. Calculate percentage savings
4. Document methodology
5. Provide reproducible script

---

## 📚 Related Documentation

- **Root `.cursorrules`** - Master AI agent rules
- **Root `CLAUDE.md`** - Quick start for Claude Code
- **MCP_CLI.md** - MCP CLI integration guide
- **Project `AGENTS.md`** - Project-specific patterns

---

## 🎯 Quick Wins Checklist

Starting a new session? Focus on:

- [ ] Query knowledge graph before researching
- [ ] Skip preambles in responses
- [ ] Use `[uses tool]` instead of narrating
- [ ] Read specific file sections, not entire files
- [ ] Batch parallel tool calls
- [ ] Track savings with token-monitor.sh

**Estimated impact:** 30-50% savings on typical tasks

---

*Last updated: 2026-01-21 | Maintained by: Claude Code agents | Validated with real benchmarks*
