# SpecForge Desktop

Wraps the SpecForge web app and collab server in a Tauri desktop shell.

## Development

```bash
# From the collab-markdown-spec-studio root:
bun run dev:desktop   # opens Tauri dev window pointing at localhost:3000

# Or run services manually first, then open browser:
cd web && bun run dev &
cd collab-server && bun run dev &
open http://localhost:3000/workspace
```

## Production Build

```bash
bun run desktop:build   # outputs to desktop/src-tauri/target/release/bundle/
```

## How It Works

- Tauri window loads `http://localhost:3000` (the Next.js web app)
- `desktop/scripts/launch.sh` starts web + collab as background processes and waits for health checks
- On close, both sidecars are killed via process trap
- Health endpoint: `GET /api/health` (web), `GET http://127.0.0.1:4322/health` (collab)

## Requirements

- Rust toolchain (`rustup`)
- Bun
- Tauri CLI v2: `bun add -g @tauri-apps/cli`
