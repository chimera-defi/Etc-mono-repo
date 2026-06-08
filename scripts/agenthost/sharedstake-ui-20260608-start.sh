#!/usr/bin/env bash
# Persistent Claude remote session — chimera-sharedstake-20260608
# Workdir is SharedStake-ui repo; --continue resumes last conversation there.

SESSION="sharedstake-ui-20260608"
WORKDIR="/home/agents/workspace/SharedStake-ui"
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

tmux send-keys -t "$SESSION" 'SENTINEL="/home/agents/workspace/SharedStake-ui/.sessions-init"
while true; do
  START=$(date +%s)
  if [ -f "$SENTINEL" ]; then
    /usr/bin/claude --dangerously-skip-permissions --remote-control chimera-sharedstake-20260608 --continue
  else
    /usr/bin/claude --dangerously-skip-permissions --remote-control chimera-sharedstake-20260608
    touch "$SENTINEL"
  fi
  RUNTIME=$(( $(date +%s) - START ))
  if [ "$RUNTIME" -lt 30 ]; then
    echo "[sharedstake-ui-20260608] Quick exit (${RUNTIME}s) — backing off 300s"
    sleep 300
  else
    echo "[sharedstake-ui-20260608] Exited after ${RUNTIME}s — restarting in 10s"
    sleep 10
  fi
done' Enter

log "Session started. Attach with: tmux attach -t $SESSION"
