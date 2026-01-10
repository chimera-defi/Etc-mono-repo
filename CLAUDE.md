# Claude Code Instructions

This file contains instructions for Claude Code when working in this repository.

> **Cross-references:**
> - **`.cursorrules`** - Comprehensive AI assistant guidelines (all agents). See "PR Attribution Requirements" at top, Rules #140-141 for MCP CLI installation, and Rules #142-157 for MCP CLI usage patterns.
> - **`wallets/AGENTS.md`** - Wallet comparison specific guidelines, scoring methodology, and data verification standards
> - **`mobile_experiments/Valdi/AGENTS.md`** - Valdi framework specific guidelines

## Quick Reference

- **Rules Location:** `.cursorrules` - contains comprehensive AI assistant guidelines including PR attribution requirements at the top
- **PR Template:** `.github/pull_request_template.md` - GitHub PR template with agent attribution fields
- **Artifacts:** Place generated files in `.cursor/artifacts/`
- **Always verify:** Run linting, type checking, and tests before marking tasks complete

## Enforcement Mechanisms

- **Git Hook:** `.git/hooks/commit-msg` - warns if commit messages lack agent attribution (can bypass with `--no-verify`)
- **CI Check:** `.github/workflows/pr-attribution-check.yml` - validates PR descriptions and posts feedback as PR comment
- **PR Template:** GitHub automatically uses `.github/pull_request_template.md` when creating PRs via UI

## Core Principles

1. **Follow `.cursorrules`** - All rules in `.cursorrules` apply to Claude Code as well as Cursor AI
2. **Verify before completing** - Always run verification commands (`npm run lint`, `npm run build`, `npm test`)
3. **No data loss** - When editing tables or documents, preserve all existing data
4. **Document sources** - Include verification dates and source links for any data
5. **🔥 USE MCP CLI FOR TOKEN EFFICIENCY** - Always prefer MCP CLI over native tools when applicable (see MCP CLI section below)

## 🚀 MCP CLI Integration (CRITICAL FOR TOKEN EFFICIENCY)

**IMPORTANT:** This repository is configured with MCP CLI to achieve **60-80% token reduction** for file operations and knowledge management. You MUST use these tools strategically to maximize efficiency.

### Why MCP CLI?

- **Token Reduction:** 60-80% fewer tokens vs loading full MCP schemas
- **On-Demand Loading:** Only load tool schemas when needed
- **Bulk Operations:** Read multiple files in a single call
- **Persistent Memory:** Cross-session knowledge graph
- **Better Workflows:** Pattern-based tool discovery

### Installation (REQUIRED BEFORE USE)

**CRITICAL:** MCP CLI must be installed before any `mcp-cli` commands are executed, or you'll get exit code 127 (command not found).

#### Check if MCP CLI is Already Installed

```bash
which mcp-cli
mcp-cli --version
```

If you see `v0.1.3` or higher, MCP CLI is installed and you can skip to "Configuration" below.

#### Install MCP CLI

If not installed, install it using the official installation script:

```bash
curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
```

This will:
1. Download the MCP CLI binary for your platform (linux/x86_64, darwin/arm64, etc.)
2. Verify the checksum
3. Install to `/usr/local/bin/mcp-cli`
4. Output success message

#### Verify Installation

After installation, verify it worked:

```bash
mcp-cli --version  # Should show: mcp-cli v0.1.3
mcp-cli            # Should list all configured servers
```

**Note:** Installation requires internet access and may take 30-60 seconds. If behind a proxy, you may need to configure curl.

### Configuration

MCP CLI is configured in `mcp_servers.json` at the repository root with:
- **Filesystem Server:** Enhanced file operations, bulk reads, directory trees
- **Memory Server:** Persistent knowledge graph for cross-session context
- **Brave Search:** Web research integration (optional, requires API key)

### When to Use MCP CLI

**🔥 ALWAYS use MCP CLI for these operations:**

1. **Bulk File Reading** - Reading 2+ files at once
2. **Directory Analysis** - Getting directory trees or file listings with metadata
3. **File Search** - Pattern-based file discovery across large codebases
4. **Knowledge Storage** - Storing research findings, architectural decisions, project context
5. **Knowledge Retrieval** - Querying previously stored information
6. **Large File Operations** - Reading specific sections (head/tail) of large files

