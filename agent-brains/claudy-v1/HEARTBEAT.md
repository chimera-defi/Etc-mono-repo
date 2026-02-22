# HEARTBEAT.md

## Every heartbeat run (qwen2.5:3b local-first)

1) Check core services quickly:
- `systemctl is-active openclaw-gateway`
- `systemctl is-active takopi`
- `systemctl is-active ollama`

2) Quick resource snapshot:
- `free -h`
- `df -h /`
- `uptime`

3) Alert only if meaningful:
- service down
- disk > 85%
- RAM pressure sustained
- anything operationally unusual

If nothing needs attention, reply exactly: `HEARTBEAT_OK`.
Keep output concise.
