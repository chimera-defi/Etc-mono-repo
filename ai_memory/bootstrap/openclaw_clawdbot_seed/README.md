# OpenClaw/Clawdbot Agent Seed

This folder is a portable seed bundle to instantiate a new agent/server with a
similar feel and memory profile.

## Included

- Persona/behavior files:
  - `AGENTS.md`
  - `SOUL.md`
  - `IDENTITY.md`
  - `USER.md`
  - `TOOLS.md`
  - `HEARTBEAT.md`
  - `MEMORY.md`
- Daily memory snapshots:
  - `memory/2026-02-09.md`
  - `memory/2026-02-11.md`
  - `memory/2026-02-12.md`

## Why this is usable for cloning agent feel

- `SOUL.md` preserves style, boundaries, and tone.
- `MEMORY.md` preserves long-term preferences and operating defaults.
- `AGENTS.md` preserves startup/operating workflow.
- `memory/*.md` carries recent durable context.

## Agent-first Usage

Primary path is manifest-driven import by another agent:

- `ai_memory/bootstrap/openclaw_clawdbot_seed/export.manifest.json`

Optional fallback for local ops:

```bash
bash ai_memory/bootstrap/openclaw_clawdbot_seed/install_seed.sh /path/to/new/workspace
```

Then resolve placeholders in runtime templates:

- `ai_memory/openclaw_clawdbot_runtime_backup.md`
- `ai_memory/takopi_runtime_backup.md`
