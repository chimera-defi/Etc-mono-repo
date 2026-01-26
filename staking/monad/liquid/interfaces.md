# Liquid Staking Interfaces

## Status JSON

Source: `staking/monad/scripts/status_server.py`

Fields:
- `status` (ok | degraded)
- `timestamp`
- `block_height`
- `last_seen`
- `rpc_error`

## Webhook Events (Draft)

- `validator.degraded`
- `validator.recovered`
- `validator.slash_warning`
- `validator.uptime_below_target`

## Metrics (Future)

- Prometheus scrape endpoint.
- Grafana dashboard link.
