# Ideas & Research Guide

> **Master rules:** `.cursorrules` | **Token efficiency:** `/token-reduce` skill | **Benchmarks:** `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`

## Git Discipline (Required)

- One task = one PR (keep all commits on a single PR branch)
- Never push directly to `main` or `master`
- Create a branch/worktree before changes
- Always use a feature branch + PR
- Enable hooks: `git config core.hooksPath .githooks`

## Projects

### Voice Coding Assistant (Cadence) - 🧪 Prototype
**Location:** `ideas/voice-coding-assistant/`

Multi-platform voice-controlled coding assistant:
- cadence-backend - Backend services
- cadence-api - API layer
- cadence-app - Main application
- cadence-web-frontend - Web interface
- cadence-prototype - POC
- cadence-setup - Configuration

**Status:** Research/prototype phase

### Automated Trading System - 📊 Research
**Location:** `ideas/automated-trading-system/`

Automated trading system with:
- `docs/` - Strategy documentation
- `src/` - Implementation code
- `tests/` - Test suite
- `SPEC.md` - Technical specification (recently expanded)

**Status:** Research/specification phase

### Birthday Bot - 📅 Planning
**Location:** `ideas/birthday-bot/`

Unified birthday reminder application:
- Cross-platform tracking (Facebook, Google, Instagram, contacts)
- Privacy-first approach
- Automated reminders

**Key findings:**
- Market: 100-150M potential users
- Instagram: No official API (browser extension workaround)
- MVP: Feasible in 8-10 weeks
- Competitors: Birday, Birthday Sweet, Hip (fragmented)

**Status:** Idea/planning phase

### Conceptual Ideas

| Idea | Description | Status |
|------|-------------|--------|
| OAuth Auto-Setup | AI-driven third-party service provisioning | 💭 Concept |
| Self-Hosted Infra | Coolify evaluation, PaaS alternatives | 💭 Exploration |
| Mobile AI Agent | Native app with camera, location, offline support | 💭 Concept |
| Clawdbot Launchpad | Hosted Clawdbot/Moltbot on VPS or containers | 💭 Concept |

## Core Principles

1. **Document exploration** - Capture findings extensively
2. **Store research** - Use project artifacts
3. **Prototype fast** - Rapid iteration
4. **Track learnings** - Capture insights
5. **Link concepts** - Connect related ideas

## Token Reduction

**Full guide:** `.cursor/TOKEN_REDUCTION.md` | **Skill:** `/token-reduce`

**Ideas-specific searches:**
```bash
rg -g "*.md" "birthday bot" ideas/
rg -g "*.ts" "speech recognition" ideas/
```

## Research Workflow

1. **Check existing knowledge** - Read project memory/artifacts first
2. **Explore structure** - Use Glob/Grep (or sub-agents for >5 files)
3. **Targeted reads** - Read with offset/limit, not full files
4. **Store findings** - Write to project artifacts immediately
5. **Link concepts** - Cross-reference related docs
6. **Track dead ends** - Store what didn't work

## Knowledge to Store

| Type | Content |
|------|---------|
| Ideas | Core concept, target users, features |
| Research | Existing solutions, gaps, opportunities |
| Architecture | Components, tech stack decisions |
| Decisions | Rationale, alternatives considered |
| Challenges | Blockers, open questions |
| Learnings | Prototype insights, feedback |

## Multi-Component Projects

For projects like Cadence:
```bash
rg --files -g "**/package.json" ideas/voice-coding-assistant/
rg -g "*.ts" "import.*cadence" ideas/voice-coding-assistant/
```

## Best Practices

1. Document everything - ideas evolve
2. Store research in project artifacts
3. Track dead ends (prevent repeating mistakes)
4. Use scoped searches (`rg -g`) before broad reads

## Meta Learnings

- Always commit changes with a self-chosen message; do not ask for one.
- Always open a PR for changes; do not push directly to main.
- Verify repo contents before answering status questions; inspect the tree first to avoid incorrect claims.
- Always pull latest `main` and rebase your branch on `main` at the start of each new request.
- After rebasing, force-push with lease if the branch diverges from the PR head.
- Keep one task in one PR; do not create multiple PRs for the same request.
- Record research inputs in `.cursor/artifacts/` or project artifacts to preserve source context.
