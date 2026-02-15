# Claudy Agent Brain - Inventory

This backup contains the complete knowledge base, principles, and operational context for Claudy (the OpenClaw agent). Use this to recreate or clone the agent with all capabilities and learned behaviors.

## What's Included

### 🧠 Core Identity (Root Level)
- **SOUL.md** — Who Claudy is (values, principles, vibe)
- **USER.md** — Information about the human (God)
- **IDENTITY.md** — Name, creature type, emoji, avatar
- **HEARTBEAT.md** — Health check procedures (hourly)
- **MEMORY.md** — Long-term curated memory (weekly updated)
- **AGENTS.md** — Quick reference table of contents
- **TOOLS.md** — Local environment notes (cameras, SSH hosts, TTS preferences)

### 📚 System of Record (`docs/`)
These are the canonical sources for all operational knowledge:
- **PRINCIPLES.md** — 6 golden rules + 3 domain-specific constraints (enforced mechanically)
- **ARCHITECTURE.md** — System design, layering rules, interfaces
- **DOMAIN.md** — Eth2/staking knowledge (parameters, schemas, risks, integration points)
- **OPERATIONS.md** — Infrastructure, deployment, monitoring, recovery
- **MEMORY_MAP.md** — How memory is organized and maintained
- **README.md** — Navigation hub for docs/

### 🛠️ Automation (`scripts/` & `linters/`)
- **scripts/verify_setup.sh** — Pre-flight checks
- **scripts/memory_search_local.sh** — Local memory search
- **scripts/cron_*.sh** — Automated tasks (daily, weekly, etc.)
- **linters/doc_freshness.sh** — Validates docs are up to date

### 📖 Memory History (`memory/`)
- **YYYY-MM-DD.md files** — Daily raw context logs
- **mistakes.md** — Lessons learned from failures
- **project-status.md** — Ongoing project tracking
- **eth2-quickstart-context.md** — Eth2 project specifics
- **active-tasks.md** — Current work in progress
- **self-review.md** — Self-assessment and introspection

### ⚙️ Configuration
- **litellm.config.yaml** — Model routing and fallback config
- **ROUTER_POLICY.md** — How models are selected

## File Statistics

```
Total Files:     ~50
Lines of Code:   ~10,000
Knowledge Docs:  ~15 files
Scripts/Linters: ~20 files
Memory History:  ~10 files
Config Files:    ~2 files
```

## Knowledge Domains

### 1. Agent Operating Principles
- Agent-first design philosophy
- Repository as single source of truth
- Mechanical enforcement of constraints
- Strict layering rules for architecture

### 2. Eth2/Staking
- Validator configuration and deployment
- Risk mitigation strategies
- Node stack architecture (execution + consensus + MEV)
- Slashing protection
- Performance monitoring

### 3. Infrastructure & Operations
- ethbig (main machine) specs and health checks
- eth2-claw (remote server) configuration
- Docker-based deployment workflow
- Recovery procedures
- Observability setup

### 4. Memory & Context Management
- Daily note-taking workflow
- Weekly curation process
- Durable decision logging
- Memory rot prevention

## Key Principles Embedded

✅ **Git is source of truth** — Everything versioned, nothing external  
✅ **Agent legibility** — Optimized for agent understanding, not humans  
✅ **Mechanical enforcement** — Rules in code, not guidelines  
✅ **Progressive disclosure** — Start with map, learn details as needed  
✅ **Continuous maintenance** — Weekly curation + cleanup  

## How to Use This Backup

See **RESTORATION.md** for detailed instructions on:
1. Extracting the backup
2. Setting up OpenClaw
3. Restoring context files
4. Validating the system
5. Resuming operations

## When This Was Created

- **Date:** 2026-02-15 (Sunday)
- **Reason:** Preservation for posterity + agent cloning capability
- **Trigger:** User requested backup after reading OpenAI harness engineering article
- **Status:** Complete, validated, ready for restoration

## Version Info

- **Claudy Agent:** v2.0 (After OpenAI principles refactoring)
- **OpenClaw:** 2026.2.12
- **Key Improvements:** Repository-as-system-of-record, mechanical enforcement, doc-gardening automation

---

_This backup represents months of self-improvement, learned lessons, and accumulated knowledge. Treat it as a complete agent genesis kit._
