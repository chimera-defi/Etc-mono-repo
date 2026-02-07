# Token Reduction Guide

**Benchmarked:** 2026-02-07 with tiktoken on real repo content (642 files, 234 .md)
**Auto-active:** Via `.cursorrules` + `/token-reduce` skill
**Validated:** `.cursor/validate-token-reduction.sh`
**Full benchmarks:** `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`

---

## Quick Reference

| Strategy | Measured Savings | Use |
|----------|-----------------|-----|
| Concise responses | 89% | Always |
| QMD BM25 search | 99% vs naive file reads | Finding which files to read |
| Targeted reads | 33% | Large files |
| Sub-agents | 15-30% | Complex exploration (>5 files) |
| Parallel ops | 20% | Multi-step tasks |

**Removed (benchmarked, not effective):**
- ~~MCP CLI bulk file reads~~ — adds 117% token overhead (JSON wrapping)
- ~~MCP CLI memory~~ — redundant with Claude Code built-in memory (`~/.claude/projects/*/memory/`)
- ~~QMD vector/combined search~~ — 15-175 seconds per query, impractical

---

## Decision Tree (Fastest First)

1. **Known file/keyword?** → `rg -g "*.md" "keyword"` then targeted read.
2. **Need ranked snippets or file list?** → `qmd search "topic" -n 5 --files` (BM25 only).
3. **Large file context?** → `head/tail/sed` (line-limited).
4. **No `rg`?** → `git grep` scoped to path.

## Guardrails (Always On)

- Cap tool output to ~120 lines; use head/tail/sed for longer content
- Summarize multi-file reads; never paste full files unless asked
- Avoid full reads for files >300 lines
- Prefer `rg --files -g` before directory_tree
- Use `rg -g` scoped searches; fallback to `git grep` if `rg` missing

---

## 1. Concise Communication (89%)

Bad: "I understand you'd like me to check..."
Good: `[uses Read]` Bug on line 47 — missing return.

**Measured:** 142 tokens → 13 tokens

---

## 2. QMD BM25 Search (99% vs naive)

Find which files to read before loading them into context.

```bash
# One-time setup (2 seconds for 212 md files, no embeddings needed)
qmd collection add /path/to/repo --name my-repo

# Find relevant files (700ms-2.7s, returns paths + scores)
qmd search "topic" -n 5 --files           # 178 tokens

# Get ranked snippets (700ms-2.7s)
qmd search "topic" -n 5                    # 512 tokens

# Read specific sections of found files
qmd get filename.md -l 50 --from 100       # 748ms

# Multi-file snippet retrieval
qmd multi-get "file1.md,file2.md" -l 30    # 710ms, 373 tokens
```

**Measured:** 52,604 tokens (naive grep+cat 10 files) → 512 tokens (QMD top 5 snippets)

**Skip these modes (too slow):**
- `qmd embed` — 11 min setup, 340MB model download
- `qmd vsearch` — 15-111 seconds per query
- `qmd query` — 105-175 seconds per query, downloads 1.28GB model

**Relevance caveat:** BM25 is keyword-based. It struggles with ambiguous terms (e.g., "token" matches both crypto tokens and LLM tokens). For precise searches, use `grep` directly.

---

## 3. Targeted Reads (33%)

```bash
Read file with offset/limit    # Lines 100-150 only
head -50 file.md               # First 50 lines
tail -100 file.md              # Last 100 lines
```

**Measured:** 4,525 tokens → 2,573 tokens

---

## 4. Sub-Agents (15-30%)

Use `Task(subagent_type="Explore")` for:
- Complex research requiring >5 file reads
- Pattern matching across codebase
- Uncertain where information lives

Agent handles file discovery, reading, and analysis — returns only a summary to the main context.

---

## 5. Parallel Operations (20%)

```
Sequential (3 turns): 3,400 tokens
Parallel (1 turn):    2,700 tokens
```

---

## Anti-Patterns

- Restating user requests
- Narrating tool usage ("Let me read the file...")
- Reading entire files without line limits
- Re-researching what's already known
- Using MCP CLI for file reads (adds JSON overhead)
- Re-reading the same file in one session unless it changed
- Per-file commentary instead of a single summary

---

## Hooks (`.claude/settings.json`)

- `enforce-targeted-read.py` — Blocks Read on files >300 lines without limit
- `enforce-grep-limits.py` — Warns when Grep content mode used without head_limit
- `warn-glob-explosion.py` — Warns when Glob returns >50 files (suggests sub-agent)

---

## Validation & Monitoring

```bash
.cursor/validate-token-reduction.sh    # 32 automated checks
.cursor/benchmark-real-tokens.sh       # Tiktoken measurement
.cursor/token-monitor.sh init          # Start session tracking
.cursor/token-monitor.sh summary       # End-of-session report
```

**Local benchmark note:** `.cursor/benchmark-real-tokens.sh` measures token overhead in simulated tool-call flows, not wall-clock latency. Use the 2026-02-07 benchmark doc as the authority for MCP CLI vs QMD performance.

---

## Benchmark Dependencies

```bash
apt install python3-venv
python3 -m venv /tmp/token-venv
source /tmp/token-venv/bin/activate
pip3 install tiktoken
```

---

**Version:** 4.1 (2026-02-08 — merged PR 197 guardrails with real benchmarks)
**Validation:** `.cursor/validate-token-reduction.sh`
