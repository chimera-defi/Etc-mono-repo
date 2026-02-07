---
name: token-reduce
description: |
  Reduce token usage by retrieving only relevant context and summarizing it.
  Uses QMD (Query Markup Documents) when available for local search.
  Use when: context limits, high costs, large codebases. Enforcement via .cursorrules.
author: Claude Code
version: 3.1.0
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

## Strategies (by impact)

| Strategy | Savings | Apply |
|----------|---------|-------|
| Concise responses | 89% | Always |
| Knowledge graph | 76% | Multi-session |
| Targeted reads | 33% | Large files |
| QMD retrieval | 30-60% | Docs/notes |
| Parallel calls | 20% | Multi-step |

## Process

1. Ensure tools are installed (QMD + MCP CLI).
2. If QMD is installed, search relevant docs first.
3. Pull only top results and summarize in 5–10 bullets.
4. If QMD is unavailable, do targeted reads only.
5. Report: `Baseline → Optimized (X% saved)` and fixes.
6. Avoid full reads >300 lines; use head/tail/sed.
7. Prefer `rg -g` scoped searches; fallback to `git grep` if `rg` missing.

## Tool bootstrap (auto-install if missing)

```bash
command -v qmd >/dev/null 2>&1 || bun install -g https://github.com/tobi/qmd
command -v mcp-cli >/dev/null 2>&1 || curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
```

## QMD quickstart

```
bun install -g https://github.com/tobi/qmd
qmd collection add <path> --name <name>
qmd context add qmd://<name> "context"
qmd embed
qmd query "question" --all --files --min-score 0.3
```

## Anti-patterns flagged

- Restating requests
- Narrating tool usage
- Reading entire files
- Re-researching stored knowledge

## Usage

```
/token-reduce src/app.tsx      # File
/token-reduce wallets/frontend # Directory
/token-reduce                  # Conversation
```

---

*Enforcement: .cursorrules + hooks | Analysis: this skill (on-demand)*
