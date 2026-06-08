#!/usr/bin/env bash
# Persistent Claude remote session for SharedStake-ui (created 2026-06-08).
# Remote-control name: chimera-sharedstake-20260608
# Connect from Claude Code app: look for "chimera-sharedstake-20260608" in remote sessions.

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
    -e "PATH=$PATH" \
    -e "HOME=$HOME"

tmux send-keys -t "$SESSION" \
    "while true; do $CLAUDE_BIN --dangerously-skip-permissions --remote-control chimera-sharedstake-20260608; echo '[$SESSION] Restarting in 5s...'; sleep 5; done" \
    Enter

log "Session started. Attach with: tmux attach -t $SESSION"
