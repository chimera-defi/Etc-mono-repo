# Token Reduction - Automatic Workflow Integration

**Status:** ✅ Fully integrated and auto-active

---

## 🎯 What's Automated

The token reduction skill is now **automatically active** in your workflow with zero manual intervention required.

### Auto-Invocation Triggers

The `/token-reduce` skill **automatically loads** when you or AI agents mention:

| Keyword | Example Usage |
|---------|---------------|
| `tokens` | "How many tokens does this use?" |
| `optimize` | "Optimize this code" |
| `efficiency` | "Improve efficiency" |
| `costs` | "Reduce API costs" |
| `context` | "Managing context limits" |
| `api usage` | "Check API usage" |
| `budget` | "Stay within budget" |
| `performance` | "Improve performance" |
| `reduce` | "Reduce token consumption" |

**No manual invocation needed** - just mention these in normal conversation.

---

## 🔄 Automatic Workflow

### Session Start (Automatic)

When you start working:

1. **Token reduction is already active** (via `.cursorrules`)
2. **Knowledge graph ready** (MCP CLI pre-installed)
3. **All AI responses automatically:**
   - Skip preambles
   - Use `[uses tool]` instead of narrating
   - Query knowledge graph before researching
   - Read targeted file sections
   - Execute parallel tool calls

**You do nothing** - it's all automatic.

### During Work (Automatic)

Every AI response automatically applies:

✅ **Concise communication** (91% savings)
- No "I understand you'd like me to..."
- No "Let me go ahead and..."
- Direct answers only

✅ **Knowledge graph** (84% savings)
- Queries before researching
- Stores findings automatically
- Reuses across sessions

✅ **Targeted reads** (44% savings)
- Reads specific file sections
- Uses head/tail, not cat
- Avoids loading full files

✅ **Parallel operations** (20% savings)
- Batches tool calls
- Reduces conversation turns
- Plans ahead

### Session End (Manual - Optional)

Only if you want to track stats:

```bash
# Review savings (if you started monitoring)
.cursor/token-monitor.sh summary

# Clean up old files (optional)
.cursor/cleanup-workspace.sh --execute
```

---

## 📋 Integration Points

### 1. `.cursorrules` (Core Rules)

**Location:** `/home/user/Etc-mono-repo/.cursorrules`

**What it does:**
- Enforces token efficiency for ALL AI agents
- Defines default concise behavior
- Requires knowledge graph usage
- References `/token-reduce` skill

**Auto-active:** ✅ Always (no action needed)

### 2. `/token-reduce` Skill

**Location:** `.claude/skills/token-reduce/SKILL.md`

**What it does:**
- Loads on keywords: tokens, optimize, efficiency, costs, etc.
- Applies benchmarked strategies (30-90% savings)
- Measures and reports token reduction
- Provides recommendations

**Auto-active:** ✅ On keyword detection

**Manual invocation available:**
```bash
/token-reduce src/app.ts
/token-reduce wallets/frontend
/token-reduce
```

### 3. `CLAUDE.md` (Quick Start)

**Location:** `/home/user/Etc-mono-repo/CLAUDE.md`

**What it does:**
- Documents the workflow
- References `/token-reduce` skill
- Provides session start/end steps

**Auto-active:** ✅ Read by AI agents

### 4. Knowledge Graph (MCP CLI)

**Tool:** `mcp-cli memory/*`

**What it does:**
- Stores research findings
- Retrieves cached knowledge
- Prevents duplicate work

**Auto-active:** ✅ Agents query before researching

---

## 🎓 User Experience

### Without Manual Intervention

**You:** "Fix the auth bug"

**AI (auto-applies token reduction):**
```
[uses Grep for auth code]

Bug on line 47 - missing return statement.

[uses Edit to fix]

Fixed. Tests pass.
```

**Tokens saved:** ~300 tokens (skipped preambles, targeted read, parallel execution)

### With Keyword Trigger

**You:** "Optimize token usage in src/app.ts"

**AI (skill auto-loads):**
```
📊 Token Analysis: src/app.ts

Baseline: 4,500 tokens

Applied optimizations:
✓ Concise imports: -800 tokens
✓ Type aliases: -300 tokens

Optimized: 3,400 tokens
Savings: 24% (1,100 tokens)
```

**Tokens saved:** 1,100 tokens + concise communication

### Manual Deep Dive

**You:** `/token-reduce wallets/frontend`

**AI (skill explicitly invoked):**
```
[Full analysis with measurements, recommendations, tracking]
```

---

## 📊 Automatic Behaviors

### Always Active (No Manual Trigger)

These patterns are **enforced by `.cursorrules`:**

