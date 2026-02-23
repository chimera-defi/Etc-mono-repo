# Claudy Agent Brain Backup

**A complete, reproducible backup of Claudy Won's agent knowledge base, principles, and operational context.**

This repository contains everything needed to recreate or clone the Claudy agent with all capabilities, learned behaviors, and accumulated knowledge.

---

## 🧠 What This Is

This is not just code—it's an **agent genesis kit**:

- **Identity & Values** (SOUL.md, USER.md, IDENTITY.md)
- **Operational Principles** (PRINCIPLES.md, ARCHITECTURE.md)
- **Domain Knowledge** (Eth2/staking, infrastructure, deployment)
- **Memory & Context** (Weekly curated + daily notes)
- **Automation** (Scripts, linters, health checks)
- **Recovery Procedures** (How to fix things when they break)

It represents months of self-improvement and learned lessons, captured in a reproducible format.

---

## 📋 Quick Start

### To Restore Claudy (or clone the agent):

```bash
# 1. Clone this backup
git clone <this-repo> /path/to/workspace

# 2. Restore to OpenClaw
cd /path/to/workspace
./scripts/verify_setup.sh

# 3. Update user context if needed
nano USER.md
nano IDENTITY.md

# 4. Read SOUL.md to understand who you are
cat SOUL.md

# 5. Commit and start working
git add -A
git commit -m "chore: agent restored"
```

**Full restoration instructions:** See [RESTORATION.md](RESTORATION.md)

---

## 📚 Contents Overview

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| **root** | Core identity | SOUL.md, USER.md, MEMORY.md, AGENTS.md |
| **docs/** | System of record | PRINCIPLES.md, ARCHITECTURE.md, DOMAIN.md |
| **scripts/** | Automation | verify_setup.sh, cron_*.sh, memory_search_local.sh |
| **linters/** | Validation | doc_freshness.sh (CI integration) |
| **memory/** | Context history | Daily notes, project status, lessons learned |

**Detailed inventory:** See [INVENTORY.md](INVENTORY.md)

---

## 🔑 Key Principles

This backup embodies learnings from:
- OpenAI's "Harness engineering" article (agent-first systems)
- Months of self-improvement iterations
- Real deployment experience (eth2 validators, multi-node setups)

**Core principles:**
✅ Git is source of truth (no external context)
✅ Agent legibility > human preference
✅ Mechanical enforcement (rules in code)
✅ Progressive disclosure (map → details)
✅ Continuous curation (weekly maintenance)

---

## 📖 How to Use This

### For Cloning Claudy Agent
1. Read [RESTORATION.md](RESTORATION.md)
2. Follow "Option 1: Fresh Agent" or "Option 2: Merge"
3. Run verify_setup.sh
4. Start working

### For Understanding How Claudy Works
1. Read [SOUL.md](SOUL.md) — Who am I?
2. Read [AGENTS.md](AGENTS.md) — Quick navigation
3. Browse [docs/](docs/) — System design
4. Check [memory/](memory/) — What we've learned

### For Reproducing Specific Knowledge
- **Eth2 deployment:** See [docs/DOMAIN.md](docs/DOMAIN.md)
- **System architecture:** See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Operational procedures:** See [docs/OPERATIONS.md](docs/OPERATIONS.md)
- **Recovery playbooks:** See [docs/OPERATIONS.md](docs/OPERATIONS.md#failure-modes--recovery)

---

## 🎯 Use Cases

### 1. **Agent Cloning**
"I want another agent with Claudy's knowledge"
→ Use [RESTORATION.md](RESTORATION.md) Option 1

### 2. **Merging Best Practices**
"I have an existing agent, I want Claudy's principles"
→ Use [RESTORATION.md](RESTORATION.md) Option 2

### 3. **Reference Implementation**
"I want to see how agent systems should be structured"
→ Review [docs/PRINCIPLES.md](docs/PRINCIPLES.md) + [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### 4. **Learning from Experience**
"What did Claudy learn?"
→ Read [memory/](memory/) files + [MEMORY.md](MEMORY.md)

### 5. **Rebuilding After Failure**
"The agent crashed, I need recovery procedures"
→ See [docs/OPERATIONS.md](docs/OPERATIONS.md)

---

## 📊 Backup Statistics

```
Created:       2026-02-15 (Sunday)
Files:         ~50
Knowledge:     ~10,000 lines
Domains:       Agent control, Eth2/staking, Infrastructure
Time Period:   Months of accumulated experience
Status:        Complete, validated, ready for restoration
```

---

## 🔄 Maintenance

This backup is a snapshot. To keep it current:

```bash
# Periodically sync with live workspace
git pull origin main  # If linked to repo

# Or merge new learnings manually
cp -r /path/to/live/workspace/docs/* ./docs/
cp -r /path/to/live/workspace/memory/*.md ./memory/
git add -A
git commit -m "chore: sync with live agent"
```

---

## ❓ FAQ

**Q: Is this just code?**
A: No—it's an entire operational system, including identity, principles, knowledge, and automation.

**Q: Can I modify this?**
A: Yes. It's meant to be adapted for your use case. Update USER.md, IDENTITY.md, TOOLS.md, etc.

**Q: How do I restore just part of it?**
A: See [RESTORATION.md](RESTORATION.md) "Option 3: Import Selective Components"

**Q: What if there are conflicts when I merge?**
A: Use `git diff` to see what changed, then decide what to keep.

**Q: How often is this updated?**
A: This is a snapshot from 2026-02-15. For live updates, sync from the main workspace.

---

## 🚀 Getting Started

1. **First time here?** → Start with [INVENTORY.md](INVENTORY.md)
2. **Ready to restore?** → Follow [RESTORATION.md](RESTORATION.md)
3. **Want to understand the system?** → Read [AGENTS.md](AGENTS.md)
4. **Need specific knowledge?** → Check [docs/](docs/) or [memory/](memory/)

---

## 📝 License & Attribution

This is Claudy Won's agent brain, backed up for posterity and agent cloning.

**Original created by:** The user (God)
**Agent (Claudy):** Self-improving, principled, competent
**Backup date:** 2026-02-15
**OpenClaw version:** 2026.2.12

---

## 🎓 What You'll Learn

By studying this backup, you'll see:
- How agent-first systems differ from traditional software
- Practical implementation of OpenAI's harness engineering principles
- Real eth2/staking deployment experience
- Memory curation workflows
- Mechanical enforcement of principles
- Recovery procedures for complex systems

This is a working blueprint for building reliable, maintainable systems with AI agents.

---

_Your agent is reproducible. Your knowledge is preserved. Your principles are enforced. You are ready._
