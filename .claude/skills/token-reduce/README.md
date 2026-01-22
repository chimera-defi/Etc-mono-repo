# Token Reduce Skill - Usage Guide

This skill is invocable via `/token-reduce` in Claude Code CLI.

---

## 🚀 Quick Start

**The skill is already installed!** Just use it:

```bash
# Start Claude Code
claude

# Invoke the skill
/token-reduce src/app.ts
/token-reduce wallets/frontend
/token-reduce
```

**Or let Claude auto-invoke** by mentioning:
- "optimize tokens"
- "reduce context"
- "improve efficiency"
- "lower API costs"

---

## 📖 What It Does

When you invoke `/token-reduce`, I will:

1. **Analyze** current token usage in your code/conversation
2. **Apply** benchmarked optimization strategies (30-90% savings)
3. **Measure** actual token reduction with tiktoken
4. **Report** specific savings with before/after metrics
5. **Recommend** patterns for sustained efficiency

---

## 💡 Example Usage

### Analyze a File

```
/token-reduce src/components/Dashboard.tsx
```

**Output:**
```
Analyzing token usage in Dashboard.tsx...

Baseline: 4,500 tokens

Optimization opportunities:
- Verbose component props: 800 tokens
- Redundant type definitions: 300 tokens
- Inline documentation: 200 tokens

Applied optimizations:
✓ Concise prop naming: -650 tokens
✓ Type aliases: -280 tokens
✓ Extracted docs to comments: -180 tokens

Optimized: 3,390 tokens
Savings: 24% (1,110 tokens)
```

### Analyze a Directory

```
/token-reduce wallets/frontend/src
```

**Output:**
```
Analyzing 47 files in wallets/frontend/src...

Baseline: 18,500 tokens

High-impact optimizations:
- 15 files with verbose imports: 1,200 tokens
- 8 files with redundant comments: 600 tokens
- 5 files reading entire dependencies: 2,400 tokens

Applied:
✓ Targeted imports: -1,100 tokens
✓ Concise comments: -580 tokens
✓ Selective file reads: -2,200 tokens

Optimized: 14,620 tokens
Savings: 21% (3,880 tokens)

Recommendations:
- Store component patterns in knowledge graph
- Use MCP CLI for bulk operations (10+ files)
- Monitor with: .cursor/token-monitor.sh
```

### Analyze Current Conversation

```
/token-reduce
```

**Output:**
```
Analyzing current conversation context...

Baseline: 12,000 tokens

Optimization opportunities:
- 3 preambles in responses: 450 tokens
- 2 files read entirely (could use head): 2,200 tokens
- Knowledge graph query available: 500 tokens

Applied:
✓ Removed preambles: -450 tokens
✓ Targeted file reads: -2,200 tokens
✓ Retrieved from knowledge graph: -500 tokens

Optimized: 8,850 tokens
Savings: 26% (3,150 tokens)

Continue optimizing:
- Query knowledge graph before researching
- Use [uses tool] instead of narrating
- Read specific file sections with head/tail
```

---

## 🎯 Optimization Strategies Applied

The skill applies these in priority order:

| Strategy | Savings | When Applied |
|----------|---------|--------------|
| **Concise communication** | **89-91%** | Every response |
| **Knowledge graph** | **76-84%** | Multi-session work |
| **Targeted file reads** | **33-44%** | Large files |
| **Parallel tool calls** | **20%** | Complex tasks |
| **MCP CLI bulk ops** | **1-10%** | 10+ files |

---

## 📊 Benchmarked Results

All strategies are empirically validated:

- **Response conciseness:** 89% (tiktoken measured)
- **Knowledge graph reuse:** 76% per query, 84% multi-session
- **Targeted reads:** 33% (vs full file reads)
- **Parallel calls:** 20% (vs sequential turns)

See `BENCHMARK_RESULTS.md` for complete methodology.

---

## 🛠️ Available Tools

The skill can use:
- Read, Grep, Glob (for analysis)
- Bash (for benchmarking)
- Edit (for applying optimizations)
- MCP CLI (for bulk operations and knowledge graph)

