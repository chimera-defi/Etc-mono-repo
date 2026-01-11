# Claude Code Instructions

> **Master rules:** `.cursorrules` | **MCP CLI:** `.cursor/MCP_CLI.md`

## Quick Start

1. **Read `.cursorrules`** - All AI rules apply to Claude Code
2. **Install MCP CLI** before bulk operations: `curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash`
3. **Query knowledge** before researching: `mcp-cli memory/search_nodes '{"query": "topic"}'`
4. **Verify before completing:** Run lint, build, tests

## Enforcement

| Check | Location | Action |
|-------|----------|--------|
| Commit hook | `.git/hooks/commit-msg` | Warns on missing agent attribution |
| CI check | `.github/workflows/pr-attribution-check.yml` | Validates PR descriptions |
| PR template | `.github/pull_request_template.md` | Auto-fills attribution fields |

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
| #140 | Install MCP CLI before using |
| #146 | Store knowledge in memory server |

## Project-Specific Docs

| Project | Doc |
|---------|-----|
| Wallets | `wallets/AGENTS.md` |
| Valdi | `mobile_experiments/Valdi/AGENTS.md` |
| Staking | `staking/AGENTS.md` |
| Ideas | `ideas/AGENTS.md` |

## Common Commands

```bash
# Git
git status && git diff

# Wallet data refresh
cd wallets/scripts && ./refresh-github-data.sh
```
