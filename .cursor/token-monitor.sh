#!/bin/bash
# Token Usage Monitor
# Tracks token usage patterns during coding sessions

MONITOR_FILE="${HOME}/.cursor_token_monitor.log"
SESSION_ID="session_$(date +%Y%m%d_%H%M%S)"

# Initialize session
init_session() {
  echo "=== Token Monitor Session: $SESSION_ID ===" >> "$MONITOR_FILE"
  echo "Started: $(date)" >> "$MONITOR_FILE"
  echo "" >> "$MONITOR_FILE"
}

# Log an operation
log_operation() {
  local operation="$1"
  local estimated_tokens="$2"
  local notes="$3"

  echo "[$(date +%H:%M:%S)] $operation: ~$estimated_tokens tokens${notes:+ - $notes}" >> "$MONITOR_FILE"
}

# Log a savings event
log_savings() {
  local strategy="$1"
  local tokens_saved="$2"
  local context="$3"

  echo "[$(date +%H:%M:%S)] ✓ SAVED: $tokens_saved tokens via $strategy${context:+ - $context}" >> "$MONITOR_FILE"
}

# Log a missed opportunity
log_missed() {
  local opportunity="$1"
  local potential_savings="$2"

  echo "[$(date +%H:%M:%S)] ⚠ MISSED: Could have saved ~$potential_savings tokens - $opportunity" >> "$MONITOR_FILE"
}

# Session summary
session_summary() {
  local total_operations=$(grep -c "^\[" "$MONITOR_FILE" | tail -1)
  local total_savings=$(grep "✓ SAVED" "$MONITOR_FILE" | grep -oE "[0-9]+ tokens" | grep -oE "[0-9]+" | awk '{s+=$1} END {print s}')
  local total_missed=$(grep "⚠ MISSED" "$MONITOR_FILE" | grep -oE "[0-9]+ tokens" | grep -oE "[0-9]+" | awk '{s+=$1} END {print s}')

  echo "" >> "$MONITOR_FILE"
  echo "=== Session Summary ===" >> "$MONITOR_FILE"
  echo "Total operations: ${total_operations:-0}" >> "$MONITOR_FILE"
  echo "Tokens saved: ${total_savings:-0}" >> "$MONITOR_FILE"
  echo "Opportunities missed: ${total_missed:-0}" >> "$MONITOR_FILE"
  echo "Ended: $(date)" >> "$MONITOR_FILE"
  echo "" >> "$MONITOR_FILE"
}

# Show current session stats
show_stats() {
  echo "📊 Current Session Stats"
  echo "========================"

  if [ ! -f "$MONITOR_FILE" ]; then
    echo "No monitoring data yet. Start with: init_session"
    return
  fi

  local savings=$(grep "✓ SAVED" "$MONITOR_FILE" | grep -oE "[0-9]+ tokens" | grep -oE "[0-9]+" | awk '{s+=$1} END {print s}')
  local missed=$(grep "⚠ MISSED" "$MONITOR_FILE" | grep -oE "[0-9]+ tokens" | grep -oE "[0-9]+" | awk '{s+=$1} END {print s}')

  echo "Tokens saved: ${savings:-0}"
  echo "Missed opportunities: ${missed:-0}"
  echo ""
  echo "Recent operations:"
  tail -10 "$MONITOR_FILE"
}

# Analyze patterns
analyze_patterns() {
  echo "📈 Token Usage Patterns"
  echo "======================="
  echo ""

  if [ ! -f "$MONITOR_FILE" ]; then
    echo "No monitoring data yet."
    return
  fi

  echo "Savings by strategy:"
  echo ""
  grep "✓ SAVED" "$MONITOR_FILE" | \
    sed 's/.*via \([^-]*\).*/\1/' | \
    sort | uniq -c | \
    sort -rn | \
    head -5

  echo ""
  echo "Most common missed opportunities:"
  echo ""
  grep "⚠ MISSED" "$MONITOR_FILE" | \
    sed 's/.*- \(.*\)/\1/' | \
    sort | uniq -c | \
    sort -rn | \
    head -5
}

# Main command handler
case "$1" in
  init)
    init_session
    echo "✓ Session initialized: $SESSION_ID"
    ;;
  log)
    log_operation "$2" "$3" "$4"
    ;;
  saved)
    log_savings "$2" "$3" "$4"
    ;;
  missed)
    log_missed "$2" "$3"
    ;;
  summary)
    session_summary
    show_stats
    ;;
  stats)
    show_stats
    ;;
  analyze)
    analyze_patterns
    ;;
  clear)
    rm -f "$MONITOR_FILE"
    echo "✓ Monitor log cleared"
    ;;
  *)
    cat << 'EOF'
Token Monitor - Track token usage during coding sessions

Usage:
  ./token-monitor.sh init                           # Start new session
  ./token-monitor.sh log "operation" 500 "notes"    # Log an operation
  ./token-monitor.sh saved "strategy" 300 "context" # Log tokens saved
  ./token-monitor.sh missed "opportunity" 200       # Log missed savings
  ./token-monitor.sh stats                          # Show current stats
  ./token-monitor.sh summary                        # End session + summary
  ./token-monitor.sh analyze                        # Analyze patterns
  ./token-monitor.sh clear                          # Clear log

Examples:
  # Start monitoring
  ./token-monitor.sh init

  # Log a verbose response that should have been concise
  ./token-monitor.sh missed "Used preamble instead of direct response" 120

  # Log successful savings
  ./token-monitor.sh saved "Concise response" 150 "Skipped confirmation"
  ./token-monitor.sh saved "Knowledge graph query" 500 "Retrieved wallet criteria"
  ./token-monitor.sh saved "Targeted read" 200 "Read 50 lines instead of 500"

  # Check progress
  ./token-monitor.sh stats

  # End session
  ./token-monitor.sh summary
EOF
    ;;
esac
