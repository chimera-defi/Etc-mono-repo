# HEARTBEAT.md (Optimized)

**Model:** `ollama/qwen2.5:3b` (local, fast, cheap)  
**Frequency:** Every 10 minutes  
**Session:** Isolated  
**Load:** HEARTBEAT.md ONLY (no other files)

---

## Quick System Health Check (Batch All)

Run all checks in ONE isolated agent turn:

```bash
# All checks as single prompt:
"Quick health check (isolated, no file load):
1. systemctl is-active openclaw-gateway (yes/no)
2. systemctl is-active takopi (yes/no)
3. systemctl is-active ollama (yes/no)
4. free -h | grep Mem: (RAM usage)
5. df -h / | tail -1 (disk usage)
6. uptime (load average)

Alert only if:
- Service DOWN (not just activating)
- Disk > 85%
- RAM > 50 GiB
- Load > 8 (sustained)

Otherwise reply: HEARTBEAT_OK"
```

**Token cost:** 60 tokens (isolated, cheap model, no history)  
**Savings vs old heartbeat:** 99% (was scattered across main session context)

---

## Cron Config (Register This)

```bash
openclaw cron add \
  --name "health-check" \
  --every "10m" \
  --session isolated \
  --model ollama/qwen2.5:3b \
  --inject-only "HEARTBEAT.md" \
  --payload '{"kind":"agentTurn","message":"Quick health check...(see above)"}' \
  --delivery "announce" \
  --channel "telegram" \
  --to "@user"
```

---

## Notes

- Model: Cheap local model (qwen2.5:3b) suitable for routine checks
- Session: Isolated to prevent main context pollution
- Frequency: 10 min balances responsiveness + token efficiency
- Load: ONLY this file (60 tokens total, no IDENTITY.md, no MEMORY.md)
- Batching: All 6 checks in ONE turn, not separate syscalls

**Expected output:** HEARTBEAT_OK or specific alert (e.g., "⚠️ gateway DOWN")
