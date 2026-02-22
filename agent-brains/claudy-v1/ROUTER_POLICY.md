# ROUTER_POLICY.md

## Local-first routing flow

1) Try local router model first (`local_qwen25_3b` → Ollama `qwen2.5:3b`).
2) Ask local model to classify task complexity + whether premium escalation is needed.
3) If local says `premium`, escalate to premium pool.
4) Reserve Codex for tool-heavy config/debugging/security-critical tasks (run with high/long thinking when escalated).

## Router prompt template

System:
"Router policy: route must be exactly one of [local,premium]. Use premium for tool-heavy debugging/security-critical tasks. Return ONLY JSON: {\"route\":\"local|premium\",\"reason\":\"...\"}."

User:
"Task: <task summary>"

## Fallback behavior
- If local route output is malformed twice, escalate to premium.
- If premium provider A fails with quota/session, fail over to premium provider B.
