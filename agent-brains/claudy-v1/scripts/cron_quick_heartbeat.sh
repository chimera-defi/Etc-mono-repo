#!/bin/bash
# Quick heartbeat (every 10 min)
# Usage: cron add --name "health-check" --every "10m" --session isolated --model ollama/qwen2.5:3b --inject-only "HEARTBEAT.md"

set -e

# Quick health check (< 5 seconds)
echo "Health check ($(date +%H:%M))..."

# Check services
gw=$(systemctl is-active openclaw-gateway 2>/dev/null || echo "unknown")
to=$(systemctl is-active takopi 2>/dev/null || echo "unknown")
ol=$(systemctl is-active ollama 2>/dev/null || echo "unknown")

# Check resources
mem=$(free -h | grep Mem | awk '{print $3 "/" $2}')
disk=$(df -h / | tail -1 | awk '{print $5}')
load=$(uptime | awk -F'load average:' '{print $2}' | cut -d',' -f1)

# Alert only if issues
if [[ "$gw" != "active" ]] || [[ "$disk" > "85%" ]]; then
    echo "⚠️ ALERT: gateway=$gw disk=$disk"
    exit 1
fi

echo "HEARTBEAT_OK (gateway=$gw, mem=$mem, disk=$disk, load=$load)"
