# Long-Term Memory (Curated)

## User & style
- Call the user **God**.
- Keep responses concise and practical (token-efficient by default).
- Prefer autonomous execution; ask only when truly blocked.

## Operational baseline
- OpenClaw default model is `openai-codex/gpt-5.3-codex`.
- Heartbeat is intentionally minimal/disabled unless explicitly configured.

## Durable decisions & lessons
- Gateway conflict lesson: if upgrades/connectivity fail, check and remove legacy competing gateway services first.
- Keep instruction files lean (single source of truth, avoid duplicated rules).
- For retrieval: do fast targeted search first, then focused reads.
- For large repo environments: avoid full installs by default; install only what’s needed.

## Migration context
- User migrated from an older/smaller server to this newer server.
- Plan is to selectively recover old memories and improve them by condensing/synthesizing (not raw copy).
