#!/usr/bin/env bash
# Persistent Claude remote session — chimera-server
# First run: fresh start. Subsequent runs: --continue resumes last conversation.
# Quick exits (<30s) back off 5 min to avoid hammering on limit hits.

SESSION="claude-remote"
WORKDIR="$HOME"
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

tmux send-keys -t "$SESSION" 'SENTINEL="$HOME/.sessions/.claude-remote.init"
while true; do
  START=$(date +%s)
  if [ -f "$SENTINEL" ]; then
    /usr/bin/claude --dangerously-skip-permissions --remote-control chimera-server --continue
  else
    /usr/bin/claude --dangerously-skip-permissions --remote-control chimera-server
    touch "$SENTINEL"
  fi
  RUNTIME=$(( $(date +%s) - START ))
  if [ "$RUNTIME" -lt 30 ]; then
    echo "[claude-remote] Quick exit (${RUNTIME}s) — backing off 300s"
    sleep 300
  else
    echo "[claude-remote] Exited after ${RUNTIME}s — restarting in 10s"
    sleep 10
  fi
done' Enter

log "Session started. Attach with: tmux attach -t $SESSION"
