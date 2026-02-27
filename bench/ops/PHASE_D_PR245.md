# PR #245 Phase D Runbook (D1..D5)

## D1: Managed llama-server start method

Files added:
- `bench/ops/start-llama-server.sh`
- `bench/ops/llama-server.service.example`

Install flow on host:
```bash
sudo cp bench/ops/llama-server.service.example /etc/systemd/system/llama-server.service
sudo systemctl daemon-reload
sudo systemctl enable --now llama-server
sudo systemctl status --no-pager llama-server
```

## D2: Verify `/v1/models` health endpoint

Expected checks:
```bash
curl -sS http://127.0.0.1:8081/v1/models | jq '.data[0].id'
curl -sS http://127.0.0.1:11434/v1/models | jq '.data[0].id'
```

## D3: Provider mapping (schema-safe)

Template mapping is provided in `ai_memory/bootstrap/openclaw_clawdbot_seed/openclaw.json.template`:
- keep `models.mode: "merge"`
- add `models.providers.llama-server` using OpenAI-compatible API
- map the benchmark target as `llama-server/qwen3.5:35b`

## D4: Gateway restart + routing smoke test

Host commands:
```bash
openclaw gateway restart
openclaw health
```

One smoke request (example):
```bash
curl -sS http://127.0.0.1:8081/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"qwen3.5:35b","messages":[{"role":"user","content":"Reply with OK"}],"max_tokens":8}'
```

## D5: Rollback

If Phase D changes cause instability:

1. Stop managed llama-server:
```bash
sudo systemctl disable --now llama-server
```
2. Restore previous OpenClaw config from backup (create one before edits):
```bash
cp /root/.openclaw/config/openclaw.json /root/.openclaw/config/openclaw.json.bak.$(date +%Y%m%d%H%M%S)
# restore when needed:
cp /root/.openclaw/config/openclaw.json.bak.<timestamp> /root/.openclaw/config/openclaw.json
```
3. Restart gateway:
```bash
openclaw gateway restart
```
4. Re-check health:
```bash
openclaw health
```
