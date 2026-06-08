#!/usr/bin/env bash
# Starts or re-attaches a persistent Claude remote-control tmux session (openclaw-wired variant).
# Run by systemd on boot; also callable directly to check status.
#
# Remote-control name: chimera-openclaw
# Connect from Claude Code app: look for "chimera-openclaw" in remote sessions.
# This session has openclaw MCP wired in (see ~/.claude/settings.json mcpServers.openclaw).

SESSION="claude-remote-b"
WORKDIR="$HOME"
CLAUDE_BIN="/usr/bin/claude"

export PATH="/home/agents/.local/bin:/home/agents/.npm-global/bin:/home/agents/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export HOME="/home/agents"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

if tmux has-session -t "$SESSION" 2>/dev/null; then
    log "Session '$SESSION' already running — skipping start."
    exit 0
fi

log "Starting claude-remote-b tmux session..."
tmux new-session -d -s "$SESSION" -x 220 -y 50 -c "$WORKDIR" \
    -e "PATH=$PATH" \
    -e "HOME=$HOME"

# Run Claude in a loop so it auto-restarts on exit
tmux send-keys -t "$SESSION" \
    "while true; do $CLAUDE_BIN --dangerously-skip-permissions --remote-control chimera-openclaw; echo '[claude-remote-b] Restarting in 5s...'; sleep 5; done" \
    Enter

log "Session started. Attach with: tmux attach -t $SESSION"
