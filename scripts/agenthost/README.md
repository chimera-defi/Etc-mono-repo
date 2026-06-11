# agenthost infra scripts

Systemd user services and start scripts for persistent Claude Code remote sessions on agenthost.

Session scripts (`~/.local/bin/*-start.sh`) and systemd units (`~/.config/systemd/user/*.service`)
are **local-only** — not tracked in this repo. Use the `gstack-session-spawn` skill to create new
sessions; see [`gstack-session-spawn/SKILL.md`](gstack-session-spawn/SKILL.md).

## Active sessions (reference only — scripts are local)

| remote-control name | workdir | notes |
|---|---|---|
| `chimera-server` | `/home/agents` | original basic session |
| `chimera-openclaw` | `/home/agents` | openclaw MCP wired in |
| `agenthost-sessions-20260611` | `~/.sessions/agenthost-sessions` | session manager |
| `agenthost-routines-20260608` | `~/.sessions/routines` | CCR routine manager |
| `agenthost-SharedStake-ui-20260611` | `/home/agents/workspace/SharedStake-ui` | SharedStake-ui workspace |
| `agenthost-server-health-20260611` | `~/.sessions/server-health` | server health monitor (Sonnet) |

Connect from Claude Code app: remote sessions → look for the remote-control name.

## How it works

Each session is:
1. A **tmux** session so it outlives SSH/terminal disconnects
2. A **while-true loop** so Claude auto-restarts on exit
3. A **systemd oneshot** service with `RemainAfterExit=yes` so it starts on boot

The `--remote-control <name>` flag registers the session as connectable from the Claude Code app on any device.

## Creating a new session

Use the `gstack-session-spawn` skill — it handles naming, start script, systemd unit, sentinel file,
trust pre-acceptance, and startup logging. See [`gstack-session-spawn/SKILL.md`](gstack-session-spawn/SKILL.md).

```
# In any Claude Code session:
/gstack-session-spawn
# Then follow the recipe with your FOLDERNAME and DATE
```

## openclaw MCP wiring

The `chimera-openclaw` session gains access to Telegram/WhatsApp messaging tools via openclaw MCP.
Add this to `~/.claude/settings.json` under `mcpServers`:

```json
"openclaw": {
  "command": "openclaw",
  "args": ["mcp", "serve", "--token", "<GATEWAY_TOKEN>"]
}
```

Gateway token is in `~/.openclaw/openclaw.json` → `gateway.auth.token`.

Requires `openclaw-gateway.service` to be running (see openclaw docs for setup).

## Session startup log

Every start script appends to `~/.sessions/session-starts.log` on the host. Format:

```
[ISO-timestamp] host=<hostname> session=<tmux-name> remote=<remote-control-name> workdir=<path> event=starting|started|already-running
```

Check it any time to see when and where sessions came up:
```bash
cat ~/.sessions/session-starts.log
```

## Trust dialog fix

On first boot, Claude may prompt "do you trust this folder?". Pre-accept it by setting
`hasTrustDialogAccepted: true` for the working directory in `~/.claude.json`:

```python
import json
path = os.path.expanduser('~/.claude.json')
d = json.load(open(path))
d.setdefault('projects', {}).setdefault('/home/agents', {})['hasTrustDialogAccepted'] = True
json.dump(d, open(path, 'w'), separators=(',', ':'))
```
