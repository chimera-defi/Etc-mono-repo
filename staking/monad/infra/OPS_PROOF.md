# Ops Proof Bundle (VDP + Delegators)

Use this checklist to produce external proof of uptime, health, and responsiveness.

## 1) Public Uptime Link

- Point UptimeRobot/StatusCake at `https://status.<domain>/status`.
- Monitor every 60s; alert on 2-3 consecutive failures.

## 2) Status Endpoint

- Keep `monad-status` bound to localhost (`127.0.0.1:8787`).
- Expose only through Caddy (or another proxy).

Example `Caddyfile` snippet:

```
status.<domain> {
  reverse_proxy /status localhost:8787
}
```

## 3) Metrics Visibility

- Provide a read-only Grafana link if required.
- Use basic auth in Caddy with `GRAFANA_BASIC_AUTH_HASH`.
- Do not expose Prometheus or Loki publicly.

## 4) Reliability Notes

- Maintain a weekly uptime note:
  - date, uptime %, incidents, corrective actions.
- Keep a short incident log (date + duration + fix).

## 5) Evidence Package (Shareable)

- Uptime monitor link.
- `/status` output screenshot or sample JSON.
- Grafana dashboard link (read-only).
- 4-week uptime history snapshot.
