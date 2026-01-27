# Monitoring Stack (Prometheus + Grafana + Loki)

Minimal monitoring setup for a single host. This is intended as a starting point; tune retention, security, and dashboards before production.

## What You Get

- Prometheus scrape of node exporter
- Grafana with Prometheus + Loki datasources
- Loki + Promtail log shipping for `/var/log/syslog` and `/var/log/auth.log`

## Start

```bash
cd staking/monad/infra/monitoring
sudo docker compose up -d
```

## Access

- Prometheus: `http://<host>:9090`
- Grafana: `http://<host>:3000` (default admin/admin)
- Loki API: `http://<host>:3100`

## Public Exposure (Recommended Pattern)

Expose only Grafana behind auth and keep Prometheus/Loki internal.

```text
monitoring.example.com -> Grafana (auth required)
```

## Notes

- Lock down ports with firewall rules (allow only admin IPs).
- Replace default Grafana credentials immediately.
- Add validator‑specific dashboards and scrape targets as needed.
- Loki data lives under `monitoring/loki-data/` by default; move to a dedicated volume in production.
