# Token Reduction Guide

**Benchmarked:** 89% concise, 76% knowledge graph, 33% targeted reads (real token count, 2026-01-30)
**Auto-active:** Via `.cursorrules` + `/token-reduce` skill
**Validated:** `.cursor/validate-token-reduction.sh`
**QMD:** Optional local search for docs/notes (https://github.com/tobi/qmd)

---

## Quick Reference

| Strategy | Savings | Use |
|----------|---------|-----|
| Concise responses | 89% | Always |
| Knowledge graph | 76% | Multi-session |
| Targeted reads | 33% | Large files |
| Parallel ops | 20% | Multi-step |
| Sub-agents | 15-30% | Complex tasks |
| MCP CLI bulk | 1-10% | 10+ files |
| QMD retrieval | 30-60% | Docs/notes |

---

## 1. Concise Communication (89%)

❌ Avoid: "I understand...", "Let me...", "Thank you...", "Would you like..."
✅ Use: `[uses tool]`, "Bug on line 47:", "Fixed.", "Results:"

**Example:**
```
Verbose (142 tokens): I understand you'd like me to check...
Concise (13 tokens): [uses Read] Bug on line 47 - missing return.
```

---

## 2. Knowledge Graph (76%)

Store once, retrieve many times:

```bash
# Store
mcp-cli memory/create_entities '{"entities": [{"name": "Topic", "entityType": "knowledge", "observations": ["fact1", "fact2"]}]}'

# Query before researching
mcp-cli memory/search_nodes '{"query": "topic"}'
```

**Impact:** 6,500 tokens → 400 tokens (10 sessions)

---

## 3. Targeted Reads (33%)

```bash
head -50 file.md           # First 50 lines
tail -100 file.md          # Last 100 lines
sed -n '100,150p' file.md  # Lines 100-150
```

**Impact:** 4,525 tokens → 2,573 tokens

---

## 4. Parallel Operations (20%)

**Sequential (3 turns):**
```
Turn 1: Search files
Turn 2: Read files
Turn 3: Analyze
Total: 3,400 tokens
```

**Parallel (1 turn):**
```
Single turn: Glob + Read + Grep in parallel
Total: 2,700 tokens
```

**Git example:**
```bash
git add -A && git status && git diff --stat  # All at once
```

---

## 5. Sub-Agents (15-30%)

Use Task tool for:
- Complex research (Explore agent)
- Multi-file analysis
- Pattern detection

```
Instead of: Multiple Read/Grep calls manually
Use: Task(subagent_type="Explore", prompt="Find auth patterns")
```

**Savings:** Agent handles file discovery, reading, analysis in optimized way

---

## 6. MCP CLI Bulk Ops (1-10%)

**Single file:** Use native Read
**2-9 files:** Marginal benefit
**10+ files:** Use MCP CLI

```bash
# Bulk read (10+ files)
mcp-cli filesystem/read_multiple_files '{"paths": [...]}'

# Directory tree (structure only)
mcp-cli filesystem/directory_tree '{"path": "."}'

# Pattern search
mcp-cli filesystem/search_files '{"path": ".", "pattern": "*.ts"}'
```

**Scales:** 3 files = 1%, 10 files = 10%, 50 files = 30%

---

## 7. QMD Retrieval (30-60%)

Use QMD to search large notes/doc sets before reading files into context.

```bash
bun install -g https://github.com/tobi/qmd
qmd collection add <path> --name <name>
qmd context add qmd://<name> "context"
qmd embed
qmd query "question" --all --files --min-score 0.3
```

---

## Anti-Patterns

🚫 Restating user requests
🚫 Apologizing for brevity
🚫 Narrating tool usage
🚫 Explaining obvious things
🚫 Asking permission for standard actions
🚫 Reading entire files
🚫 Re-researching stored knowledge

---

## Workflow Integration

**Already active:**
- `.cursorrules` enforces conciseness
- `/token-reduce` auto-triggers on keywords
- Knowledge graph auto-queried
- Tool output capped (~120 lines); use targeted reads
- Multi-file reads require summaries, not full pastes
- Avoid re-reading same file in one session unless it changed

**Hooks (`.claude/settings.json`):**
- `enforce-targeted-read.py` - Blocks Read on files >300 lines without limit
- `enforce-grep-limits.py` - Warns when Grep content mode used without head_limit
- `warn-glob-explosion.py` - Warns when Glob returns >50 files (suggests sub-agent)

**Manual tools:**
```bash
/token-reduce [file]           # Analyze & optimize
.cursor/token-monitor.sh       # Track savings
.cursor/validate-token-reduction.sh  # Validate
```

**Auto-install if missing:**
```bash
command -v qmd >/dev/null 2>&1 || bun install -g https://github.com/tobi/qmd
command -v mcp-cli >/dev/null 2>&1 || curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
```

**Auto-invoke keywords:** token-reduce, token reduction, context limits

---

## Real-World Impact

| Task | Baseline | Optimized | Savings |
|------|----------|-----------|---------|
| Simple (1-2 files) | 1,000 | 750 | 25% |
| Complex (5+ files) | 4,000 | 2,500 | 37% |
| Multi-session (10x) | 30,000 | 8,000 | 73% |

---

## Advanced Techniques

### Parallel File Ops
```bash
# Read multiple files in parallel
(cat file1.md & cat file2.md & cat file3.md) | process

# MCP CLI bulk (better)
mcp-cli filesystem/read_multiple_files '{"paths": ["file1.md", "file2.md", "file3.md"]}'
```

### Sub-Agent Delegation
```
Complex research task → Explore agent (optimized file discovery)
Multi-repo analysis → General-purpose agent (handles batching)
Pattern extraction → Grep + analysis in single agent call
```

**When to use sub-agents:**
- Task requires >5 file reads
- Pattern matching across codebase
- Uncertain where information lives
- Need comprehensive analysis

### Knowledge Graph Advanced
```bash
# Create relations
mcp-cli memory/create_relations '{"relations": [{"from": "entityId1", "to": "entityId2", "relationType": "implements"}]}'

# Search with context
mcp-cli memory/search_nodes '{"query": "topic", "relationType": "related"}'

# Batch storage (after major research)
Store multiple findings at once, retrieve as needed
```

## Benchmark dependencies

The benchmark script uses `tiktoken` via `pip3`. On Debian/Ubuntu, you may need:

```bash
apt install python3-venv
python3 -m venv /tmp/token-venv
source /tmp/token-venv/bin/activate
pip3 install tiktoken
```

### Differential Updates
```
Instead of: Regenerating 500-line file
Use: Edit specific sections with targeted old_string/new_string
```

---

## Monitoring

**Session start:**
```bash
.cursor/token-monitor.sh init
```

**During work:**
- Auto-logs via skill invocation
- Manual: `token-monitor.sh saved "strategy" 150`

**Session end:**
```bash
.cursor/token-monitor.sh summary
# Shows: Total saved, missed opportunities, patterns
```

---

## Validation

**Check implementation:**
```bash
.cursor/validate-token-reduction.sh
# 32 automated checks
```

**Benchmark:**
```bash
.cursor/benchmark-real-tokens.sh
# Tiktoken measurement
```

---

## Key Insight

**Token reduction comes from HOW you communicate, not WHICH tools you use.**

**Priority order:**
1. Concise communication (89% - biggest win)
2. Knowledge graph (76% - multi-session)
3. Targeted reads (33% - consistent)
4. Parallel ops (20% - reduces turns)
5. Sub-agents (15-30% - complex tasks)
6. MCP CLI (1-10% - ergonomic + scales)

---

**Version:** 3.1
**Status:** Production-ready
**Validation:** `.cursor/validate-token-reduction.sh`
**Context compaction prevention:** Hooks + sub-agent delegation (Rules #151-153)
