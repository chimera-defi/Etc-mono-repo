# Claude Code Instructions

> **Master rules:** `.cursorrules` | **MCP CLI:** `.cursor/MCP_CLI.md` | **Token efficiency:** `/token-reduce` skill

## Context Compaction Prevention (Critical)

**Use sub-agents to avoid filling main context:**

| Task | Instead of | Use |
|------|-----------|-----|
| Codebase exploration | Multiple Glob/Grep/Read | `Task(subagent_type="Explore")` |
| Finding files | Glob with broad patterns | `Task(subagent_type="Explore")` |
| Complex research | Sequential file reads | `Task(subagent_type="general-purpose")` |

**Rules:**
- **>5 file reads needed?** → Spawn Explore agent
- **Uncertain where info lives?** → Spawn Explore agent
- **Pattern matching across codebase?** → Spawn Explore agent
- **Glob returns >50 files?** → Hook warns, use sub-agent instead

**Hooks enforce:** Read limits (300 lines), Grep content warnings, Glob explosion warnings

## Quick Start

1. **Read `.cursorrules`** - All AI rules apply to Claude Code
2. **Install MCP CLI + QMD** (auto-install if missing):
   - `command -v mcp-cli >/dev/null 2>&1 || curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash`
   - `command -v qmd >/dev/null 2>&1 || bun install -g https://github.com/tobi/qmd`
3. **Query knowledge** before researching: `mcp-cli memory/search_nodes '{"query": "topic"}'`
4. **Use token reduction** - Auto-active via `/token-reduce` skill (89% concise, 76% knowledge graph, 33% targeted reads)
5. **Verify before completing:** Run lint, build, tests

## Enforcement

| Check | Location | Action |
|-------|----------|--------|
| CI check | `.github/workflows/pr-attribution-check.yml` | Validates PR has **Agent:**, **Co-authored-by:**, and **## Original Request** |
| PR template | `.github/pull_request_template.md` | Auto-fills required attribution fields |

**Required PR Format:**
```markdown
**Agent:** Claude Opus 4.5

**Co-authored-by:** Chimera <chimera_defi@protonmail.com>

## Summary
[What was changed]

## Original Request
> [User's original prompt]

## Changes Made
- [List of changes]
```

**Required Commit Format:**
```
feat(scope): description [Agent: Claude Opus 4.5]

Commit body with details.

Co-authored-by: Claude <noreply@anthropic.com>
```

**Attribution Pattern (Who Goes Where):**

| Location | Field | Value | Why |
|----------|-------|-------|-----|
| Commit | Author | Human (Chimera) | Human is responsible for merged code |
| Commit | Co-authored-by | AI (Claude) | AI assisted in writing |
| PR | Agent | AI model name | AI did the implementation work |
| PR | Co-authored-by | Human (Chimera) | Human provided guidance/review |

**Key Points:**
- Commit Author ≠ Commit Co-authored-by (human authors, AI co-authors)
- PR Agent ≠ PR Co-authored-by (AI is agent, human is co-author)
- CI validates PR description only (not commit messages)
- Both locations need attribution for proper tracking

**Never include:** Session links (`https://claude.ai/code/session_*`) in commits or PR descriptions.

## Wallets Frontend

```bash
cd wallets/frontend
npm install && npm run dev     # Development
npm run build                  # Production build
npm run lint                   # ESLint
npm run type-check             # TypeScript
npm test                       # Tests
npm run generate-og            # Regenerate OG images
npm run validate-cards         # Twitter Card validation
```

**Key files:**
- `src/lib/seo.ts` - SEO utilities
- `src/app/layout.tsx` - Global metadata
- `scripts/generate-og-images.js` - OG image generator

**OG Image workflow:** Add function to script → Run `npm run generate-og` → Add metadata to page → Commit PNG

## Verification Checklist

Before completing any task:
- [ ] `npm run build` succeeds
- [ ] `npm run lint` no errors
- [ ] `npm run type-check` passes
- [ ] `npm test` passes
- [ ] OG images 1200x630px
- [ ] Twitter metadata complete

## Critical Rules (Quick Reference)

| Rule | Summary |
|------|---------|
| #20 | Code must actually run |
| #24 | Run ALL verification tools |
| #46 | No data loss on restructure |
| #47 | Chains ≠ tokens |
| #116 | Include model name in PRs (Agent field) |
| #117 | Include model name in commits ([Agent: Model] in title) |
| #122 | Commit: Human authors, AI co-authors. PR: AI is agent, Human co-authors |
| #124 | Commit Co-authored-by = AI (Claude). PR Co-authored-by = Human (Chimera) |
| #125 | CI checks PR description only (Agent + Co-authored-by + Original Request) |
| #140 | Install MCP CLI before using |
| #146 | Store knowledge in memory server |
| #148 | Token reduction skill always active |
| #149 | Benchmarked savings: 89% (concise), 76% (knowledge graph), 33% (targeted reads) |
| #150 | Query knowledge graph before researching |
| #151 | Use sub-agents for exploration (>5 files, uncertain locations) |
| #152 | Sub-agents return summaries - prevents context compaction |
| #153 | Hooks enforce: Read >300 lines, Grep content, Glob >50 files |
| #154 | Pull latest `main` and rebase at the start of each new request |

