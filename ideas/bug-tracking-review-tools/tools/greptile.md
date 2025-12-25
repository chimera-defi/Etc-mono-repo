# Greptile Setup Guide 🔍

> **Codebase-aware AI Code Review**
>
> Status: ❌ Not yet integrated

---

## Overview

Greptile is an AI code review tool that **indexes your entire codebase** for context-aware PR reviews. It has the **highest bug catch rate** (82%) in independent benchmarks.

**Key Stats:**
- 82% bug catch rate (vs Cursor's 58%)
- Full codebase indexing
- Jira/Notion/Google Drive integration
- MCP Server for Claude/Cursor

**Raised:** $25M Series A (September 2025)

---

## Why Greptile?

### The Context Problem

Most AI review tools only see the PR diff:
```
// They see this:
- const user = getUser(id);
+ const user = await getUser(id);

// But miss this (in another file):
function getUser(id) {
  return cache.get(id) || db.query(id);  // Not async!
}
```

### Greptile's Approach

Greptile indexes your **entire repository**, so it knows:
- All function definitions
- Module conventions
- Existing patterns
- Related code in other files

---

## Installation

### 1. GitHub App

1. Go to [github.com/apps/greptile-apps](https://github.com/apps/greptile-apps)
2. Click **Install**
3. Select repositories to enable
4. Grant permissions:
   - Read: Contents, Pull requests
   - Write: Pull requests (for comments)

### 2. Enable Auto-Review

1. Go to [app.greptile.com/review/github](https://app.greptile.com/review/github)
2. Toggle on repositories you want auto-reviewed
3. Configure review settings per repo

---

## VS Code Extension

```bash
# Install from VS Code marketplace
# Search: "Greptile"
# Click: Install
```

Features:
- Ask questions about your codebase
- Get context-aware suggestions
- Query from editor

---

## MCP Server (For Claude Code/Cursor)

### Setup

1. Create `.env` file:
```bash
GREPTILE_API_KEY=your_api_key_here
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

2. Get your API key:
   - Go to [app.greptile.com](https://app.greptile.com)
   - Login with GitHub
   - Copy API key from settings

3. Add to Claude Code:
```json
{
  "mcpServers": {
    "greptile": {
      "command": "npx",
      "args": ["-y", "@greptile/mcp-server"],
      "env": {
        "GREPTILE_API_KEY": "your_key",
        "GITHUB_TOKEN": "your_token"
      }
    }
  }
}
```

### MCP Usage

Once configured, you can ask Claude:
- "What does the `processPayment` function do?"
- "Find all files that import from `@/lib/auth`"
- "How is caching implemented in this repo?"

---

## API Usage

### Index a Repository

```bash
curl -X POST https://api.greptile.com/v2/repositories \
  -H "Authorization: Bearer YOUR_GREPTILE_API_KEY" \
  -H "X-GitHub-Token: YOUR_GITHUB_TOKEN" \
  -d '{
    "remote": "github",
    "repository": "owner/repo",
    "branch": "main"
  }'
```

### Query the Codebase

```bash
curl -X POST https://api.greptile.com/v2/query \
  -H "Authorization: Bearer YOUR_GREPTILE_API_KEY" \
  -d '{
    "messages": [
      {"role": "user", "content": "How is authentication implemented?"}
    ],
    "repositories": [
      {"remote": "github", "repository": "owner/repo", "branch": "main"}
    ]
  }'
```

---

## Configuration

### Review Settings

Go to [app.greptile.com/review](https://app.greptile.com/review):

| Setting | Options |
|---------|---------|
| Auto-review | On/Off per repo |
| Review triggers | All PRs / Mentioned only |
| Comment style | Inline / Summary |
| Severity filter | All / High only |

### Custom Rules

Create `.greptile/rules.yaml`:

```yaml
rules:
  - name: no-console-log
    description: Remove console.log before merging
    pattern: console\.log
    severity: warning

  - name: require-error-handling
    description: All async functions must have try/catch
    pattern: async function.*\{(?!.*try)
    severity: error

  - name: use-typed-routes
    description: Use typed routes from @/routes
    pattern: href=["']/
    severity: info
    message: "Consider using typed routes for type-safe navigation"
```

---

## Integration with Other Tools

### Jira
```yaml
# .greptile/integrations.yaml
jira:
  enabled: true
  project: PROJ
  auto_link: true  # Link PRs to mentioned tickets
```

### Notion
Connect at [app.greptile.com/integrations](https://app.greptile.com/integrations) to let Greptile read your docs for context.

### Slack
Get notifications when Greptile finds critical issues.

---

## Benchmark Results

From [Greptile State of AI Coding 2025](https://www.greptile.com/benchmarks):

| Tool | Catch Rate | Noise Level |
|------|-----------|-------------|
| **Greptile** | 82% | Low |
| Cursor BugBot | 58% | Very Low |
| GitHub Copilot | 54% | Medium |
| CodeRabbit | 44% | High |
| Graphite | 6% | Very Low |

---

## Comparison with BugBot

| Feature | Greptile | BugBot |
|---------|----------|--------|
| Catch Rate | 82% | 58% |
| Codebase Indexing | Full | PR + related |
| One-Click Fix | ❌ | ✅ |
| MCP Server | ✅ | ❌ |
| Jira/Notion | ✅ | ❌ |
| Pricing | $99/mo | $40/user/mo |

**When to Use Greptile:**
- Large codebase with many interconnected modules
- Need to catch cross-file bugs
- Want to query codebase from Claude
- Already use Jira/Notion

**When to Use BugBot:**
- Smaller/medium codebases
- Want one-click fixes in Cursor
- Prefer low noise over high catch rate
- Already using Cursor

---

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Starter** | $99/mo | 5 repos, 100 PRs/mo |
| **Team** | $299/mo | 20 repos, 500 PRs/mo |
| **Enterprise** | Custom | Unlimited, SSO, audit |

---

## Next Steps

- [ ] Install GitHub App: [github.com/apps/greptile-apps](https://github.com/apps/greptile-apps)
- [ ] Enable on one test repo
- [ ] Open a PR and compare feedback with BugBot
- [ ] Try MCP Server integration with Claude

---

## Resources

- [Official Docs](https://docs.greptile.com)
- [API Reference](https://docs.greptile.com/api)
- [GitHub App](https://github.com/apps/greptile-apps)
- [Benchmarks](https://www.greptile.com/benchmarks)
- [MCP Server](https://lobehub.com/mcp/sosacrazy126-greptile-mcp)
