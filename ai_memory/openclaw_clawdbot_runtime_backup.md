# OpenClaw / Clawdbot Runtime Backup (Sanitized)

This file captures high-signal runtime memory/soul/tooling state from the root
install paths, with secrets intentionally redacted.

## Source Paths (Root Host)

- Install repo: `/root/openclaw`
- Runtime state: `/root/.openclaw`
- Active workspace used by OpenClaw/Clawdbot: `/root/clawd`
- Workspace memory logs: `/root/clawd/memory/*.md`

## Memory + Soul Surfaces

- Workspace persona/safety files:
  - `/root/clawd/SOUL.md`
  - `/root/clawd/AGENTS.md`
  - `/root/clawd/MEMORY.md`
  - `/root/clawd/TOOLS.md`
  - `/root/clawd/HEARTBEAT.md`
- OpenClaw memory store:
  - `/root/.openclaw/memory/main.sqlite`
  - `/root/.openclaw/memory/main.sqlite.tmp-*`
- OpenClaw memory docs/templates:
  - `/root/openclaw/docs/concepts/memory.md`
  - `/root/openclaw/docs/cli/memory.md`
  - `/root/openclaw/docs/reference/templates/SOUL.md`
  - `/root/openclaw/docs/hooks/soul-evil.md`

## Config Snapshot (Sanitized)

Source files:
- `/root/.openclaw/openclaw.json`
- `/root/.openclaw/clawdbot.json`

Key retained state:
- Default agent workspace: `/root/clawd`
- Default primary model:
  - OpenClaw: `openai-codex/gpt-5.3-codex`
  - Clawdbot: `openai-codex/gpt-5.2-codex`
- Auth mode: OAuth profile present for `openai-codex:default`
- Telegram channel enabled (token/user IDs redacted)
- Gateway local mode on port `18789` (auth token redacted)
- Internal hooks enabled:
  - `boot-md`
  - `command-logger`
  - `session-memory`

Redacted secrets:
- bot tokens
- gateway tokens
- allowlist IDs

## Workspace Memory Notes Present

Observed files in `/root/clawd/memory/`:
- `2026-02-09.md`
- `2026-02-11.md`
- `2026-02-12.md`
- `2026-02-12-0705.md`

Themes in these notes:
- model/version shifts
- gateway conflict fix and service stabilization
- disk cleanup outcomes
- durable user workflow preferences

## Global AI Tools + Skills Relevant To This Stack

- Codex global skills:
  - `/root/.codex/skills/napkin/SKILL.md`
  - `/root/.codex/skills/token-reduce/SKILL.md`
  - `/root/.codex/skills/.system/skill-creator/SKILL.md`
  - `/root/.codex/skills/.system/skill-installer/SKILL.md`
- Claude global skills:
  - `/root/.claude/skills/napkin/SKILL.md`
  - `/root/.claude/skills/claudeception/SKILL.md`

## Why This Backup Exists

- Preserve where memory and soul state actually lives on this machine.
- Preserve model/tooling defaults needed for continuity.
- Keep durable references in-repo without leaking runtime secrets.

## Bootstrap Bundle

Use this with the portable seed in:

- `ai_memory/bootstrap/openclaw_clawdbot_seed/README.md`
