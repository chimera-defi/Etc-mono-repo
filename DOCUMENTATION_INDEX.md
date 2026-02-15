# Documentation Index (Current)

**Purpose:** Single source of truth for all workspace docs  
**Last updated:** 2026-02-14 10:30 GMT+1

---

## 📋 Active Documentation (USE THESE)

### Core Identity & Memory
- **SOUL.md** — Personality, vibe, core truths
- **USER.md** — About your human (God), timezone, preferences
- **IDENTITY.md** — Self-identity (name, emoji, who you are)
- **MEMORY.md** — Condensed long-term memory (50 words, lessons + user context)
- **AGENTS.md** — Session startup guide, what to read and when

### Operational Guides
- **HEARTBEAT.md** — What to check during heartbeat runs (service health)
- **HEARTBEAT_OPTIMIZED.md** — Optimized heartbeat (isolated, cheap model)
- **LOADING_STRATEGY.md** — Conditional file loading per task type (NO consolidation)
- **TOOLS.md** — Available tools and when to use them

### Token Reduction Strategy (Complete Documentation)
- **GLOBAL_TOKEN_REDUCTION_PLAN.md** ← **START HERE** (phased 2-week deployment)
- **SESSION_ISOLATION_RULES.md** — Main vs isolated sessions
- **SUBAGENT_INJECTION_CONTROL.md** — Scope templates, injection limits
- **CRON_JOB_STRATEGY.md** — Batched jobs (4 planned, 8 old scattered ones)
- **LONG_SESSION_COMPACTION.md** — Auto-compress history at 30 min
- **system_prompt_summary.md** — Lightweight system prompt summary (inject per-turn)

### Memory Files (For Continuity)
- **active-tasks.md** — Current work + crash recovery (read FIRST on restart)
- **project-status.md** — Real-time dashboard of all projects
- **mistakes.md** — Error log (learn once, prevent repeats)
- **self-review.md** — 4-hour checkpoints (agent self-critique)
- **daily-logs.md** — Raw notes (delete after 7 days)

### Special Documentation
- **CONSOLIDATION_MISTAKE.md** — Lesson learned: don't consolidate files, use conditional loading
- **CRITICAL_BACKUP.md** — Backup strategy for IDENTITY.md + system_prompt.md
- **TOKEN_REDUCTION_AUDIT.md** — Detailed analysis of what we kept (no data loss)

---

## ⚠️ Deprecated / Experimental (IGNORE THESE)

- **TOKEN_REDUCTION_COMPLETE.md** ← Superseded by GLOBAL_TOKEN_REDUCTION_PLAN.md
- **TOKEN_REDUCTION_SYSTEMATIC.md** ← Superseded by GLOBAL_TOKEN_REDUCTION_PLAN.md
- **MODEL_ROUTING.md** ← Superseded by SUBAGENT_INJECTION_CONTROL.md + SESSION_ISOLATION_RULES.md
- **ROUTER_POLICY.md** ← Experimental, not used
- **AGGREGATE_SUMMARY.md** ← Benchmark results (archived, not current)

(Keep these files for historical reference, but don't maintain them)

---

## 🎯 For Different Purposes

### Just Starting Session?
1. Read **SOUL.md** (who you are)
2. Read **USER.md** (who you're helping)
3. Read **memory/YYYY-MM-DD.md** (today's notes, if any)

### Heartbeat Check?
- Use **HEARTBEAT.md** (original) OR **HEARTBEAT_OPTIMIZED.md** (new, isolated+cheap)

### About Token Reduction?
- Read **GLOBAL_TOKEN_REDUCTION_PLAN.md** (overview + phased checklist)
- Then read specific docs (SESSION_ISOLATION_RULES.md, etc.)

### Implementing Token Reduction?
- Follow **GLOBAL_TOKEN_REDUCTION_PLAN.md** week-by-week
- Days 1-2: **HEARTBEAT_OPTIMIZED.md** + **CRON_JOB_STRATEGY.md**
- Days 3-4: **SESSION_ISOLATION_RULES.md**
- Days 5-6: **SUBAGENT_INJECTION_CONTROL.md**
- Days 7+: **LONG_SESSION_COMPACTION.md** + optimization

### Crash Recovery?
1. Read **active-tasks.md** FIRST (what was running?)
2. Read **project-status.md** (where are we?)
3. Resume from **active-tasks.md** instructions

---

## 📊 File Organization

```
/root/.openclaw/workspace/
├── SOUL.md .......................... Personality
├── USER.md .......................... User context
├── IDENTITY.md ...................... Self-identity
├── MEMORY.md ........................ Long-term memory (50 words)
├── AGENTS.md ........................ Session startup guide
├── HEARTBEAT.md ..................... Heartbeat checklist
├── HEARTBEAT_OPTIMIZED.md ........... Optimized heartbeat (isolated)
├── LOADING_STRATEGY.md .............. Conditional loading rules
├── TOOLS.md ......................... Tool reference
├── system_prompt.md ................. Full system rules (cache on startup)
├── system_prompt_summary.md ......... Summary (inject per-turn)
│
├── GLOBAL_TOKEN_REDUCTION_PLAN.md ... 🔴 START HERE for token work
├── SESSION_ISOLATION_RULES.md ....... Main vs isolated sessions
├── SUBAGENT_INJECTION_CONTROL.md .... Scope + injection templates
├── CRON_JOB_STRATEGY.md ............. Batched jobs strategy
├── LONG_SESSION_COMPACTION.md ....... Auto-compaction spec
│
├── CONSOLIDATION_MISTAKE.md ......... Lesson: files stay separate
├── CRITICAL_BACKUP.md .............. Backup strategy
├── TOKEN_REDUCTION_AUDIT.md ......... What we kept (no data loss)
│
├── memory/
│   ├── active-tasks.md .............. CRASH RECOVERY (read first!)
│   ├── project-status.md ............ Real-time dashboard
│   ├── mistakes.md .................. Error log
│   ├── self-review.md ............... 4-hour checkpoints
│   ├── daily-logs.md ................ Raw notes (delete after 7 days)
│   └── YYYY-MM-DD.md ................ Daily logs
│
└── [DEPRECATED]
    ├── TOKEN_REDUCTION_COMPLETE.md
    ├── TOKEN_REDUCTION_SYSTEMATIC.md
    ├── MODEL_ROUTING.md
    ├── ROUTER_POLICY.md
    └── (keep for archive, don't update)
```

---

## 🚀 Quick Reference

**I don't know what to do:** Read **AGENTS.md**  
**System check:** Read **HEARTBEAT.md**  
**Token bloat issue:** Read **GLOBAL_TOKEN_REDUCTION_PLAN.md**  
**Crash recovery:** Read **active-tasks.md**  
**Session startup:** Read **SOUL.md** → **USER.md** → **MEMORY.md**  
**Current project status:** Read **project-status.md**  

---

**This index is the source of truth. Use it to navigate.**
