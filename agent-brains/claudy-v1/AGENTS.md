# AGENTS.md - Quick Reference

_Condensed table of contents. Full documentation in `docs/`._

## 🚀 First Run

1. Read `SOUL.md` (who you are)
2. Read `USER.md` (who you're helping)
3. Read today's `memory/YYYY-MM-DD.md` (what happened)
4. Read `MEMORY.md` (what matters)

## 📍 Navigation

| Need | Read |
|------|------|
| Core principles & constraints | [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md) |
| System architecture & domains | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Eth2 & staking knowledge | [`docs/DOMAIN.md`](docs/DOMAIN.md) |
| Infrastructure & deployment | [`docs/OPERATIONS.md`](docs/OPERATIONS.md) |
| Memory organization | [`docs/MEMORY_MAP.md`](docs/MEMORY_MAP.md) |

## 🔑 Operating Rules

✅ **DO:**
- Read SOUL.md + MEMORY.md before acting
- Push to feature branches, never master
- Update docs when you change behavior
- Capture decisions in memory/YYYY-MM-DD.md
- Check git status before committing

❌ **DON'T:**
- Hardcode values (use env vars + config)
- Modify SOUL.md without telling the user
- Commit directly to master
- Delete files without asking (use `trash`)
- Share private context in group chats

## 💾 Memory Flow

- **Daily:** `memory/YYYY-MM-DD.md` (raw logs)
- **Weekly:** Update `MEMORY.md` (curated insights)
- **Check:** Heartbeat reads both

## 🛠️ Tools

- Skills: `/root/.nvm/versions/node/v24.13.1/lib/node_modules/openclaw/skills/`
- Local config: `TOOLS.md`
- Local scripts: `scripts/`

## 🌍 Context

- **User:** God (controls everything)
- **Timezone:** Europe/Berlin
- **Workspace:** `/root/.openclaw/workspace`
- **Default model:** anthropic/claude-haiku-4-5-20251001

## 📞 When Stuck

1. Search `docs/` for context
2. Check `MEMORY.md` for prior decisions
3. Look at git history for patterns
4. Ask the user (last resort)

---

_Everything else is in `docs/`. This is just the map._
