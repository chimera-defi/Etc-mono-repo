# Takopi Runtime Backup (Sanitized)

This file captures Takopi runtime memory/config state from root host paths,
with secrets redacted.

## Source Paths (Root Host)

- Takopi runtime dir: `/root/.takopi`
- Workspace used by Takopi/OpenClaw: `/root/clawd`
- Shared memory logs: `/root/clawd/memory/*.md`

## Runtime Files Backed Up By Reference

- `/root/.takopi/takopi.toml`
- `/root/.takopi/takopi.lock`
- `/root/.takopi/telegram_chat_sessions_state.json`
- `/root/.takopi/telegram_topics_state.json`

## Config Snapshot (Sanitized)

From `/root/.takopi/takopi.toml`:
- `watch_config = true`
- `transport = "telegram"`
- `default_engine = "codex"`
- Codex model: `gpt-5.3-codex`
- Project mappings include:
  - `/root/clawd/dev/Etc-mono-repo`
  - `/root/clawd/dev/SharedStake-ui`
  - `/root/clawd/dev/takopi`

Redacted secrets:
- Telegram bot token
- Chat IDs/user IDs

## Durable Memory Linkage

- Takopi and OpenClaw share durable memory context through `/root/clawd/memory`.
- Stable long-term notes are also curated in `/root/clawd/MEMORY.md`.

## Global AI Tools + Skills Used In Practice

- Retrieval/search:
  - `rg` / `rg --files`
  - `qmd search` (BM25-first workflow)
  - targeted reads (`sed`, `head`, `tail`)
- Skills:
  - `/root/.codex/skills/napkin/SKILL.md`
  - `/root/.codex/skills/token-reduce/SKILL.md`
  - `/root/.claude/skills/napkin/SKILL.md`

## Why This Backup Exists

- Preserve concrete runtime defaults for Takopi continuity.
- Keep root-path references visible from this repo.
- Avoid losing operational context during config churn.

## Bootstrap Bundle

- `ai_memory/bootstrap/takopi_seed/README.md`
- `ai_memory/bootstrap/takopi_seed/export.manifest.json`
