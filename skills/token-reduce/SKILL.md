---
name: token-reduce
description: |
  Reduce token usage by retrieving only relevant context and summarizing it.
  Uses QMD BM25 search when available for fast local search (skip embed/vsearch/query — too slow).
  Use when: file location is uncertain, the repo is large, the user asks to "read context" or explore, or context/cost pressure matters.
  Do not use when: the exact file is already provided and the task is a small single-file edit. Pair with workspace rules and hooks when available.
metadata:
  author: "GPT-5 Codex"
  version: "5.0.0"
  argument_hint: "[file-or-directory]"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# Token Reduction Skill

Reduce context usage for `$ARGUMENTS` using targeted retrieval and short summaries.

## Use When

- The user asks to "read the context", "review the repo", "explore", or "find where this lives".
- You do not know the file location yet.
- The task likely needs more than 5 files or spans multiple areas of the repo.
- The repo is large enough that naive `find`, broad `Glob`, or full-file reads would bloat context.

## Don't Use When

- The exact file path is already given and the edit is local.
- The task is a one-command operational check with minimal repo reading.
- The file is small and a direct targeted read is clearly cheaper than search.

## Required First Move

- If file location is unknown, start with one of:
  - `scripts/token-reduce-search.sh "topic"` (preferred helper: repo-scoped QMD first, scoped `rg` fallback)
  - `qmd search "topic" -n 5 --files`
  - `rg -n -g '<glob>' '<pattern>'`
- Do not treat `rg --files .` as compliant discovery. It is still a broad scan in large repos.
- Do not start discovery with broad recursive Bash scans such as `find .`, `ls -R`, or `grep -R`.
- Do not start discovery with broad `Glob` patterns such as `**/*` or unscoped wildcard searches.
- After two failed discovery attempts or once the candidate set exceeds 5 files, escalate to `Task(subagent_type="Explore")`.

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
2. **Need ranked snippets/paths?** → `scripts/token-reduce-search.sh "topic"` or QMD BM25: `qmd search "topic" -n 5 --files`.
3. **Large file (>300 lines)?** → `Read` with `offset` and `limit` params (not head/tail/sed).
4. **Broad exploration (>5 files)?** → `Task(subagent_type="Explore")` to keep main context clean.
5. Report: `Baseline → Optimized (X% saved)` and fixes.

## Success Criteria

- Discovery starts with QMD BM25 or scoped `rg`, not recursive shell scans.
- `scripts/token-reduce-search.sh` is preferred for ambiguous exploration because it chooses repo-scoped QMD first and gives a fallback path.
- `rg --files .` and similarly broad inventory commands are treated as violations, even if they are fast.
- Reads are targeted (`Read` with `offset`/`limit`, `qmd get`, `head`/`tail`/`sed -n`).
- Broad exploration is delegated once the search space is clearly large.
- Final summary cites only the minimum set of files needed to explain the result.

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
- Starting exploration with `find .`, `ls -R`, `grep -R`, or broad `Glob` patterns
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
Read `references/token-reduction-guide.md` for the benchmark summary and workspace integration notes.
