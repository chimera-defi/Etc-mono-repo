# SpecForge Tauri Desktop Plan

## Goal

Package SpecForge as a desktop-distributed local product without rewriting the current web architecture, while preserving three deployment modes:

1. `Local desktop`: packaged app, local collaboration, local CLI assist
2. `Hosted SaaS`: remote collaboration, remote assist / BYO provider keys
3. `Hybrid bridge`: hosted workspace plus a local helper for Codex / Claude CLI reuse

## Why Tauri

Tauri is a better fit than Electron for the first desktop distribution pass because:

- smaller runtime footprint
- lower memory cost
- better default security posture
- good fit for shipping a local web UI plus a few helper processes

Electron is still the easier fallback if Node-first process control becomes the dominant concern, but Tauri is the better product packaging target.

## What We Already Have

SpecForge already runs as a multi-process local product:

- `web/`: Next.js app and server-side API routes
- `collab-server/`: Hocuspocus / Yjs collaboration runtime
- local persistence: `PGlite` in local mode
- local AI assist: server-side shell-out to `codex` / `claude`

That means the desktop packaging problem is mostly process supervision and distribution, not product redesign.

## Recommended Desktop Shape

### Desktop Shell

Tauri owns:

- the application window
- secure local settings storage
- process lifecycle
- tray / menu integration later if needed

### Sidecars

The desktop app should start and supervise:

1. `specforge-web`
   - local Next.js server
   - serves the main UI and API routes
2. `specforge-collab`
   - local Hocuspocus server
3. optional `specforge-bridge`
   - small local bridge for future hosted-to-local CLI access

### External Dependencies

Do not bundle these in the first pass:

- `codex`
- `claude`

Instead:

- detect them
- show availability in the UI
- keep the built-in heuristic fallback

This preserves the current working local-assist model without taking on CLI redistribution risk.

## Runtime Modes

### Mode A: Local Desktop

The packaged app starts:

- local web server
- local collab server
- local persistence

The web API continues to call local `codex` / `claude` when present.

This is the best mode for:

- power users
- design partners
- agent-native use

### Mode B: Hosted SaaS

SpecForge runs remotely.

Assist uses:

- hosted provider credentials
- or workspace-managed provider keys

This is the best mode for:

- standard team onboarding
- shared workspaces
- paid hosted product

### Mode C: Hybrid Bridge

Hosted SpecForge talks to a locally installed helper.

The local helper exposes:

- CLI availability
- local assist execution
- maybe local repo access later

This mode is for users who want:

- hosted collaboration
- local logged-in Codex / Claude reuse

## Security Boundaries

### Keep

- browser never talks directly to local CLIs
- browser never receives raw provider secrets
- local assist runs through the server-side app or a future local bridge

### Add For Desktop

- signed localhost-only bridge protocol if hybrid mode is added
- explicit user consent before enabling local CLI execution
- clear UI state for:
  - local mode
  - hosted mode
  - hybrid mode

## Packaging Plan

### Phase 1: Desktop Wrapper

Ship Tauri as a wrapper around the existing local product:

- bundle the frontend shell assets
- launch local sidecars
- point the webview at the local SpecForge app

This keeps product behavior closest to the already-tested local app.

### Phase 2: One-Command Desktop Dev

Add:

- `bun run dev:desktop`
- `bun run build:desktop`

And define:

- sidecar ports
- health checks
- startup ordering

### Phase 3: Hybrid Bridge

Add a small local daemon for hosted SaaS users who want local CLI reuse.

Do not block desktop packaging on this.

## UI Changes Needed

### Workspace Session

Add a clearer runtime status cluster:

- local desktop mode
- local assist availability
- hosted assist availability
- current bridge state

### Assist Runtime

Current runtime selector is already close.

Extend it to show:

- `Codex CLI available`
- `Claude Code available`
- `Hosted provider`
- `Bridge connected`

### Settings

Add a desktop/runtime settings area for:

- local server diagnostics
- collab diagnostics
- CLI detection
- log export

## Suggested Process Model

Tauri process tree:

1. Tauri app starts
2. Tauri starts `specforge-web`
3. Tauri waits for `/api/health`
4. Tauri starts `specforge-collab`
5. Tauri waits for collab `/health`
6. Tauri opens the workspace window

If any sidecar fails:

- show a recovery screen
- expose logs
- offer restart actions

## Why Not Rewrite Into One Binary

Do not collapse everything into a single custom runtime yet.

Reasons:

- current local architecture already works
- local Codex / Claude reuse is the real product value
- process supervision is cheaper than runtime reinvention

The best first product is:

- one desktop installer per platform
- multiple supervised local services underneath

## Open Decisions

1. Tauri webview pointing at a local server vs embedding static frontend assets and proxying API
2. whether `collab-server` should remain separate or fold into the local app later
3. whether hybrid bridge becomes a separate install or part of the desktop package
4. whether desktop mode stays self-hosted-only or becomes the main paid local offering too

## Recommended Next Steps

1. Add `desktop distribution` as an explicit post-alpha track in `TASKS.md`
2. Add a runtime mode section to the workspace session UI
3. Scaffold Tauri at the repo root of the SpecForge pack
4. Define sidecar startup contracts and health checks
5. Keep local CLI detection exactly as-is for the first desktop pass
6. Defer hosted-to-local bridge work until after the first desktop wrapper works
