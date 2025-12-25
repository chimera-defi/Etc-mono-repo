# Graphite Setup Guide 📚

> **Stacked PRs + AI Code Review (Acquired by Cursor Dec 2025)**
>
> Status: ❌ Not yet integrated

---

## Overview

Graphite enables **stacked pull requests** - work on multiple dependent changes simultaneously without waiting for approvals. Now owned by Cursor, it will integrate deeply with BugBot in 2026.

**Key Features:**
- Stacked PRs (dependent changes in parallel)
- CLI-first workflow (`gt` command)
- Team analytics
- Free tier available

**Why Cursor Bought It:**
> "The way engineering teams review code is increasingly becoming a bottleneck to them moving even faster as AI has been deployed more broadly." - Michael Truell, Cursor CEO

---

## What Are Stacked PRs?

### Traditional Workflow (Blocking)
```
Feature A (PR #1) → Wait for review → Merge
                                        ↓
                        Feature B (PR #2) → Wait → Merge
                                                     ↓
                                     Feature C (PR #3) → Wait → Merge

Total time: 3x review cycles
```

### Stacked Workflow (Parallel)
```
Feature A (PR #1) ─┐
Feature B (PR #2) ─┼──→ Review all in parallel → Merge in order
Feature C (PR #3) ─┘

Total time: 1x review cycle
```

---

## Installation

### 1. Install CLI

```bash
# npm
npm install -g @withgraphite/graphite-cli

# Homebrew (macOS)
brew install withgraphite/tap/graphite

# Verify installation
gt --version
```

### 2. Authenticate

```bash
gt auth
```

This opens browser for GitHub OAuth.

### 3. Initialize Repository

```bash
cd your-repo
gt init
```

---

## GitHub App Installation

1. Go to [github.com/apps/graphite](https://github.com/apps/graphite)
2. Click **Install**
3. Select repositories to enable
4. Configure permissions:
   - Read/write: Pull requests, Issues
   - Read: Contents, Metadata

---

## Basic Usage

### Create a Stack

```bash
# Create first branch
gt branch create feature-a
# ... make changes ...
git add . && git commit -m "Add feature A"

# Create second branch (stacked on feature-a)
gt branch create feature-b
# ... make changes ...
git add . && git commit -m "Add feature B"

# Create third branch
gt branch create feature-c
# ... make changes ...
git add . && git commit -m "Add feature C"
```

### View Your Stack

```bash
gt log
```

Output:
```
◉ feature-c (current)
│ Add feature C
│
◉ feature-b
│ Add feature B
│
◉ feature-a
│ Add feature A
│
◉ main
```

### Submit PRs for Entire Stack

```bash
gt stack submit
```

This creates PRs for all branches in your stack, properly linked.

---

## Key Commands

| Command | Description |
|---------|-------------|
| `gt branch create <name>` | Create new stacked branch |
| `gt stack submit` | Submit PRs for all branches |
| `gt stack sync` | Sync stack with upstream changes |
| `gt stack restack` | Rebase entire stack |
| `gt branch checkout <name>` | Switch branches |
| `gt branch down` | Move to parent branch |
| `gt branch up` | Move to child branch |
| `gt log` | View stack visualization |
| `gt log short` | Compact stack view |

---

## Configuration

### `.graphite_config` (repo-level)

```yaml
# Trunk branch
trunk: main

# Require tests to pass before merge
requireTests: true

# Auto-merge when approved
autoMerge: true

# Squash commits on merge
squashOnMerge: true
```

### Team Settings

Go to [app.graphite.dev](https://app.graphite.dev) for:
- PR templates
- Required reviewers
- Auto-assign rules
- Cycle time analytics

---

## Integration with Cursor BugBot

Since Cursor acquired Graphite, expect tighter integration in 2026:

**Current (Separate):**
```
Create Stack (Graphite) → Submit PRs → BugBot Reviews Each
```

**Future (Unified):**
```
Create Stack → BugBot Reviews All + Suggests Stack Optimizations → Merge
```

---

## Workflow Example

```bash
# Start from main
git checkout main
git pull

# Create feature stack
gt branch create auth-types
# Add TypeScript types for auth
git add . && git commit -m "Add auth types"

gt branch create auth-api
# Add API endpoints
git add . && git commit -m "Add auth API"

gt branch create auth-ui
# Add UI components
git add . && git commit -m "Add auth UI"

# Submit all at once
gt stack submit

# Reviewer can see:
# PR #1: auth-types (base: main)
# PR #2: auth-api (base: auth-types)
# PR #3: auth-ui (base: auth-api)

# After PR #1 merges, Graphite auto-updates PR #2's base
```

---

## Comparison with BugBot

| Aspect | Graphite | BugBot |
|--------|----------|--------|
| **Purpose** | Workflow optimization | Code quality |
| **Solves** | Review bottleneck | Bug detection |
| **Output** | Faster merges | Fewer bugs |
| **AI Features** | Review suggestions | Bug detection |
| **Catch Rate** | 6% (not its focus) | 58% |

**Best Together:** Use Graphite for workflow + BugBot for quality.

---

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Unlimited stacks, basic analytics |
| **Team** | $19/user/mo | Advanced analytics, priority support |
| **Enterprise** | Custom | SSO, audit logs, SLAs |

---

## Next Steps

- [ ] Install Graphite CLI: `npm install -g @withgraphite/graphite-cli`
- [ ] Run `gt auth` to connect GitHub
- [ ] Try creating a 2-branch stack on a test repo
- [ ] Compare workflow speed with traditional PRs

---

## Resources

- [Official Docs](https://graphite.dev/docs)
- [CLI Reference](https://graphite.dev/docs/cli)
- [GitHub App](https://github.com/apps/graphite)
- [Cursor Acquisition Announcement](https://graphite.com/blog/graphite-joins-cursor)
