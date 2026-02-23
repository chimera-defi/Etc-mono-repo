# Agent Import Runbook (Takopi)

Use this when an agent is setting up a new server.

## Input

- Manifest: `ai_memory/bootstrap/takopi_seed/export.manifest.json`
- Source root: `ai_memory/bootstrap/takopi_seed/`

## Execution Rules

1. For each step with `"op": "copy"`:
- Read file at `<source root>/<source>`.
- Write exact content to `<target>`.

2. For each step with `"op": "write_template"`:
- Read `<source root>/<source>`.
- Replace placeholders listed in `required_placeholders`.
- Write to `<target>`.

3. Ensure target directories exist before writing.

## Required Placeholder Resolution

- `TAKOPI_TELEGRAM_BOT_TOKEN`
- `TAKOPI_TELEGRAM_CHAT_ID`
- `TAKOPI_TELEGRAM_ALLOWED_USER_ID`
