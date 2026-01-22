---
name: token-reduce
description: |
  Analyze files, directories, or conversations for token optimization opportunities.
  Reports baseline usage, identifies waste patterns, and recommends specific improvements.
  Use when: approaching context limits, high API costs, analyzing large codebases,
  or reviewing token usage patterns. Triggers: tokens, optimize, efficiency, costs, budget.
  NOTE: Always-on behavior enforced via .cursorrules and hooks, not this skill.
author: Claude Code
version: 3.0.0
argument-hint: [file-or-directory]
disable-model-invocation: false
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Task
---

# Token Reduction Skill

**Purpose:** Analyze and report token optimization opportunities (not enforce always-on behavior).

## Architecture: How Token Efficiency Works

```
┌─────────────────────────────────────────────────────────┐
│  ALWAYS-ON (Automatic - no invocation needed)           │
│  ├── .cursorrules         → Behavior rules              │
│  ├── .claude/settings.json → Enforcement hooks          │
│  │   ├── user-prompt-submit → Knowledge graph reminder  │
│  │   ├── PreToolUse (Read)  → Targeted read reminder    │
│  │   └── Stop               → Session summary           │
│  └── CLAUDE.md             → System prompt rules        │
├─────────────────────────────────────────────────────────┤
│  ON-DEMAND (This skill - invoke for analysis)           │
│  └── /token-reduce [target] → Analyze & report          │
└─────────────────────────────────────────────────────────┘
```

## 🎯 What This Skill Does

When invoked with `/token-reduce [target]`, I will:

1. **Analyze** token usage patterns in `$ARGUMENTS` (file/directory/conversation)
2. **Identify** optimization opportunities with specific line numbers
3. **Measure** current token consumption using tiktoken
4. **Report** findings with before/after estimates
5. **Recommend** specific improvements ranked by impact

## 📊 Benchmarked Strategies (Priority Order)

**I apply optimizations in order of impact:**

| Strategy | Savings | When to Apply |
|----------|---------|---------------|
| **Concise communication** | **89-91%** | Every response |
| **Knowledge graph** | **76-84%** | Multi-session research |
| **Targeted file reads** | **33-44%** | Large files |
| **Parallel tool calls** | **20%** | Multi-step tasks |
| **Sub-agents (Task)** | **15-30%** | Complex analysis |
| **MCP CLI bulk ops** | **1-10%** | 10+ files |

## 🔧 How to Use

**Manual invocation:**
```
/token-reduce src/components/App.tsx    # Analyze specific file
/token-reduce wallets/frontend          # Analyze directory
/token-reduce                           # Analyze conversation
```

**Auto-invocation:** Mention "tokens", "efficiency", "optimize context", or "reduce costs"

## 📚 Complete Reference Guides

**Core documentation available in `.cursor/`:**

- **`TOKEN_REDUCTION.md`** - Consolidated optimization guide
- **`BENCHMARK_RESULTS.md`** - Empirical validation data
- **`benchmark-real-tokens.sh`** - Real token counting with tiktoken
- **`token-monitor.sh`** - Session tracking and monitoring

## ⚡ Quick Optimization Patterns

**When I analyze your code/conversation, I apply:**

### 1. Concise Communication (91% savings)

❌ **Remove:**
- "I understand you'd like me to..."
- "Let me go ahead and..."
- "Thank you for your patience..."
- "After carefully reviewing..."

✅ **Use:**
- `[uses tool]`
- Direct answers
- "Bug on line 47:"
- "Fixed."

### 2. Targeted File Reads (44% savings)

❌ **Avoid:**
```bash
cat entire_file.ts  # 5,000 tokens
```

✅ **Use:**
```bash
head -50 entire_file.ts  # 2,500 tokens
sed -n '100,150p' file.ts  # Specific sections
```

### 3. Knowledge Graph (84% multi-session)

❌ **Avoid:**
- Re-researching same topics every session

✅ **Use:**
```bash
# Query first
mcp-cli memory/search_nodes '{"query": "wallet scoring"}'

# Store findings
mcp-cli memory/create_entities '{"entities": [...]}'
```

