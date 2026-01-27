# Monitoring Stack (Prometheus + Grafana + Loki)

Minimal monitoring setup for a single host. This is intended as a starting point; tune retention, security, and dashboards before production.

## What You Get

- Prometheus scrape of node exporter
- Grafana with Prometheus + Loki datasources
- Alertmanager with basic node alerts
- Loki + Promtail log shipping for `/var/log/syslog` and `/var/log/auth.log`
- Basic Grafana dashboard: **Monad Node Basics**
- Basic Grafana dashboard: **Monad IO + Network**

## Start

```bash
cd staking/monad/infra/monitoring
cp .env.example .env
sed -i 's/change-me/<strong-password>/' .env
sudo docker compose up -d
```

If `GRAFANA_ADMIN_PASSWORD` is missing, compose will error to prevent an insecure default.

## Access

- Prometheus: `http://<host>:9090`
- Grafana: `http://<host>:3000` (default admin/admin)
- Loki API: `http://<host>:3100`
- Alertmanager: `http://<host>:9093`

## Public Exposure (Recommended Pattern)

Expose only Grafana behind auth and keep Prometheus/Loki internal. The compose file binds Prometheus/Loki/node_exporter to localhost by default; use Caddy or SSH tunneling for access.

```text
monitoring.example.com -> Grafana (auth required)
```

## Notes

- Lock down ports with firewall rules (allow only admin IPs).
- Replace default Grafana credentials immediately.
- Wire alert receivers in `alertmanager.yml` (email/Slack/Telegram).
- Add validator‑specific dashboards and scrape targets as needed.
- Loki data lives under `monitoring/loki-data/` by default; move to a dedicated volume in production.
