# Token Reduction Skill

> **Purpose:** Minimize token usage while maintaining high-quality outputs using proven strategies and MCP CLI integration.

---

## When to Use This Skill

**Activate when:**
- Working within tight token budgets (< 50K remaining)
- Running long agentic workflows requiring maximum context window
- Processing multiple files where token costs accumulate
- Using Claude Code or tool-heavy workflows
- Managing API costs on extended sessions

**Skip when:**
- Token budget is abundant (> 150K remaining)
- User explicitly requests detailed explanations
- Task requires comprehensive analysis or exploration

---

## Core Principles

### 1. Response Optimization

**Default to concise, direct responses:**
- Skip preambles ("I'll help you...", "Let me...")
- Provide minimal viable explanations for code/actions
- Use bullet points only when structure improves clarity
- Never restate user requests back to them
- Never apologize for being concise

**Examples:**

```
❌ BAD (verbose - 45 tokens):
I understand you'd like me to check the file. Let me go ahead and do that for you. I'll use the Read tool to examine the contents of the file and see what we're working with.

✅ GOOD (optimized - 12 tokens):
[uses Read tool]
Bug on line 47 - missing return statement.
```

### 2. File Operation Efficiency

**CRITICAL: Use MCP CLI for bulk operations (see `.cursor/MCP_CLI.md`):**

```bash
# Bulk file reads - reduces tool call overhead
mcp-cli filesystem/read_multiple_files '{"paths": ["file1.md", "file2.md", "file3.md"]}'

# Read specific line ranges only
mcp-cli filesystem/read_text_file '{"path": "/large_file.py", "head": 150}'

# Directory structure without full content
mcp-cli filesystem/directory_tree '{"path": "./src"}'
```

**Token savings:**
- **1-10% per operation** (from reduced tool call overhead)
- **Scales with file count:** 3 files = 1%, 10 files = 10%, 50 files = 30%
- **Major benefit:** Single tool call, structured data, better ergonomics

**Cache file contents mentally** - don't re-read unnecessarily

### 3. Tool Call Reduction

**Batch operations and minimize redundant calls:**
- Combine related searches into single queries
- Use `web_fetch` directly when URL is known (not search + fetch)
- Set `max_results` to minimum needed (5-10, not 20)
- Cache tool results - avoid re-running same queries
- Plan tool calls to avoid duplicate work

**Example:**
```bash
# Instead of 3 separate searches
mcp-cli filesystem/search_files '{"path": ".", "pattern": "**/*.{ts,tsx,md}"}'
```

### 4. Knowledge Graph Usage

**CRITICAL: Store and retrieve knowledge to avoid re-reading docs:**

```bash
# Query BEFORE researching
mcp-cli memory/search_nodes '{"query": "wallet scoring methodology"}'

# Store findings for future sessions
mcp-cli memory/create_entities '{"entities": [
  {"name": "WalletScoring", "entityType": "methodology", "observations": ["Platform coverage is critical", "Stability > frequent releases"]}
]}'
```

**Token savings:** 95% reduction on repeated research

### 5. Code Generation Strategy

**Generate minimal working code:**
- Omit boilerplate that can be inferred (standard imports)
- Use inline comments only for complex logic
- Provide code snippets instead of full files when possible
- For iterations, use `Edit` on specific sections (not full file regeneration)

**Example:**
```typescript
// Instead of full file with 200 tokens of imports/boilerplate

// Focused solution (30 tokens):
export const processData = (items: Item[]) =>
  items.filter(x => x.valid && x.score > threshold);
```

### 6. Context Window Management

**Maintain lean conversation state:**
- Summarize long outputs before presenting
- For iterative tasks, track state concisely
- Truncate large text to relevant sections with "..." notation
- When hitting limits, suggest new conversation with summary

---

## Integration with Existing Patterns

### .cursorrules Alignment

