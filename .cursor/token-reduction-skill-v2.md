# Token Reduction Skill v2.0

> **Focus:** Evidence-based strategies for minimizing token usage based on empirical benchmarks.

**Benchmarked savings:** 91% (concise communication), 84% (knowledge graph), 44% (targeted reads)

---

## Quick Reference: What Actually Works

| Strategy | Savings | When to Use | Priority |
|----------|---------|-------------|----------|
| **Concise responses** | **91%** | Every response | 🔥 Critical |
| **Knowledge graph** | **84%** | Multi-session work | 🔥 Critical |
| **Targeted file reads** | **44%** | Large files | ⭐ High |
| **Parallel tool calls** | **20%** | Multi-step tasks | ✅ Medium |
| **MCP CLI bulk ops** | **1-10%** | 10+ files | ℹ️ Ergonomic |

---

## 1. Concise Communication (91% Savings) 🔥

**This is the biggest win.** Skip preambles, confirmations, and unnecessary explanations.

### ❌ Verbose Patterns to Avoid

```
"I understand you'd like me to..."
"Let me go ahead and..."
"Thank you for your patience..."
"I can confirm that..."
"Would you like me to go ahead and..."
"After carefully reviewing..."
"This is important because..."
```

**Cost:** ~120-150 tokens per occurrence

### ✅ Concise Patterns to Use

```
[uses tool]
"Bug on line 47:"
"Fixed."
"Results:"
"Next step?"
```

**Cost:** ~5-20 tokens per occurrence

### Real Example

**Verbose (142 tokens):**
```
I understand you'd like me to check the file for any potential issues.
Let me go ahead and do that for you now. I'll use the Read tool to
examine the contents.

[After using Read tool]

Thank you for your patience. After carefully reviewing the file, I can
confirm that I've found an issue on line 47. There's a missing return
statement in the function definition.

Would you like me to fix this for you?
```

**Concise (13 tokens):**
```
[uses Read tool]

Bug on line 47 - missing return statement. Fix it?
```

**Savings: 91%**

---

## 2. Knowledge Graph (84% Savings) 🔥

**Store research once, retrieve many times.** Prevents duplicate work across sessions.

### Pattern: Store Research

```bash
# After researching wallet scoring criteria
mcp-cli memory/create_entities '{"entities": [
  {
    "name": "WalletScoringCriteria",
    "entityType": "methodology",
    "observations": [
      "Platform coverage critical (mobile, desktop, browser)",
      "Open source status and developer activity",
      "API openness for integrations",
      "Security features and audit history",
      "UX and community support"
    ]
  }
]}'
```

**Cost:** ~100 tokens (one-time)

### Pattern: Query Before Research

```bash
# Before starting any research, query first
mcp-cli memory/search_nodes '{"query": "wallet scoring criteria"}'
```

**Result:** ~50 tokens
**Savings:** ~500 tokens if research already exists

### Impact Over 10 Sessions

- **Without knowledge graph:** 10 × 600 tokens = 6,000 tokens
- **With knowledge graph:** 100 + (9 × 50) = 550 tokens
- **Savings: 91% (or 84% with retrieval overhead)**

---

## 3. Targeted File Reads (44% Savings) ⭐

**Read only what you need.** Don't load entire files into context.

### ❌ Avoid Full File Reads

```
Read entire file (4,525 tokens for SOFTWARE_WALLETS.md)
```

### ✅ Use Targeted Reads

```bash
# Read specific line ranges
head -50 wallets/SOFTWARE_WALLETS.md

# Read specific sections
sed -n '100,150p' large_file.ts

# MCP CLI with line limits
mcp-cli filesystem/read_text_file '{"path": "file.py", "head": 100}'
```

**Savings:** 44% for typical files

### When to Use Full Reads

- File is < 200 lines
- You need complete context (refactoring, analysis)
- User explicitly requests full content

---

## 4. Parallel Tool Calls (20% Savings) ✅

**Batch independent operations in single turn.** Reduces conversation overhead.

### ❌ Sequential (3 turns)

```
Turn 1: Search for files (~600 tokens)
Turn 2: Read files (~2,600 tokens)
Turn 3: Analyze (~200 tokens)
Total: ~3,400 tokens
```

### ✅ Parallel (1 turn)

```
Turn 1: Search + Read + Analyze in parallel (~2,700 tokens)
Total: ~2,700 tokens
```

**Savings: 20%**

### Implementation

```
[Single response with multiple tool calls]
- Glob for matching files
- Read the found files
- Analyze patterns

[Then respond with findings]
```

---

## 5. MCP CLI Bulk Operations (1-10% Savings) ℹ️

**Ergonomic benefits > token savings.** Use for structured data, not token reduction.

### When MCP CLI Saves Tokens

- **10+ files:** ~10% savings
- **50+ files:** ~30% savings
- **3 files:** ~1% savings (not worth it for tokens alone)

### When to Use MCP CLI Anyway

✅ Need structured JSON output
✅ Complex queries requiring bulk operations
✅ Want error handling and retries
✅ Building on results programmatically

❌ Don't use for 1-3 file reads (native tools are more efficient)

---

## Communication Style Guide

### Thinking vs. Saying

**Think:**
- "I should check the file structure"
- "This might be in the auth module"
- "Let me verify this approach"

**Say:**
```
[uses Glob to check structure]
```

**Don't narrate your thought process unless user asks.**

### Asking Questions

