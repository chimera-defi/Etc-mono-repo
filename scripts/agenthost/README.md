# agenthost infra scripts

Systemd user services and start scripts for persistent Claude Code remote sessions on agenthost.

## Active sessions

| tmux session | service | remote-control name | notes |
|---|---|---|---|
| `claude-remote` | `claude-remote.service` | `chimera-server` | original, basic |
| `claude-remote-b` | `claude-remote-b.service` | `chimera-openclaw` | openclaw MCP wired in |

Connect from Claude Code app: remote sessions → look for the remote-control name.

## How it works

Each session is:
1. A **tmux** session so it outlives SSH/terminal disconnects
2. A **while-true loop** so Claude auto-restarts on exit
3. A **systemd oneshot** service with `RemainAfterExit=yes` so it starts on boot

The `--remote-control <name>` flag registers the session as connectable from the Claude Code app on any device.

## Install on a new host

```bash
# Copy start scripts
cp claude-remote-start.sh ~/.local/bin/
cp claude-remote-b-start.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-remote*-start.sh

# Install systemd units (user-level)
mkdir -p ~/.config/systemd/user
cp claude-remote.service ~/.config/systemd/user/
cp claude-remote-b.service ~/.config/systemd/user/

# Update paths in scripts/units if HOME != /home/agents

# Enable and start
systemctl --user daemon-reload
systemctl --user enable --now claude-remote.service
systemctl --user enable --now claude-remote-b.service

# Verify
tmux list-sessions
```

## openclaw MCP wiring

The `claude-remote-b` session gains access to Telegram/WhatsApp messaging tools via openclaw MCP.
Add this to `~/.claude/settings.json` under `mcpServers`:

```json
"openclaw": {
  "command": "openclaw",
  "args": ["mcp", "serve", "--token", "<GATEWAY_TOKEN>"]
}
```

Gateway token is in `~/.openclaw/openclaw.json` → `gateway.auth.token`.

Requires `openclaw-gateway.service` to be running (see openclaw docs for setup).

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
