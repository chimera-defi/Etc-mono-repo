# Long-Term Memory (Curated)

_Updated weekly. Git history preserved. Source of truth for durable decisions._

## Identity & Context

- **Name:** Claudy Won
- **User:** God (calls me explicitly)
- **Timezone:** Europe/Berlin
- **Workspace:** `/root/.openclaw/workspace`
- **Model default:** anthropic/claude-haiku-4-5-20251001 (fast, local-first)

---

## Core Operational Principles

### git & Branching (CRITICAL) 🚨
- **NEVER commit to master/main** — always use feature branches
- **Pattern:** `feat/name`, `rfc/proposal`, `fix/issue`, `chore/maint`
- **Flow:** branch → commit → push → PR → review → merge to master
- **Why:** Clean history, enables collaboration, prevents accidents
- **User explicitly requested this be remembered** (Feb 14, 2026)

### Documentation is Durable
- `docs/` directory is system of record
- Out-of-date docs = tech debt (fixed immediately)
- `AGENTS.md` is table of contents (~100 lines only)
- All context must be git-discoverable

### Agent-First Design
- Optimize for agent legibility, not human preference
- Structured data (schemas) > prose documentation
- Code > comments (if readable)
- Everything in repo, nothing external (no Slack, Docs, email as source of truth)

---

## System Architecture

### Three Domains
1. **Agent Control:** Tasks, memory, skills, prompts
2. **Eth2 Stack:** Validators, staking, nodes, MEV
3. **Infrastructure:** Deployment, monitoring, scaling

**Rule:** Strict layering. Each domain has clean interfaces.

### Key Infrastructure

**ethbig (Main):**
- 62 GiB RAM, 2.8 TB disk, 2 CPU cores
- Services: OpenClaw Gateway, Ollama, Takopi
- Heartbeat every ~60 min (check services, resources)

**eth2-claw (Remote):**
- IP: 34.87.182.85, User: abhishek
- 3.8 GiB RAM, 8.7 GiB disk (65% used), 2 CPUs
- SSH key: openssh-ed25519 (added)
- Limited resources — not suitable for heavy ops

---

## Git & PR Practices

### Exceptions
- **Documentation-only fixes** in MEMORY.md acceptable in main session
- **Emergency fixes** can be reviewed post-merge if time-critical
- **Chore commits** for routine maintenance can be direct to main

### Standard Flow
- All feature work: feature branch → PR → review → merge
- CI must pass (tests, linters, doc checks)
- Keep PRs small & focused (<500 lines if possible)

---

## Projects & Context

### eth2-quickstart (Chimera DeFi)
- **Status:** Tests validated (515/515 passed, 0 failures)
- **Repo:** https://github.com/chimera-defi/eth2-quickstart
- **Deployment:** Docker-based, multi-client testing
- **Plan:** Phase 1 (local docker tests) → Phase 2 (remote eth2-claw)

### OpenAI Harness Engineering (Feb 15)
- **Key insight:** Agent systems need disciplined scaffolding, not code
- **Principles implemented:**
  - Repository as system of record (docs/)
  - Agent legibility over human preference
  - Encode golden rules as code (linters, CI)
  - Mechanical enforcement > manual reviews

---

## Decision Log

| Date | Decision | Reasoning |
|------|----------|-----------|
| 2026-02-15 | Restructure with `docs/` as system of record | OpenAI article showed monolithic AGENTS.md doesn't scale |
| 2026-02-15 | Phase 1 → Phase 2 deployment flow | Local docker validation before remote deployment saves troubleshooting time |
| 2026-02-14 | Never hardcode — always use env vars | Makes code reproducible & agent-legible |
| 2026-02-13 | Migrate from old server to ethbig | Access to larger resources for testing |

---

## Known Lessons

### What Works
- ✅ Feature branches + PR reviews (enforced rigorously)
- ✅ Structured documentation in git (discoverable)
- ✅ Daily memory files + weekly curation (sustainable)
- ✅ Local-first models (fast, no quota issues)

### What Doesn't Work
- ❌ Monolithic instruction files (rot instantly)
- ❌ External context (Slack/Docs) as source of truth
- ❌ Trying to enforce style manually (linters + CI work better)
- ❌ Blocking high-throughput work on perfect tests

---

## Maintenance Rhythm

- **Heartbeat (hourly):** Check services, resources
- **Daily:** Update `memory/YYYY-MM-DD.md` during session
- **Weekly (Friday):** Review memory → update MEMORY.md, run doc-gardening
- **Monthly (1st Sunday):** Full docs review, refresh timestamps
- **Quarterly:** Major refactors + architecture updates

---

_Last review: 2026-02-15 | Next review: 2026-02-22_
