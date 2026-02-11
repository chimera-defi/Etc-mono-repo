# Claude Code Instructions

> **Master rules:** `.cursorrules` | **Token efficiency:** `/token-reduce` skill | **Benchmarks:** `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`

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
2. **Install QMD** (BM25 only): `command -v qmd >/dev/null 2>&1 || bun install -g https://github.com/tobi/qmd`
3. **Use QMD for search** before reading files: `qmd search "topic" -n 5 --files` (skip embed/vector)
4. **Use token reduction** - Auto-active via `/token-reduce` skill (89% concise, 99% QMD search vs naive, 33% targeted reads)
5. **Verify before completing:** Run lint, build, tests

**Decision flow:** If you know the file/keyword → `rg -g` scoped search. If you need ranked snippets → QMD BM25. Avoid MCP CLI for file reads.

## Enforcement

| Check | Location | Action |
|-------|----------|--------|
| CI check | `.github/workflows/pr-attribution-check.yml` | Validates PR has **Agent:**, **Co-authored-by:**, and **## Original Request** |
| CI check | `.github/workflows/commit-message-check.yml` | Validates commit header format and required commit trailer on PR commits |
| PR template | `.github/pull_request_template.md` | Auto-fills required attribution fields |
| Git hook | `.githooks/commit-msg` | Validates local commit header format and required commit trailer |

**Required PR Format:**
```markdown
**Agent:** <MODEL NAME> <!-- e.g. GPT-5.2, GPT-4o, Claude Opus 4.5 -->

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
feat(scope): description [Agent: <MODEL NAME>]

Commit body with details.

Co-authored-by: <MODEL NAME> <model@vendor.invalid>
```

Install hooks path once per clone:
`git config core.hooksPath .githooks`

**Attribution Pattern (Who Goes Where):**

| Location | Field | Value | Why |
|----------|-------|-------|-----|
| Commit | Author | Human (Chimera) | Human is responsible for merged code |
| Commit | Co-authored-by | AI (model) | AI assisted in writing |
| PR | Agent | AI model name | AI did the implementation work |
| PR | Co-authored-by | Human (Chimera) | Human provided guidance/review |

**Key Points:**
- Commit Author ≠ Commit Co-authored-by (human authors, AI co-authors)
- PR Agent ≠ PR Co-authored-by (AI is agent, human is co-author)
- CI validates both PR description attribution and PR commit message format (separate workflows)
- Both locations need attribution for proper tracking

**Important:** Do not copy example model names blindly. The `**Agent:**` field must match the actual model used in the run.

**Never include:** Session links (`https://claude.ai/code/session_*`) in commits or PR descriptions.

## Wallets Frontend

```bash
cd wallets/frontend
bun install && bun run dev     # Development
bun run build                  # Production build
bun run lint                   # ESLint
bun run type-check             # TypeScript
bun test                       # Tests
bun run generate-og            # Regenerate OG images
bun run validate-cards         # Twitter Card validation
```

**Key files:**
- `src/lib/seo.ts` - SEO utilities
- `src/app/layout.tsx` - Global metadata
- `scripts/generate-og-images.js` - OG image generator

**OG Image workflow:** Add function to script → Run `bun run generate-og` → Add metadata to page → Commit PNG

**Note:** Use `bun` by default for this project (prefer `bun` over `node`/`npm`).

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
| #125 | PR attribution CI checks PR description; commit-message CI checks PR commits |
| #140 | Use QMD BM25 search before reading files (skip embed/vector) |
| #148 | Token reduction skill always active |
| #149 | Benchmarked savings: 89% (concise), 99% (QMD search vs naive), 33% (targeted reads) |
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

```bash
# Start: sync with main
git fetch origin && git rebase origin/main

# Optional: token monitoring
.cursor/token-monitor.sh init          # start
.cursor/token-monitor.sh summary       # end

# End: cleanup + verify
.cursor/cleanup-workspace.sh
bun run lint && bun run build && bun test
```

Token reduction is always active (see Quick Start + `.cursorrules` Token Efficiency section).

## Common Commands

```bash
# Git
git status && git diff

# Wallet data refresh
cd wallets/scripts && ./refresh-github-data.sh
```

## Troubleshooting CI Failures

### PR Attribution Check Failing?

**PR attribution CI validates PR description. Required fields:**

| Field | Format | Example |
|-------|--------|---------|
| Agent | `**Agent:** [Model]` | `**Agent:** GPT-5.2` |
| Co-authored-by | `**Co-authored-by:** Name <email>` | `**Co-authored-by:** Chimera <chimera_defi@protonmail.com>` |
| Original Request | `## Original Request` section | User's original prompt |

**Common mistakes:**
1. Missing `**Co-authored-by:**` in PR description (CI checks PR, not commits)
2. Missing `**Agent:**` at start of PR body
3. Missing `## Original Request` section
4. Using wrong person in Co-authored-by (should be human in PR, AI in commits)

**Quick fix:** Edit PR description to include all three required fields. CI re-runs automatically.

**Remember the pattern:**
- Commits: Human (Chimera) as Author, AI (model) as Co-authored-by
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
1. `bun run lint` - No warnings or errors
2. `bun run type-check` - TypeScript passes
3. `bun run build` - Build succeeds
4. Check for unused imports
5. Verify theme works in both light and dark mode
6. Test all interactive elements
