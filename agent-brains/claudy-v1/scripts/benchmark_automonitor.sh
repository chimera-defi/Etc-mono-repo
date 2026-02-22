#!/bin/bash
# Benchmark Auto-Monitor & Resume Script
# Purpose: Continuously monitor benchmark, detect stalls, auto-restart, report completion
# Usage: nohup bash benchmark_automonitor.sh > /tmp/bench_monitor.log 2>&1 &

set -e

WORKSPACE="/root/.openclaw/workspace/dev/Etc-mono-repo"
RESULTS_FILE="$WORKSPACE/bench/openclaw_llm_bench/runs/20260214_093023/results.jsonl"
BENCH_DIR="$WORKSPACE/bench"
RUN_ID="20260214_093023"
MAX_STALL_MINUTES=5
TOTAL_PROMPTS=209
CHECK_INTERVAL=30  # seconds

# Log function
log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

# Get current line count
get_progress() {
    if [ -f "$RESULTS_FILE" ]; then
        wc -l < "$RESULTS_FILE"
    else
        echo 0
    fi
}

# Start benchmark
start_benchmark() {
    log "Starting benchmark (or resuming)..."
    cd "$BENCH_DIR"
    python3 openclaw_llm_bench/run_bench.py --run-id "$RUN_ID" --resume --allow-concurrent-ollama > /tmp/bench_run.log 2>&1 &
    BENCH_PID=$!
    log "Started with PID $BENCH_PID"
}

# Main loop
log "=== BENCHMARK AUTO-MONITOR STARTED ==="
log "Target: $TOTAL_PROMPTS prompts"
log "Stall threshold: $MAX_STALL_MINUTES minutes"
log "Check interval: $CHECK_INTERVAL seconds"

prev_progress=0
stall_time=0
start_benchmark

while true; do
    sleep $CHECK_INTERVAL
    
    current_progress=$(get_progress)
    current_time=$(date +%s)
    
    # Progress check
    if [ "$current_progress" -gt "$prev_progress" ]; then
        # Progressing normally
        log "✓ Progress: $current_progress / $TOTAL_PROMPTS ($(( (current_progress * 100) / TOTAL_PROMPTS ))%)"
        stall_time=0
        prev_progress=$current_progress
        
        # Check if done
        if [ "$current_progress" -ge "$TOTAL_PROMPTS" ]; then
            log "✅ BENCHMARK COMPLETE! ($current_progress prompts)"
            log "=== AUTO-MONITOR FINISHED ==="
            
            # Update memory
            cat > /tmp/bench_complete.txt << EOF
Benchmark completed at $(date '+%Y-%m-%d %H:%M GMT+1')
Total prompts: $current_progress / $TOTAL_PROMPTS
Results: $RESULTS_FILE
EOF
            exit 0
        fi
    else
        # No progress
        stall_time=$(( stall_time + CHECK_INTERVAL ))
        stall_minutes=$(( stall_time / 60 ))
        
        if [ "$stall_minutes" -ge "$MAX_STALL_MINUTES" ]; then
            log "⚠️  STALL DETECTED ($stall_minutes min, line $current_progress)"
            log "Restarting benchmark with --resume..."
            pkill -f "run_bench.py" 2>/dev/null || true
            sleep 2
            start_benchmark
            stall_time=0
        else
            log "⏳ Stalling for ${stall_minutes}m ($current_progress / $TOTAL_PROMPTS)"
        fi
    fi
done
