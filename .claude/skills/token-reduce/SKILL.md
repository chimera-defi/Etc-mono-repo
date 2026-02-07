---
name: token-reduce
description: |
  Reduce token usage by retrieving only relevant context and summarizing it.
  Uses QMD BM25 search when available for fast local search (skip embed/vsearch/query — too slow).
  Use when: context limits, high costs, large codebases. Enforcement via .cursorrules.
author: Claude Code
version: 4.0.0
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

1. **Know the path/keyword?** Use `rg -g` scoped search first.
2. **Need ranked snippets/paths?** Use QMD BM25 (`qmd search "topic" -n 5 --files`).
3. **Need context from a large file?** Use head/tail/sed with line limits.
4. If QMD is unavailable, fall back to `rg -g` or `git grep`.
5. Avoid full reads >300 lines.
6. Report: `Baseline → Optimized (X% saved)` and fixes.

## Tool bootstrap (auto-install QMD if missing)

```bash
command -v qmd >/dev/null 2>&1 || bun install -g https://github.com/tobi/qmd
```

## QMD quickstart (BM25 only — skip embed/vector)

```bash
# One-time setup (2 seconds, no model downloads needed)
qmd collection add /path/to/repo --name my-repo

# Find files by keyword (700ms-2.7s)
qmd search "topic" -n 5 --files

# Get ranked snippets
qmd search "topic" -n 5

# Read specific file section
qmd get filename.md -l 50 --from 100
```

**Do NOT use:** `qmd embed` (11 min), `qmd vsearch` (15-111s/query), `qmd query` (105-175s/query)

## Anti-patterns flagged

- Restating requests
- Narrating tool usage
- Reading entire files
- Re-researching stored knowledge
- Using MCP CLI for file reads (117% more tokens due to JSON)

## Usage

```
/token-reduce src/app.tsx      # File
/token-reduce wallets/frontend # Directory
/token-reduce                  # Conversation
```

---

*Enforcement: .cursorrules + hooks | Benchmarks: `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`*
