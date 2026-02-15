# Memory Map

Guide to how memory is organized and maintained.

## Memory Layers

### Session-Bound
- **Type:** Current conversation context
- **Lifetime:** Single session
- **Retention:** Lost after session ends
- **Use:** Temporary task state, one-off decisions

### Daily (`memory/YYYY-MM-DD.md`)
- **Type:** Raw notes + context
- **Lifetime:** 7 days (rotated weekly)
- **Retention:** Archived, not reviewed unless needed
- **Use:** "What happened today?" + "Why did we decide this?"

**Example entries:**
```markdown
## 2026-02-15 (Sunday)

### Testing
- Ran eth2-quickstart tests: 515/515 passed ✅
- Deployed docker locally successfully
- Remote eth2-claw ready for Phase 2

### Decisions
- Went with Phase 1 (local docker) → Phase 2 (remote) flow
- Reason: Catch Docker issues early before deploying to constrained server

### Blockers
- None
```

### Long-Term (`MEMORY.md`)
- **Type:** Curated insights + durable decisions
- **Lifetime:** Permanent (updated weekly)
- **Retention:** Git history preserved
- **Use:** "What matters long-term?" + "How do we operate?"

**Contents:**
- Key decisions + reasoning
- Operational baseline
- Git & deployment practices
- Risk lessons learned
- People & preferences

**Review cadence:** Every Friday (heartbeat)

---

## Memory Maintenance

### Daily Workflow
1. Session starts → read `SOUL.md`, `USER.md`, `MEMORY.md`
2. During session → capture key events in `memory/YYYY-MM-DD.md`
3. Session ends → no action (daily file auto-persists)

### Weekly Workflow (Friday Heartbeat)
1. Read `memory/YYYY-MM-DD.md` from past 7 days
2. Identify significant patterns + decisions
3. Update `MEMORY.md` with distilled insights
4. Clean up stale entries
5. Commit to git

### Monthly Workflow (First Sunday)
1. Review all files in `docs/`
2. Update freshness timestamps
3. Run `linters/doc_freshness.sh`
4. Open PRs for stale docs
5. Commit linter updates

---

## Memory Governance

### What Goes Where?

| Item | Goes To | Why |
|------|---------|-----|
| "Did X work today?" | `memory/YYYY-MM-DD.md` | Raw log |
| "We decided to always Y" | `MEMORY.md` | Durable rule |
| "API endpoint is Z" | `docs/DOMAIN.md` | Reference |
| "System is struggling with W" | `docs/OPERATIONS.md` | Infrastructure issue |
| "User prefers V" | `USER.md` | Personal context |

### Cleanup Rules

- **Daily files >2 weeks old:** Archive to `memory/archive/`
- **MEMORY.md entries:** Reviewed for relevance monthly
- **Docs:** Auto-flagged if unchanged >30 days
- **Stale links:** CI fails if `docs/` refs external URLs

---

## Tools & Automation

### Heartbeat Script
```bash
# In HEARTBEAT.md (runs every heartbeat)
1. Check core services
2. Check resources
3. Read MEMORY.md
4. Scan memory/YYYY-MM-DD.md
5. Flag any urgent items
```

### Memory Gardening (Weekly)
```bash
# Background cron job (Friday 22:00 UTC)
./scripts/memory_gardening.sh
# - Finds stale entries
# - Updates doc timestamps
# - Suggests PRs for cleanup
```

---

## For Agents Reading Memory

1. **Start here:** `SOUL.md` (who am I?)
2. **Then:** `USER.md` (who am I helping?)
3. **Then:** `MEMORY.md` (what matters?)
4. **Then:** `docs/` (what do I need to know?)
5. **Then:** Today's `memory/YYYY-MM-DD.md` (what happened?)

**Rule:** If it's not in git or `memory/`, it doesn't exist.

---

_Last reviewed: 2026-02-15 | Next review: 2026-02-22_
