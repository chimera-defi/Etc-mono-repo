# Bug Tracking & AI Code Review Tools Setup 🛠️

> **Hands-on setup guides for all major AI code review and bug tracking tools**
>
> Compare how each tool works in your actual workflow

---

## 📋 Quick Reference

| Tool | Type | Pricing | Setup Time | Already Integrated? |
|------|------|---------|------------|---------------------|
| [Cursor BugBot](./cursor-bugbot.md) | AI PR Review | $40/user/mo | 5 min | ✅ Yes (if using Cursor) |
| [Graphite](./graphite.md) | Stacked PRs + AI Review | Free tier | 10 min | ❌ No |
| [Greptile](./greptile.md) | Codebase-aware AI Review | $99/mo | 5 min | ❌ No |
| [CodeRabbit](./coderabbit.md) | AI PR Review | Free tier | 5 min | ❌ No |
| [React Scan](./react-scan.md) | React Performance | Free (MIT) | 1 min | ❌ No |

---

## 🎯 What To Do

### Step 1: Understand Current Setup
You already have **Cursor BugBot** integrated. Review the [comparison below](#-tool-comparison) to see what's different about each tool.

### Step 2: Try the Free Ones
1. **React Scan** - Run immediately: `npx react-scan@latest http://localhost:3000`
2. **CodeRabbit** - Free for open source, install on any repo
3. **Graphite** - Free tier available, try stacked PRs

### Step 3: Evaluate Premium Tools
1. **Greptile** - 82% bug catch rate vs Cursor's 58%
2. Compare side-by-side on the same PRs

---

## 🔍 Tool Comparison

### Bug Detection Accuracy (Greptile Benchmark 2025)

| Tool | Catch Rate | False Positive Rate |
|------|-----------|---------------------|
| **Greptile** | 82% | Low |
| **Cursor BugBot** | 58% | Very Low |
| **GitHub Copilot** | 54% | Medium |
| **CodeRabbit** | 44% | Medium-High |
| **Graphite** | 6% | Very Low |

*Source: [Greptile State of AI Coding 2025](https://www.greptile.com/benchmarks)*

### Feature Comparison

| Feature | BugBot | Graphite | Greptile | CodeRabbit | React Scan |
|---------|:------:|:--------:|:--------:|:----------:|:----------:|
| **AI PR Review** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Codebase Context** | ✅ | ❌ | ✅✅ | ✅ | ❌ |
| **One-Click Fix** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Stacked PRs** | ❌ | ✅✅ | ❌ | ❌ | ❌ |
| **Custom Rules** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Slack/Jira/Notion** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Performance Debugging** | ❌ | ❌ | ❌ | ❌ | ✅✅ |
| **Visual Overlay** | ❌ | ❌ | ❌ | ❌ | ✅✅ |
| **CLI Tool** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **VS Code Extension** | ❌ | ✅ | ✅ | ❌ | ✅ |
| **MCP Server** | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## 🤔 Key Differences from Cursor BugBot

### Graphite (Now owned by Cursor)
**What's Different:**
- **Stacked PRs**: Work on multiple dependent changes simultaneously
- **Faster merge workflow**: Don't wait for approvals to start next change
- **CLI-first**: `gt` command line tool for managing PR stacks
- **Team analytics**: See PR cycle times, review bottlenecks

**Why Cursor Bought It:**
> "The way engineering teams review code is increasingly becoming a bottleneck" - Michael Truell, Cursor CEO

Graphite solves the **workflow** problem, BugBot solves the **quality** problem. Combined = faster AND better.

### Greptile
**What's Different:**
- **Full codebase indexing**: Understands your entire repo, not just the diff
- **82% catch rate** vs BugBot's 58% (per their benchmark)
- **Jira/Notion integration**: Links PRs to tickets and docs
- **MCP Server**: Query your codebase from Claude/Cursor

**When to Use:**
- Large codebases where context matters
- Teams with lots of interconnected modules
- When you need to catch subtle cross-file bugs

### CodeRabbit
**What's Different:**
- **Free for open source**
- **Most talkative**: Leaves the most comments per PR
- **Lower accuracy**: 44% catch rate
- **Good for learning**: Explains issues in detail

**When to Use:**
- Open source projects (free!)
- Teaching/onboarding new developers
- When you want verbose feedback

### React Scan
**What's Different:**
- **Runtime performance**: Not a code review tool
- **Visual overlay**: See slow renders in real-time
- **Scan any site**: Works on production sites too
- **No GitHub integration**: It's a debugging tool

**When to Use:**
- React performance optimization
- Before submitting PRs (catch perf issues early)
- Debugging slow components

---

## 📊 Recommended Workflow

### Current (BugBot Only)
```
Write Code → Push PR → BugBot Reviews → Fix Issues → Merge
```

### Enhanced (BugBot + Graphite + React Scan)
```
Write Code → React Scan (perf check) → Create Stacked PRs (Graphite)
     ↓
BugBot Reviews Each Stack → Fix Issues → Merge in Order
```

### Maximum Coverage (Add Greptile)
```
Write Code → React Scan → Stacked PRs → BugBot + Greptile Review
     ↓
Compare Feedback → Fix All Issues → Merge
```

---

## 📁 Individual Setup Guides

- [Cursor BugBot Setup](./cursor-bugbot.md) - Already integrated, but check custom rules
- [Graphite Setup](./graphite.md) - Stacked PRs, CLI tool
- [Greptile Setup](./greptile.md) - Codebase-aware AI review
- [CodeRabbit Setup](./coderabbit.md) - Free for open source
- [React Scan Setup](./react-scan.md) - React performance debugging

---

## ⚡ Quick Start Commands

```bash
# React Scan - immediate performance check
npx react-scan@latest http://localhost:3000

# Graphite CLI - install and setup
npm install -g @withgraphite/graphite-cli
gt auth

# Greptile VS Code Extension
# Search "Greptile" in VS Code extensions

# CodeRabbit - install via GitHub
# https://github.com/apps/coderabbitai
```

---

## 🔗 Official Links

| Tool | Website | Docs | GitHub App |
|------|---------|------|------------|
| Cursor BugBot | [cursor.com/bugbot](https://cursor.com/bugbot) | [Docs](https://cursor.com/docs/bugbot) | [Dashboard](https://cursor.com/dashboard) |
| Graphite | [graphite.dev](https://graphite.dev) | [Docs](https://graphite.dev/docs) | [App](https://github.com/apps/graphite) |
| Greptile | [greptile.com](https://www.greptile.com) | [Docs](https://docs.greptile.com) | [App](https://github.com/apps/greptile-apps) |
| CodeRabbit | [coderabbit.ai](https://coderabbit.ai) | [Docs](https://docs.coderabbit.ai) | [App](https://github.com/apps/coderabbitai) |
| React Scan | [react-scan.com](https://react-scan.com) | [GitHub](https://github.com/aidenybai/react-scan) | N/A |