**❌ Do NOT use MCP CLI for:**
- Single file reads of small files (use native Read tool)
- File writes/edits (use native Write/Edit tools)
- Git operations (use native Bash tool)

### Common MCP CLI Patterns

#### Pattern 1: Bulk File Reading (HIGH PRIORITY)

Instead of multiple Read tool calls:
```bash
# ❌ OLD WAY (multiple tool calls)
Read package.json
Read tsconfig.json
Read next.config.js

# ✅ NEW WAY (single MCP CLI call)
mcp-cli filesystem/read_multiple_files '{"paths": ["package.json", "tsconfig.json", "next.config.js"]}'
```

**Token Savings:** ~66% (1 call vs 3 calls, reduced overhead)

#### Pattern 2: Directory Tree Analysis

```bash
# Get full directory structure with one command
mcp-cli filesystem/directory_tree '{"path": "/home/user/Etc-mono-repo/wallets/frontend/src"}'
```

**Token Savings:** ~80% vs recursive directory listing

#### Pattern 3: File Search with Patterns

```bash
# Find all TypeScript files
mcp-cli filesystem/search_files '{"path": "/home/user/Etc-mono-repo/wallets", "pattern": "**/*.ts"}'

# Find all config files
mcp-cli filesystem/search_files '{"path": "/home/user/Etc-mono-repo", "pattern": "**/*config*"}'
```

**Token Savings:** ~70% vs Glob + multiple reads

#### Pattern 4: Large File Head/Tail Reading

```bash
# Read first 50 lines only
mcp-cli filesystem/read_text_file '{"path": "/home/user/Etc-mono-repo/CLAUDE.md", "head": 50}'

# Read last 100 lines only
mcp-cli filesystem/read_text_file '{"path": "/home/user/Etc-mono-repo/wallets/frontend/src/lib/seo.ts", "tail": 100}'
```

**Token Savings:** ~90% for large files (only load what you need)

#### Pattern 5: Knowledge Graph Storage

```bash
# Store project knowledge (CRITICAL for avoiding repeated research)
mcp-cli memory/create_entities '{"entities": [
  {"name": "Wallets Frontend Architecture", "entityType": "architecture", "observations": [
    "Next.js 14 with App Router",
    "TypeScript strict mode",
    "OG images generated via scripts/generate-og-images.js",
    "Twitter Card validation required"
  ]}
]}'

# Create relationships between concepts
mcp-cli memory/create_relations '{"relations": [
  {"from": "Wallets Frontend", "to": "Next.js 14", "relationType": "uses"}
]}'
```

**Token Savings:** ~90% across sessions (store once, query many times)

#### Pattern 6: Knowledge Retrieval

```bash
# Search for previously stored knowledge
mcp-cli memory/search_nodes '{"query": "OG images"}'

# Open specific entities
mcp-cli memory/open_nodes '{"names": ["Wallets Frontend Architecture"]}'

# Read entire knowledge graph
mcp-cli memory/read_graph '{}'
```

**Token Savings:** ~95% vs re-reading documentation

### Project-Specific MCP CLI Usage

#### For Wallets Frontend

```bash
# Analyze all wallet data files
mcp-cli filesystem/search_files '{"path": "/home/user/Etc-mono-repo/wallets", "pattern": "**/*.json"}'

# Read multiple wallet configs
mcp-cli filesystem/read_multiple_files '{"paths": ["wallets/frontend/package.json", "wallets/frontend/tsconfig.json"]}'

# Store wallet research
mcp-cli memory/create_entities '{"entities": [{"name": "MetaMask Features", "entityType": "wallet", "observations": ["Browser extension", "EVM chains", "Most popular"]}]}'
```

#### For Voice Coding Assistant (Cadence)

```bash
# Explore all cadence components
mcp-cli filesystem/directory_tree '{"path": "/home/user/Etc-mono-repo/ideas/voice-coding-assistant"}'

# Read multiple cadence configs
mcp-cli filesystem/search_files '{"path": "/home/user/Etc-mono-repo/ideas/voice-coding-assistant", "pattern": "**/*package.json"}'
```

#### For Staking Projects

```bash
# Analyze staking research
mcp-cli filesystem/read_multiple_files '{"paths": ["staking/README.md", "staking/aztec/README.md"]}'

# Store staking knowledge
mcp-cli memory/create_entities '{"entities": [{"name": "Aztec Staking", "entityType": "project", "observations": ["Privacy-focused", "ZK proofs", "Research phase"]}]}'
```