This skill extends the token efficiency rules (#9-24 in `.cursorrules`):

- **Answer directly** - keep reasoning implicit
- **No restating** - context/rules/prompts
- **Diffs over full files** - Edit tool, not full rewrites
- **Lists ≤5 items** - unless expansion requested
- **Token targets:** ~100 for answers, ~200 for diffs, ~300 for summaries

### MCP CLI Requirements (Rule #140)

**MUST install before bulk operations:**
```bash
curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
```

**Use for:**
- 2+ file reads
- Directory trees
- Pattern searches
- Knowledge storage/retrieval

### Expansion Triggers

**Expand only when user says:**
- "Go deeper"
- "Expand"
- "Show reasoning"
- "Explore tradeoffs"
- "Explain in detail"

---

## Token Budget Targets

| Task Type | Target Tokens | When to Expand |
|-----------|---------------|----------------|
| Simple Q&A | < 300 | User asks "why?" |
| Code generation | < 800 | Complex logic needs explanation |
| File operations | < 200 per call | Large file requires context |
| Multi-file work | < 1500 | Use MCP CLI bulk reads |
| Research tasks | < 1500 | User wants comprehensive analysis |

---

## Advanced Techniques

### 1. Chunking Large Operations

Break into resumable steps:
```
Instead of: "Process all 100 files"
Do: "Processed files 1-20. Continue with 21-40? [y/n]"
```

### 2. Differential Updates

Show only changes:
```
Instead of: [full 500-line file]
Do: "Modified lines 45-47:" [3 lines shown]
```

### 3. Progressive Disclosure

Start with summary, offer details:
```
"Found 3 issues:
1. Type error in auth.ts:45
2. Missing return in api.ts:67
3. Unused import in index.ts:12

Details on specific issue?"
```

### 4. Knowledge Graph Queries

**Before researching, query existing knowledge:**
```bash
# Check if we've already researched this
mcp-cli memory/search_nodes '{"query": "wallet API openness scoring"}'

# If found, use cached knowledge
# If not found, research and store for next time
```

---

## Project-Specific Patterns

### Wallet Comparison Work

**Efficient data verification:**
```bash
# Instead of reading all wallet docs separately
mcp-cli filesystem/read_multiple_files '{"paths": [
  "wallets/SOFTWARE_WALLETS.md",
  "wallets/HARDWARE_WALLETS.md",
  "wallets/CRYPTO_CARDS.md"
]}'

# Store wallet criteria for reuse
mcp-cli memory/create_entities '{"entities": [
  {"name": "WalletCoreCriteria", "entityType": "criteria", "observations": [
    "Mobile app required",
    "Browser extension required",
    "Developer-friendly",
    "Better stability than MetaMask"
  ]}
]}'
```

### Documentation Updates

**Use diffs, not full rewrites:**
```bash
# Bad: Rewrite entire 500-line file
# Good: Edit specific sections
Edit tool with targeted old_string/new_string
```

### Multi-Project Work

**Query project structure once, cache mentally:**
```bash
mcp-cli filesystem/directory_tree '{"path": "."}'
# Cache the structure, don't re-query
```

---

## Verification Checklist

**Before completing token-heavy tasks:**
- [ ] Could MCP CLI have been used? (Rule #142)
- [ ] Was knowledge graph queried first? (Rule #147)
- [ ] Were findings stored for future? (Rule #146)
- [ ] Did I avoid re-reading files?
- [ ] Did I use targeted line ranges?
- [ ] Did I batch independent operations?
- [ ] Is response length appropriate for task complexity?

---

## Skill Activation

**This skill is ALWAYS active by default** per `.cursorrules` token efficiency rules.

**User can override with:**
- "Explain in detail"
- "Show full file"
- "Expand your reasoning"
- "Go deeper"

**Self-adjust based on:**
- Remaining token budget (< 50K = strict mode)
- Task complexity (simple = ultra-concise, complex = appropriate detail)
- User preference signals

---

## Token Savings Comparison

**Benchmarked Results** (see `.cursor/benchmark-*.sh` for methodology):

| Strategy | Baseline | Optimized | Measured Savings |
|----------|----------|-----------|------------------|
| **Response conciseness** | ~189 tokens | ~17 tokens | **91%** ⭐ |
| **Knowledge graph (10 sessions)** | ~65K tokens | ~10K tokens | **84%** ⭐ |
| **Targeted file reads** | ~4525 tokens | ~2573 tokens | **44%** |
| **Parallel tool calls** | ~3400 tokens | ~2700 tokens | **20%** |
| **Bulk file reads (3 files)** | ~3986 tokens | ~3936 tokens | **1%** |

**Real-World Impact:**

- **Single session, simple task:** 10-30% savings
  - From: concise responses, targeted reads

- **Single session, complex task:** 30-50% savings
  - From: concise responses, parallel tool calls, targeted reads

- **Multi-session, repeated research:** 70-90% savings
  - From: knowledge graph preventing duplicate research

**Key Insight:** MCP CLI bulk operations provide modest per-operation savings (1-10%) but scale with file count. Real savings come from concise communication (91%), knowledge graph reuse (84%), and targeted file access (44%).

---

## Meta Learning Integration

This skill enforces existing meta learnings:

- **#19**: Verify, don't trust - but do it efficiently
- **#24**: Multi-tool verify - but batch the checks
- **#140**: Install MCP CLI before use
- **#142**: Prefer MCP CLI for bulk operations
- **#146**: Store knowledge in memory server
- **#147**: Query knowledge graph before searching

---

## Testing the Skill

**Test script location:** `.cursor/test-token-reduction.sh`

**Manual validation:**
1. Token budget monitoring throughout session
2. MCP CLI usage for 2+ file operations
3. Knowledge graph queries before research
4. Concise responses without preambles
5. Targeted file reads (not full files)

**Success criteria:**
- Average response < 500 tokens for standard tasks
- MCP CLI used for all bulk operations
- Knowledge graph has 10+ stored entities by end of session
- No duplicate file reads
- User gets quality output with minimal tokens

---

*Version: 1.0 | Last updated: January 2026 | Compatible with: Claude Code, Claude.ai*