### 4. Parallel Tool Calls (20% savings)

❌ **Avoid:** Sequential turns
```
Turn 1: Search for files
Turn 2: Read files
Turn 3: Analyze
```

✅ **Use:** Single turn
```
[Glob + Read + Analyze in parallel]
```

## 🎯 Optimization Process

**When you invoke this skill, I follow this process:**

1. **Baseline Measurement**
   - Count current tokens in target
   - Identify optimization opportunities
   - Prioritize by impact

2. **Apply High-Impact Strategies**
   - Start with conciseness (91% potential)
   - Check knowledge graph for duplicates (84% potential)
   - Use targeted reads for large files (44% potential)

3. **Measure Results**
   - Use tiktoken for real token counts
   - Compare baseline vs optimized
   - Calculate percentage savings

4. **Report Findings**
   ```
   Baseline: 4,500 tokens
   Optimized: 2,100 tokens
   Savings: 53% (2,400 tokens)

   Applied:
   - Concise responses: 1,800 tokens saved
   - Targeted reads: 600 tokens saved
   ```

5. **Provide Recommendations**
   - Suggest monitoring with `token-monitor.sh`
   - Identify patterns for future optimization
   - Store findings in knowledge graph

## 📈 Real-World Impact

**Benchmarked on actual usage:**

- **Simple tasks** (1-2 files): 25% savings (~250 tokens)
- **Complex tasks** (5+ files): 37% savings (~1,500 tokens)
- **Multi-session** (with knowledge graph): 73% savings (~22,000 tokens)

## 🔍 Anti-Patterns I'll Flag

**I'll identify these token-wasting patterns:**

- 🚫 Restating user requests
- 🚫 Apologizing for being concise
- 🚫 Narrating tool usage
- 🚫 Explaining the obvious
- 🚫 Asking permission for standard actions
- 🚫 Reading entire files when specific sections needed
- 🚫 Re-researching stored knowledge

## 📊 Monitoring & Validation

**After optimization, I recommend:**

```bash
# Track savings during session
.cursor/token-monitor.sh init
.cursor/token-monitor.sh saved "Concise response" 150
.cursor/token-monitor.sh summary

# Validate with benchmarks
.cursor/benchmark-real-tokens.sh

# Read detailed analysis
cat .cursor/BENCHMARK_RESULTS.md
```

## 🎓 When to Use This Skill

**Invoke when:**
- ✅ Approaching context limits
- ✅ High API costs
- ✅ Repeated research across sessions
- ✅ Large file operations
- ✅ Multi-file analysis

**Skip when:**
- ❌ User requests detailed explanations
- ❌ Task requires comprehensive analysis
- ❌ Token budget is abundant (>150K remaining)
- ❌ Debugging complex issues (clarity > conciseness)

## 📖 Example Usage

**User:** `/token-reduce wallets/frontend/src`

**I will:**
1. Analyze token usage in all frontend files
2. Identify verbose patterns, redundant reads, missing knowledge graph entries
3. Apply optimizations and measure savings
4. Report: "Baseline: 8,500 tokens → Optimized: 5,200 tokens (39% savings)"
5. Provide specific recommendations for sustained efficiency

## 🔗 Integration with MCP CLI

**This skill leverages MCP CLI for knowledge management:**

```bash
# Before research
mcp-cli memory/search_nodes '{"query": "topic"}'

# Store findings
mcp-cli memory/create_entities '{"entities": [{...}]}'

# Bulk file operations
mcp-cli filesystem/read_multiple_files '{"paths": [...]}'
```

**MCP CLI provides ergonomic benefits and structured data, with modest token savings that scale with file count.**

## 💡 Key Principle

**Token reduction comes from HOW you communicate, not WHICH tools you use.**

Focus on:
1. **Concise communication** (biggest win)
2. **Knowledge reuse** (compounds over time)
3. **Targeted operations** (read only what's needed)
4. **Parallel execution** (reduce conversation turns)

---

*Version: 2.0 | Benchmarked with tiktoken | Empirically validated | See `.cursor/` for complete guides*
