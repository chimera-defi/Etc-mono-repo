---
name: token-reduce
description: |
  Analyze files/directories for token optimization. Reports waste patterns and improvements.
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

Analyze `$ARGUMENTS` for token optimization opportunities.

## Strategies (by impact)

| Strategy | Savings | Apply |
|----------|---------|-------|
| Concise responses | 89-91% | Always |
| Knowledge graph | 76-84% | Multi-session |
| Targeted reads | 33-44% | Large files |
| Parallel calls | 20% | Multi-step |

## Process

1. Count tokens in target (tiktoken)
2. Identify waste patterns
3. Report: `Baseline → Optimized (X% saved)`
4. Recommend fixes

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

*Enforcement: .cursorrules (always on) | Analysis: this skill (on-demand)*