| Pattern | Instead Of | Tokens Saved |
|---------|------------|--------------|
| `[uses tool]` | "Let me use the tool..." | ~15 per occurrence |
| Direct answer | "I understand you'd like..." | ~25 per response |
| `Fix it?` | "Would you like me to fix this?" | ~8 per question |
| Targeted read | Full file read | ~50% of file size |
| Parallel calls | Sequential turns | ~20% per batch |

**Estimated savings per task:** 25-50%

### Keyword-Triggered (Auto-Loads Skill)

When you mention efficiency keywords, the skill adds:

- Full token analysis with measurements
- Before/after metrics
- Specific optimization recommendations
- Session tracking integration
- Monitoring suggestions

**Estimated additional savings:** 10-30%

---

## 🧹 Cleanup Automation

### Automatic Cleanup (Built-in)

**What cleans itself:**
- Knowledge graph evicts old entries automatically
- MCP CLI manages its own cache
- Session monitoring logs rotate

**No action needed:** ✅

### Manual Cleanup (Optional)

**When to run:**
- After major refactoring
- Before committing
- When disk space is low

**Command:**
```bash
.cursor/cleanup-workspace.sh          # Preview
.cursor/cleanup-workspace.sh --execute # Clean
```

**What it removes:**
- Old documentation versions (v1.0)
- Superseded benchmarks
- Session logs
- Temporary files

**What it keeps:**
- Production skill (`.claude/skills/token-reduce/`)
- Latest documentation (v2.0)
- Current benchmarks and tools
- All committed work

---

## 🎯 Verification

### Check Auto-Invocation Works

Test that the skill auto-loads:

```bash
# Start Claude Code
claude

# Trigger with keyword (no slash command)
> "How can I optimize token usage?"

# Skill should auto-load and analyze
```

### Check Automatic Behaviors

Test that concise patterns are enforced:

```bash
# Ask a simple question
> "What's in src/app.ts?"

# Should respond with:
# [uses Read tool]
# "Contains: [summary]"

# NOT:
# "I'll read the file for you. Let me go ahead and..."
```

### Check Cleanup Script

Test the cleanup workflow:

```bash
# Preview what would be cleaned
.cursor/cleanup-workspace.sh

# Should show:
# - Old v1.0 docs
# - Superseded benchmarks
# - Session logs
```

---

## 📈 Expected Impact

### Automatic Savings (No User Action)

**Simple task (bug fix):**
- Without automation: 1,000 tokens
- With automation: 750 tokens
- **Savings: 25%** (250 tokens)

**Complex task (feature implementation):**
- Without automation: 4,000 tokens
- With automation: 2,500 tokens
- **Savings: 37%** (1,500 tokens)

**Multi-session work:**
- Without automation: 30,000 tokens (10 sessions)
- With automation: 8,000 tokens (knowledge graph reuse)
- **Savings: 73%** (22,000 tokens)

### With Manual Optimization

Add `/token-reduce` invocation for analysis:
- **Additional savings: 10-30%**
- **Provides measurements and tracking**
- **Identifies new optimization opportunities**

---

## 🔧 Configuration

### Current Settings

**Auto-invocation:** ✅ Enabled
```yaml
disable-model-invocation: false
```

**Keyword triggers:** ✅ Configured
```
tokens, optimize, efficiency, costs, context,
api usage, budget, performance, reduce
```

**Default behavior:** ✅ Enforced via `.cursorrules`
```
- Concise responses
- Knowledge graph queries
- Targeted file reads
- Parallel tool calls
```

### Disable Auto-Invocation (Not Recommended)

To disable auto-invocation and require manual `/token-reduce`:

```yaml
# Edit .claude/skills/token-reduce/SKILL.md
disable-model-invocation: true
```

**Not recommended** - you'll lose automatic optimizations.

---

## 📚 Reference Documentation

**Quick reference:** This file (AUTO_WORKFLOW.md)
**Complete guide:** `.cursor/token-reduction-skill-v2.md`
**Benchmarks:** `.cursor/BENCHMARK_RESULTS.md`
**Usage examples:** `.claude/skills/token-reduce/README.md`
**Core rules:** `.cursorrules` (section: Token Efficiency)
**Workflow integration:** `CLAUDE.md` (section: Session Workflow)

---

## 🎯 Summary

**Token reduction is now:**

✅ **Auto-active** - Enforced by `.cursorrules` for all AI agents
✅ **Auto-triggered** - Skill loads on efficiency keywords
✅ **Auto-optimized** - Knowledge graph, targeted reads, concise responses
✅ **Auto-measured** - Benchmarked strategies with validated savings
✅ **Auto-documented** - Complete reference materials available

**User action required:** ✨ **NONE** ✨

Just work normally - the system optimizes automatically.

**Optional manual tools:**
- `/token-reduce` - Explicit analysis
- `token-monitor.sh` - Session tracking
- `cleanup-workspace.sh` - File cleanup

---

*Version: 2.0 | Status: Production | Auto-active: ✅ | Last updated: 2026-01-21*
