# SpecForge Desktop

Wraps the SpecForge web app and collab server in a Tauri desktop shell with startup UX.

## Development

```bash
# From the collab-markdown-spec-studio root:
bun run dev:desktop    # opens Tauri dev window with loading screen
bun run launch --dev   # run services in dev mode without Tauri (browser workflow)

# Or run services manually:
cd web && bun run dev &
cd collab-server && bun run dev &
open http://localhost:3000/workspace
```

## Production Build

```bash
bun run desktop:build   # outputs to desktop/src-tauri/target/release/bundle/
```

## How It Works

### Startup Flow

1. Tauri opens a loading screen (`desktop/dist/index.html`)
2. The loading screen polls both health endpoints every 1.5 seconds
3. Status indicators show which services are ready
4. Once both respond, the webview navigates to `http://localhost:3000`
5. If services don't start within 30 seconds, an error panel with a "Retry" button is shown

### Sidecar Management

- The Rust backend spawns web and collab-server as child processes on startup
- `desktop/scripts/launch.sh` provides the same lifecycle for non-Tauri use
- On window close (Destroyed event), all child processes are killed via `Sidecars` state
- The `Sidecars` struct also implements `Drop` for safety

### Health Endpoints

- Web: `GET http://localhost:3000/api/health`
- Collab: `GET http://127.0.0.1:4322/health`

### Tauri Commands

- `get_health` — Returns JSON `{ web: bool, collab: bool, ready: bool }`

## Requirements

- Rust toolchain (`rustup`)
- Bun
- Tauri CLI v2: `bun add -g @tauri-apps/cli`