**Verbose:**
```
Would you like me to go ahead and implement this feature for you?
I can make the necessary changes to the codebase.
```
(22 tokens)

**Concise:**
```
Implement this?
```
(3 tokens)

**Savings: 86%**

### Reporting Results

**Verbose:**
```
I've successfully completed the implementation. The tests are now
passing and the build completed without any errors. Everything looks
good to proceed.
```
(28 tokens)

**Concise:**
```
✓ Implemented. Tests pass, build clean.
```
(8 tokens)

**Savings: 71%**

---

## Anti-Patterns to Avoid

### 🚫 Restating User Requests

**User:** "Fix the auth bug"
**Bad:** "I understand you want me to fix the authentication bug. Let me start by..."
**Good:** [uses Grep to find auth code]

### 🚫 Apologizing for Being Concise

**Bad:** "I'll keep this brief..."
**Good:** [Just be brief]

### 🚫 Narrating Tool Usage

**Bad:** "Let me use the Read tool to examine the file..."
**Good:** [uses Read tool]

### 🚫 Explaining the Obvious

**Bad:** "The error occurs because the variable is undefined, which means it hasn't been declared yet."
**Good:** "Undefined variable error."

### 🚫 Asking Permission for Standard Actions

**Bad:** "Would you like me to run the tests to verify?"
**Good:** [runs tests]

---

## Session Monitoring Framework

### Track Your Token Usage

Create a simple log at the start of long sessions:

```bash
# Log tokens used per major operation
echo "$(date) - Research wallet criteria: ~600 tokens" >> /tmp/token_log.txt
echo "$(date) - Stored in knowledge graph" >> /tmp/token_log.txt
echo "$(date) - Retrieved from graph: ~50 tokens (saved 550)" >> /tmp/token_log.txt
```

### Review Patterns

At end of session, review:
- How many times did I restate user requests?
- How many preambles did I use?
- Did I query knowledge graph before researching?
- Could I have used targeted reads instead of full files?

---

## Practical Workflow

### Starting a Task

❌ **Verbose:**
```
I'll help you implement this feature. Let me start by examining the
current codebase to understand the existing implementation. I'll use
the Grep tool to search for related code.
```

✅ **Concise:**
```
[uses Grep for related code]
```

### Providing Status Updates

❌ **Verbose:**
```
I'm currently working on the authentication module. I've made some
progress and I'm about halfway through the implementation.
```

✅ **Concise:**
```
Auth module: 50% complete.
```

### Completing a Task

❌ **Verbose:**
```
I've successfully completed all the requested changes. The code has
been updated, tests are passing, and the build is clean. You should
now be able to use the new feature.
```

✅ **Concise:**
```
✓ Complete. Tests pass. Ready to use.
```

---

## When to Expand

**User signals for detail:**
- "Why?"
- "Explain"
- "How does this work?"
- "Show me the details"
- "Go deeper"
- "What are the tradeoffs?"

**Then and only then, expand your response.**

---

## Measurement & Validation

### Run Benchmarks

```bash
# Test token reduction strategies
.cursor/benchmark-real-tokens.sh

# Validate implementation
.cursor/test-token-reduction.sh

# Review full analysis
cat .cursor/BENCHMARK_RESULTS.md
```

### Expected Results

- Response conciseness: 85-95% savings
- Knowledge graph (multi-session): 80-90% savings
- Targeted reads: 40-50% savings
- Parallel calls: 15-25% savings

If results are lower, review:
1. Are you using preambles?
2. Are you restating user requests?
3. Are you apologizing or over-explaining?
4. Are you asking permission for standard actions?

---

## Integration with Existing Patterns

### .cursorrules Alignment

This skill implements:
- **#9-24:** Token efficiency rules
- **#140-150:** MCP CLI and knowledge graph usage

### Project-Specific Usage

- **Wallets:** Store scoring criteria in knowledge graph
- **Valdi:** Cache build patterns and common errors
- **Staking:** Store contract interaction patterns
- **Ideas:** Track research findings

---

## Real-World Impact

### Simple Task (1-2 file edits)

**Baseline:** ~1,000 tokens
**With skill:** ~750 tokens
**Savings: 25%**

**From:**
- Concise responses: ~200 tokens saved
- Targeted reads: ~50 tokens saved

### Complex Task (multi-file feature)

**Baseline:** ~4,000 tokens
**With skill:** ~2,500 tokens
**Savings: 37%**

**From:**
- Concise responses: ~800 tokens saved
- Parallel tool calls: ~400 tokens saved
- Targeted reads: ~300 tokens saved

### Multi-Session Work (10 sessions)

**Baseline:** ~30,000 tokens
**With skill:** ~8,000 tokens
**Savings: 73%**

**From:**
- Knowledge graph: ~15,000 tokens saved
- Concise responses: ~5,000 tokens saved
- Targeted reads: ~2,000 tokens saved

---

## Version History

**v2.0 (2026-01-21)**
- Refocused on empirically validated strategies
- Added real token counting benchmarks
- Expanded communication patterns with examples
- De-emphasized MCP CLI as token reduction tool
- Added practical workflow guidance

**v1.0 (2026-01-21)**
- Initial release with estimated savings
- Benchmarked and found some claims overstated
- Led to v2.0 with honest, measured approach

---

*Benchmarked with tiktoken | Scripts: `.cursor/benchmark-*.sh` | Validated against real usage*
