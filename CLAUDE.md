# Claude Code Instructions

> **Master rules:** `.cursorrules` | **MCP CLI:** `.cursor/MCP_CLI.md` | **Token efficiency:** `/token-reduce` skill

## Quick Start

1. **Read `.cursorrules`** - All AI rules apply to Claude Code
2. **Install MCP CLI** before bulk operations: `curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash`
3. **Query knowledge** before researching: `mcp-cli memory/search_nodes '{"query": "topic"}'`
4. **Use token reduction** - Auto-active via `/token-reduce` skill (91% concise, 84% knowledge graph, 44% targeted reads)
5. **Verify before completing:** Run lint, build, tests

## Enforcement

| Check | Location | Action |
|-------|----------|--------|
| CI check | `.github/workflows/pr-attribution-check.yml` | Validates PR has **Agent:**, **Co-authored-by:**, and **## Original Request** |
| PR template | `.github/pull_request_template.md` | Auto-fills required attribution fields |

**Required PR Format:**
```markdown
**Agent:** Claude Sonnet 4.5

**Co-authored-by:** Chimera <chimera_defi@protonmail.com>

## Summary
[What was changed]

## Original Request
> [User's original prompt]

## Changes Made
- [List of changes]
```

**Important:** Also add `Co-authored-by: Chimera <chimera_defi@protonmail.com>` to commit message body (separate from PR description).

**Why Both?**
- PR description Co-authored-by: Validated by CI (`.github/workflows/pr-attribution-check.yml`)
- Commit message Co-authored-by: Shows in git history and GitHub commits

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
| #116 | Include model name in PRs |
| #117 | Include model name in commits |
| #122 | Include Co-authored-by: Name <email> in PRs AND commits |
| #124 | Commit vs PR Co-authored-by are different (both required) |
| #125 | CI checks PR description Co-authored-by (not just commit) |
| #140 | Install MCP CLI before using |
| #146 | Store knowledge in memory server |
| #148 | Token reduction skill always active |
| #149 | Benchmarked savings: 91% (concise), 84% (knowledge graph), 44% (targeted reads) |
| #150 | Query knowledge graph before researching |

## Project-Specific Docs

| Project | Doc |
|---------|-----|
| Wallets | `wallets/AGENTS.md` |
| Valdi | `mobile_experiments/Valdi/AGENTS.md` |
| Staking | `staking/AGENTS.md` |
| Ideas | `ideas/AGENTS.md` |

## Session Workflow

### Starting a Session

```bash
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

**Common causes:**
1. **Missing Co-authored-by in PR description** (not commit)
   - CI checks PR body, not git commit
   - Add to PR description: `**Co-authored-by:** Chimera <chimera_defi@protonmail.com>`
   - Also add to commit message body (different requirement)

2. **Missing Agent field**
   - Add to PR description: `**Agent:** Claude Sonnet 4.5`

3. **Missing Original Request section**
   - Add to PR description: `## Original Request` with user's prompt

**Quick fix:**
Edit PR description to include all three required fields. CI re-runs automatically.
