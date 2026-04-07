# Ideas & Research Guide

> **Master rules:** `.cursorrules` | **Token efficiency:** `/token-reduce` skill | **Benchmarks:** `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`

## Git & Workflow

See `.cursorrules` **Git Discipline** and **Meta Learnings** sections for shared rules (PRs, rebasing, attribution, hooks).

Quick reminder for Ideas PRs:
- `**Agent:**` in PR descriptions must match the **actual model used** (don’t copy example model names).
- `**Co-authored-by:**` in PR descriptions should be the **human** (Chimera).

## Projects

### SpecForge (Collaborative Spec Studio) - 📐 Build In Progress
**Location:** `ideas/collab-markdown-spec-studio/`

Multiplayer Markdown workspace for humans + AI agents to co-author PRDs/specs with section-level patch proposals, merge controls, and provenance. Phase 2: one-click starter repo generation.

**Key docs:** `EXECUTIVE_SUMMARY.md`, `PRD.md`, `SPEC.md`, `ARCHITECTURE_DECISIONS.md`, `STATE_MODEL.md`, `OPEN_QUESTIONS.md`

**Current implementation stack:** Tiptap + Yjs + Hocuspocus + Next.js 16 + embedded PGlite for local persistence + GitHub OAuth pilot hooks + Node parity runner

**Status:** Local MVP exists and is being hardened. The actual runnable surface lives in `web/` and `collab-server/`; use `FIRST_60_MINUTES.md` and `web/README.md` instead of older pre-build assumptions.

### Intelligence Exchange - 🏪 Spec-Ready
**Location:** `ideas/intelligence-exchange/`

AI job execution marketplace: buyers submit jobs, workers run a local CLI using their own API keys, platform brokers matching/scoring/settlement via Stripe Connect.

**Key docs:** `EXECUTIVE_SUMMARY.md`, `PRD.md`, `SPEC.md`, `ARCHITECTURE_DECISIONS.md`, `OPEN_QUESTIONS.md`, `STATE_MODEL.md`

**Tech stack (decided):** Hono+Bun broker + BullMQ+Redis queue + TypeScript CLI worker + Postgres ledger + Stripe Connect payouts

**MVP task types:** Code review, test generation, PR summary (all auto-scorable via CI/lint/tests).

**Critical blocker:** Provider ToS legal review required before launch (see `OPEN_QUESTIONS.md` Q6).

**Status:** Spec-ready; legal review + open question resolution required before one-shot build.

### YieldBasis Stablecoin Derivatives - 🧪 Spec-Ready
**Location:** `ideas/yieldbasis-stablecoin-derivatives/`

Structured stable derivatives layered on top of YieldBasis Hybrid Vaults and veYB incentive rails, with explicit modeling of TRD, cap, emissions, and lock fault domains.

**Key docs:** `EXECUTIVE_SUMMARY.md`, `PRD.md`, `SPEC.md`, `ADVERSARIAL_REVIEW.md`, `TASKS.md`

**Status:** Early spec-ready; strong concept if it stays honest about cross-protocol fault domains.

### Voice Coding Assistant (Cadence) - 🧪 Prototype
**Location:** `ideas/voice-coding-assistant/`

Multi-platform voice-controlled coding assistant:
- cadence-backend - Backend services
- cadence-api - API layer (Fastify + TS, 77 tests passing)
- cadence-app - Main application
- cadence-web-frontend - Web interface (Next.js)
- cadence-prototype - POC
- cadence-setup - Configuration

**Status:** Research/prototype phase — Phase 1 MVP complete, Phase 2 in progress.

### Automated Trading System - 📊 Research
**Location:** `ideas/automated-trading-system/`

Automated trading system with:
- `docs/` - Strategy documentation
- `src/` - Implementation code (Python, asyncio)
- `tests/` - Test suite
- `SPEC.md` - Technical specification

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

### Orbit Pilot - V0 CLI
**Specs:** `ideas/orbit-pilot/`  
**App:** `apps/orbit-pilot/` (install: `pip install -e 'apps/orbit-pilot/[dev]'`, CLI: `orbit`)

Compliance-first launch ops CLI: plan → generate per-platform packs → optional API publish (GitHub, DEV, Medium, LinkedIn, X when configured) → manual queue + SQLite audit.

### Conceptual Ideas

| Idea | Description | Status |
|------|-------------|--------|
| OAuth Auto-Setup | AI-driven third-party service provisioning | 💭 Concept |
| Self-Hosted Infra | Coolify evaluation, PaaS alternatives | 💭 Exploration |
| Mobile AI Agent | Native app with camera, location, offline support | 💭 Concept |
| Clawdbot Launchpad | Hosted Clawdbot/Moltbot on VPS or containers | 💭 Concept |
| AgentRadar | ERC-8004 DeFi agent credit with Ethos vouching | 💭 Concept |

## Core Principles

1. **Build output first** - decide what artifact exists at the end before expanding the doc pack.
2. **UI is part of the spec** - for human-facing products, treat screens, state transitions, and design-system rules as first-class requirements.
3. **Determinism over prose** - fixtures, contracts, acceptance checks, and bootstrap commands matter more than extra narrative docs.
4. **Prototype fast** - rapid iteration still matters, but scope cuts must stay explicit.
5. **Link concepts** - connect related ideas without letting comparison docs outrun buildability.

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

1. Strengthen canonical docs before creating new ones.
2. For GUI products, require a golden path, failure path, and screen inventory before calling the pack build-ready.
3. Treat `FIRST_60_MINUTES.md`, `ACCEPTANCE_TEST_MATRIX.md`, `fixtures/`, and runtime/package layout as the minimum one-shot build contract.
4. Make competitor docs, scorecards, and meta docs optional unless the product stage clearly justifies them.
5. Use scoped searches (`rg -g`) before broad reads.

## Ideas-Specific Learnings

- Verify repo contents before answering status questions; inspect the tree first to avoid incorrect claims.
- Always commit with a self-chosen message; do not ask for one.
- When an idea graduates into a runnable repo, prefer the real build/docs surfaces (`web/README.md`, `FIRST_60_MINUTES.md`, package READMEs, verification commands) over older planning docs.
- If the pack cannot answer "what do we get at the end?" in one paragraph, it is not build-ready yet.
