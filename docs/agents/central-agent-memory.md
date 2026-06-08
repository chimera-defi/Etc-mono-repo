# Central Agent Memory Runbook

This runbook backs up the Takopi-style local setup for Hermes, Codex, Claude Code, OpenClaw, and OpenCode into a reproducible script. The goal is a single local place to inspect agent memories without automatically mixing the memories of different agents or indexing secrets.

## Design goals

- **One place to look:** `/home/agents/agent-memory` by default.
- **Writer segregation:** each agent writes under `agents/<agent>/`.
- **Sensitivity segregation:** each writer has `public/`, `private/curated/`, `private/live/`, and `secrets/` folders.
- **Low active-context cost:** agents search GBrain/QMD first, cite a source, and read only the small hit they need.
- **No accidental secret fan-out:** `secrets/` is never registered as a GBrain source or QMD collection, and should contain pointers to a secret manager rather than plaintext secrets.
- **Reproducibility:** setup is scripted and idempotent; existing live memory paths are backed up before they are symlinked into the central root.

## Directory layout

```text
/home/agents/agent-memory/
  README.md
  policy.yaml
  shared/public/
  agents/
    hermes/{public,private/{curated,live},secrets,inbox,archive}/
    codex/{public,private/{curated,live},secrets,inbox,archive}/
    claude/{public,private/{curated,live},secrets,inbox,archive}/
    openclaw/{public,private/{curated,live},secrets,inbox,archive}/
    opencode/{public,private/{curated,live},secrets,inbox,archive}/
```

`private/curated/MEMORY.md` is the durable same-agent memory file. If an older install has `private/MEMORY.md`, the setup script migrates it into `private/curated/MEMORY.md` and removes the legacy file. `private/live/` is only for centralized raw tool-owned state such as agent logs, project memories, and global instruction files.

## GBrain/QMD source policy

The setup registers safe folders with separate source IDs:

- `agent-shared-public` -> `shared/public`
- `agent-<agent>-public` -> `agents/<agent>/public`
- `agent-<agent>-private` -> `agents/<agent>/private/curated`

No `private/live/` or `secrets/` folder is registered. Keep these sources non-federated/default unless a human explicitly changes the memory policy. Agents should cite hits as `brain:<source-id>:<slug-or-file>`.

## Live-state links created on Takopi-style servers

By default the setup script migrates these existing memories into `private/live/` and replaces the original paths with symlinks:

- Hermes: `~/.hermes/memories` -> `agents/hermes/private/live/hermes-memories`
- Codex markdown memory: `~/.codex/memories` -> `agents/codex/private/live/codex-memories`
- Codex SQLite memory: `~/.codex/memories_1.sqlite` is copied as a timestamped snapshot by default. Pass `--link-sqlite` after stopping active Codex processes if you want the SQLite file itself symlinked into the central root.
- Codex global instructions: `~/.codex/AGENTS.md` -> `agents/codex/private/live/AGENTS.md`
- Claude project memories: `~/.claude/projects` -> `agents/claude/private/live/claude-projects`
- Claude global memory: `~/.claude/CLAUDE.md` -> `agents/claude/private/live/CLAUDE.md`
- OpenClaw memory workspace: `~/.openclaw/workspace/memory` -> `agents/openclaw/private/live/openclaw-memory`
- OpenCode global instructions: `~/.config/opencode/AGENTS.md` -> `agents/opencode/private/live/AGENTS.md`

For future machines where you only want to create the structure, pass `--no-link-live-state`.

## Commands

Dry run:

```bash
scripts/agents/setup-central-agent-memory.sh --dry-run
```

Apply locally:

```bash
scripts/agents/setup-central-agent-memory.sh
```

Configure GBrain MCP for installed agents:

```bash
scripts/agents/configure-agent-gbrain-mcp.sh
```

The MCP helper configures Codex, Claude Code, and OpenClaw when their CLIs are present, and verifies Hermes when its MCP list command is available. OpenCode versions may expose `opencode mcp`, but this repo script does not assume undocumented non-interactive add syntax; use `opencode mcp add` manually only when the installed OpenCode help documents a local stdio command flow.

Audit:

```bash
scripts/agents/audit-agent-memory.sh
```

Smoke test in a temporary root without touching live agent configs:

```bash
scripts/tests/agent-memory-smoke.sh
```

## Agent instructions

The setup appends a `central-agent-memory` block to each agent's global instruction/memory file where available, and to `private/curated/MEMORY.md`. The block tells each agent:

1. its own writer namespace;
2. where to write private vs deliberately public memory;
3. to query GBrain/QMD before reading raw folders;
4. to avoid other agents' private sources unless explicitly instructed;
5. to keep plaintext credentials out of memory.

## Security notes

This setup is a policy and locality boundary, not a hard security boundary when all agents run as the same Unix user. File permissions are tightened to owner-only where possible, but any tool-capable process running as the same user can technically read same-user files. For strong isolation, run lower-trust agents under separate Unix users or containers and mount only their own `agents/<agent>` directory plus `shared/public`.

The audit scans only curated/public docs for secret-looking patterns and intentionally skips `private/live/` because that folder can contain raw tool logs or copied live state. Excluding `private/live/` from GBrain/QMD prevents accidental retrieval fan-out; it does not make those files unreadable to processes running as the same Unix user.

Never commit `/home/agents/agent-memory` wholesale. If memory should be backed up to this repo, create a curated, redacted export under an explicit docs or backup path and run a secret scan first.