## Project-Specific Docs

| Project | Doc |
|---------|-----|
| Wallets | `wallets/AGENTS.md` |
| Valdi | `mobile_experiments/Valdi/AGENTS.md` |
| Staking | `staking/AGENTS.md` |
| Ideas | `ideas/AGENTS.md` |
| **Status** | `.cursor/artifacts/PROJECT_STATUS.md` |

## File Organization

- **Artifacts:** `.cursor/artifacts/` (generated docs, status files)
- **Never litter root:** Keep generated markdown out of root directory
- **Project docs:** Each project folder has its own AGENTS.md

## Session Workflow

### Starting a Session

```bash
# 0. Sync with main
git fetch origin
git rebase origin/main

# 1. Token monitoring (optional but recommended)
.cursor/token-monitor.sh init

# 2. Query knowledge graph for context
mcp-cli memory/search_nodes '{"query": "your topic"}'

# 3. Token reduction auto-active (no action needed)
# Skill auto-invokes when you mention: tokens, efficiency, optimize, costs
```

### During Session

**Token reduction is always active:**
- Responses use concise patterns (no preambles)
- Knowledge graph queried before research
- Targeted file reads (head/tail, not full files)
- Parallel tool calls when possible

**Manual invocation available:**
```bash
/token-reduce src/app.ts          # Analyze file
/token-reduce wallets/frontend    # Analyze directory
/token-reduce                     # Analyze conversation
```

### Ending a Session

```bash
# 1. Review token savings (if monitoring)
.cursor/token-monitor.sh summary

# 2. Clean up temporary files
.cursor/cleanup-workspace.sh

# 3. Verify quality
npm run lint && npm run build && npm test
```

## Common Commands

```bash
# Git
git status && git diff

# Wallet data refresh
cd wallets/scripts && ./refresh-github-data.sh
```

## Troubleshooting CI Failures

### PR Attribution Check Failing?

**CI validates PR description (not commits). Required fields:**

| Field | Format | Example |
|-------|--------|---------|
| Agent | `**Agent:** [Model]` | `**Agent:** Claude Opus 4.5` |
| Co-authored-by | `**Co-authored-by:** Name <email>` | `**Co-authored-by:** Chimera <chimera_defi@protonmail.com>` |
| Original Request | `## Original Request` section | User's original prompt |

**Common mistakes:**
1. Missing `**Co-authored-by:**` in PR description (CI checks PR, not commits)
2. Missing `**Agent:**` at start of PR body
3. Missing `## Original Request` section
4. Using wrong person in Co-authored-by (should be human in PR, AI in commits)

**Quick fix:** Edit PR description to include all three required fields. CI re-runs automatically.

**Remember the pattern:**
- Commits: Human (Chimera) as Author, AI (Claude) as Co-authored-by
- PR: AI as Agent, Human (Chimera) as Co-authored-by

## Meta Learnings (Frontend/UI)

### Theme-Aware Styling
- **Never use hardcoded Tailwind colors** like `text-slate-100`, `bg-slate-800` for themed content
- **Use CSS variables:** `text-foreground`, `text-muted-foreground`, `bg-muted`, `bg-card`, `border-border`
- Hardcoded colors break light/dark mode toggle
- Color variables defined in `globals.css` under `:root` and `.dark`

### UI Best Practices
- **Avoid redundancy:** Don't show same nav links in multiple formats (buttons AND grid)
- **Use Next.js `<Image>`** instead of `<img>` for optimization and ESLint compliance
- **Replace `alert()`** with inline state-based notifications (better UX)
- **Placeholder components:** Remove fake data components before shipping

### Multi-Pass Review Checklist
1. `npm run lint` - No warnings or errors
2. `npm run type-check` - TypeScript passes
3. `npm run build` - Build succeeds
4. Check for unused imports
5. Verify theme works in both light and dark mode
6. Test all interactive elements

### Workflow Discipline
- Always pull latest `main` and rebase before starting a new request.
- Keep one task in one PR; do not split work across multiple PRs.
- Always commit with a self-authored message and model attribution.
- Store research sources in artifacts to preserve context.
- Token reduction: bootstrap MCP CLI + QMD first, use QMD before targeted reads.
- Use Bun by default (prefer `bun` over `node`/`npm` for scripts and installs).
- Always do 2-3 quick passes for extra optimization ideas.
