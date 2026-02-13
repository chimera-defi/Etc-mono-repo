# Agent Import Runbook (OpenClaw/Clawdbot)

Use this when an agent is setting up a new server.

## Input

- Manifest: `ai_memory/bootstrap/openclaw_clawdbot_seed/export.manifest.json`
- Source root: `ai_memory/bootstrap/openclaw_clawdbot_seed/`

## Execution Rules

1. For each step with `"op": "copy"`:
- Read file at `<source root>/<source>`.
- Write exact content to `<target>`.

2. For each step with `"op": "write_template"`:
- Read `<source root>/<source>`.
- Replace placeholders listed in `required_placeholders`.
- Write to `<target>`.

3. Ensure target directories exist before writing.

4. Do not modify content semantics during copy.

## Required Placeholder Resolution

- `OPENCLAW_TELEGRAM_BOT_TOKEN`
- `OPENCLAW_TELEGRAM_ALLOWED_USER_ID`
- `OPENCLAW_GATEWAY_TOKEN`
- `CLAWDBOT_TELEGRAM_BOT_TOKEN`
- `CLAWDBOT_TELEGRAM_ALLOWED_USER_ID`
- `CLAWDBOT_GATEWAY_TOKEN`
