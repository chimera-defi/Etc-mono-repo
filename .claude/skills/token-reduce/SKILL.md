---
name: token-reduce
description: |
  Reduce token usage by retrieving only relevant context and summarizing it.
  Uses QMD BM25 search when available for fast local search (skip embed/vsearch/query — too slow).
  Use when: context limits, high costs, large codebases. Enforcement via .cursorrules.
author: Claude Code
version: 4.2.0
argument-hint: [file-or-directory]
disable-model-invocation: false
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# Token Reduction Skill

Reduce context usage for `$ARGUMENTS` using targeted retrieval and short summaries.

## Strategies (by measured impact)

| Strategy | Measured Savings | When |
|----------|-----------------|------|
| Concise responses | 89% | Always |
| QMD BM25 search | 99% vs naive reads | Finding which files to read |
| Targeted reads | 33% | Large files |
| Sub-agents | 15-30% | >5 files, broad exploration |
| Parallel calls | 20% | Multi-step tasks |

## Process

0. **Check QMD availability** (once per session):
   ```bash
   command -v qmd >/dev/null 2>&1 && qmd collection list 2>/dev/null | head -1
   ```
   If missing or no collection, skip QMD steps — use Grep/Glob directly.

1. **Know the file/keyword?** → `Grep` tool (scoped with `glob: "*.md"` or `type: "ts"`), then `Read` with `offset`/`limit`.
2. **Need ranked snippets/paths?** → QMD BM25: `qmd search "topic" -n 5 --files`.
3. **Large file (>300 lines)?** → `Read` with `offset` and `limit` params (not head/tail/sed).
4. **Broad exploration (>5 files)?** → `Task(subagent_type="Explore")` to keep main context clean.
5. Report: `Baseline → Optimized (X% saved)` and fixes.

## QMD Reference (BM25 only — skip embed/vector)

```bash
# Install if missing
command -v qmd >/dev/null 2>&1 || bun install -g https://github.com/tobi/qmd

# One-time collection setup (2s, no model downloads)
qmd collection add /path/to/repo --name my-repo

# Search (700ms-2.7s)
qmd search "topic" -n 5 --files    # paths + scores
qmd search "topic" -n 5            # ranked snippets
qmd get filename.md -l 50 --from 100  # file section
```

**Skip:** `qmd embed` (11 min), `qmd vsearch` (15-111s), `qmd query` (105-175s)

## Anti-patterns flagged

- Restating requests
- Narrating tool usage ("Let me read the file...")
- Reading entire files (use offset/limit for >300 lines)
- Re-researching stored knowledge
- Re-reading the same file in one session (unless it changed)
- Per-file commentary instead of a single summary
- Using MCP CLI for file reads (117% more tokens due to JSON)
- Using Bash for file ops when Read/Grep/Glob exist

## Usage

```
/token-reduce src/app.tsx      # File
/token-reduce wallets/frontend # Directory
/token-reduce                  # Conversation
```

---

*Enforcement: .cursorrules + hooks | Benchmarks: `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`*
