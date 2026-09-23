# Alert Layer — Architecture

## System shape

```text
ChatGPT / Claude / Web UI
          |
       MCP + REST API
          |
  Rule compiler + validator  --->  rule preview / confirmation
          |
   Postgres: users, rules, sources, runs, deliveries
          |
 Scheduler / queue ---> source adapters ---> condition evaluator
          |                                     |
          +-------------------------------> delivery router
                                                |
                                    APNs / FCM / email / webhook
```

## Core rule model

```json
{
  "name": "S&P drawdown",
  "source": {"type": "market_quote", "symbol": "SPY"},
  "poll": {"interval": "5m", "timezone": "America/New_York"},
  "condition": {"op": "lte", "value": {"percent_from": "previous_close", "percent": -2}},
  "delivery": {"channel": "push", "title": "Market move", "body_template": "SPY is down {{percent}}"},
  "policy": {"cooldown": "24h", "notify_once": true, "quiet_hours": "22:00-07:00"}
}
```

The compiler only emits a small allowlisted DSL. MCP tools should include `list_rules`, `preview_rule`, `create_rule`, `update_rule`, `pause_rule`, `test_rule`, and `list_runs`. Mutating tools require confirmation and return the exact persisted rule.

## Scheduling and execution

- Use a queue with delayed jobs for due evaluations; a cron tick can enqueue due rules, but cron should not contain business logic.
- Partition work by source and tenant to respect provider rate limits.
- Store a deterministic `evaluation_key` and `delivery_key` to make retries idempotent.
- Use exponential backoff for transient source/delivery failures, bounded by the rule’s freshness window.
- Record source timestamp, evaluation timestamp, rule version, input hash, decision, and delivery response.
- Start with one worker process and Postgres; add Redis/managed queues only when the run volume justifies it.

## Security boundary

Do not run arbitrary user scripts in the shared worker. It creates a remote-code-execution, secret-exfiltration, SSRF, abuse, and noisy-neighbor problem. If custom code is later necessary, use isolated jobs with a narrow network egress policy, CPU/memory/time limits, ephemeral credentials, a reviewed runtime, and explicit per-user quotas.

## Suggested MVP stack

- API/MCP: TypeScript with Hono or Fastify.
- Database/auth: Postgres, with Supabase acceptable for the personal pilot.
- Queue: Postgres-backed due queue first; BullMQ/Redis later.
- Mobile: Expo/React Native or native clients; APNs + FCM directly, or Pushover during private pilot.
- Sources: Google Calendar/ICS, webhook, RSS/JSON, one market quote provider.
- Observability: structured run log, delivery receipts, dead-letter queue, and a synthetic test alert.
