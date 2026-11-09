#!/usr/bin/env bash
# Persistent Claude remote session — chimera-openclaw (openclaw MCP wired)
# Dedicated workdir isolates --continue from other /home/agents sessions.

SESSION="claude-remote-b"
WORKDIR="/home/agents/.sessions/claude-remote-b"
CLAUDE_BIN="/usr/bin/claude"

export PATH="/home/agents/.local/bin:/home/agents/.npm-global/bin:/home/agents/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export HOME="/home/agents"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

if tmux has-session -t "$SESSION" 2>/dev/null; then
    log "Session '$SESSION' already running — skipping start."
    exit 0
fi

log "Starting $SESSION tmux session..."
tmux new-session -d -s "$SESSION" -x 220 -y 50 -c "$WORKDIR" \
    -e "PATH=$PATH" -e "HOME=$HOME"

tmux send-keys -t "$SESSION" 'SENTINEL="/home/agents/.sessions/claude-remote-b/.init"
while true; do
  START=$(date +%s)
  if [ -f "$SENTINEL" ]; then
    /usr/bin/claude --dangerously-skip-permissions --remote-control chimera-openclaw --continue
  else
    /usr/bin/claude --dangerously-skip-permissions --remote-control chimera-openclaw
    touch "$SENTINEL"
  fi
  RUNTIME=$(( $(date +%s) - START ))
  if [ "$RUNTIME" -lt 30 ]; then
    echo "[claude-remote-b] Quick exit (${RUNTIME}s) — backing off 300s"
    sleep 300
  else
    echo "[claude-remote-b] Exited after ${RUNTIME}s — restarting in 10s"
    sleep 10
  fi
done' Enter

log "Session started. Attach with: tmux attach -t $SESSION"
