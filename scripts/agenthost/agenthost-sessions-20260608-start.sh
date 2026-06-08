#!/usr/bin/env bash
# Persistent Claude remote session — agenthost-sessions-20260608 (session manager)
# Dedicated workdir isolates --continue from other /home/agents sessions.

SESSION="agenthost_sessions-20260608"
WORKDIR="/home/agents/.sessions/agenthost-sessions"
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

tmux send-keys -t "$SESSION" 'SENTINEL="/home/agents/.sessions/agenthost-sessions/.init"
while true; do
  START=$(date +%s)
  if [ -f "$SENTINEL" ]; then
    /usr/bin/claude --dangerously-skip-permissions --remote-control agenthost-sessions-20260608 --continue
  else
    /usr/bin/claude --dangerously-skip-permissions --remote-control agenthost-sessions-20260608
    touch "$SENTINEL"
  fi
  RUNTIME=$(( $(date +%s) - START ))
  if [ "$RUNTIME" -lt 30 ]; then
    echo "[agenthost-sessions] Quick exit (${RUNTIME}s) — backing off 300s"
    sleep 300
  else
    echo "[agenthost-sessions] Exited after ${RUNTIME}s — restarting in 10s"
    sleep 10
  fi
done' Enter

log "Session started. Attach with: tmux attach -t $SESSION"