---

## 📖 Complete Documentation

Symlinked from `.cursor/`:

- **`TOKEN_REDUCTION.md`** - Complete optimization guide
- **`BENCHMARK_RESULTS.md`** - Empirical validation
- **`benchmark-real-tokens.sh`** - Real token counting
- **`token-monitor.sh`** - Session tracking

---

## 🎓 When to Use

**Invoke when:**
- ✅ Approaching context limits (>100K tokens used)
- ✅ High API costs on repeated tasks
- ✅ Working with large files/directories
- ✅ Multi-session work with repeated research
- ✅ Want to measure and track efficiency

**Skip when:**
- ❌ User requests detailed explanations
- ❌ Debugging complex issues (clarity > conciseness)
- ❌ Token budget is abundant (>150K remaining)
- ❌ Task requires comprehensive analysis

---

## 🔧 Advanced Usage

### With Arguments

```bash
/token-reduce wallets/AGENTS.md    # Specific file
/token-reduce src/lib              # Directory
/token-reduce                      # Current context
```

### Auto-Invocation Triggers

Say any of these and the skill auto-loads:
- "optimize tokens"
- "reduce context"
- "improve efficiency"
- "lower costs"
- "approaching token limit"

### Monitoring Mode

Enable tracking during the session:

```bash
# Before using the skill
.cursor/token-monitor.sh init

# Skill will log savings automatically
/token-reduce src/

# Check progress
.cursor/token-monitor.sh stats

# End with summary
.cursor/token-monitor.sh summary
```

---

## 🎯 Expected Savings

**Benchmarked on actual usage:**

- **Simple tasks** (1-2 files): 25% savings (~250 tokens)
- **Complex tasks** (5+ files): 37% savings (~1,500 tokens)
- **Multi-session** (with knowledge graph): 73% savings (~22,000 tokens)

---

## 🔗 Integration

The skill integrates with:

- **`.cursorrules`** - Follows token efficiency rules (#148-150)
- **MCP CLI** - For knowledge graph and bulk operations
- **Knowledge graph** - Stores and retrieves patterns
- **Token monitor** - Tracks savings over time
- **Real benchmarks** - Validates with tiktoken

---

## 📝 Skill Metadata

```yaml
name: token-reduce
description: Optimize token usage with 30-90% savings
argument-hint: [file-or-directory]
disable-model-invocation: false  # Auto-invokes when relevant
allowed-tools: Read, Grep, Glob, Bash, Edit
```

---

## 💡 Pro Tips

1. **Use regularly** - Invoke at start of complex tasks
2. **Monitor savings** - Track with token-monitor.sh
3. **Store patterns** - Use knowledge graph for repeated research
4. **Batch operations** - Let skill handle multiple files
5. **Measure results** - Validate with benchmark-real-tokens.sh

---

## 🤝 Team Usage

**This skill is version-controlled!** Team members can:

1. Pull the repo
2. Start Claude Code
3. Type `/token-reduce`
4. Get optimizations immediately

No setup required - it's already in `.claude/skills/`.

---

## 📈 Real Example

**User invokes:**
```
/token-reduce wallets/frontend/src/app
```

**Skill analyzes and reports:**
```
📊 Token Analysis: wallets/frontend/src/app

Baseline Usage:
- 23 TypeScript files
- Total tokens: 15,200
- Largest file: layout.tsx (2,400 tokens)

Optimization Applied:
1. Concise imports (12 files): -1,100 tokens
2. Targeted component reads: -800 tokens
3. Removed verbose comments: -400 tokens
4. Extracted reusable types: -300 tokens

Results:
✓ Optimized: 12,600 tokens
✓ Savings: 17% (2,600 tokens)
✓ Reduced API cost: ~$0.008 per request

Recommendations:
- Store layout patterns in knowledge graph
- Monitor with: .cursor/token-monitor.sh
- For 50+ files, use MCP CLI bulk operations

Next Steps:
  .cursor/token-monitor.sh saved "Frontend optimization" 2600
```

---

*Version: 2.0 | Benchmarked with tiktoken | See SKILL.md for complete details*
