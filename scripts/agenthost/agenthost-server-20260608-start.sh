#!/usr/bin/env bash
SESSION="agenthost_server-20260608"
WORKDIR="/home/agents/.sessions/agenthost-server"
REMOTE_NAME="agenthost-server-20260608"
export PATH="/home/agents/.local/bin:/home/agents/.npm-global/bin:/home/agents/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export HOME="/home/agents"

LOG_FILE="$HOME/.sessions/session-starts.log"
mkdir -p "$(dirname "$LOG_FILE")"
log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }
log_start() {
  local msg="[$(date -u +%Y-%m-%dT%H:%M:%SZ)] host=$(hostname) session=$SESSION remote=$REMOTE_NAME workdir=$WORKDIR event=$1"
  echo "$msg" | tee -a "$LOG_FILE"
}

if tmux has-session -t "$SESSION" 2>/dev/null; then
  log_start "already-running"
  exit 0
fi

log_start "starting"
tmux new-session -d -s "$SESSION" -x 220 -y 50 -c "$WORKDIR" -e "PATH=$PATH" -e "HOME=$HOME"
tmux send-keys -t "$SESSION" 'SENTINEL="/home/agents/.sessions/agenthost-server/.init"
while true; do
  START=$(date +%s)
  if [ -f "$SENTINEL" ]; then
    /usr/bin/claude --dangerously-skip-permissions --remote-control agenthost-server-20260608 --continue
  else
    /usr/bin/claude --dangerously-skip-permissions --remote-control agenthost-server-20260608
    touch "$SENTINEL"
  fi
  RUNTIME=$(( $(date +%s) - START ))
  if [ "$RUNTIME" -lt 30 ]; then
    echo "[agenthost_server-20260608] Quick exit (${RUNTIME}s) — backing off 300s"
    sleep 300
  else
    echo "[agenthost_server-20260608] Exited after ${RUNTIME}s — restarting in 10s"
    sleep 10
  fi
done' Enter
log_start "started"
log "Attach: tmux attach -t $SESSION"
