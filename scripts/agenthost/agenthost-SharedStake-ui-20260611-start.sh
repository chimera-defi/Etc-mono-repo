#!/usr/bin/env bash
SESSION="agenthost_SharedStake-ui-20260611"
WORKDIR="/home/agents/workspace/SharedStake-ui"
REMOTE_NAME="agenthost-SharedStake-ui-20260611"
export PATH="/home/agents/.local/bin:/home/agents/.npm-global/bin:/home/agents/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export HOME="/home/agents"

LOG_FILE="$HOME/.sessions/session-starts.log"
mkdir -p "$(dirname "$LOG_FILE")"
log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }
log_start() {
  local msg="[$(date -u +%Y-%m-%dT%H:%M:%SZ)] host=$(hostname) session=$SESSION remote=$REMOTE_NAME workdir=$WORKDIR event=$1"
  echo "$msg" | tee -a "$LOG_FILE"
}

if tmux has-session -t "agenthost_SharedStake-ui-20260611" 2>/dev/null; then
  log_start "already-running"
  exit 0
fi

log_start "starting"
tmux new-session -d -s "agenthost_SharedStake-ui-20260611" -x 220 -y 50 -c "/home/agents/workspace/SharedStake-ui" -e "PATH=$PATH" -e "HOME=$HOME"
tmux send-keys -t "agenthost_SharedStake-ui-20260611" 'SENTINEL="/home/agents/workspace/SharedStake-ui/.sessions-init"
while true; do
  START=$(date +%s)
  if [ -f "$SENTINEL" ]; then
    /usr/bin/claude --dangerously-skip-permissions --remote-control agenthost-SharedStake-ui-20260611 --continue
  else
    /usr/bin/claude --dangerously-skip-permissions --remote-control agenthost-SharedStake-ui-20260611
    touch "$SENTINEL"
  fi
  RUNTIME=$(( $(date +%s) - START ))
  if [ "$RUNTIME" -lt 30 ]; then
    echo "[agenthost_SharedStake-ui-20260611] Quick exit (${RUNTIME}s) — backing off 300s"
    sleep 300
  else
    echo "[agenthost_SharedStake-ui-20260611] Exited after ${RUNTIME}s — restarting in 10s"
    sleep 10
  fi
done' Enter
log_start "started"
log "Attach: tmux attach -t agenthost_SharedStake-ui-20260611"
