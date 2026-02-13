# Agent Exports

This folder contains agent-consumable exports for rebuilding agent state on a
new server without requiring a human to run shell scripts.

## Export Sets

- OpenClaw/Clawdbot: `ai_memory/bootstrap/openclaw_clawdbot_seed/export.manifest.json`
- Takopi: `ai_memory/bootstrap/takopi_seed/export.manifest.json`
- OpenClaw/Clawdbot runbook: `ai_memory/bootstrap/openclaw_clawdbot_seed/AGENT_IMPORT.md`
- Takopi runbook: `ai_memory/bootstrap/takopi_seed/AGENT_IMPORT.md`

## Agent Import Contract

- Read the relevant `export.manifest.json`.
- For each `copy` step, copy `source` from this repo into `target`.
- For each `write_template` step, copy template content and replace required placeholders.
- Preserve paths exactly.

## Placeholder Policy

- Never commit real secrets.
- Values marked as placeholders must be filled by runtime secrets management.
