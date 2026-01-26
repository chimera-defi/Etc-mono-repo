#!/usr/bin/env bash
set -euo pipefail

now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
host=$(hostname)

cpu=$(lscpu | rg -m 1 '^Model name:' | sed 's/Model name:\s*//')
mem=$(free -h | rg -m 1 '^Mem:' | awk '{print $2}')
disk=$(df -h / | rg -m 1 '^/' | awk '{print $2" total, "$4" free"}')

cat <<JSON
{
  "timestamp": "$now",
  "host": "$host",
  "cpu": "${cpu:-unknown}",
  "memory": "${mem:-unknown}",
  "disk": "${disk:-unknown}"
}
JSON
