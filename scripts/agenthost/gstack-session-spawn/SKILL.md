---
name: gstack-session-spawn
slug: gstack-session-spawn
version: "1.0.0"
tagline: "Create a persistent Claude remote session on agenthost"
description: "Use when asked to create a remote session, schedule a persistent agent, spin up a Claude session for a project, or start a background Claude process. Creates a tmux+systemd session with --dangerously-skip-permissions, --continue auto-resume, and smart backoff."
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---

# gstack-session-spawn

Use when asked to: "create a session for X", "create a remote session in X", "spin up an agent for X", "schedule a persistent Claude session", or "start a background Claude process for X".

## Naming Convention

```
tmux session name:    agenthost_<foldername>-<YYYYMMDD>   (underscore — tmux converts : to _)
remote-control name:  agenthost-<foldername>-<YYYYMMDD>   (hyphens — shows in Claude Code app)
working directory:    /home/agents/workspace/<foldername>  (repo/project sessions)
                      /home/agents/.sessions/<foldername>  (utility/non-project sessions)
start script path:    ~/.local/bin/agenthost-<foldername>-<YYYYMMDD>-start.sh
service file path:    ~/.config/systemd/user/agenthost-<foldername>-<YYYYMMDD>.service
sentinel file:        <WORKDIR>/.sessions-init
```

**Workdir rule**: use `/home/agents/workspace/<foldername>` for sessions tied to a specific repo.
Use `/home/agents/.sessions/<foldername>` for utility sessions (session managers, health monitors,
routine managers, etc.) — these share `/home/agents` as home so each needs its own subdirectory
to prevent `--continue` picking up the wrong conversation.

**Today's date:** run `date +%Y%m%d` to get the YYYYMMDD value.

## Full Recipe

```bash
# ── 1. Set variables ──────────────────────────────────────────────────────────
FOLDERNAME="<foldername>"          # e.g. SharedStake-ui
DATE=$(date +%Y%m%d)
SESSION="agenthost_${FOLDERNAME}-${DATE}"
REMOTE_NAME="agenthost-${FOLDERNAME}-${DATE}"
WORKDIR="/home/agents/workspace/${FOLDERNAME}"
SCRIPT="$HOME/.local/bin/${REMOTE_NAME}-start.sh"
SERVICE="$HOME/.config/systemd/user/${REMOTE_NAME}.service"

# ── 2. Create start script ────────────────────────────────────────────────────
cat > "$SCRIPT" << SCRIPT_EOF
#!/usr/bin/env bash
SESSION="${SESSION}"
WORKDIR="${WORKDIR}"
REMOTE_NAME="${REMOTE_NAME}"
export PATH="/home/agents/.local/bin:/home/agents/.npm-global/bin:/home/agents/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export HOME="/home/agents"

LOG_FILE="\$HOME/.sessions/session-starts.log"
mkdir -p "\$(dirname "\$LOG_FILE")"
log() { echo "[\$(date -u +%Y-%m-%dT%H:%M:%SZ)] \$*"; }
log_start() {
  local _evt="\$1"
  local msg="[\$(date -u +%Y-%m-%dT%H:%M:%SZ)] host=\$(hostname) session=\$SESSION remote=\$REMOTE_NAME workdir=\$WORKDIR event=\${_evt}"
  echo "\$msg" | tee -a "\$LOG_FILE"
}

if tmux has-session -t "${SESSION}" 2>/dev/null; then
  log_start "already-running"
  exit 0
fi

log_start "starting"
tmux new-session -d -s "${SESSION}" -x 220 -y 50 -c "${WORKDIR}" -e "PATH=\$PATH" -e "HOME=\$HOME"
tmux send-keys -t "${SESSION}" 'SENTINEL="${WORKDIR}/.sessions-init"
while true; do
  START=\$(date +%s)
  if [ -f "\$SENTINEL" ]; then
    /usr/bin/claude --dangerously-skip-permissions --remote-control ${REMOTE_NAME} --continue
  else
    /usr/bin/claude --dangerously-skip-permissions --remote-control ${REMOTE_NAME}
    touch "\$SENTINEL"
  fi
  RUNTIME=\$(( \$(date +%s) - START ))
  if [ "\$RUNTIME" -lt 30 ]; then
    echo "[${SESSION}] Quick exit (\${RUNTIME}s) — backing off 300s"
    sleep 300
  else
    echo "[${SESSION}] Exited after \${RUNTIME}s — restarting in 10s"
    sleep 10
  fi
done' Enter
log_start "started"
log "Attach: tmux attach -t ${SESSION}"
SCRIPT_EOF
chmod +x "$SCRIPT"

# ── 3. Create systemd service ─────────────────────────────────────────────────
cat > "$SERVICE" << UNIT_EOF
[Unit]
Description=Claude Code Remote - ${REMOTE_NAME}
After=network-online.target openclaw-gateway.service
Wants=network-online.target
[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=${SCRIPT}
ExecStop=/usr/bin/tmux kill-session -t ${SESSION}
Environment=HOME=/home/agents
Environment=PATH=/home/agents/.local/bin:/home/agents/.npm-global/bin:/home/agents/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=TMUX_TMPDIR=/tmp
[Install]
WantedBy=default.target
UNIT_EOF

# ── 4. Enable and start ───────────────────────────────────────────────────────
systemctl --user daemon-reload
systemctl --user enable --now "$(basename $SERVICE)"

# ── 4.5. Startup log ─────────────────────────────────────────────────────────
# Start scripts append to ~/.sessions/session-starts.log in this format:
# [ISO-timestamp] host=<hostname> session=<tmux-name> remote=<remote-control-name> workdir=<path> event=starting|started|already-running
# Check when/where sessions came up:
#   cat ~/.sessions/session-starts.log
# The start script template already includes log_start() — no extra steps needed here.

# ── 5. Pre-accept folder trust ────────────────────────────────────────────────
python3 -c "
import json
p='/home/agents/.claude.json'
d=json.load(open(p))
d.setdefault('projects',{}).setdefault('${WORKDIR}',{})['hasTrustDialogAccepted']=True
json.dump(d,open(p,'w'),separators=(',',':'))
"

# ── 6. Verify ─────────────────────────────────────────────────────────────────
tmux list-sessions | grep "${SESSION}"
```

## After Creating

- Connect from Claude Code app: look for `agenthost-<foldername>-<YYYYMMDD>` in remote sessions
- Scripts live locally in `~/.local/bin/` and `~/.config/systemd/user/` — no repo commit needed
- The skill itself is versioned in `chimera-defi/Etc-mono-repo` under `scripts/agenthost/gstack-session-spawn/`

## Key Rules

- Always use `--dangerously-skip-permissions` — sessions must not prompt for tool approval
- Use the sentinel file pattern — `--continue` on fresh workdirs exits in 0s and triggers 300s backoff loop
- 300s backoff on exit <30s (limit hit / crash), 10s otherwise
- If two sessions share the same workdir, `--continue` picks the wrong conversation — use dedicated workdirs for shared-home sessions (e.g. `~/.sessions/<name>/`)
- `hasTrustDialogAccepted: true` must be set for the workdir or Claude prompts on every restart