#### For Ideas & Research

```bash
# Search all idea documentation
mcp-cli filesystem/search_files '{"path": "/home/user/Etc-mono-repo/ideas", "pattern": "**/*.md"}'

# Store idea evaluations
mcp-cli memory/create_entities '{"entities": [{"name": "Birthday Bot Idea", "entityType": "idea", "observations": ["Unified birthday reminders", "Cross-platform", "Privacy-first"]}]}'
```

### Tool Discovery Workflow

When you need a tool but aren't sure what's available:

```bash
# 1. List all available tools
mcp-cli

# 2. Search for specific capabilities
mcp-cli grep "*file*"      # Find file-related tools
mcp-cli grep "*read*"       # Find read operations
mcp-cli grep "*search*"     # Find search tools

# 3. Get specific tool schema
mcp-cli filesystem/read_multiple_files

# 4. Execute the tool
mcp-cli filesystem/read_multiple_files '{"paths": ["file1", "file2"]}'
```

### JSON Output Mode

For programmatic processing, use `--json` flag:

```bash
mcp-cli --json filesystem/search_files '{"path": ".", "pattern": "**/*.ts"}' | jq '.[]'
```

### Best Practices

1. **🔥 ALWAYS check if MCP CLI can do it better** before using native tools
2. **Batch operations** - Combine multiple reads into one `read_multiple_files` call
3. **Store knowledge** - Use memory server to avoid repeated research
4. **Query first** - Check knowledge graph before searching/reading files
5. **Use head/tail** - For large files, read only what you need
6. **Pattern search** - Use `search_files` for discovery instead of manual globbing
7. **JSON mode** - Use `--json` when you need structured output

### Measuring Token Savings

Track your MCP CLI usage to ensure token reduction:
- **Before MCP CLI:** Note context size for file operations
- **After MCP CLI:** Compare context size for same operations
- **Expected:** 60-80% reduction in tokens

### Troubleshooting

If MCP CLI fails:
- Check `mcp_servers.json` exists and is valid JSON
- Verify server is listed: `mcp-cli`
- Check error messages in stderr
- Fall back to native tools if necessary

### Full Documentation

See `mcp-cli-evaluation.md` for:
- Detailed evaluation and testing results
- Token usage analysis with examples
- Performance characteristics
- Integration strategies

## Project-Specific Notes

### Wallets Frontend (`wallets/frontend/`)

```bash
# Development
cd wallets/frontend
npm install
npm run dev

# Verification (run before marking complete)
npm run build          # Build for production
npm run lint           # ESLint checks
npm run type-check     # TypeScript verification
npm test               # Frontend tests (e.g., parser regression)
npm run validate-cards # Twitter Card validation (after build)
```

### Key Files

| Area | File | Purpose |
|------|------|---------|
| SEO | `src/lib/seo.ts` | SEO utility functions |
| Metadata | `src/app/layout.tsx` | Global metadata, structured data |
| Pages | `src/app/docs/[slug]/page.tsx` | Dynamic page metadata |
| Social | `src/components/SocialShare.tsx` | Social sharing buttons |
| OG Images | `public/og-*.png` | Open Graph images for social |
| OG Generator | `scripts/generate-og-images.js` | Generates OG images |
| Validation | `scripts/validate-twitter-cards.js` | Twitter Card validator |

### OG Image Workflow

When adding a new page that needs a custom OG image:

1. **Add generator function** to `scripts/generate-og-images.js`:
   ```javascript
   function generateMyNewPageImage() {
     const canvas = createCanvas(WIDTH, HEIGHT);
     // ... draw image
     return canvas;
   }
   ```

2. **Add to main()** in the same file:
   ```javascript
   saveCanvas(generateMyNewPageImage(), 'og-my-new-page.png');
   ```

3. **Regenerate images:**
   ```bash
   cd wallets/frontend
   npm run generate-og
   ```

4. **Add metadata to page** (use existing pattern from explore/page.tsx or layout.tsx):
   ```typescript
   const ogImageUrl = `${baseUrl}/og-my-new-page.png?${ogImageVersion}`;
   ```

5. **Commit the PNG** - CI will fail if generated images don't match committed ones

**CI Verification:** The GitHub Actions workflow compares committed images against freshly generated ones. If they differ, CI fails with instructions to regenerate.

### Verification Checklist

Before completing any frontend task:

- [ ] `npm run build` succeeds
- [ ] `npm run lint` shows no errors
- [ ] `npm run type-check` passes
- [ ] `npm test` passes (when present)
- [ ] OG images exist and are 1200x630 pixels
- [ ] Twitter metadata includes: card, title, description, image
- [ ] All image URLs are absolute (include base URL)

## Meta Learnings (from .cursorrules)

> **Full rules:** See `.cursorrules` for complete list. Wallet-specific: see `wallets/AGENTS.md`.

### Critical Rules for Data Work

- **Rule #46:** No data loss on restructure - verify ALL columns preserved
- **Rule #47:** Chains ≠ tokens - count blockchain networks, not tokens
- **Rule #52:** When uncertain, be vague not specific
- **Rule #53:** Line-by-line verification before finalizing tables

### Critical Rules for Code Work

- **Rule #20:** Think about runability - code must actually run
- **Rule #24:** Multi-tool verification - run ALL checks (lint, types, tests)
- **Rule #61:** Verify build after cleanup - always confirm nothing breaks
- **Rule #70:** Regenerate OG images when adding pages - CI will fail if images are out of sync
- **Rule #126:** Add filtering functions for new comparison types - map status types correctly
- **Rule #127:** Navigation consistency - add new sections to ALL navigation locations
- **Rule #128:** OG images for new comparison types - generate, map, update CI
- **Rule #129:** CI checks must not skip - all checks should fail builds on errors

### Critical Rules for Documentation

- **Rule #31:** Add columns, don't remove rows
- **Rule #32:** Never consolidate by deletion
- **Rule #35:** Concise ≠ shorter - remove redundancy, not information
- **Rule #125:** File naming consistency - update ALL references when renaming

### Critical Rules for PR Creation

- **Rule #116:** Always include model name in PRs (e.g., "Claude Opus 4.5" not "Claude Code") - enables tracking model performance
- **Rule #117:** Include model name in commit messages - use `[Agent: Claude Opus 4.5]` format
- **Rule #118:** PR titles focus on what's done, not the prompt - descriptive and action-oriented
- **Rule #134:** Model attribution, not platform attribution - attribute to specific model, not interface
- **Rule #119:** Include original prompt in PR description - provides context for reviewers
- **Rule #120:** Create prompt artifact for complex requests - preserves full context
- **Rule #121:** PR description structure - consistent format for easier analysis
- **Rule #122:** Always include human co-author in commits - additive attribution

**Quick reference:** See `.cursorrules` "PR Attribution Requirements" section at the top.

## Common Commands

```bash
# Root level
git status                    # Check changes
git diff                      # Review changes before commit

# Wallets frontend
cd wallets/frontend
npm run dev                   # Development server
npm run build                 # Production build
npm run lint                  # Lint check
npm run type-check            # TypeScript check
npm test                      # Frontend tests (when present)
npm run generate-og           # Regenerate OG images
npm run validate-cards        # Validate Twitter Cards (after build)

# Wallet data refresh
cd wallets/scripts
./refresh-github-data.sh      # Refresh wallet activity data
```

## PR Review Checklist

When reviewing or creating PRs, verify:

1. **Model attribution:** PR description includes model name (e.g., "**Agent:** Claude Opus 4.5") - see Rule #116, #134
2. **PR title:** Descriptive and focused on what's done, not the prompt - see Rule #118
3. **Original prompt:** Included in PR description or artifact - see Rule #119
4. **Build passes:** `npm run build` succeeds
5. **Linting passes:** `npm run lint` shows no errors
6. **Types pass:** `npm run type-check` has no errors
7. **Tests pass:** `npm test` passes (when present)
8. **No unused code:** All imports and functions are used
9. **Data preserved:** No accidental deletion of table rows/columns
10. **Sources documented:** Data changes include verification sources
11. **Commit messages:** Clear, descriptive with model attribution (e.g., `[Agent: Claude Opus 4.5]`) - see Rule #117

## External Resources

| Resource | URL | Use For |
|----------|-----|---------|
| Twitter Card Validator | https://cards-dev.twitter.com/validator | Test Twitter Cards |
| Facebook Debugger | https://developers.facebook.com/tools/debug/ | Test OG tags |
| LinkedIn Inspector | https://www.linkedin.com/post-inspector/ | Test LinkedIn shares |
| WalletBeat | https://walletbeat.fyi | Wallet technical data |
